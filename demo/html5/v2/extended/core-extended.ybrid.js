/**
 * core-extension.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2018 nacamar GmbH
 */

var ybridCtrl = io.ybrid.ctrl.v2.YbridCTRL();
var audioCtx = io.ybrid.audio.AudioCTX();

var stopped = true;

/**
 * showJson.
 * 
 * @param jsonObj
 * @param div
 * @param level
 */
function showJson(jsonObj, div, level){
    clearDiv(div);
    var level = level || 1;
    var jsonViewer = new JSONViewer();
    div.appendChild(jsonViewer.getContainer());
    jsonViewer.showJSON(jsonObj, -1, level);
}


/**
 * @param {Object}
 *            swapInfo
 */
function handleSwapInfo(swapInfo) {
    var swapButton = document.getElementById("swap-button");
    var back2MainButton = document.getElementById("back-to-main-button");
    if (swapInfo.swapsLeft == 0) {
        // swapButton.classList.remove('fa-spin');
        disableCTRLButton(swapButton);
        disableCTRLButton(back2MainButton)
    } else {
        // swapButton.classList.add('fa-spin');
        enableCTRLButton(swapButton, swapButtonClicked)
        enableCTRLButton(back2MainButton, backToMainButtonClicked)
    }
}

/**
 * @param {String}
 *            url
 */
function handleItemMetaURL(url) {
    fetchJson(url, 
            (meta) => {
                showItemMeta(meta);
                if (typeof meta.currentItem.companions !== 'undefined') {
                    if (typeof meta.currentItem.companions[0] !== 'undefined') {
                        // SEBASTIAN select most appropriate companion
                        var companion = meta.currentItem.companions[0];
                        showCompanionAd(companion.staticResourceURL,
                                companion.altText, companion.onClickThroughURL);
                    } else {
                        hideCompanionAd();
                    }
                } else {
                    hideCompanionAd();
                }
                handleSwapInfo(meta.swapInfo);
            });
}

function handleCurrentLevels(levelDoc) {
    var levelDocString = decodeURIComponent(levelDoc);
    var levelDocJson = JSON.parse(levelDocString);
    var playoutArray = levelDocJson.mostCurrentLevels.playout;
//    for (var i = 0; i < playoutArray.length; i++) {
//        playoutArray[i] = 168 + (Math.log(playoutArray[i]) * 10);
//    }
    pushLevelPlotItem(playoutArray);
}

function showItemMeta(itemMeta){
    var div = document.getElementById("meta-area-2");
    showJson(itemMeta, div, 2);
// var niceJson = JSON.stringify(itemMeta, undefined, 4);
// document.getElementById("meta-area-2").innerHTML = niceJson;
}

/**
 * @param {Object}
 *            windResult
 */
function handleWindResult(windResult) {
    console.debug("wind result [totalOffset: " + windResult.totalOffset
            + ", effectiveWindDuration: " + windResult.effectiveWindDuration
            + "].");
    showWindResult(windResult);
        var backToNowButton = document.getElementById("back-to-now-button");
        if (windResult.totalOffset == 0) {
            disableCTRLButton(backToNowButton);
        } else {
            enableCTRLButton(backToNowButton, backToNowButtonClicked)
        }
    }

function showWindResult(windResult){
    var div = document.getElementById("wind-result-area");
    showJson(windResult, div);
// var niceJson = JSON.stringify(windResult, undefined, 4);
// document.getElementById("wind-result-area").innerHTML = niceJson;
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
        var txt = document.getElementById("log-area").textContent;
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
        document.getElementById("log-area").textContent = txt;
        document.getElementById("log-area").scrollTop = document
                .getElementById("log-area").scrollHeight
    };

    console.error = console.debug = console.info = console.log;
}

var servicesKnown = false;

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
                        if(!servicesKnown){
                            ybridCtrl.playoutSwapServiceInfo(
                                    (result) => {
                                        handleSwapServiceInfoResult(result);
                                    },
                                    (statusCode, message, object) => {
                                    });
                            servicesKnown = true;
                        }
                    },//
                    showSessionInfo, 
                    (currentBitRate) => {
                        pushBandwidthPlotItem(currentBitRate);
                    });
        } catch (e) {
            alert(e);
        }
    } else {
        stopped = true;
        servicesKnown = false;
        playButton.classList.remove("fa-pause");
        playButton.classList.add("fa-play");
        disableAllCTRL();
        disableCTRLButton(document.getElementById("swap-button"));
        audioCtx.stopAudio();
    }
}

