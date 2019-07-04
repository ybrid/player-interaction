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
        
        initPlotLines();
        try {
            initAudioIfNeeded((time, bufferSize)=>{
                pushBufferPlotItem(bufferSize);
            });
            initMediaSource();
            initializeBuffering(scheme, host, path,
                (baseURLVal, sessionId) => {
                    var result = "sessionId:\t"+sessionId + "\nbase URL:\t"+baseURLVal;
                    document.getElementById("session-area").innerHTML = result;
                },// 
                (currentBitRate) => {
                    pushBandwidthPlotItem(currentBitRate);
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
    document.getElementById("overlay").style.display = "block";
    setTimeout(spinningWheelOff, 2000);
}

function spinningWheelOff() {
    document.getElementById("overlay").style.display = "none";
}

