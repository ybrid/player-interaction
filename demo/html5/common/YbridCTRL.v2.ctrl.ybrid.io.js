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
    
    const COMMAND__SESSION_CREATE = "session/create";
    const COMMAND__SESSION_CLOSE = "session/close";
    const COMMAND__SESSION_INFO = "session/info";
    const COMMAND__SESSION_SET_MAX_BIT_RATE = "session/set-max-bit-rate";
    
    const COMMAND__PLAYOUT_SWAP_ITEM = "playout/swap/item";
    const COMMAND__PLAYOUT_SWAP_ITEM_INFO = "playout/swap/item/info";
    const COMMAND__PLAYOUT_SWAP_SERVICE = "playout/swap/service";
    const COMMAND__PLAYOUT_SWAP_SERVICE_INFO = "playout/swap/service/info";
    
    const COMMAND__PLAYOUT_WIND = "playout/wind";
    const COMMAND__PLAYOUT_WIND_BACK_TO_LIVE = "playout/wind/back-to-live";
    const COMMAND__PLAYOUT_SKIP_FORWARDS = "playout/skip/forwards";
    const COMMAND__PLAYOUT_SKIP_BACKWARDS = "playout/skip/backwards";
    
    
    const PARAM__SESSION_ID = "session-id";
    const PARAM__VALUE = "value";
    const PARAM__DURATION = "duration";
    const PARAM__TIMESTAMP = "ts";
    const PARAM__ITEM_TYPE = "item-type";
    const PARAM__SERVICE_ID = "service-id";
    
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
    
    function _createCommandURL(command, parameters){
        var url = instance.commandBaseURL + command;
        if(parameters){
            var start = true;
            for(key in parameters){
                if(start){
                    url += "?";
                    start = false;
                } else {
                    url += "&";
                }
                url += key + "=" + parameters[key];
            }
        }
        return url;
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
        let url = _createCommandURL(COMMAND__SESSION_CREATE, {});
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
        let parameters = {};
        parameters[PARAM__SESSION_ID] = instance.sessionId;
        let url = _createCommandURL(COMMAND__SESSION_INFO, parameters);
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
        let parameters = {};
        parameters[PARAM__SESSION_ID] = instance.sessionId;
        let url = _createCommandURL(COMMAND__SESSION_CLOSE, parameters);
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
        let parameters = {};
        parameters[PARAM__SESSION_ID] = instance.sessionId;
        parameters[PARAM__VALUE] = maxBitRateVal;
        let url = _createCommandURL(COMMAND__SESSION_SET_MAX_BIT_RATE, parameters);
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
        let parameters = {};
        parameters[PARAM__SESSION_ID] = instance.sessionId;
        parameters[PARAM__DURATION] = duration;
        let url = _createCommandURL(COMMAND__PLAYOUT_WIND, parameters);
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
        let parameters = {};
        parameters[PARAM__SESSION_ID] = instance.sessionId;
        parameters[PARAM__TIMESTAMP] = timestamp;
        let url = _createCommandURL(COMMAND__PLAYOUT_WIND, parameters);
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
        let parameters = {};
        parameters[PARAM__SESSION_ID] = instance.sessionId;
        let url = _createCommandURL(COMMAND__PLAYOUT_WIND_BACK_TO_LIVE, parameters);
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
        let parameters = {};
        parameters[PARAM__SESSION_ID] = instance.sessionId;
        if (requestedItemType) {
            parameters[PARAM__ITEM_TYPE] = requestedItemType;
        }
        let url = _createCommandURL(COMMAND__PLAYOUT_SKIP_BACKWARDS, parameters);
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
        let parameters = {};
        parameters[PARAM__SESSION_ID] = instance.sessionId;
        if (requestedItemType) {
            parameters[PARAM__ITEM_TYPE] = requestedItemType;
        }
        let url = _createCommandURL(COMMAND__PLAYOUT_SKIP_FORWARDS, parameters);
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
        let parameters = {};
        parameters[PARAM__SESSION_ID] = instance.sessionId;
        let url = _createCommandURL(COMMAND__PLAYOUT_SWAP_ITEM, parameters);
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
        let parameters = {};
        parameters[PARAM__SESSION_ID] = instance.sessionId;
        let url = _createCommandURL(COMMAND__PLAYOUT_SWAP_ITEM_INFO, parameters);
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
        let parameters = {};
        parameters[PARAM__SESSION_ID] = instance.sessionId;
        parameters[PARAM__SERVICE_ID] = serviceId;
        let url = _createCommandURL(COMMAND__PLAYOUT_SWAP_SERVICE, parameters);
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
        let parameters = {};
        parameters[PARAM__SESSION_ID] = instance.sessionId;
        let url = _createCommandURL(COMMAND__PLAYOUT_SWAP_SERVICE_INFO, parameters);
        _cURL(url, successHandler, errorHandler);
    }

    return instance;
}

