/**
 * araicyp.js
 * @author Sebastian A. Weiß
 * (C) 2018 nacamar GmbH
 */

/**
 * @param {String}
 *            host - host of streaming server
 * @param {String}
 *            path - path of requested resource
 * @param {Function}
 *            callback - callback function for retrieving session id
 */
function createSession(host, path, callback) {
	var xmlhttp = new XMLHttpRequest();
	var url = "http://" + host + "/" + path + "/ctrl/create-session";
	xmlhttp.onreadystatechange = function() {
		if ((this.readyState == 4) && (this.status == 200)) {
			var response = JSON.parse(this.responseText);
			callback(response.sessionId);
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

/**
 * @param {String}
 *            hostVal - host of streaming server
 * @param {String}
 *            pathVal - path of requested resource
 * @param {String}
 *            sessionIdVal - session id
 */
function swap(hostVal, pathVal, sessionIdVal) {
	var xmlhttp = new XMLHttpRequest();
	var url = "http://" + hostVal + "/" + pathVal + "/ctrl/swap?sessionId="
			+ sessionIdVal;
	xmlhttp.onreadystatechange = function() {
		if ((this.readyState == 4) && (this.status == 200)) {
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
 *            hostVal - host of streaming server
 * @param {String}
 *            pathVal - path of requested resource
 * @param {String}
 *            sessionIdVal - session id
 */
function swapInfo(hostVal, pathVal, sessionIdVal) {
	var xmlhttp = new XMLHttpRequest();
	var url = "http://" + hostVal + "/" + pathVal
			+ "/ctrl/swap-info?sessionId=" + sessionIdVal;
	xmlhttp.onreadystatechange = function() {
		if ((this.readyState == 4) && (this.status == 200)) {
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
 *            hostVal - host of streaming server
 * @param {String}
 *            pathVal - path of requested resource
 * @param {String}
 *            sessionIdVal - session id
 */
function startSwapInfoWatcher(hostVal, pathVal, sessionIdVal) {
	setInterval(function() {
		swapInfo(hostVal, pathVal, sessionIdVal);
	}, 2000);
}
