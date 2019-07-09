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
     *                schemeVal
     * @param {String}
     *                hostVal
     * @param {String}
     *                pathVal
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
     * setMaxBitRate.
     * 
     * @param {int}
     *                maxBitRateVal - maximum bit rate
     * @param {Function}
     *                successHandler
     * @param {Function}
     *                errorHandler
     * @link https://github.com/ybrid/player-interaction#set-max-bit-rate
     */
    function setMaxBitRate(maxBitRateVal, successHandler, errorHandler) {
        var url = instance.commandBaseURL + "set-max-bit-rate?sessionId=" + instance.sessionId
                + "&value=" + maxBitRateVal;
        fetchJsonXHR(url, successHandler);
    }    


    /**
     * swap.
     * 
     * @param {Function}
     *                successHandler
     * @param {Function}
     *                errorHandler
     * @link https://github.com/ybrid/player-interaction#swap
     */
    function swap(successHandler, errorHandler) {
        var url = instance.commandBaseURL + "swap?sessionId=" + instance.sessionId;
        fetchJsonXHR(url, successHandler);
    }

    /**
     * swapInfo.
     * 
     * @param {Function}
     *                successHandler
     * @param {Function}
     *                errorHandler
     * @link https://github.com/ybrid/player-interaction#swap-info
     */
    function swapInfo(successHandler, errorHandler) {
        var url = instance.commandBaseURL + "swap-info?sessionId=" + instance.sessionId;
        fetchJsonXHR(url, successHandler);
    }

    return instance;
}

