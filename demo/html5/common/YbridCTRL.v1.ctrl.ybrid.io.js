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
    function createSession(schemeVal, hostVal, pathVal, successHandler, errorHandler) {
        _updateBaseURLs(scheme, host, path);
        var url = instance.commandBaseURL + "create-session";
        // console.info(url);
        fetchJson(url, //
            (jsonObj) => {
                instance.sessionId = jsonObj.sessionId;
                _updateBaseURLs(scheme, jsonObj.host, path);
                // console.info("created new session with [id: " + sessionId
                // + ", new base URL: " + baseURL + "].");
                successHandler(jsonObj);
            });
    }
    
    /**
     * @param {int}
     *            maxBitRateVal - maximum bit rate
     * @link https://github.com/ybrid/player-interaction#set-max-bit-rate
     */
    function setMaxBitRate(maxBitRateVal, successHandler, errorHandler) {
        var url = instance.commandBaseURL + "set-max-bit-rate?sessionId=" + instance.sessionId
                + "&value=" + maxBitRateVal;
        fetchJsonXHR(url, successHandler);
    }
    
    /**
     * @param {Long}
     *            duration - negative to wind backwards, positive to wind
     *            forwards. Value in milliseconds.
     * @link https://github.com/ybrid/player-interaction#wind
     */
    function wind(duration, successHandler, errorHandler) {
        var url = instance.commandBaseURL + "wind?duration=" + duration + "&sessionId="
                + instance.sessionId;
        fetchJsonXHR(url, successHandler);
    }

    /**
     * @param {Long}
     *            ts - timestamp to wind to, value in milliseconds since
     *            1.1.1970.
     * @link https://github.com/ybrid/player-interaction#wind
     */
    function windTo(timestamp, successHandler, errorHandler) {
        var url = instance.commandBaseURL + "wind?ts=" + timestamp + "&sessionId="
                + instance.sessionId;
        fetchJsonXHR(url, successHandler);
    }

    /**
     * @link https://github.com/ybrid/player-interaction#back-to-now
     */
    function backToNow(successHandler, errorHandler) {
        var url = instance.commandBaseURL + "back-to-now?sessionId=" + instance.sessionId;
        fetchJsonXHR(url, successHandler);
    }

    /**
     * @param {String}
     *            requestedItemType - null or one of (ADVERTISEMENT | COMEDY |
     *            JINGLE | MUSIC | NEWS | VOICE | WEATHER | TRAFFIC)
     * @link https://github.com/ybrid/player-interaction#skip-backwards
     */
    function skipBackwards(requestedItemType, successHandler, errorHandler) {
        var url = instance.commandBaseURL + "skip-backwards?sessionId=" + instance.sessionId;
        if (requestedItemType) {
            url += "&requestedItemType=" + requestedItemType;
        }
        fetchJsonXHR(url, successHandler);
    }

    /**
     * @param {String}
     *            requestedItemType - null or one of (ADVERTISEMENT | COMEDY |
     *            JINGLE | MUSIC | NEWS | VOICE | WEATHER | TRAFFIC)
     * @link https://github.com/ybrid/player-interaction#skip-forwards
     */
    function skipForwards(requestedItemType, successHandler, errorHandler) {
        var url = instance.commandBaseURL + "skip-forwards?sessionId=" + instance.sessionId;
        if (requestedItemType) {
            url += "&requestedItemType=" + requestedItemType;
        }
        fetchJsonXHR(url, successHandler);
    }

    /**
     * @link https://github.com/ybrid/player-interaction#swap
     */
    function swap(successHandler, errorHandler) {
        var url = instance.commandBaseURL + "swap?sessionId=" + instance.sessionId;
        fetchJsonXHR(url, successHandler);
    }

    /**
     * @link https://github.com/ybrid/player-interaction#swap-info
     */
    function swapInfo(successHandler, errorHandler) {
        var url = instance.commandBaseURL + "swap-info?sessionId=" + instance.sessionId;
        fetchJsonXHR(url, successHandler);
    }

    return instance;
}

