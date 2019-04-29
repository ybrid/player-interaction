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
    var url = schemeVal + "://" + hostVal + pathVal
            + "/ctrl/set-max-bit-rate?sessionId=" + sessionIdVal + "&value="
            + maxBitRateVal;
    fetchJsonXHR(url, function(response) {
        console.info("set-max-bit-rate response [maxBitRate: "
                + response.maxBitRate + "].");
    });
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
 * @param {Long}
 *            duration - negative to wind backwards, positive to wind forwards.
 *            Value in milliseconds.
 * @link https://github.com/ybrid/player-interaction#wind
 */
function wind(schemeVal, hostVal, pathVal, sessionIdVal, duration) {
    var url = schemeVal + "://" + hostVal + pathVal + "/ctrl/wind?duration="
            + duration + "&sessionId=" + sessionIdVal;
    fetchJsonXHR(url, function(response) {
        handleWindResult(response);
    });
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
 * @param {Long}
 *            ts - timestamp to wind to, value in milliseconds since 1.1.1970.
 * @link https://github.com/ybrid/player-interaction#wind
 */
function windTo(schemeVal, hostVal, pathVal, sessionIdVal, timestamp) {
    var url = schemeVal + "://" + hostVal + pathVal + "/ctrl/wind?ts="
            + timestamp + "&sessionId=" + sessionIdVal;
    fetchJsonXHR(url, function(response) {
        handleWindResult(response);
    });
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
    var url = schemeVal + "://" + hostVal + pathVal
            + "/ctrl/back-to-now?sessionId=" + sessionIdVal;
    fetchJsonXHR(url, function(response) {
        handleWindResult(response);
    });
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
 * @param {String}
 *            requestedItemType - null or one of (ADVERTISEMENT | COMEDY |
 *            JINGLE | MUSIC | NEWS | VOICE | WEATHER | TRAFFIC)
 * @link https://github.com/ybrid/player-interaction#skip-backwards
 */
function skipBackwards(schemeVal, hostVal, pathVal, sessionIdVal,
        requestedItemType) {
    var url = schemeVal + "://" + hostVal + pathVal
            + "/ctrl/skip-backwards?sessionId=" + sessionIdVal;
    if (requestedItemType) {
        url += "&requestedItemType=" + requestedItemType;
    }
    fetchJsonXHR(url, function(response) {
        handleWindResult(response);
    });
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
 * @param {String}
 *            requestedItemType - null or one of (ADVERTISEMENT | COMEDY |
 *            JINGLE | MUSIC | NEWS | VOICE | WEATHER | TRAFFIC)
 * @link https://github.com/ybrid/player-interaction#skip-forwards
 */
function skipForwards(schemeVal, hostVal, pathVal, sessionIdVal,
        requestedItemType) {
    var url = schemeVal + "://" + hostVal + pathVal
            + "/ctrl/skip-forwards?sessionId=" + sessionIdVal;
    if (requestedItemType) {
        url += "&requestedItemType=" + requestedItemType;
    }
    fetchJsonXHR(url, function(response) {
        handleWindResult(response);
    });
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
    var url = schemeVal + "://" + hostVal + pathVal + "/ctrl/swap?sessionId="
            + sessionIdVal;
    fetchJsonXHR(url, function(response) {
        console.info("swap response [swapWasSuccessfull: "
                + response.swapWasSuccessfull + ", swapsLeft: "
                + response.swapsLeft + ", nextSwapReturnsToMain: "
                + response.nextSwapReturnsToMain + "].");
    });
}

/**
 * @param {String}
 *            baseURL
 * @param {String}
 *            sessionIdVal - session id
 * @link https://github.com/ybrid/player-interaction#swap-info
 */
function swapInfo(baseURL, sessionIdVal) {
    var url = baseURL + "/ctrl/swap-info?sessionId=" + sessionIdVal;
    fetchJsonXHR(url, function(response) {
        console.info("swap info response [swapsLeft: " + response.swapsLeft
                + ", nextSwapReturnsToMain: " + response.nextSwapReturnsToMain
                + "].");
        handleSwapInfo(response);
    });
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
