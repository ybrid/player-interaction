/**
 * core-extension.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2018 nacamar GmbH
 */

/**
 * @param {Object}
 *            swapInfo
 * 
 */
function handleSwapInfo(swapInfo) {
    var swapButton = document.getElementById("swap-button");
    if (swapInfo.swapsLeft == 0) {
        // swapButton.classList.remove('fa-spin');
        disableCTRLButton(swapButton);
    } else {
        // swapButton.classList.add('fa-spin');
        enableCTRLButton(swapButton, swapButtonClicked)
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

/**
 * @param {Object}
 *            windResult
 */
function handleWindResult(windResult) {
    console.info("wind result [totalOffset: " + windResult.totalOffset
            + ", effectiveWindDuration: " + windResult.effectiveWindDuration
            + "].");
    if (windResult.effectiveWindDuration != -1) {
        var backToNowButton = document.getElementById("back-to-now-button");
        if (windResult.totalOffset == 0) {
            disableCTRLButton(backToNowButton);
        } else {
            enableCTRLButton(backToNowButton, backToNowButtonClicked)
        }
        // var secs = windResult.totalOffset / 1000;
        // document.getElementById("otn").innerHTML = secs.toFixed(1) + " sec.";
    }
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
