/**
 * core.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2018 nacamar GmbH
 */

const showCompanions = false;

/**
 * @param {String}
 *            schemeVal - http or https
 * @param {String}
 *            hostVal - host of streaming server
 * @param {String}
 *            pathVal - path of requested resource
 * @param {String}
 *            sessionIdVal - session id
 * @param {int}
 *            maxBitRateVal - maximum bit rate
 */
function setMaxBitRate(schemeVal, hostVal, pathVal, sessionIdVal, maxBitRateVal) {
    var xmlhttp = new XMLHttpRequest();
    var url = schemeVal + "://" + hostVal + pathVal
            + "/ctrl/set-max-bit-rate?sessionId=" + sessionIdVal + "&value="
            + maxBitRateVal;
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            console.info("set-max-bit-rate response [maxBitRate: "
                    + response.maxBitRate + "].");
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/**
 * @param {String}
 *            schemeVal - http or https
 * @param {String}
 *            hostVal - host of streaming server
 * @param {String}
 *            pathVal - path of requested resource
 * @param {String}
 *            sessionIdVal - session id
 */
function swap(schemeVal, hostVal, pathVal, sessionIdVal) {
    var xmlhttp = new XMLHttpRequest();
    var url = schemeVal + "://" + hostVal + pathVal + "/ctrl/swap?sessionId="
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
 *            baseURL
 * @param {String}
 *            sessionIdVal - session id
 */
function swapInfo(baseURL, sessionIdVal) {
    var xmlhttp = new XMLHttpRequest();
    var url = baseURL + "/ctrl/swap-info?sessionId=" + sessionIdVal;
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var response = JSON.parse(this.responseText);
            console.info("swap info response [swapsLeft: " + response.swapsLeft
                    + ", nextSwapReturnsToMain: "
                    + response.nextSwapReturnsToMain + "].");
            handleSwapInfo(response);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/**
 * @param {Object}
 *            swapInfo
 * 
 */
function handleSwapInfo(swapInfo) {
    var swapButton = document.getElementById("swap-button");
    if (swapInfo.swapsLeft == 0) {
        // swapButton.classList.remove('fa-spin');
        swapButton.classList.remove('audioElement');
        swapButton.classList.add('audioElementDisabled');
        swapButton.onclick = false;
    } else {
        // swapButton.classList.add('fa-spin');
        swapButton.classList.remove('audioElementDisabled');
        swapButton.classList.add('audioElement');
        swapButton.onclick = swapButtonClicked;
    }
}

/**
 * @param {String}
 *            url
 */
function handleItemMetaURL(url) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (((this.readyState == 4)) && ((this.status == 200))) {
            var result = JSON.parse(this.responseText);
            var niceJson = JSON.stringify(result, undefined, 4);
            document.getElementById("meta-area-2").innerHTML = niceJson;
            if (typeof result.currentItem.companions !== 'undefined') {
                if (typeof result.currentItem.companions[0] !== 'undefined') {
                    // SEBASTIAN select most appropriate companion
                    var companion = result.currentItem.companions[0];
                    showCompanionAd(companion.staticResourceURL,
                            companion.altText, companion.onClickThroughURL);
                } else {
                    hideCompanionAd();
                }
            } else {
                hideCompanionAd();
            }
            handleSwapInfo(result.swapInfo);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function showCompanionAd(companionURL, alt, onClickThrough) {
    if (showCompanions) {
        var adOverlay = document.getElementById("ad-overlay");
        var companion = document.getElementById("companion");
        var as = companion.getElementsByTagName("a");
        var a;
        var img;
        if (as.length == 0) {
            a = document.createElement("a");
            img = document.createElement("img");
            a.appendChild(img);
            companion.appendChild(a);
        } else {
            a = as[0];
            img = a.getElementsByTagName("img")[0];
        }
        a.href = onClickThrough;
        a.target = "_blank";
        img.src = companionURL;
        img.alt = alt;
        img.title = alt;
        adOverlay.style.display = "block";
        // SEBASTIAN send create view
    }
}

function hideCompanionAd() {
    var adOverlay = document.getElementById("ad-overlay");
    adOverlay.style.display = "none";
}

/**
 * initConsole.
 * 
 * Initializes the console.
 */
function initConsole() {
    if (typeof console != "undefined") {
        if (typeof console.log != 'undefined') {
            console.olog = console.log;
        } else {
            console.olog = function() {
            };
        }
    }

    console.log = function(message) {
        console.olog(message);
        var txt = document.getElementById("log-area").innerHTML;
        var lines = txt.split("\n");
        if (lines.length > 250) {
            txt = '';
            var i = lines.length - 250;
            if (i < 0) {
                i = 0;
            }
            while (i < lines.length) {
                if (lines[i].trim().length > 0) {
                    txt += lines[i] + "\n";
                }
                i++;
            }
        }
        txt += message + "\n";
        document.getElementById("log-area").innerHTML = txt;
        document.getElementById("log-area").scrollTop = document
                .getElementById("log-area").scrollHeight
    };

    console.error = console.debug = console.info = console.log;
}
