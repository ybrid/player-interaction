# How a Player Should Interact with Ybrid
This document specifies how clients, or more specific players, interact with **Ybrid, a Hybrid Dynamic Live Audio Platform**.

## Content
* [**Introduction**](#introduction)
* [**Control Interface**](#control-interface)
  * [**Example Scenario**](#example-scenario)
* [**Advanced Stream Features**](#advanced-stream-features)
  * [**Limited Pre-Stream Ad Insertion Control**](#limited-pre-stream-ad-insertion-control)
  * [**Instream Meta Data**](#instream-meta-data)
    * [**Icecast**](#icecast)

## Introduction
The simplest form of service player interaction is just to request a stream. In that case the stream will be 
delivered conform with the Icecast protocol.

##### Scheme of Stream Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>
```
```ini
HOSTNAME        = Hostname of service. The host to be used changes during the subsequent workflow. See command 
                  create-session on how to retrieve the hostname to be used.
PATH_TO_SERVICE = Includes trailing slash. Example "/stream.mp3".
```
##### Example
```http
http://anyserverhostname.com/stream.mp3
```

To use advanced features like skipping and others the player needs to implement the **control interface** of 
the service. This enables to send commands to the service that directly influence the behaviour of the 
delivered stream. That being said, a player that implemented the control interface is somehow comparable to a 
**remote control for the service**.

If the control interface was implemented the player would need to request the stream slightly different:

```http
http://<HOSTNAME><PATH_TO_SERVICE>?sessionId=<session-uuid>
```
```ini
session-uuid = See definition in section create-session.
```
##### Example
```http
http://anyserverhostname.com/stream.mp3?sessionId=b28ac752-7881-4aa1-8cc6-c7e0f794a7f7
```

By adding the sessionId to the URL the stream is linked to the player. How to create a sessionId and how to 
implement the control interface at all will be explained in the following sections.

## Control Interface
The following commands (in alphabetical order) are available:

Command | Short Description
------------- | -------------
[**create-session**](#create-session)  | Creating a session.
[**is-session-valid**](#is-session-valid)  | Checks whether a created session is valid any longer or not.
[**set-max-bit-rate**](#set-max-bit-rate)  | Setting the maximum bitrate to be used for adaptive playout.
[**show-meta**](#show-meta)  | Requesting current meta data of session.
[**swap**](#swap)  | Swapping current content for alternative content if possible.
[**swap-info**](#swap-info)  | Returns information about current swapping state.
[~~**sync**~~](#sync)  | *(deprecated since 20180710)* Syncing player with service.

### create-session

> In future releases clients have to authenticate with a **token**. This allows to exchange even secret data, 
> like ad insertion points or others. Therefore, a token based on a secret has to be created by the client 
> each time it wants to create a new session. That means, a serverside generated uuid will become 
> unnecessary.

#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/create-session

OR

http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/create-session?max-bit-rate=<max-bit-rate-in-bps>
```

```ini
max-bit-rate-in-bps = Optional parameter to set maximum bitrate right from the beginning. See 
                      command set-max-bit-rate for more details. 
```

#### Response **(application/json)**
```http
Status 200 OK
```
```json
{
    "host" : <host>,
    "sessionId" : <session-uuid>,
    "baseURL" : <base-URL>
}

```
```ini
host         = *TEXT, host to be used by the client / player for all subsequent requests.
session-uuid = *TEXT
base-URL     = *TEXT, convenient combined string, equivalent to <SCHEME>://<HOSTNAME><PATH_TO_SERVICE> to be used by the client / player for all subsequent requests.
```

##### Example
```json
{
    "host" : "vg652-uz6.platform-eu.ybrid.io",
    "sessionId" : "b28ac752-7881-4aa1-8cc6-c7e0f794a7f7",
    "baseURL" : "https://vg652-uz6.platform-eu.ybrid.io/1003FM/live/mp3/high"
}
```

### is-session-valid

In some scenariors it is useful to check the validity of a session before initiating a player with a stream 
connected with it. Hence, this command allows to validate a session before starting a stream again.

#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/is-session-valid?sessionToCheckId=<session-uuid>
```
Please note, that the parameter for the session id is different from all other commands!

```ini
session-uuid = *TEXT, session to be checked for being valid
```

#### Response **(application/json)**
```http
Status 200 OK
```
```json
{
    "message" : <message>,
    "valid" : <valid>
}
```
```ini
message = *TEXT, a message in case session is not valid.
valid   = BOOL, true if session is valid.
```

##### Examples
```json
{
    "message": "",
    "valid": true
}
```
```json
{
    "message": "Session [id: e5efe8c9-96ab-4dac-82c4-a68ca7805cca] is invalid.",
    "valid": false
}
```
```json
{
    "message": "Session [id: e5efe8c9-96ab-4dac-82c4-a68ca7805cca] is closed.",
    "valid": false
}
```

### set-max-bit-rate
This call can be used by a player instance to control the maximum bitrate the server should use to deliver to 
the client. E.g. if the player is hosted on a smart phone and mobile internet is available only, the maximum 
bit rate could be reduced to limit traffic costs. If WLAN is available, the maximum could be set to undefined 
(-1). 
#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/set-max-bit-rate?sessionId=<session-uuid>&value=<max-bit-rate-in-bps>
```
```ini
session-uuid        = *TEXT, session id retrieved during create-session.
max-bit-rate-in-bps = 1*DIGI, maximum bit rate in bits per second that the server should delivery during an 
                      adaptive playout session. Value can be set to -1, meaning that there is no upper limit. 
                      If the bit rate given is not available the server will select the next lower available 
                      bitrate. If there is no lower bit rate, the lowest available bit rate will be selected. 
```

#### Response **(application/json)**
```http
Status 200 OK
```
```json
{
    "maxBitRate" : <max-bit-rate-in-bps>
}
```

##### Example
```json
{
    "maxBitRate" : 64000
}
```

### show-meta
#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/show-meta?sessionId=<session-uuid>
```
```ini
session-uuid = *TEXT, session id retrieved during create-session.
```

#### Response **(application/json)**
```http
Status 200 OK
```
```json
{
    "currentBitRate": <currently-selected-bit-rate>,
    "currentItem": {
        "artist": <artist>,
        "description": <description>,
        "id": <id>,
        "title": <title>,
        "type": <type>,
        "companions": [
            {
                "altText": <alternative-text>,
                "height": <height>,
                "onClickThroughURL": <on-click-through-url>,
                "onCreativeViewURL": <on-creative-view-url>,
                "staticResourceURL": <static-resource-url>,
                "width": <width>,
                "sequenceNumber": <sequence-number>
            },
            {
            ...
            }
            ...
        ],
        "durationMillis": <duration-milliseconds>
    },
    "nextItem": {
        "id": <id>,
        "artist": <artist>,
        "description": <description>,
        "title": <title>,
        "type": <type>,
        "durationMillis": <duration-milliseconds>
    },
    "station": {
        "genre": <station-genre>,
        "name": <station-name>
    },
    "swapInfo": {
         "nextSwapReturnsToMain": <next-swap-returns-to-main>,
         "swapsLeft": <number-of-swaps-left>
    },
    "timeToNextItemMillis": <time-to-next-item-milliseconds>
}
```
```ini
currently-selected-bit-rate    = 1*DIGI, currently by the server selected delivery bit rate in bits per 
                                 second.
id                             = *TEXT, an id identifying the item.
artist                         = *TEXT, can be empty.
description                    = *TEXT, can be empty.
title                          = *TEXT, can be empty.
type                           = ( "ADVERTISEMENT" | "COMEDY" | "JINGLE" | "MUSIC" | "NEWS" | "TRAFFIC"| 
                                   "VOICE" | "WEATHER" | "unrecognized" ) 
                                 If set to "unrecognized", type of item could not be detected.
duration-milliseconds          = 1*DIGIT, duration of item in milliseconds, can be -1 if not set.
station-genre                  = *TEXT, can be empty.
station-name                   = *TEXT, can be empty.
time-to-next-item-milliseconds = 1*DIGIT, duration of item in milliseconds, can be -1 if not set.

# Swap Info Section
number-of-swaps-left           = See definition in swap command section.
next-swap-returns-to-main      = See definition in swap command section.

# Companion Advertisement Properties                                 
alternative-text               = *TEXT, alternative text that can be used for e.g. mouse overs.
height                         = 1*DIGI, height of companion banner.
on-click-through-url           = *TEXT, URL to be used of User clicks on companion banner.
on-creative-view-url           = *TEXT, URL to be triggered as soon as the banner was presented to the user.
static-resource-url            = *TEXT, URL to companion banner itself.
width                          = 1*DIGI, width of companion banner.
sequence-number                = 1*DIGI, sequence number. Hint in which order the companions should be used.
```

##### Example for Current Music Item
```json
{
    "currentBitRate": 128000,
    "currentItem": {
        "id": "1234-612",
        "artist": "Madonna",
        "description": "",
        "title": "Like a prayer",
        "type": "MUSIC",
        "companions": [],
        "durationMillis": 252573
    },
    "nextItem": {
        "id": "1432-556",
        "artist": "Michael Jackson",
        "description": "",
        "title": "Bad",
        "type": "MUSIC",
        "durationMillis": 212736
    },
    "station": {
        "genre": "Pop",
        "name": "100,5 My Famous Station"
    },
    "swapInfo": {
        "nextSwapReturnsToMain": false,
        "swapsLeft": 3
    },
    "timeToNextItemMillis": 180432
}
```

##### Example for Current Advertisement Item
```json
{
    "currentBitRate": 128000,
    "currentItem": {
        "id": "AD-12344",
        "artist": "",
        "description": "",
        "title": "@@ADVERT@@",
        "type": "ADVERTISEMENT",
        "companions": [
            {
                "altText": "http://www.famous-company.com/",
                "height": 250,
                "onClickThroughURL": "https://webserver.com/clickthrough?id=1234567899",
                "onCreativeViewURL": "https://webserver.com/creativeView?id=1234567899",
                "staticResourceURL": "https://webserver.com/banner.jpg",
                "width": 300,
                "sequenceNumber": 1
            }
        ],
        "durationMillis": 252573
    },
    "nextItem": {
        "id": "1432-556",
        "artist": "Michael Jackson",
        "description": "",
        "title": "Bad",
        "type": "MUSIC",
        "durationMillis": 212736
    },
    "station": {
        "genre": "Pop",
        "name": "100,5 My Famous Station"
    },
    "swapInfo": {
        "nextSwapReturnsToMain": false,
        "swapsLeft": 0
    },
    "timeToNextItemMillis": 18032
}
```

### swap
Swapping the current music item by replacing the rest of item's duration by an alternative item.
The number of possible swaps is limited to the available alternative contents per
each item. Each swap iterates through the list of contents. Thereby, the **last possible swap** 
per item always returns to the original/main item.
 
#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/swap?sessionId=<session-uuid>&mode=<swapping-mode>
```
```ini
Parameter mode is not mandatory.

session-uuid  = *TEXT, session id retrieved during create-session.
swapping-mode = ( "end2end" | "fade2end" ), determines which kind of timing synchronisation should be used 
                for current swap.
                "end2end" (default): Beginning of alternative content will be skipped to fit to the left
                                     main items duration.
                "fade2end":          Alternative content starts from the beginning and will become faded out 
                                     at the end.
```

#### Response **(application/json)**
```http
Status 200 OK
```
```json
{
    "swapsLeft": <number-of-swaps-left>,
    "swapWasSuccessful": <swap-was-successful-flag>,
    "nextSwapReturnsToMain": <next-swap-returns-to-main>
}
```
```ini
number-of-swaps-left =      1*DIGIT, number of possible swaps left after last operation. Number refers to 
                            possible swaps for an individual music item. The last swap always returns to the 
                            original item. Value can be used e.g. to disable the swap button if no more swap 
                            is left.
                            In case of value -1 the number of swaps left is unknown or unlimited.
swap-was-successful-flag =  bool, value is true if last swap request could sucessfully be processed.
next-swap-returns-to-main = bool, value is true if next swap returns to main content.
```

##### Example
```json
{
    "swapsLeft": 2,
    "swapWasSuccessful": true,
    "nextSwapReturnsToMain": false
}
```

### swap-info
Similar to **swap** but only returns information on the current swapping state without actually performing a 
swap. The call does not influence the stream.
 
#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/swap-info?sessionId=<session-uuid>
```
```ini
session-uuid  = *TEXT, session id retrieved during create-session.
```

#### Response **(application/json)**
```http
Status 200 OK
```
```json
{
    "swapsLeft": <number-of-swaps-left>,
    "nextSwapReturnsToMain": <next-swap-returns-to-main>
}
```
```ini
number-of-swaps-left      = See definition in swap section.
next-swap-returns-to-main = See definition in swap section.
```

##### Example
```json
{
    "swapsLeft": 2,
    "nextSwapReturnsToMain": false
}
```

### ~~sync~~ *(deprecated since 20180710)*
Method for syncing player with service. Based on ICY meta data the service tries to determine how far the 
player is behind playout's time. Therefore, this method is supported using Icecast transportation protocol 
only. This call MUST NOT be called every time the StreamTitle field is updated in the stream. Rather, the 
player should call this in the event that the value of this field changed.

#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/sync?sessionId=<session-uuid>&icyStreamTitle=<icy-meta-stream-title-utf8-urlencoded>
```
```ini
session-uuid                          = *TEXT, session id retrieved during create-session.
icy-meta-stream-title-utf8-urlencoded = url encoding of icy-meta-stream-title in UTF-8
icy-meta-stream-title                 = *TEXT, current StreamTitle from stream in Icecast protocol format.
```

#### Response **(application/json)**
```http
Status 200 OK
```
```json
{
    "offset" : <measured-offset-millis>
}
```
```ini
measured-offset-millis = 1*DIGI, milliseconds offset between server and playout. This number will always be 
                         > 0 due to player's buffering behaviour.
                         Value can be used e.g. for displaying a spinning wheel during skipping. In the case 
                         that the given StreamTitle did not match, or the current plyout protocol is not 
                         Icecast, -1 will be returned.
```

##### Example
```json
{
    "offset" : 3879
}
```

### Example Scenario

1. Create a Session
2. Retrieve Meta Data
3. Swap Content

## Advanced Stream Features

### Limited Pre-Stream Ad Insertion Control
Sometimes it is necessary to suppress pre-stream inserted adverts, e.g. in case of reconnecting to the stream
after a short break. For that reason it is possible to add the parameter `noPreAd` with its value set to `true`
to the stream's URL to avoid an advert atthe beginning.

**This feature is available only during an open session! Parameters attached to any URL without a valid 
session id will be ignored!**

To prevent fraudulent use of this feature and the stream, the service checks
* whether the account associated with the stream was enabled for this feature and
* the amount of times during a session this feature was used.

If one of aboves conditions fails the advert will be inserted even if the parameter was set.

```http
http://<host><PATH_TO_SERVICE>?sessionId=<session-uuid>&noPreAd=true
```
```ini
host            = See definition in section create-session.
PATH_TO_SERVICE = See definition in section Introduction.
session-uuid    = See definition in section create-session.
```
##### Example
```http
http://anyserverhostname.com/stream.mp3?sessionId=b28ac752-7881-4aa1-8cc6-c7e0f794a7f7&noPreAd=true
```

### Instream Meta Data

#### Icecast

```http
...
<binary-data>
<length-byte>StreamTitle='<stream-title>';StreamUrl='<stream-url>';<fill-bytes>
<binary-data>
...
```
```ini
binary-data  =
length-byte  =
stream-title =
stream-url   =
fill-bytes   =
```

##### Example
```http
...
<binary-data>
<length-byte>StreamTitle='MADONNA - LIKE A VIRGIN';StreamUrl='http://aserverhostname.com/stream.mp3/ctrl/show-meta?sessionId=b28ac752-7881-4aa1-8cc6-c7e0f794a7f7&chunkId=';<fill-bytes>
<binary-data>
...
```
