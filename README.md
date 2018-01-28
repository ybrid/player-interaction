# player-interaction
Specification of player interaction with **Hybrid Dynamic Live Audio Platform**

## Content
[**Introduction**](#introduction)

[**Methods**](#methods)

[**Example Scenario**](#example-scenario)

[**Credentials**](#credentials)

## Introduction

## Methods
Method  | Short Description
------------- | -------------
[**create-session**](#create-session)  | Creating a session
[**sync**](#sync)  | Syncing playout with server
[**show-meta**](#show-meta)  | Requesting current meta data of session
[**skip**](#show-meta)  | Skipping to alternative content if possible.

### create-session

> In future releases clients have to authentcate with a **token**. This allows to exchange even secret data, like ad insertion points or others.
> Therefore, a token based on a secret has to be created by the client each time it want's to create a new session. That means, a serverside 
> generated uuid will become unnecessary.

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
}
```
```ini
```

##### Example
```json
{
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
        "durationMillis": <duration-milliseconds>,
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
artist = *TEXT, can be empty.
description = *TEXT, can be empty.
title = *TEXT, can be empty.
type = *TEXT, can be empty. If set to "unrecognized", type of item could not be detected.
duration-milliseconds = 1*DIGIT, duration of item in milliseconds, can be -1 if not set.
station-genre = *TEXT, can be empty.
station-name = *TEXT, can be empty.
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
        "durationMillis": 252573,
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
#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/skip?sessionId=<session-uuid>
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
}
```
```ini
```

##### Example
```json
{
}
```

## Example Scenario

1. Create a Session
2. Retrieve Meta Data
3. Skip Content

## Credentials
### Authors
@sebastian-weiss

### Copyright
AddRadio - a division of nacamar GmbH 2017-2018
