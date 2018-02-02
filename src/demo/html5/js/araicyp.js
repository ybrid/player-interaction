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
function skip(hostVal, pathVal, sessionIdVal) {
	var xmlhttp = new XMLHttpRequest();
	var url = "http://" + hostVal + "/" + pathVal + "/ctrl/skip?sessionId="
			+ sessionIdVal;
	xmlhttp.onreadystatechange = function() {
		if ((this.readyState == 4) && (this.status == 200)) {
			var response = JSON.parse(this.responseText);
			console.info("skip response [skipsLeft: " + response.skipsLeft
					+ ", nextSkipReturnsToMain: "
					+ response.nextSkipReturnsToMain + "].");
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}
