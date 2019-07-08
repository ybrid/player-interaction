/**
 * core-bare-swap-only.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2019 nacamar GmbH
 */

var ybridCtrl = io.ybrid.ctrl.v1.YbridCTRL();
var audioCtx = io.ybrid.audio.AudioCTX();

var stopped = true;

/**
 * @param {Object}
 *            swapInfo
 * 
 */
function handleSwapInfo(swapInfo) {
    var swapButton = document.getElementById("swap-button");
    if (swapInfo.swapsLeft == 0) {
        swapButton.classList.remove('fa-spin');
        disableCTRLButton(swapButton);
    } else {
        enableCTRLButton(swapButton, swapButtonClicked)
    }
}

/**
 * @param {String}
 *            url
 */
function handleItemMetaURL(url) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var result = JSON.parse(this.responseText);
            if (typeof result.currentItem.companions !== 'undefined') {
                if (typeof result.currentItem.companions[0] !== 'undefined') {
                    // SEBASTIAN select most appropriate companion
                    var companion = result.currentItem.companions[0];
                    showCompanionAd(companion.staticResourceURL,
                            companion.altText, companion.onClickThroughURL);
                } else {
                    hideCompanionAd();
                }
            } else {
                hideCompanionAd();
            }
            document.getElementById("artist").innerHTML = result.currentItem.artist;
            document.getElementById("title").innerHTML = result.currentItem.title;
            if (result.timeToNextItemMillis > -1) {
                var secs = result.timeToNextItemMillis / 1000
                document.getElementById("ttni").innerHTML = secs.toFixed(1)
                        + " sec.";
            }
            handleSwapInfo(result.swapInfo);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function togglePlay() {
    var playButton = document.getElementById("play-button");
    if (stopped == true) {
        stopped = false;
        playButton.classList.remove("fa-play");
        playButton.classList.add("fa-pause");

        try {
            audioCtx.startAudio(//
                    () => {
                    },//
                    (createSessionResponse) => {
                        console.info("created session [id: " + createSessionResponse.sessionId + ", baseURL: " + createSessionResponse.baseURL + "]");
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
        disableCTRLButton(document.getElementById("swap-button"));
        audioCtx.stopAudio();
    }
}

function spinningWheelOn() {
    var swapButton = document.getElementById("swap-button");
    swapButton.classList.add('fa-spin');
    swapButton.onclick = false;
    setTimeout(spinningWheelOff, 2000);
}

function spinningWheelOff() {
    var swapButton = document.getElementById("swap-button");
    swapButton.classList.remove('fa-spin');
    swapButton.onclick = swapButtonClicked;
}

/**
 * @param button
 * @param clickFunction
 */
function enableCTRLButton(button, clickFunction) {
    button.classList.remove('audioElementDisabled');
    button.classList.add('audioElement');
    button.onclick = clickFunction;
}

/**
 * @param button
 */
function disableCTRLButton(button) {
    button.classList.remove('audioElement');
    button.classList.add('audioElementDisabled');
    button.onclick = false;
}


function setMaxBitRate(bitRate){
    ybridCtrl.setMaxBitRate(bitRate,
            (result) => {
                console.info("set-max-bit-rate response [maxBitRate: "
                        + result.maxBitRate + "].");
            },
            (statusCode, message) => {
            });
}

function swapButtonClicked() {
    ybridCtrl.swap(
            (result) => {
                console.info("swap response [swapWasSuccessfull: "
                        + result.swapWasSuccessfull + ", swapsLeft: "
                        + result.swapsLeft + ", nextSwapReturnsToMain: "
                        + result.nextSwapReturnsToMain + "].");
            },
            (statusCode, message) => {
            });
    spinningWheelOn();
}

