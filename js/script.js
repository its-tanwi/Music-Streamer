
// Global Variables
let currentSong = new Audio();
let songs;
let currFolder;
document.querySelector(".range").getElementsByTagName("input")[0].value = 100;



async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}`);
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = []
    for (const e of as) {
        if (e.href.endsWith(".mp3")) {
            songs.push(e.href.split(`/${folder}/`)[1]);
        }
    }

    // Modified code
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    // playSongs(songs[0].split(".mp3")[0], true);
    for (const s of songs) {
        let temp = (s.replaceAll("%20", " ")).split(".mp3")[0]
        songUl.innerHTML = songUl.innerHTML + `<li>
                            <img class="invert" width="28px" src="img/music.svg" alt="">
                            <div class="info">
                                <div class="songName">${temp.split("-")[0]}</div>
                                <div class="songArtist">${temp.split("-")[1]}</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img class="invert" src="img/playBtn.svg" alt="playButton" width="34px">
                            </div>
                            </li>`

    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            // console.log(e);
            play.src = "img/pause.svg"
            let songName = e.querySelector(".songName").innerHTML;
            let songArtist = e.querySelector(".songArtist").innerHTML;
            // console.log((songName + "-" + songArtist).replaceAll(" ", "%20"));
            playSongs((songName + "-" + songArtist).replaceAll(" ", "%20"));

        }
        )
    });

}

const playSongs = (track, paused = false) => {
    currentSong.src = `/${currFolder}/` + track + ".mp3";
    if (!paused) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songInfo").innerHTML = (track.split("-")[0]).replaceAll("%20", " ");
    currentSong.addEventListener('loadeddata', () => {
        let duration = currentSong.duration
        let minutes = Math.floor(parseInt(duration) / 60)
        let seconds = Math.round(duration - minutes * 60);
        document.querySelector(".songTime").querySelector(".totalDuration").innerHTML = `/ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    )

    currentSong.addEventListener("timeupdate", () => {
        let currentTime = currentSong.currentTime
        let minutes = Math.floor(parseInt(currentTime) / 60)
        let seconds = Math.round(currentTime - minutes * 60);
        document.querySelector(".songTime").querySelector(".currentTime").innerHTML = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.querySelector(".circle").style.left = `${(currentTime / currentSong.duration) * 100}%`
        // document.querySelector(".circle").style.left =  "20%"
        // console.log((currentTime/currentSong.duration)*100);

    }
    )
}


async function displayAlbums() {
    let a = await fetch("/Songs/");

    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("Songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            // console.log(folder);
            // Getting the meta data
            let a = await fetch(`/Songs/${folder}/info.json`);
            let response = await a.json();
            let cardContainer = document.querySelector(".cardContainer");
            cardContainer.innerHTML = cardContainer.innerHTML + `
                    <div class="card" data-folder="${folder}">
                        <div class="playBtn">
                            <img src="img/play.svg" alt="playBtn" class="playSvg">
                        </div>
                        <img src="/Songs/${folder}/cover.jpeg" alt="playlist-img">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div> `
        }
    }
    // console.log(anchors);
    // console.log(document.querySelectorAll(".card"))
}




async function main() {
    // get the list of all the songs
    await getSongs("Songs/aafavourites")
    playSongs(songs[0].split(".mp3")[0], true);

    //Display all albums
    await displayAlbums()

    document.querySelector(".seekbar").addEventListener('click', (e) => {
        //   console.log(e.target.getBoundingClientRect().width,e.offsetX);
        let fraction = e.offsetX / e.target.getBoundingClientRect().width
        document.querySelector('.circle').style.left = `${(fraction) * 100}%`
        currentSong.currentTime = currentSong.duration * fraction
    }
    )



    // Adding event listner to hamburger
    document.querySelector(".hamburger").addEventListener('click', (params) => {
        document.querySelector(".left").style.left = "0"
    }
    )
    // Adding event listener to close button
    document.querySelector(".close").addEventListener('click', () => {
        document.querySelector(".left").style.left = "-200%"
    }
    )

    // Adding Event listner to previous btn

    previous.addEventListener('click', () => {
        let indexOfSong = songs.indexOf(currentSong.src.split(`${currFolder}/`)[1])
        if (indexOfSong > 0) {
            playSongs(((songs[indexOfSong - 1]).split(".mp3"))[0])
        }
    }
    )

    // Adding Event listner to next btn

    next.addEventListener('click', () => {

        let indexOfSong = songs.indexOf(currentSong.src.split(`${currFolder}/`)[1])
        if (indexOfSong < songs.length - 1) {
            playSongs((songs[indexOfSong + 1]).split(".mp3")[0])

        }
    }
    )

    // Addding event listener to volume seekbar
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener('change', (e) => {
        // console.log(e,e.target,e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100;

    }
    )

    // Adding event listner to card
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener('click', (item) => {
            // console.log(item.currentTarget.dataset.folder);
            getSongs(`Songs/${item.currentTarget.dataset.folder}`)
        }
        )
    })
    // Adding event listner to volume button
    document.querySelector(".volumeImg").addEventListener('click', (e) => {
        // console.log(e.target.src)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            // console.log(e.target.src)

            volumeBar.value = 0;
            currentSong.volume = 0;
        }

        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            volumeBar.value = 10;
            currentSong.volume = 0.1;
        }
    }
    )


    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "img/playBtn.svg"
        }
    }
    )
}

main()