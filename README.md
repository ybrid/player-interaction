# player-interaction
Specification of player interaction with **Hybrid Dynamic Live Audio Platform**.

A demo player for HTML5/JavaScrpt is available under **src/demo/html5**.

## Content
* [**Introduction**](#introduction)
* [**Methods**](#methods)
* [**Example Scenario**](#example-scenario)
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
<session-uuid> = See definition in section create-session.
```
##### Example
```http
http://anyserverhostname.com/stream.mp3?sessionId=b28ac752-7881-4aa1-8cc6-c7e0f794a7f7
```

By adding the sessionId to the URL the stream is linked to the player. How to create a sessionId and how to implement the control interface at all will be explained in the following sections.

## Methods
Method  | Short Description
------------- | -------------
[**create-session**](#create-session)  | Creating a session.
[**sync**](#sync)  | Syncing playout with server.
[**show-meta**](#show-meta)  | Requesting current meta data of session.
[**skip**](#skip)  | Skipping to alternative content if possible.
[**skip-info**](#skip-info)  | Returns information about current skipping state.

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

### skip
Skipping current music item by replacing the rest of item's duration by an alternative item.
The number of possible skips is limited to the available alternative contents per
each item. Each skip iterates through the list of contents. Thereby, the **last possible skip** 
per item always returns to the original/main item.
 
#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/skip?sessionId=<session-uuid>&mode=<skipping-mode>
```
```ini
Parameter mode is not mandatory.

session-uuid  = *TEXT, session id retrieved during create-session.
skipping-mode = ( "end2end" | "fade2end" ), determines which kind of timing synchronisation should be used 
                for current skip.
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
    "skipsLeft": <number-of-skips-left>,
    "skipWasSuccessFull": <skip-was-successfull-flag>,
    "nextSkipReturnsToMain": <next-skip-returns-to-main>
}
```
```ini
number-of-skips-left =      1*DIGIT, number of possible skips left after last operation. Number refers to 
                            possible skips for an individual music item. The last skip always returns to the 
                            original item. Value can be used e.g. to disable the skip button if no more skip 
                            is left.
                            In case of value -1 the number of skips left is unknown or unlimited.
skip-was-successfull-flag = bool, value is true if last skip request could sucessfully be processed.
next-skip-returns-to-main = bool, value is true if next skip returns to main content.
```

##### Example
```json
{
    "skipsLeft": 2,
    "skipWasSuccessFull": true,
    "nextSkipReturnsToMain": false
}
```

### skip-info
Similar to **skip** but only returns information on the current skipping state. The call does not influence 
the stream.
 
#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/skip-info?sessionId=<session-uuid>
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
    "skipsLeft": <number-of-skips-left>,
    "nextSkipReturnsToMain": <next-skip-returns-to-main>
}
```
```ini
number-of-skips-left      = See definition in skip section.
next-skip-returns-to-main = See definition in skip section.
```

##### Example
```json
{
    "skipsLeft": 2,
    "nextSkipReturnsToMain": false
}
```

## Example Scenario

1. Create a Session
2. Retrieve Meta Data
3. Skip Content

## Instream Meta Data

### Icecast

```http
...
<binary-data>
<length-byte>StreamTitle='<stream-title>';StreamUrl='<stream-url>';<fillbytes>
<binary-data>
...
```
```ini
stream-title = 
stream-url   =
```

##### Example
```http
...
<binary-data>
<length-byte>StreamTitle='MADONNA - LIKE A VIRGIN';StreamUrl='http://aserverhostname.com/stream.mp3/ctrl/show-meta?sessionId=b28ac752-7881-4aa1-8cc6-c7e0f794a7f7&chunkId=';<fillbytes>
<binary-data>
...
```


## Credentials
### Authors
@sebastian-weiss

### Copyright
AddRadio - a division of nacamar GmbH 2017-2018
