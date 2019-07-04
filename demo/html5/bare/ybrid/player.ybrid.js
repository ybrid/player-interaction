/**
 * player.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2018 nacamar GmbH
 */

var stopped = true;

function togglePlay() {
    var playButton = document.getElementById("play-button");
    if (stopped == true) {
        stopped = false;
        playButton.classList.remove("fa-play");
        playButton.classList.add("fa-pause");
        enableAllCTRL();

        try {
            initAudioIfNeeded();
            initMediaSource();
            initializeBuffering(scheme, host, path,
                (baseURLVal, sessionId) => {
                    console.info("created session [id: " + sessionId + ", baseURL: " + baseURLVal + "]");
                }, 
                (currentBitRate) => {
                    console.info("Current bit rate: " + currentBitRate);
                });
        } catch (e) {
            alert(e);
        }
    } else {
        stopped = true;
        playButton.classList.remove("fa-pause");
        playButton.classList.add("fa-play");
        disableAllCTRL();
        disableCTRLButton(document.getElementById("swap-button"));
        
        audio.pause();
        console.info("stopped");
    }
}

function spinningWheelOn() {
    var swapButton = document.getElementById("swap-button");
    swapButton.classList.add('fa-spin');
    swapButton.onclick = false;
    disableAllCTRL();
    setTimeout(spinningWheelOff, 2000);
}

function spinningWheelOff() {
    var swapButton = document.getElementById("swap-button");
    swapButton.classList.remove('fa-spin');
    swapButton.onclick = swapButtonClicked;
    enableAllCTRL();
}

