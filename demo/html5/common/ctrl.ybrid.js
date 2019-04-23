/**
 * ctrl.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2019 nacamar GmbH
 */

/**
 * @param button
 * @param clickFunction
 */
function enableCTRLButton(button, clickFunction) {
    button.classList.remove('audioElementDisabled');
    button.classList.add('audioElement');
    button.onclick = clickFunction;
}

function enableAllCTRL(){
    enableCTRLButton(document.getElementById("skip-backwards-button"), skipBackwardsButtonClicked);
    enableCTRLButton(document.getElementById("rewind-button"), rewindButtonClicked);
    enableCTRLButton(document.getElementById("back-to-now-button"), backToNowButtonClicked);
    enableCTRLButton(document.getElementById("fast-forward-button"), fastForwardButtonClicked);
    enableCTRLButton(document.getElementById("skip-forwards-button"), skipForwardsButtonClicked);
}

/**
 * @param button
 */
function disableCTRLButton(button) {
    button.classList.remove('audioElement');
    button.classList.add('audioElementDisabled');
    button.onclick = false;
}

function disableAllCTRL(){
    disableCTRLButton(document.getElementById("skip-backwards-button"));
    disableCTRLButton(document.getElementById("rewind-button"));
    disableCTRLButton(document.getElementById("back-to-now-button"));
    disableCTRLButton(document.getElementById("fast-forward-button"));
    disableCTRLButton(document.getElementById("skip-forwards-button"));
}

function swapButtonClicked() {
    swap(scheme, host, path, sessionId);
    spinningWheelOn();
}

function rewindButtonClicked() {
    wind(scheme, host, path, sessionId, -60000);
    spinningWheelOn();
}

function backToNowButtonClicked() {
    backToNow(scheme, host, path, sessionId);
    spinningWheelOn();
}

function fastForwardButtonClicked() {
    wind(scheme, host, path, sessionId, 60000);
    spinningWheelOn();
}

function skipBackwardsButtonClicked() {
    skipBackwards(scheme, host, path, sessionId);
    spinningWheelOn();
}

function skipForwardsButtonClicked() {
    skipForwards(scheme, host, path, sessionId);
    spinningWheelOn();
}
