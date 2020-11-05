var io = io || {};
io.ybrid = io.ybrid || {};
io.ybrid.audio = io.ybrid.audio || {};

/**
 * AudioCTX.audio.ybrid.io.js
 * 
 * @author Sebastian A. Weiß (C) 2019-2020 nacamar GmbH
 */
io.ybrid.audio.AudioCTX = function () {

    const ARAICYP_HEADER_ITEM_URL = 'AR-Meta-Item-URL';
    const ARAICYP_HEADER_CURRENT_BITRATE = 'AR-CTRL-Current-Bit-Rate';
    const ARAICYP_HEADER_CURRENT_LEVELS = 'AR-CTRL-Current-Levels';
    
    const ACCEPTED_MIME_TYPE = 'application/x-ybrid-discrete';
    const CODEC_MIME_TYPE = 'audio/mpeg';

    var _audio;
    var _audioCtx;
    var _mediaSource;
    var _sourceBuffer;
    var _stopped = true;

    var instance = {
        startAudio: startAudio,
        stopAudio: stopAudio
    }
    
    /**
     * Starting audio, initializing contexts and buffers, starting buffering
     * audio from ybrid platform.
     * 
     * @param audioEventListener
     *            can be used to retrieve and handle information about the
     *            buffer's current state.
     * @param sessionInfoHandler
     *            can be used to retrieve and handle information about the
     *            current session.
     * @param currentBitRateHandler
     *            can be used to retrieve and handle the current bit rate.
     */
    function startAudio(audioEventListener, sessionInfoHandler, currentBitRateHandler){
        _stopped = false;
        _initAudioIfNeeded(audioEventListener);
        _initMediaSource();
        _initializeBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler);
    }

    /**
     * Stopping all audio components.
     */
    function stopAudio(){
        _stopped = true;
        _audio.pause();
        console.info("AudioCTX stopped");
    }

    /**
     * initializes AudioContext if needed, connects audio element to context
     * 
     * @param audioEventListener
     *            {Function} - callback for buffering info
     */
    function _initAudioIfNeeded(audioEventListener) {
        if (typeof _audioCtx !== 'undefined') {
            return;
        }
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        _audioCtx.onstatechange = function() {
            console.info(_audioCtx.state);
        }
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
        
        _audio.addEventListener('canplay',
            () => {
                _audio.play();
                console.info("Triggered playing...");
            });

        _audio.addEventListener('timeupdate',
            () => {
                var bufferSize = _calculateBufferSize();
                if (typeof audioEventListener !== 'undefined') {
                    audioEventListener(_audio.currentTime, bufferSize);
                }
                console.debug("time pointer: " + _audio.currentTime.toFixed(3)
                    + ", buffer size: " + bufferSize.toFixed(3));
            });
    }

    /**
     * Calculates the current buffer's size in seconds.
     */
    function _calculateBufferSize() {
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
    function _initMediaSource() {
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

    function _initializeBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler) {
        if (ybridCtrl.baseURL && ybridCtrl.sessionId) {
            _buffer(ybridCtrl.baseURL, ybridCtrl.sessionId, currentBitRateHandler,//
                () => {
                    _initSessionAndBeginBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler);
                });
        } else {
            _initSessionAndBeginBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler);
        }
    }

    function _initSessionAndBeginBuffering(scheme, host, path, sessionInfoHandler, currentBitRateHandler) {
        ybridCtrl.createSession(scheme, host, path,// 
            (result) => {
                sessionInfoHandler(result);
                _buffer(ybridCtrl.baseURL, ybridCtrl.sessionId, currentBitRateHandler,//
                    () => {
                        alert("Could not retrieve chunks from [baseURLVal: " + ybridCtrl.baseURL +
                            ", sessionId: " + ybridCtrl.sessionId + "]");
                    });
            },
            (statusCode, message, object) => {
            });
    }

    function _buffer(baseURLVal, sessionId, currentBitRateHandler, errorCallback) {
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
                    var delay = _calculateBufferSize() * 1000;
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
                        setTimeout(() => {
                            currentBitRateHandler(bitRate);
                        }, delay);
                    }
                    var currentLevels = headers.get(ARAICYP_HEADER_CURRENT_LEVELS);
                    if (typeof currentLevels !== undefined && currentLevels != null) {
                        setTimeout(() => {
                            handleCurrentLevels(currentLevels);
                        }, delay);
                    }
                    if (_stopped == false) {
                        _buffer(baseURLVal, sessionId, currentBitRateHandler, errorCallback);
                    }
                } else {
                    errorCallback();
                }
            },//
            init);
    }

    return instance;
}
