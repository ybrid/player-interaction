/**
 * araicyp.js
 * @author Sebastian A. Weiß
 * (C) 2018 nacamar GmbH
 */

/**
 * @param {String}
 *                schemeVal - http or https
 * @param {String}
 *                hostVal - host of streaming server
 * @param {String}
 *                pathVal - path of requested resource
 * @param {Function}
 *            callback - callback function for retrieving session id
 */
function createSession(schemeVal, hostVal, pathVal, callback) {
    var xmlhttp = new XMLHttpRequest();
    var url = schemeVal + "://" + hostVal + "/" + pathVal + "/ctrl/create-session";
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            var niceJson = JSON.stringify(response, undefined, 4);
            $('#session-area').html(niceJson);
            callback(response.sessionId);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/**
 * @param {String}
 *                schemeVal - http or https
 * @param {String}
 *                hostVal - host of streaming server
 * @param {String}
 *                pathVal - path of requested resource
 * @param {String}
 *                sessionIdVal - session id
 */
function swap(schemeVal, hostVal, pathVal, sessionIdVal) {
    var xmlhttp = new XMLHttpRequest();
    var url = schemeVal + "://" + hostVal + "/" + pathVal + "/ctrl/swap?sessionId="
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
 *                schemeVal - http or https
 * @param {String}
 *                hostVal - host of streaming server
 * @param {String}
 *                pathVal - path of requested resource
 * @param {String}
 *                sessionIdVal - session id
 */
function swapInfo(schemeVal, hostVal, pathVal, sessionIdVal) {
    var xmlhttp = new XMLHttpRequest();
    var url = schemeVal + "://" + hostVal + "/" + pathVal
            + "/ctrl/swap-info?sessionId=" + sessionIdVal;
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            console.info("swap info response [swapsLeft: " + response.swapsLeft
                    + ", nextSwapReturnsToMain: "
                    + response.nextSwapReturnsToMain + "].");
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/**
 * @param {String}
 *                schemeVal - http or https
 * @param {String}
 *                hostVal - host of streaming server
 * @param {String}
 *                pathVal - path of requested resource
 * @param {String}
 *                sessionIdVal - session id
 */
function startSwapInfoWatcher(schemeVal, hostVal, pathVal, sessionIdVal) {
    setInterval(function() {
        swapInfo(schemeVal, hostVal, pathVal, sessionIdVal);
    }, 2000);
}
