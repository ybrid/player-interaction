/**
 * companion-support.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2018 nacamar GmbH
 */

/**
 * Shows overlay with companion ad.
 * 
 * @param companionURL
 * @param {String}
 *            alt - alternative text / tooltip for companion
 * @param onClickThrough -
 *            event handler triggered on mouse click on companion
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
