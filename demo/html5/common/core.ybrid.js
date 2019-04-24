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
 * @link https://github.com/ybrid/player-interaction#wind
 */
function wind(schemeVal, hostVal, pathVal, sessionIdVal, duration) {
    var xmlhttp = new XMLHttpRequest();
    var url = schemeVal + "://" + hostVal + pathVal + "/ctrl/wind?duration="
            + duration + "&sessionId=" + sessionIdVal;
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            handleWindResult(response);
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
 * @link https://github.com/ybrid/player-interaction#back-to-now
 */
function backToNow(schemeVal, hostVal, pathVal, sessionIdVal) {
    var xmlhttp = new XMLHttpRequest();
    var url = schemeVal + "://" + hostVal + pathVal
            + "/ctrl/back-to-now?sessionId=" + sessionIdVal;
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            handleWindResult(response);
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
            handleWindResult(response);
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
            handleWindResult(response);
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
