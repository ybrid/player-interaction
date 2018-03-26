/**
 * player.araicyp.js
 * @author Sebastian A. Weiß
 * (C) 2018 nacamar GmbH
 */

function spinningWheelOn() {
    document.getElementById("overlay").style.display = "block";
    setTimeout(spinningWheelOff, 4000);
}

function spinningWheelOff() {
    document.getElementById("overlay").style.display = "none";
}

function swapButtonClicked() {
    swap(host, path, sessionId);
    spinningWheelOn();
}
