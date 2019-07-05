/**
 * v1.api.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2019 nacamar GmbH
 */

var baseURL = null;
var sessionId = null;

/**
 * createSession.
 * 
 * @param {String}
 *            schemeVal
 * @param {String}
 *            hostVal
 * @param {String}
 *            pathVal
 */
function createSession(schemeVal, hostVal, pathVal, callback) {
    baseURL = createBaseURL(scheme, host, path);
    var url = baseURL + "/ctrl/create-session";
    // console.info(url);
    fetchJson(url, function(jsonObj) {
        sessionId = jsonObj.sessionId;
        baseURL = createBaseURL(scheme, jsonObj.host, path);
        // console.info("created new session with [id: " + sessionId
        // + ", new base URL: " + baseURL + "].");
        callback(baseURL, sessionId);
    });
}

/**
 * @param {int}
 *            maxBitRateVal - maximum bit rate
 * @link https://github.com/ybrid/player-interaction#set-max-bit-rate
 */
function setMaxBitRate(maxBitRateVal) {
    var url = baseURL + "/ctrl/set-max-bit-rate?sessionId=" + sessionId
            + "&value=" + maxBitRateVal;
    fetchJsonXHR(url, function(response) {
        console.info("set-max-bit-rate response [maxBitRate: "
                + response.maxBitRate + "].");
    });
}

/**
 * @param {Long}
 *            duration - negative to wind backwards, positive to wind forwards.
 *            Value in milliseconds.
 * @link https://github.com/ybrid/player-interaction#wind
 */
function wind(duration) {
    var url = baseURL + "/ctrl/wind?duration=" + duration + "&sessionId="
            + sessionId;
    fetchJsonXHR(url, function(response) {
        handleWindResult(response);
    });
}

/**
 * @param {Long}
 *            ts - timestamp to wind to, value in milliseconds since 1.1.1970.
 * @link https://github.com/ybrid/player-interaction#wind
 */
function windTo(timestamp) {
    var url = baseURL + "/ctrl/wind?ts=" + timestamp + "&sessionId="
            + sessionId;
    fetchJsonXHR(url, function(response) {
        handleWindResult(response);
    });
}

/**
 * @link https://github.com/ybrid/player-interaction#back-to-now
 */
function backToNow() {
    var url = baseURL + "/ctrl/back-to-now?sessionId=" + sessionId;
    fetchJsonXHR(url, function(response) {
        handleWindResult(response);
    });
}

/**
 * @param {String}
 *            requestedItemType - null or one of (ADVERTISEMENT | COMEDY |
 *            JINGLE | MUSIC | NEWS | VOICE | WEATHER | TRAFFIC)
 * @link https://github.com/ybrid/player-interaction#skip-backwards
 */
function skipBackwards(requestedItemType) {
    var url = baseURL + "/ctrl/skip-backwards?sessionId=" + sessionId;
    if (requestedItemType) {
        url += "&requestedItemType=" + requestedItemType;
    }
    fetchJsonXHR(url, function(response) {
        handleWindResult(response);
    });
}

/**
 * @param {String}
 *            requestedItemType - null or one of (ADVERTISEMENT | COMEDY |
 *            JINGLE | MUSIC | NEWS | VOICE | WEATHER | TRAFFIC)
 * @link https://github.com/ybrid/player-interaction#skip-forwards
 */
function skipForwards(requestedItemType) {
    var url = baseURL + "/ctrl/skip-forwards?sessionId=" + sessionId;
    if (requestedItemType) {
        url += "&requestedItemType=" + requestedItemType;
    }
    fetchJsonXHR(url, function(response) {
        handleWindResult(response);
    });
}

/**
 * @link https://github.com/ybrid/player-interaction#swap
 */
function swap() {
    var url = baseURL + "/ctrl/swap?sessionId=" + sessionId;
    fetchJsonXHR(url, function(response) {
        console.info("swap response [swapWasSuccessfull: "
                + response.swapWasSuccessfull + ", swapsLeft: "
                + response.swapsLeft + ", nextSwapReturnsToMain: "
                + response.nextSwapReturnsToMain + "].");
    });
}

/**
 * @link https://github.com/ybrid/player-interaction#swap-info
 */
function swapInfo() {
    var url = baseURL + "/ctrl/swap-info?sessionId=" + sessionId;
    fetchJsonXHR(url, function(response) {
        console.info("swap info response [swapsLeft: " + response.swapsLeft
                + ", nextSwapReturnsToMain: " + response.nextSwapReturnsToMain
                + "].");
        handleSwapInfo(response);
    });
}
