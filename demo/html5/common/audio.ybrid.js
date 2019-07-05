/**
 * audio.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2019 nacamar GmbH
 */

const ACCEPTED_MIME_TYPE = 'application/x-ybrid-discrete';
const CODEC_MIME_TYPE = 'audio/mpeg';

var _audio;
var _audioCtx;
var _mediaSource;
var _sourceBuffer;
var _stopped = true;

function startAudio(audioEventListener, sessionInfoHandler, currentBitRateHandler){
    _stopped = false;
    initAudioIfNeeded(audioEventListener);
    initMediaSource();
    initializeBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler);
}

function stopAudio(){
    _stopped = true;
    _audio.pause();
    console.info("audio stopped");
}


/**
 * initializes AudioContext if needed, connects audio element to context
 * 
 * @param audioEventListener
 *            {Function} - callback for buffering info
 */
function initAudioIfNeeded(audioEventListener) {
    if (typeof _audioCtx !== 'undefined') {
        return;
    }
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    _audio = document.querySelector('audio');
    var source = _audioCtx.createMediaElementSource(_audio);

    // // Create a gain node
    // var gainNode = audioCtx.createGain();
    //
    // // connect the AudioBufferSourceNode to the gainNode
    // // and the gainNode to the destination, so we can play the
    // // music and adjust the volume using the mouse cursor
    // source.connect(gainNode);
    // gainNode.connect(audioCtx.destination);

    source.connect(_audioCtx.destination);
    _audio.addEventListener('canplay', function() {
        _audio.play();
        console.info("triggered playing...");
    });

    _audio.addEventListener('timeupdate', function() {
        var bufferSize = calculateBufferSize();
        if (typeof audioEventListener !== 'undefined') {
            audioEventListener(_audio.currentTime, bufferSize);
        }
        console.info("time pointer: " + _audio.currentTime.toFixed(3)
                + ", buffer size: " + bufferSize.toFixed(3));
    });
}

/**
 * Calculates the current buffer's size in seconds.
 */
function calculateBufferSize() {
    try {
        if (_sourceBuffer.buffered.length < 1) {
            return 0;
        }
        return _sourceBuffer.buffered.end(0) - _audio.currentTime;
    } catch (e) {
        return 0;
    }
}

/**
 * Initializes the media source.
 */
function initMediaSource() {
    if ('MediaSource' in window && MediaSource.isTypeSupported(CODEC_MIME_TYPE)) {
        _mediaSource = new MediaSource();
        _audio.src = URL.createObjectURL(_mediaSource);
        _mediaSource.addEventListener('sourceopen', //
            () => {
                _sourceBuffer = _mediaSource.addSourceBuffer(CODEC_MIME_TYPE);
                _sourceBuffer.addEventListener('updateend',//
                    () => {
                        logTimeRanges(_sourceBuffer.buffered);
                    });
            });
    } else {
        console.error('Unsupported MIME type or codec: ', CODEC_MIME_TYPE);
    }
}

function initializeBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler) {
    if (baseURL && sessionId) {
        buffer(baseURL, sessionId, currentBitRateHandler,//
            () => {
                initSessionAndBeginBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler);
            });
    } else {
        initSessionAndBeginBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler);
    }
}

function initSessionAndBeginBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler) {
    createSession(scheme, host, path,// 
        (baseURLVal, sessionId) => {
            sessionInfoHandler(baseURLVal, sessionId);
            buffer(baseURLVal, sessionId, currentBitRateHandler,//
                () => {
                    alert("Could not retrieve chunks from [baseURLVal: " + baseURLVal +
                        ", sessionId: " + sessionId + "]");
                });
        });
}

function buffer(baseURLVal, sessionId, currentBitRateHandler, errorCallback) {
    var init = {
        method : 'GET',
        headers : {
            'Accept' : ACCEPTED_MIME_TYPE
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
                // console.info("delay: " + delay);
                _sourceBuffer.appendBuffer(chunk);
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
                if (_stopped == false) {
                    buffer(baseURLVal, sessionId, currentBitRateHandler, errorCallback);
                }
            } else {
                errorCallback();
            }
        },//
        init);
}

