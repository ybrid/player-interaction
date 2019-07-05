var io = io || {};
io.ybrid = io.ybrid || {};
io.ybrid.ctrl = io.ybrid.ctrl || {};
io.ybrid.ctrl.v1 = io.ybrid.ctrl.v1 || {};

/**
 * YbridCTRL.v1.ctrl.ybrid.io.js
 * 
 * @author Sebastian A. Weiß (C) 2019 nacamar GmbH
 */
io.ybrid.ctrl.v1.YbridCTRL = function () {

    const PATH_BASE = "/ctrl/";

    var instance = {
        baseURL: null,
        commandBaseURL: null,
        sessionId: null,
        createSession: createSession,
        setMaxBitRate: setMaxBitRate,
        wind: wind,
        windTo: windTo,
        backToNow: backToNow,
        skipBackwards: skipBackwards,
        skipForwards: skipForwards,
        swap: swap,
        swapInfo: swapInfo
    }
    
    function _updateBaseURLs(scheme, host, path){
        instance.baseURL = scheme + '://' + host + path;
        instance.commandBaseURL = instance.baseURL + PATH_BASE;
    }
    
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
        _updateBaseURLs(scheme, host, path);
        var url = instance.commandBaseURL + "create-session";
        // console.info(url);
        fetchJson(url, //
            (jsonObj) => {
                instance.sessionId = jsonObj.sessionId;
                _updateBaseURLs(scheme, jsonObj.host, path);
                // console.info("created new session with [id: " + sessionId
                // + ", new base URL: " + baseURL + "].");
                callback(instance.baseURL, instance.sessionId);
            });
    }
    
    /**
     * @param {int}
     *            maxBitRateVal - maximum bit rate
     * @link https://github.com/ybrid/player-interaction#set-max-bit-rate
     */
    function setMaxBitRate(maxBitRateVal) {
        var url = instance.commandBaseURL + "set-max-bit-rate?sessionId=" + instance.sessionId
                + "&value=" + maxBitRateVal;
        fetchJsonXHR(url, 
            (response) => {
                console.info("set-max-bit-rate response [maxBitRate: "
                    + response.maxBitRate + "].");
            });
    }
    
    /**
     * @param {Long}
     *            duration - negative to wind backwards, positive to wind
     *            forwards. Value in milliseconds.
     * @link https://github.com/ybrid/player-interaction#wind
     */
    function wind(duration) {
        var url = instance.commandBaseURL + "wind?duration=" + duration + "&sessionId="
                + instance.sessionId;
        fetchJsonXHR(url, 
            (response) => {
                handleWindResult(response);
            });
    }

    /**
     * @param {Long}
     *            ts - timestamp to wind to, value in milliseconds since
     *            1.1.1970.
     * @link https://github.com/ybrid/player-interaction#wind
     */
    function windTo(timestamp) {
        var url = instance.commandBaseURL + "wind?ts=" + timestamp + "&sessionId="
                + instance.sessionId;
        fetchJsonXHR(url, 
            (response) => {
                handleWindResult(response);
            });
    }

    /**
     * @link https://github.com/ybrid/player-interaction#back-to-now
     */
    function backToNow() {
        var url = instance.commandBaseURL + "back-to-now?sessionId=" + instance.sessionId;
        fetchJsonXHR(url, 
            (response) => {
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
        var url = instance.commandBaseURL + "skip-backwards?sessionId=" + instance.sessionId;
        if (requestedItemType) {
            url += "&requestedItemType=" + requestedItemType;
        }
        fetchJsonXHR(url, 
            (response) => {
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
        var url = instance.commandBaseURL + "skip-forwards?sessionId=" + instance.sessionId;
        if (requestedItemType) {
            url += "&requestedItemType=" + requestedItemType;
        }
        fetchJsonXHR(url,
            (response) => {
                handleWindResult(response);
            });
    }

    /**
     * @link https://github.com/ybrid/player-interaction#swap
     */
    function swap() {
        var url = instance.commandBaseURL + "swap?sessionId=" + instance.sessionId;
        fetchJsonXHR(url, 
            (response) => {
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
        var url = instance.commandBaseURL + "swap-info?sessionId=" + instance.sessionId;
        fetchJsonXHR(url, 
            (response) => {
                console.info("swap info response [swapsLeft: " + response.swapsLeft
                    + ", nextSwapReturnsToMain: " + response.nextSwapReturnsToMain
                    + "].");
                handleSwapInfo(response);
            });
    }

    return instance;
}

