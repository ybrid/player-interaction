/**
 * core.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2018 nacamar GmbH
 */

/**
 * @param {String}
 *            schemeVal - http or https
 * @param {String}
 *            hostVal - host of streaming server
 * @param {String}
 *            pathVal - path of requested resource
 * @param {String}
 *            sessionIdVal - session id
 * @param {int}
 *            maxBitRateVal - maximum bit rate
 * @link https://github.com/ybrid/player-interaction#set-max-bit-rate
 */
function setMaxBitRate(schemeVal, hostVal, pathVal, sessionIdVal, maxBitRateVal) {
    var xmlhttp = new XMLHttpRequest();
    var url = schemeVal + "://" + hostVal + pathVal
            + "/ctrl/set-max-bit-rate?sessionId=" + sessionIdVal + "&value="
            + maxBitRateVal;
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            console.info("set-max-bit-rate response [maxBitRate: "
                    + response.maxBitRate + "].");
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/**
 * @param {String}
 *            schemeVal - http or https
 * @param {String}
 *            hostVal - host of streaming server
 * @param {String}
 *            pathVal - path of requested resource
 * @param {String}
 *            sessionIdVal - session id
 * @link https://github.com/ybrid/player-interaction#rewind
 */
function rewind(schemeVal, hostVal, pathVal, sessionIdVal) {
    var xmlhttp = new XMLHttpRequest();
    var url = schemeVal + "://" + hostVal + pathVal
            + "/ctrl/rewind?duration=60000&sessionId=" + sessionIdVal;
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            console.info("rewind result [requestedDuration: "
                    + response.requestedDuration + ", effectiveDuration: "
                    + response.effectiveDuration + "].");
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/**
 * @param {String}
 *            schemeVal - http or https
 * @param {String}
 *            hostVal - host of streaming server
 * @param {String}
 *            pathVal - path of requested resource
 * @param {String}
 *            sessionIdVal - session id
 * @link https://github.com/ybrid/player-interaction#fast-forward
 */
function fastForward(schemeVal, hostVal, pathVal, sessionIdVal) {
    var xmlhttp = new XMLHttpRequest();
    var url = schemeVal + "://" + hostVal + pathVal
            + "/ctrl/fast-forward?duration=60000&sessionId=" + sessionIdVal;
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            console.info("fast forward result [requestedDuration: "
                    + response.requestedDuration + ", effectiveDuration: "
                    + response.effectiveDuration + "].");
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/**
 * @param {String}
 *            schemeVal - http or https
 * @param {String}
 *            hostVal - host of streaming server
 * @param {String}
 *            pathVal - path of requested resource
 * @param {String}
 *            sessionIdVal - session id
 * @link https://github.com/ybrid/player-interaction#skipt-backwards
 */
function skipBackwards(schemeVal, hostVal, pathVal, sessionIdVal) {
    var xmlhttp = new XMLHttpRequest();
    var url = schemeVal + "://" + hostVal + pathVal
            + "/ctrl/skip-backwards?sessionId=" + sessionIdVal;
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            console.info("skip result [skippedMilliseconds: "
                    + response.skippedMilliseconds + "].");
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/**
 * @param {String}
 *            schemeVal - http or https
 * @param {String}
 *            hostVal - host of streaming server
 * @param {String}
 *            pathVal - path of requested resource
 * @param {String}
 *            sessionIdVal - session id
 * @link https://github.com/ybrid/player-interaction#skipt-forwards
 */
function skipForwards(schemeVal, hostVal, pathVal, sessionIdVal) {
    var xmlhttp = new XMLHttpRequest();
    var url = schemeVal + "://" + hostVal + pathVal
            + "/ctrl/skip-forwards?sessionId=" + sessionIdVal;
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            console.info("skip result [skippedMilliseconds: "
                    + response.skippedMilliseconds + "].");
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/**
 * @param {String}
 *            schemeVal - http or https
 * @param {String}
 *            hostVal - host of streaming server
 * @param {String}
 *            pathVal - path of requested resource
 * @param {String}
 *            sessionIdVal - session id
 * @link https://github.com/ybrid/player-interaction#swap
 */
function swap(schemeVal, hostVal, pathVal, sessionIdVal) {
    var xmlhttp = new XMLHttpRequest();
    var url = schemeVal + "://" + hostVal + pathVal + "/ctrl/swap?sessionId="
            + sessionIdVal;
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            console.info("swap response [swapWasSuccessfull: "
                    + response.swapWasSuccessfull + ", swapsLeft: "
                    + response.swapsLeft + ", nextSwapReturnsToMain: "
                    + response.nextSwapReturnsToMain + "].");
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/**
 * @param {String}
 *            baseURL
 * @param {String}
 *            sessionIdVal - session id
 * @link https://github.com/ybrid/player-interaction#swap-info
 */
function swapInfo(baseURL, sessionIdVal) {
    var xmlhttp = new XMLHttpRequest();
    var url = baseURL + "/ctrl/swap-info?sessionId=" + sessionIdVal;
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            console.info("swap info response [swapsLeft: " + response.swapsLeft
                    + ", nextSwapReturnsToMain: "
                    + response.nextSwapReturnsToMain + "].");
            handleSwapInfo(response);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
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

/**
 * Shows overlay with companion ad.
 * 
 * @param companionURL
 * @param {String}
 *            alt - alternative text / tooltip for companion
 * @param onClickThrough -
 *            event handler triggered on mouse click on companion
 */
function showCompanionAd(companionURL, alt, onClickThrough) {
    if (showCompanions) {
        var adOverlay = document.getElementById("ad-overlay");
        var companion = document.getElementById("companion");
        var as = companion.getElementsByTagName("a");
        var a;
        var img;
        if (as.length == 0) {
            a = document.createElement("a");
            img = document.createElement("img");
            a.appendChild(img);
            companion.appendChild(a);
        } else {
            a = as[0];
            img = a.getElementsByTagName("img")[0];
        }
        a.href = onClickThrough;
        a.target = "_blank";
        img.src = companionURL;
        img.alt = alt;
        img.title = alt;
        adOverlay.style.display = "block";
        // SEBASTIAN send create view
    }
}

/**
 * Hides companion ad overlay.
 */
function hideCompanionAd() {
    var adOverlay = document.getElementById("ad-overlay");
    adOverlay.style.display = "none";
}
