async function getLastWriteUpFromPlatform(platform) {
    let re = new RegExp("Update [A-Za-z0-9]+\.html");
    platform = platform.toUpperCase();
    let commitsUrl = `https://api.github.com/repos/Cyberretta/Write-Ups-${platform}/commits`;

    try {
        let response = await fetch(commitsUrl);
        let jsonData = await response.json();
        for (let commit in jsonData) {
            let message = jsonData[commit]["commit"]["message"];
            if (re.test(message)) {
                let sha = jsonData[commit]["sha"];
                let date = jsonData[commit]["commit"]["author"]["date"];
                let commitJsonData = await (await fetch(`https://api.github.com/repos/Cyberretta/Write-Ups-${platform}/commits/${sha}`)).json();
                let filePath = commitJsonData["files"][0]["filename"];
                console.log(filePath);
                return [filePath, date];
            }
        }

        return null;
    } catch (error) {
        console.error("Erreur lors de la récupération des commits :", error);
    }
}

async function getLastWriteUp() {
    // Obtenez le dernier HTB write up téléchargé
    let lastHtbWriteUp = await getLastWriteUpFromPlatform("HTB");
    let lastThmWriteUp = await getLastWriteUpFromPlatform("THM");

    let lastWriteUp;
    let platform;

    //Check which is the latest commit
    if(lastHtbWriteUp !== null && lastThmWriteUp !== null){
        let htbDate = new Date(lastHtbWriteUp[1]);
        let thmDate = new Date(lastThmWriteUp[1]);

        if(htbDate > thmDate){
            lastWriteUp = lastHtbWriteUp;
            platform = "HTB";
        }else{
            lastWriteUp = lastThmWriteUp;
            platform = "THM";
        }
    }else{
        if(lastHtbWriteUp === null){
            lastWriteUp = lastThmWriteUp;
            platform = "THM";
        }else if(lastThmWriteUp === null){
            lastWriteUp = lastHtbWriteUp;
            platform = "HTB";
        }
    }

    let difficulty = lastWriteUp[0].split("/")[0];
    let boxName = lastWriteUp[0].split("/")[1];   

    return [platform, difficulty, boxName];
}

async function getLastWriteUpPreview(){
    let lastWriteUp = await getLastWriteUp();
    let boxId = await getBoxId(lastWriteUp);
    let platform;
    if(lastWriteUp[0] === "HTB"){
        platform = "HackTheBox";
    }else if(lastWriteUp[0] === "THM"){
        platform = "TryHackMe";
    }
    let preview = `<a href="" class="article-preview-link"><span class="article-preview"><iframe src="https://www.hackthebox.com/achievement/machine/1264762/${boxId}"></iframe><h3>Compte rendu : ${platform} - ${lastWriteUp[2]} (${lastWriteUp[1]})</h3></span></a>`
    return preview;
}

async function getBoxId(boxInfo){
    let boxInfoUrl = `https://raw.githubusercontent.com/Cyberretta/Write-Ups-${boxInfo[0]}/main/${boxInfo[1]}/${boxInfo[2]}/boxId.txt`;
    let response = await fetch(boxInfoUrl);
    let boxId = await response.text();
    return boxId.replace("\n", "");
}

async function showLastWriteUpPreview(){
    let preview = await getLastWriteUpPreview();
    document.getElementById("lastWriteUpPreview").innerHTML = preview;
}