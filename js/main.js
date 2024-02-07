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
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };