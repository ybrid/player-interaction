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

/**
 * @param button
 */
function disableCTRLButton(button) {
    button.classList.remove('audioElement');
    button.classList.add('audioElementDisabled');
    button.onclick = false;
}

function swapButtonClicked() {
    swap();
    spinningWheelOn();
}

function rewindButtonClicked() {
    wind(-60000);
    spinningWheelOn();
}

function windToButtonClicked(requestedTimestamp) {
    windTo(requestedTimestamp);
    spinningWheelOn();
}

function backToNowButtonClicked() {
    backToNow();
    spinningWheelOn();
}

function fastForwardButtonClicked() {
    wind(60000);
    spinningWheelOn();
}

function skipBackwardsTypedButtonClicked(requestedItemType) {
    skipBackwards(requestedItemType);
    spinningWheelOn();
}

function skipForwardsTypedButtonClicked(requestedItemType) {
    skipForwards(requestedItemType);
    spinningWheelOn();
}

function skipBackwardsButtonClicked() {
    skipBackwards();
    spinningWheelOn();
}

function skipForwardsButtonClicked() {
    skipForwards();
    spinningWheelOn();
}
