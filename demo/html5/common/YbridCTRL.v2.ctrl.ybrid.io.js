var io = io || {};
io.ybrid = io.ybrid || {};
io.ybrid.ctrl = io.ybrid.ctrl || {};
io.ybrid.ctrl.v2 = io.ybrid.ctrl.v2 || {};

/**
 * YbridCTRL.v2.ctrl.ybrid.io.js
 * 
 * @author Sebastian A. Weiß (C) 2019 nacamar GmbH
 */
io.ybrid.ctrl.v2.YbridCTRL = function () {

    const PATH_BASE = "/ctrl/v2/";

    var instance = {
        baseURL: null,
        commandBaseURL: null,
        sessionId: null,
        
        // public function interface
        sessionCreate: sessionCreate,
        sessionInfo: sessionInfo,
        sessionClose: sessionClose,
        sessionSetMaxBitRate: sessionSetMaxBitRate,
        
        playoutWind: playoutWind,
        playoutWindTo: playoutWindTo,
        playoutWindBackToLive: playoutWindBackToLive,
        playoutSkipBackwards: playoutSkipBackwards,
        playoutSkipForwards: playoutSkipForwards,
        playoutSwapItem: playoutSwapItem,
        playoutSwapItemInfo: playoutSwapItemInfo,
        playoutSwapService: playoutSwapService,
        playoutSwapServiceInfo: playoutSwapServiceInfo,
        
        // public function interface due to compatibility with v1
        createSession: sessionCreate,
        setMaxBitRate: sessionSetMaxBitRate,
        swap: playoutSwapItem,
        swapInfo: playoutSwapItemInfo
    }
    
    function _updateBaseURLs(scheme, host, path){
        instance.baseURL = scheme + '://' + host + path;
        instance.commandBaseURL = instance.baseURL + PATH_BASE;
    }
    
    function _isSuccess(response){
    	return response.__responseHeader.success == true;
    }
    
    function _parseResponse(response, successHandler, errorHandler){
        console.info("Received response:");
        console.info(response);
        if(_isSuccess(response)){
            if(successHandler){
                successHandler(response.__responseObject);
            }
        } else if(errorHandler){
            errorHandler(response.__responseHeader.statusCode, response.__responseHeader.mesage, response.__responseObject);
        }
    }
    
    function _cURL(url, successHandler, errorHandler){
        console.info("Requesting [url: " + url + "].");
        fetchJson(url, //
            (jsonObj) => {
                _parseResponse(jsonObj, successHandler, errorHandler);
            });
    }
    
    /**
     * sessionCreate.
     * 
     * @param {String}
     *            schemeVal
     * @param {String}
     *            hostVal
     * @param {String}
     *            pathVal
     * @param {Function}
     *            successHandler
     * @param {Function}
     *            errorHandler
     */
    function sessionCreate(schemeVal, hostVal, pathVal, successHandler, errorHandler) {
        _updateBaseURLs(scheme, host, path);
        var url = instance.commandBaseURL + "session/create";
        // console.info(url);
        _cURL(url,
            (result) => {
                instance.sessionId = result.sessionId;
                _updateBaseURLs(scheme, result.host, path);
                // console.info("created new session with [id: " + sessionId
                // + ", new base URL: " + baseURL + "].");
                if(successHandler){
                    successHandler(result);
                }
            }, //
            errorHandler);
    }
    
    /**
     * sessionInfo.
     * 
     * @param {Function}
     *            successHandler
     * @param {Function}
     *            errorHandler
     */
    function sessionInfo(successHandler, errorHandler){
        var url = instance.commandBaseURL + "session/info?sessionId=" + instance.sessionId;
        _cURL(url, successHandler, errorHandler);
    }
    
    /**
     * sessionClose.
     * 
     * @param {Function}
     *            successHandler
     * @param {Function}
     *            errorHandler
     */
    function sessionClose(successHandler, errorHandler){
        var url = instance.commandBaseURL + "session/close?sessionId=" + instance.sessionId;
        _cURL(url, successHandler, errorHandler);
    }
    
    /**
     * sessionSetMaxBitRate.
     * 
     * @param {int}
     *            maxBitRateVal - maximum bit rate
     * @param {Function}
     *            successHandler
     * @param {Function}
     *            errorHandler
     * @link https://github.com/ybrid/player-interaction#set-max-bit-rate
     */
    function sessionSetMaxBitRate(maxBitRateVal, successHandler, errorHandler) {
        var url = instance.commandBaseURL + "session/setMaxBitRate?sessionId=" + instance.sessionId
                + "&value=" + maxBitRateVal;
        _cURL(url, successHandler, errorHandler);
    }
    
    /**
     * playoutWind.
     * 
     * @param {Long}
     *            duration - negative to wind backwards, positive to wind
     *            forwards. Value in milliseconds.
     * @param {Function}
     *            successHandler
     * @param {Function}
     *            errorHandler
     * @link https://github.com/ybrid/player-interaction#wind
     */
    function playoutWind(duration, successHandler, errorHandler) {
        var url = instance.commandBaseURL + "playout/wind?duration=" + duration + "&sessionId="
                + instance.sessionId;
        _cURL(url, successHandler, errorHandler);
    }

    /**
     * playoutWindTo.
     * 
     * @param {Long}
     *            ts - timestamp to wind to, value in milliseconds since
     *            1.1.1970.
     * @param {Function}
     *            successHandler
     * @param {Function}
     *            errorHandler
     * @link https://github.com/ybrid/player-interaction#wind
     */
    function playoutWindTo(timestamp, successHandler, errorHandler) {
        var url = instance.commandBaseURL + "playout/wind?ts=" + timestamp + "&sessionId="
                + instance.sessionId;
        _cURL(url, successHandler, errorHandler);
    }

    /**
     * playoutWindBackToLive.
     * 
     * @param {Function}
     *            successHandler
     * @param {Function}
     *            errorHandler
     * @link https://github.com/ybrid/player-interaction#back-to-now
     */
    function playoutWindBackToLive(successHandler, errorHandler) {
        var url = instance.commandBaseURL + "playout/wind/backToLive?sessionId=" + instance.sessionId;
        _cURL(url, successHandler, errorHandler);
    }

    /**
     * playoutSkipBackwards.
     * 
     * @param {String}
     *            requestedItemType - null or one of (ADVERTISEMENT | COMEDY |
     *            JINGLE | MUSIC | NEWS | VOICE | WEATHER | TRAFFIC)
     * @param {Function}
     *            successHandler
     * @param {Function}
     *            errorHandler
     * @link https://github.com/ybrid/player-interaction#skip-backwards
     */
    function playoutSkipBackwards(requestedItemType, successHandler, errorHandler) {
        var url = instance.commandBaseURL + "playout/skip/backwards?sessionId=" + instance.sessionId;
        if (requestedItemType) {
            url += "&requestedItemType=" + requestedItemType;
        }
        _cURL(url, successHandler, errorHandler);
    }

    /**
     * playoutSkipForwards.
     * 
     * @param {String}
     *            requestedItemType - null or one of (ADVERTISEMENT | COMEDY |
     *            JINGLE | MUSIC | NEWS | VOICE | WEATHER | TRAFFIC)
     * @param {Function}
     *            successHandler
     * @param {Function}
     *            errorHandler
     * @link https://github.com/ybrid/player-interaction#skip-forwards
     */
    function playoutSkipForwards(requestedItemType, successHandler, errorHandler) {
        var url = instance.commandBaseURL + "playout/skip/forwards?sessionId=" + instance.sessionId;
        if (requestedItemType) {
            url += "&requestedItemType=" + requestedItemType;
        }
        _cURL(url, successHandler, errorHandler);
    }

    /**
     * playoutSwapItem.
     * 
     * @param {Function}
     *            successHandler
     * @param {Function}
     *            errorHandler
     * @link https://github.com/ybrid/player-interaction#swap
     */
    function playoutSwapItem(successHandler, errorHandler) {
        var url = instance.commandBaseURL + "playout/swap/item?sessionId=" + instance.sessionId;
        _cURL(url, successHandler, errorHandler);
    }

    /**
     * playoutSwapItemInfo.
     * 
     * @param {Function}
     *            successHandler
     * @param {Function}
     *            errorHandler
     * @link https://github.com/ybrid/player-interaction#swap-info
     */
    function playoutSwapItemInfo(successHandler, errorHandler) {
        var url = instance.commandBaseURL + "playout/swap/item/info?sessionId=" + instance.sessionId;
        _cURL(url, successHandler, errorHandler);
    }

    /**
     * playoutSwapService.
     * 
     * @param {String}
     *            serviceId
     * @param {Function}
     *            successHandler
     * @param {Function}
     *            errorHandler
     * @link https://github.com/ybrid/player-interaction#swap
     */
    function playoutSwapService(serviceId, successHandler, errorHandler) {
        var url = instance.commandBaseURL + "playout/swap/service?sessionId=" + instance.sessionId 
            + "&serviceId=" + serviceId;
        _cURL(url, successHandler, errorHandler);
    }

    /**
     * playoutSwapServiceInfo.
     * 
     * @param {Function}
     *            successHandler
     * @param {Function}
     *            errorHandler
     * @link https://github.com/ybrid/player-interaction#swap-info
     */
    function playoutSwapServiceInfo(successHandler, errorHandler) {
        var url = instance.commandBaseURL + "playout/swap/service/info?sessionId=" + instance.sessionId;
        _cURL(url, successHandler, errorHandler);
    }

    return instance;
}

