
/**
 * @param {String}
 *            url
 * @param {Function}
 *            callback - callback function for retrieving json object
 */
function fetchJson(url, callback, init) {
    try {
        init =  init || { method : 'GET' };
        var request = new Request(url, init);
        fetch(request).then(response => {
            if (response.ok) {
                response.json().then(json => {
                    // console.info(json);
                    callback(json);
                });
            }
        });
    } catch (e) {
        console.error(e);
    }
}

/**
 * @param {String}
 *            url
 * @param {Function}
 *            callback - callback function for retrieving json object
 */
function fetchJsonXHR(url, callback){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            callback(response);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/**
 * @param {String}
 *            url
 * @param {Function}
 *            callback - callback function for retrieving arraybuffer object
 */
function fetchArrayBuffer(url, callback, init) {
    try {
        init =  init || { method : 'GET' };
        var request = new Request(url, init);
        try{
            var promise = fetch(request);
            promise.then(response => {
                if (response.ok) {
                    response.arrayBuffer().then(arrayBuffer => {
                        callback(true, arrayBuffer, response.headers);
                    });
                } else {
                    callback(false, null, null);
                }
            });
            promise.catch(() => {
                callback(false, null, null);
            });
        } catch(e){
            callback(false, null, null);
        }
    } catch (e) {
        console.error(e);
    }
}

/**
 * @param {TimeRanges}
 *            timeRanges to be logged to console.
 */
function logTimeRanges(timeRanges) {
    for (i = 0; i < timeRanges.length; i++) {
        console.info("time range [index: " + i + ", start: "
                + timeRanges.start(i) + ", end: " + timeRanges.end(i) + "]");
    }
}

