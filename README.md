# player-interaction
Specification of player interaction with **Hybrid Dynamic Live Audio Platform**.

A demo player for HTML5/JavaScrpt is available under **src/demo/html5**.

## Content
* [**Introduction**](#introduction)
* [**Control Interface**](#control-interface)
  * [**Example Scenario**](#example-scenario)
* [**Advanced Stream Features**](#advanced-stream-features)
  * [**Limited Pre-Stream Ad Insertion Control**](#limited-pre-stream-ad-insertion-control)
  * [**Instream Meta Data**](#instream-meta-data)
    * [**Icecast**](#icecast)
* [**Credentials**](#credentials)

## Introduction
The simplest form of service player interaction is just to request a stream. In that case the stream will be delivered conform with the Icecast protocol.

##### Scheme of Stream Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>
```
```ini
HOSTNAME        = Hostname of service.
PATH_TO_SERVICE = Includes trailing slash. Example "/stream.mp3".
```
##### Example
```http
http://anyserverhostname.com/stream.mp3
```

To use advanced features like skipping and others the player needs to implement the **control interface** of the service. This enables to send commands to the service that directly influence the behaviour of the delivered stream. That being said, a player that implemented the control interface is somehow comparable to a **remote control for the service**.

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

By adding the sessionId to the URL the stream is linked to the player. How to create a sessionId and how to implement the control interface at all will be explained in the following sections.

## Control Interface
The following commands are available:

Command  | Short Description
------------- | -------------
[**create-session**](#create-session)  | Creating a session.
[**sync**](#sync)  | Syncing playout with server.
[**set-max-bit-rate**](#set-max-bit-rate)  | Setting the maximum bitrate to be used for adaptive playout.
[**show-meta**](#show-meta)  | Requesting current meta data of session.
[**swap**](#swap)  | Swapping current content for alternative content if possible.
[**swap-info**](#swap-info)  | Returns information about current swapping state.

### create-session

> In future releases clients have to authenticate with a **token**. This allows to exchange even secret data, 
> like ad insertion points or others. Therefore, a token based on a secret has to be created by the client 
> each time it want's to create a new session. That means, a serverside generated uuid will become 
> unnecessary.

#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/create-session
```

#### Response **(application/json)**
```http
Status 200 OK
```
```json
{
    "sessionId" : <session-uuid>
}
```
```ini
session-uuid = *TEXT
```

##### Example
```json
{
    "sessionId" : "b28ac752-7881-4aa1-8cc6-c7e0f794a7f7"
}
```

### sync
#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/sync?sessionId=<session-uuid>
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
    "offset" : <measured-offset-millis>
}
```
```ini
measured-offset-millis = 1*DIGI, milliseconds offset between server and playout. This number will always be 
                         > 0 due to player's buffering behaviour.
                         Value can be used e.g. for displaying a spinning wheel during skipping.
```

##### Example
```json
{
    "offset" : 3879
}
```

### set-max-bit-rate
This call can be used by a player instance to control the maximum bitrate the server should use to deliver to 
the client. E.g. if the player is hosted on a smart phone and mobile internet is available only, the maximum 
bit rate could be reduced to limit traffic costs. If WLAN is available, the maximum could be set to undefined 
(-1). 
#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/set-max-bit-rate?value=<max-bit-rate-in-bps>
```
```ini
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
    "max-bit-rate" : <max-bit-rate-in-bps>
}
```

##### Example
```json
{
    "max-bit-rate" : 64000
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
    "currentItem": {
        "artist": <artist>,
        "description": <description>,
        "title": <title>,
        "type": <type>,
        "durationMillis": <duration-milliseconds>
    },
    "nextItem": {
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
    "timeToNextItemMillis": <time-to-next-item-milliseconds>
}
```
```ini
artist                         = *TEXT, can be empty.
description                    = *TEXT, can be empty.
title                          = *TEXT, can be empty.
type                           = *TEXT, can be empty. If set to "unrecognized", type of item could not be 
                                 detected.
duration-milliseconds          = 1*DIGIT, duration of item in milliseconds, can be -1 if not set.
station-genre                  = *TEXT, can be empty.
station-name                   = *TEXT, can be empty.
time-to-next-item-milliseconds = 1*DIGIT, duration of item in milliseconds, can be -1 if not set.
```

##### Example
```json
{
    "currentItem": {
        "artist": "Madonna",
        "description": "",
        "title": "Like a prayer",
        "type": "unrecognized",
        "durationMillis": 252573
    },
    "nextItem": {
        "artist": "Michael Jackson",
        "description": "",
        "title": "Bad",
        "type": "unrecognized",
        "durationMillis": 212736
    },
    "station": {
        "genre": "Pop",
        "name": "100,5 My Famous Station"
    },
    "timeToNextItemMillis": 180432
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
    "swapWasSuccessFull": <swap-was-successfull-flag>,
    "nextSwapReturnsToMain": <next-swap-returns-to-main>
}
```
```ini
number-of-swaps-left =      1*DIGIT, number of possible swaps left after last operation. Number refers to 
                            possible swaps for an individual music item. The last swap always returns to the 
                            original item. Value can be used e.g. to disable the swap button if no more swap 
                            is left.
                            In case of value -1 the number of swaps left is unknown or unlimited.
swap-was-successfull-flag = bool, value is true if last swap request could sucessfully be processed.
next-swap-returns-to-main = bool, value is true if next swap returns to main content.
```

##### Example
```json
{
    "swapsLeft": 2,
    "swapWasSuccessFull": true,
    "nextSwapReturnsToMain": false
}
```

### swap-info
Similar to **swap** but only returns information on the current swapping state without actually performing a swap. The call does not influence the stream.
 
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

### Example Scenario

1. Create a Session
2. Retrieve Meta Data
3. Swap Content

## Advanced Stream Features

### Limited Pre-Stream Ad Insertion Control
Sometimes it is necessary to suppress pre-stream inserted adverts, e.g. in case of reconnecting to the stream
after a short break. For that reason it is possible to add the parameter `noPreAd` with its value set to `true`
to the stream's URL to avoid an advert atthe beginning.

**This feature is available only during an open session! Parameters attached to any URL without a valid session 
id will be ignored!**

To prevent fraudulent use of this feature and the stream, the service checks
* whether the account associated with the stream was enabled for this feature and
* the amount of times during a session this feature was used.

If one of aboves conditions fails the advert will be inserted even if the parameter was set.

```http
http://<HOSTNAME><PATH_TO_SERVICE>?sessionId=<session-uuid>&noPreAd=true
```
```ini
HOSTNAME        = See definition in section Introduction.
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


## Credentials
### Authors
@sebastian-weiss

### Copyright
AddRadio - a division of nacamar GmbH 2017-2018
