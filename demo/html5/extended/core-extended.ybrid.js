/**
 * core-extension.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2018 nacamar GmbH
 */

var ybridCtrl = io.ybrid.ctrl.v2.YbridCTRL();
var audioCtx = io.ybrid.audio.AudioCTX();

var stopped = true;

/**
 * @param {Object}
 *                swapInfo
 * 
 */
function handleSwapInfo(swapInfo) {
    var swapButton = document.getElementById("swap-button");
    if (swapInfo.swapsLeft == 0) {
        // swapButton.classList.remove('fa-spin');
        disableCTRLButton(swapButton);
    } else {
        // swapButton.classList.add('fa-spin');
        enableCTRLButton(swapButton, swapButtonClicked)
    }
}

/**
 * @param {String}
 *                url
 */
function handleItemMetaURL(url) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var result = JSON.parse(this.responseText);
            var niceJson = JSON.stringify(result, undefined, 4);
            document.getElementById("meta-area-2").innerHTML = niceJson;
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
            handleSwapInfo(result.swapInfo);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/**
 * @param {Object}
 *                windResult
 */
function handleWindResult(windResult) {
    console.debug("wind result [totalOffset: " + windResult.totalOffset
            + ", effectiveWindDuration: " + windResult.effectiveWindDuration
            + "].");
    var niceJson = JSON.stringify(windResult, undefined, 4);
    document.getElementById("wind-result-area").innerHTML = niceJson;
    if (windResult.windRequestWasSuccessfull) {
        var backToNowButton = document.getElementById("back-to-now-button");
        if (windResult.totalOffset == 0) {
            disableCTRLButton(backToNowButton);
        } else {
            enableCTRLButton(backToNowButton, backToNowButtonClicked)
        }
    }
}

/**
 * initConsole.
 * 
 * Initializes the console.
 */
function initConsole() {
    if (typeof console != "undefined") {
        if (typeof console.log != 'undefined') {
            console.olog = console.log;
        } else {
            console.olog = function() {
            };
        }
    }

    console.log = function(message) {
        console.olog(message);
        var txt = document.getElementById("log-area").innerHTML;
        var lines = txt.split("\n");
        if (lines.length > 250) {
            txt = '';
            var i = lines.length - 250;
            if (i < 0) {
                i = 0;
            }
            while (i < lines.length) {
                if (lines[i].trim().length > 0) {
                    txt += lines[i] + "\n";
                }
                i++;
            }
        }
        txt += message + "\n";
        document.getElementById("log-area").innerHTML = txt;
        document.getElementById("log-area").scrollTop = document
                .getElementById("log-area").scrollHeight
    };

    console.error = console.debug = console.info = console.log;
}

function togglePlay() {
    var playButton = document.getElementById("play-button");
    if (stopped == true) {
        stopped = false;
        playButton.classList.remove("fa-play");
        playButton.classList.add("fa-pause");
        enableAllCTRL();
        
        initPlotLines();
        try {
            audioCtx.startAudio(//
                    (time, bufferSize) => {
                        pushBufferPlotItem(bufferSize);
                    },//
                    (createSessionResponse) => {
                        var niceJson = JSON.stringify(createSessionResponse, undefined, 4);
                        document.getElementById("session-area").innerHTML = niceJson;
                    }, 
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
        audioCtx.stopAudio();
    }
}

function spinningWheelOn() {
    document.getElementById("overlay").style.display = "block";
    setTimeout(spinningWheelOff, 2000);
}

function spinningWheelOff() {
    document.getElementById("overlay").style.display = "none";
}

function enableAllCTRL(){
    enableCTRLButton(document.getElementById("skip-backwards-button"), skipBackwardsButtonClicked);
    enableCTRLButton(document.getElementById("rewind-button"), rewindButtonClicked);
    enableCTRLButton(document.getElementById("fast-forward-button"), fastForwardButtonClicked);
    enableCTRLButton(document.getElementById("skip-forwards-button"), skipForwardsButtonClicked);
}

function disableAllCTRL(){
    disableCTRLButton(document.getElementById("skip-backwards-button"));
    disableCTRLButton(document.getElementById("rewind-button"));
    disableCTRLButton(document.getElementById("back-to-now-button"));
    disableCTRLButton(document.getElementById("fast-forward-button"));
    disableCTRLButton(document.getElementById("skip-forwards-button"));
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
    ybridCtrl.playoutSwap(
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

function rewindButtonClicked() {
    ybridCtrl.playoutWind(-60000, handleWindResult,
            (statusCode, message) => {
            });
    spinningWheelOn();
}

function windToButtonClicked(requestedTimestamp) {
    ybridCtrl.playoutWindTo(requestedTimestamp, handleWindResult,
            (statusCode, message) => {
            });
    spinningWheelOn();
}

function backToNowButtonClicked() {
    ybridCtrl.playoutWindBack2Live(handleWindResult,
            (statusCode, message) => {
            });
    spinningWheelOn();
}

function fastForwardButtonClicked() {
    ybridCtrl.playoutWind(60000, handleWindResult,
            (statusCode, message) => {
            });
    spinningWheelOn();
}

function skipBackwardsTypedButtonClicked(requestedItemType) {
    ybridCtrl.playoutSkipBackwards(requestedItemType, handleWindResult,
            (statusCode, message) => {
            });
    spinningWheelOn();
}

function skipForwardsTypedButtonClicked(requestedItemType) {
    ybridCtrl.playoutSkipForwards(requestedItemType, handleWindResult,
            (statusCode, message) => {
            });
    spinningWheelOn();
}

function skipBackwardsButtonClicked() {
    ybridCtrl.playoutSkipBackwards(null, handleWindResult,
            (statusCode, message) => {
            });
    spinningWheelOn();
}

function skipForwardsButtonClicked() {
    ybridCtrl.playoutSkipForwards(null, handleWindResult,
            (statusCode, message) => {
            });
    spinningWheelOn();
}