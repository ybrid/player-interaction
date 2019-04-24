/**
 * core-bare.ybrid.js
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
        swapButton.classList.remove('fa-spin');
        disableCTRLButton(swapButton);
    } else {
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
            if (result.timeToNextItemMillis > -1) {
                var secs = result.timeToNextItemMillis / 1000
                document.getElementById("ttni").innerHTML = secs.toFixed(1)
                        + " sec.";
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
    if (windResult.effectiveWindDuration != -1){
        var backToNowButton = document.getElementById("back-to-now-button");
        if (windResult.totalOffset == 0) {
            disableCTRLButton(backToNowButton);
        } else {
            enableCTRLButton(backToNowButton, backToNowButtonClicked)
        }
        var secs = windResult.totalOffset / 1000;
        document.getElementById("otn").innerHTML = secs.toFixed(1) + " sec.";
    }
}
