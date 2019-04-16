/**
 * player.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2018 nacamar GmbH
 */

const acceptMimeType = 'application/x-ybrid-discrete';

var audio;
var mimeCodec;
var mediaSource;
var sourceBuffer;
var stopped = true;
var sessionId = null;

var audioCtx;
var playoutBuffer;
var startTS = -1;
var maxTS;

function initAudioIfNeeded() {
    if (typeof audioCtx !== 'undefined') {
        return;
    }
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audio = document.querySelector('audio');
    var source = audioCtx.createMediaElementSource(audio);

    // // Create a gain node
    // var gainNode = audioCtx.createGain();
    //
    // // connect the AudioBufferSourceNode to the gainNode
    // // and the gainNode to the destination, so we can play the
    // // music and adjust the volume using the mouse cursor
    // source.connect(gainNode);
    // gainNode.connect(audioCtx.destination);

    source.connect(audioCtx.destination);

    audio.addEventListener('canplay', function() {
        audio.play();
        console.info("triggered playing...");
    });
    audio.addEventListener('timeupdate', function() {
        var bufferSize = calculateBufferSize();
        console.info("time pointer: " + audio.currentTime.toFixed(3)
                + ", buffer size: " + bufferSize.toFixed(3));
    });
}

function calculateBufferSize() {
    if (sourceBuffer.buffered.length < 1) {
        return 0;
    }
    return sourceBuffer.buffered.end(0) - audio.currentTime;
}

function initMediaSource() {
    mimeCodec = 'audio/mpeg';
    if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
        mediaSource = new MediaSource();
        audio.src = URL.createObjectURL(mediaSource);
        mediaSource.addEventListener('sourceopen', function() {
            sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
            sourceBuffer.addEventListener('updateend', function() {
                logTimeRanges(sourceBuffer.buffered);
            });
        });
    } else {
        console.error('Unsupported MIME type or codec: ', mimeCodec);
    }
}

function initializeBuffering(baseURLVal) {
    if (sessionId) {
        buffer(baseURLVal, sessionId, function() {
            initSessionAndBeginBuffering(baseURLVal);
        });
    } else {
        initSessionAndBeginBuffering(baseURLVal);
    }
}

function initSessionAndBeginBuffering(baseURLVal) {
    var url = baseURLVal + "/ctrl/create-session";
    // console.info(url);
    fetchJson(url, function(jsonObj) {
        sessionId = jsonObj.sessionId;
        baseURLVal = createBaseURL(scheme, jsonObj.host, path);
        console.info("created new session with [id: " + sessionId
                + ", new base URL: " + baseURLVal + "].");
        buffer(baseURLVal, sessionId, () => {
            alert("Could not retrieve chunks from [baseURLVal: " + baseURLVal +
            		", sessionId: " + sessionId +
            		"]");
        });
    });
}

function buffer(baseURLVal, sessionId, callback) {
    var init = {
        method : 'GET',
        headers : {
            'Accept' : acceptMimeType
        }
    }
    var url = baseURLVal + '?sessionId=' + sessionId;
    // console.info(url);
    fetchArrayBuffer(url, //
    function(success, chunk, headers) {
        if (success) {
            // console.info("received chunk...");
            var delay = calculateBufferSize() * 1000;
            delay = delay.toFixed(0);
            console.info("delay: " + delay);
            sourceBuffer.appendBuffer(chunk);
            var url = headers.get(ARAICYP_HEADER_ITEM_URL);
            if (typeof url !== undefined && url != null) {
                setTimeout(function() {
                    handleItemMetaURL(decodeURIComponent(url));
                }, delay);
            }
            var bitRate = headers.get(ARAICYP_HEADER_CURRENT_BITRATE);
            if (typeof bitRate !== undefined && bitRate != null) {
                console.info("Current bit rate: " + bitRate);
            }
            if (stopped == false) {
                buffer(baseURLVal, sessionId, callback);
            }
        } else {
            callback();
        }
    } //
    , init);
}

function togglePlay() {
    var playButton = document.getElementById("play-button");
    if (stopped == true) {
        stopped = false;
        playButton.classList.remove("fa-play");
        playButton.classList.add("fa-pause");
        enableAllCTRL();

        try {
            initAudioIfNeeded();
            initMediaSource();
            var baseURL = createBaseURL(scheme, host, path);
            initializeBuffering(baseURL);
        } catch (e) {
            alert(e);
        }
    } else {
        stopped = true;
        playButton.classList.remove("fa-pause");
        playButton.classList.add("fa-play");
        disableAllCTRL();
        disableCTRLButton(document.getElementById("swap-button"));
        
        audio.pause();
        console.info("stopped");
    }
}

function spinningWheelOn() {
    var swapButton = document.getElementById("swap-button");
    swapButton.classList.add('fa-spin');
    swapButton.onclick = false;
    disableAllCTRL();
    setTimeout(spinningWheelOff, 2000);
}

function spinningWheelOff() {
    var swapButton = document.getElementById("swap-button");
    swapButton.classList.remove('fa-spin');
    swapButton.onclick = swapButtonClicked;
    enableAllCTRL();
}

function swapButtonClicked() {
    swap(scheme, host, path, sessionId);
    spinningWheelOn();
}

function rewindButtonClicked() {
    rewind(scheme, host, path, sessionId);
    spinningWheelOn();
}

function fastForwardButtonClicked() {
    fastForward(scheme, host, path, sessionId);
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
