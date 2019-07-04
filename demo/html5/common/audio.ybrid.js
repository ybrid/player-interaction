/**
 * audio.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2019 nacamar GmbH
 */

const acceptMimeType = 'application/x-ybrid-discrete';
const CODEC_MIME_TYPE = 'audio/mpeg';

var audio;
var audioCtx;
var mediaSource;
var sourceBuffer;


/**
 * initializes AudioContext if needed, connects audio element to context
 * 
 * @param audioEventListener
 *            {Function} - callback for buffering info
 */
function initAudioIfNeeded(audioEventListener) {
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
        if (typeof audioEventListener !== 'undefined') {
            audioEventListener(audio.currentTime, bufferSize);
        }
        console.info("time pointer: " + audio.currentTime.toFixed(3)
                + ", buffer size: " + bufferSize.toFixed(3));
    });
}

/**
 * Calculates the current buffer's size.
 */
function calculateBufferSize() {
    if (sourceBuffer.buffered.length < 1) {
        return 0;
    }
    return sourceBuffer.buffered.end(0) - audio.currentTime;
}

/**
 * Initializes the media source.
 */
function initMediaSource() {
    if ('MediaSource' in window && MediaSource.isTypeSupported(CODEC_MIME_TYPE)) {
        mediaSource = new MediaSource();
        audio.src = URL.createObjectURL(mediaSource);
        mediaSource.addEventListener('sourceopen', function() {
            sourceBuffer = mediaSource.addSourceBuffer(CODEC_MIME_TYPE);
            sourceBuffer.addEventListener('updateend', function() {
                logTimeRanges(sourceBuffer.buffered);
            });
        });
    } else {
        console.error('Unsupported MIME type or codec: ', CODEC_MIME_TYPE);
    }
}

function initializeBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler) {
    if (baseURL && sessionId) {
        buffer(baseURL, sessionId, function() {
            initSessionAndBeginBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler);
        });
    } else {
        initSessionAndBeginBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler);
    }
}

function initSessionAndBeginBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler) {
    createSession(scheme, host, path, (baseURLVal, sessionId) =>{
        sessionInfoHandler(baseURLVal, sessionId);
        buffer(baseURLVal, sessionId, currentBitRateHandler,
            () => {
                alert("Could not retrieve chunks from [baseURLVal: " + baseURLVal +
                    ", sessionId: " + sessionId +
                    "]");
            });
    });
}

function buffer(baseURLVal, sessionId, currentBitRateHandler, errorCallback) {
    var init = {
        method : 'GET',
        headers : {
            'Accept' : acceptMimeType
        }
    }
    var url = baseURLVal + '?sessionId=' + sessionId;
    // console.info(url);
    fetchArrayBuffer(url, //
        (success, chunk, headers) => {
            if (success) {
                // console.info("received chunk...");
                var delay = calculateBufferSize() * 1000;
                delay = delay.toFixed(0);
                console.info("delay: " + delay);
                sourceBuffer.appendBuffer(chunk);
                var url = headers.get(ARAICYP_HEADER_ITEM_URL);
                if (typeof url !== undefined && url != null) {
                    setTimeout(() => {
                        handleItemMetaURL(decodeURIComponent(url));
                    }, delay);
                }
                var bitRate = headers.get(ARAICYP_HEADER_CURRENT_BITRATE);
                if (typeof bitRate !== undefined && bitRate != null) {
                    currentBitRateHandler(bitRate);
                }
                if (stopped == false) {
                    buffer(baseURLVal, sessionId, currentBitRateHandler, errorCallback);
                }
            } else {
                errorCallback();
            }
        },//
        init);
}

