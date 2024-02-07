async function getLastWriteUpFromPlatform(platform) {
    let re = new RegExp("Upload [A-Za-z0-9]+\.html");
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

async function getBoxId(boxInfo){
    let boxInfoUrl = `https://raw.githubusercontent.com/Cyberretta/Write-Ups-${boxInfo[0]}/main/${boxInfo[1]}/${boxInfo[2]}/boxId.txt`;
    let response = await fetch(boxInfoUrl);
    let boxId = await response.text();
    return boxId.replace("\n", "");
}

async function showLastWriteUpPreview(){
    let lastWriteUp = await getLastWriteUp();
    let platform;
    if(lastWriteUp[0] === "HTB"){
        platform = "HackTheBox";
    }else if(lastWriteUp[0] === "THM"){
        platform = "TryHackMe";
    }
    let title = `Compte rendu : ${platform} - ${lastWriteUp[2]} (${lastWriteUp[1]})`;
    let link = `./write-ups?platform=${lastWriteUp[0]}&difficulty=${lastWriteUp[1]}&box=${lastWriteUp[2]}`;

    document.getElementById("lastWriteUpLink").href = link;
    document.getElementById("lastWriteUpTitle").innerHTML = title;
    document.getElementById("lastWriteUpIllustration").src = `https://raw.githubusercontent.com/Cyberretta/Write-Ups-${lastWriteUp[0]}/main/${lastWriteUp[1]}/${lastWriteUp[2]}/boxFinished.png`;
}

async function showLastVideoPreview(){
    const cid = "UCl1_r1WXNuV9hnEQVemVzpw";
    const channelURL = encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${cid}`)
    const reqURL = `https://api.rss2json.com/v1/api.json?rss_url=${channelURL}`;

    fetch(reqURL)
    .then(response => response.json())
    .then(result => {
        const link = result["items"][0].link;
        const title = result["items"][0].title;
        const id = link.substr(link.indexOf("=") + 1);
        document.getElementById("lastVideoPreview").src = `https://youtube.com/embed/${id}?controls=0&autoplay=1`;
        document.getElementById("lastVideoTitle").innerHTML = title;
    }).catch(error => console.log('error', error));
}

async function listProjects(){
    const blacklist = ["Write-Ups-HTB", "Write-Ups-THM", "cyberretta.github.io"];
    let projectsUrl = "https://api.github.com/users/Cyberretta/repos";
    let response = await fetch(projectsUrl);
    let jsonData = await response.json();
    let projects = [];
    for(let entry in jsonData){
        let projectName = jsonData[entry]["name"];
        if(!blacklist.includes(projectName)){
            projects.push(projectName);
        }
    }
    
    return projects;
}

async function showLastProjectPreview(){
    let projects = await listProjects();
    let lastProject = projects[0];
    let previewImgUrl = `https://raw.githubusercontent.com/Cyberretta/${lastProject}/main/preview.png`;

    //Update last project preview
    document.getElementById("lastProjectTitle").innerHTML = lastProject;
    document.getElementById("lastProjectPreview").src = previewImgUrl;
    document.getElementById("lastProjectLink").href = "/projects/AwsLogAnalyser.html";
}

//This function is used to adapt stylesheet if the client uses a mobile device (e.g : android, iphone...)
function checkMobileBrowser() {
    if(screen.availHeight > screen.availWidth){
        return true;
    }else{
        return false;
    }
  };