function showSessionInfo(sessionInfo){
    var div = document.getElementById("session-area");
    showJson(sessionInfo, div);
// var niceJson = JSON.stringify(createSessionResponse, undefined, 4);
// innerHTML = niceJson;
}

function handleSwapServiceInfoResult(swapServiceInfo){
    console.info(swapServiceInfo.availableServices);

    if(swapServiceInfo.activeServiceId){
        var activeServiceDiv = document.getElementById("active-service-div");
        swapServiceInfo.availableServices.forEach(
                (service)=>{
                    if(service.id === swapServiceInfo.activeServiceId){
                        if(service.iconURL){
                            activeServiceDiv.style.backgroundImage = "url('" + service.iconURL + "')";
                        }else{
                            activeServiceDiv.style.backgroundImage = "none";
                        }
                    }
                    
                });
        activeServiceDiv.textContent = swapServiceInfo.activeServiceId;
    }
    
    var parentDiv = document.getElementById("available-services-div");
    clearDiv(parentDiv);

    var maxColumns =  5;
    var maxRows = 1;
    var fields = maxColumns * maxRows;
    for (var i = 0; i < swapServiceInfo.availableServices.length; i++) {
        var service = swapServiceInfo.availableServices[i];
        if(swapServiceInfo.activeServiceId && (service.id === swapServiceInfo.activeServiceId)){
            continue;
        }
        
        var field = document.createElement("DIV");
        if(service.iconURL){
            field.style.backgroundImage = "url('" + service.iconURL + "')";
        }
        field.textContent = service.id;
        field.addEventListener("click", createOnClick(service.id), false);
        
        field.classList.add("field");
        parentDiv.appendChild(field);
     }
}

function createOnClick(serviceId){
    return function() {
        ybridCtrl.playoutSwapService(serviceId,
                (result) => {
                    handleSwapServiceInfoResult(result.bouquet);
                },
                (statusCode, message, object) => {
                });
        spinningWheelOn();
    };
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
    disableCTRLButton(document.getElementById("back-to-main-button"));
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
    ybridCtrl.sessionSetMaxBitRate(bitRate,
            (result) => {
                console.info("set-max-bit-rate response [maxBitRate: "
                        + result.maxBitRate + "].");
            },
            (statusCode, message, object) => {
            });
}

function swapButtonClicked() {
    ybridCtrl.playoutSwapItem(
            (result) => {
                console.info("swap item was successfull, response [swapsLeft: "
                        + result.swapsLeft + ", nextSwapReturnsToMain: "
                        + result.nextSwapReturnsToMain + "].");
            },
            (statusCode, message, object) => {
                console.warn("swap item was unsuccessfull, response [swapsLeft: "
                        + object.swapsLeft + ", nextSwapReturnsToMain: "
                        + object.nextSwapReturnsToMain + "].");
            });
    spinningWheelOn();
}

function rewindButtonClicked() {
    ybridCtrl.playoutWind(-60000, handleWindResult,
            (statusCode, message, object) => {
            });
    spinningWheelOn();
}

function windToButtonClicked(requestedTimestamp) {
    ybridCtrl.playoutWindTo(requestedTimestamp, handleWindResult,
            (statusCode, message, object) => {
            });
    spinningWheelOn();
}

function backToNowButtonClicked() {
    ybridCtrl.playoutWindBackToLive(handleWindResult,
            (statusCode, message, object) => {
            });
    spinningWheelOn();
}

function backToMainButtonClicked() {
    ybridCtrl.playoutBackToMain(handleWindResult,
            (statusCode, message, object) => {
            });
    spinningWheelOn();
}

function fastForwardButtonClicked() {
    ybridCtrl.playoutWind(60000, handleWindResult,
            (statusCode, message, object) => {
            });
    spinningWheelOn();
}

function skipBackwardsTypedButtonClicked(requestedItemType) {
    ybridCtrl.playoutSkipBackwards(requestedItemType, handleWindResult,
            (statusCode, message, object) => {
            });
    spinningWheelOn();
}

function skipForwardsTypedButtonClicked(requestedItemType) {
    ybridCtrl.playoutSkipForwards(requestedItemType, handleWindResult,
            (statusCode, message, object) => {
            });
    spinningWheelOn();
}

function skipBackwardsButtonClicked() {
    ybridCtrl.playoutSkipBackwards(null, handleWindResult,
            (statusCode, message, object) => {
            });
    spinningWheelOn();
}

function skipForwardsButtonClicked() {
    ybridCtrl.playoutSkipForwards(null, handleWindResult,
            (statusCode, message, object) => {
            });
    spinningWheelOn();
}
