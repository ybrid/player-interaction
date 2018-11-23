/**
 * core.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2018 nacamar GmbH
 */

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
 * @link https://github.com/ybrid/player-interaction#set-max-bit-rate
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
 * @link https://github.com/ybrid/player-interaction#swap
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
 * @link https://github.com/ybrid/player-interaction#swap-info
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
        swapButton.classList.remove('fa-spin');
        swapButton.classList.remove('audioElement');
        swapButton.classList.add('audioElementDisabled');
        swapButton.onclick = false;
    } else {
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
            document.getElementById("artist").innerHTML = result.currentItem.artist;
            document.getElementById("title").innerHTML = result.currentItem.title;
            if(result.timeToNextItemMillis > -1){
            	var secs = result.timeToNextItemMillis / 1000
                document.getElementById("ttni").innerHTML = secs.toFixed(1) + " sec.";
            }
            handleSwapInfo(result.swapInfo);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/**
 * Shows overlay with companion ad.  
 * @param companionURL 
 * @param {String} alt - alternative text / tooltip for companion 
 * @param onClickThrough - event handler triggered on mouse click on companion
 */
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

/**
 * Hides companion ad overlay.
 */
function hideCompanionAd() {
    var adOverlay = document.getElementById("ad-overlay");
    adOverlay.style.display = "none";
}

