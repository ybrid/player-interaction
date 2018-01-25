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
[**show-meta**](#show-meta)  | Requesting current meta data of session

### create-session
#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/create-session
```

#### Response **(application/json)**
```http
Status 200 OK
```

**Scheme**
```json
{
    "session-id":<session-uuid>
}
```
```ini
session-uuid           = *TEXT
```
**Example**
```json
{
    "session-id":"b28ac752-7881-4aa1-8cc6-c7e0f794a7f7"
}
```
### show-meta
#### Request
```http
http://<HOSTNAME><PATH_TO_SERVICE>/ctrl/show-meta
```

#### Response **(application/json)**
```http
Status 200 OK
```
```json
{
    "currentItem": {
        "artist": "TEST ARTIST",
        "description": "TEST DESCRIPTION",
        "title": "TEST TITLE 5",
        "type": "unrecognized",
        "durationMillis": 21273,
    },
    "nextItem": {
        "artist": "TEST ARTIST",
        "description": "TEST DESCRIPTION",
        "title": "TEST TITLE 5",
        "type": "unrecognized",
        "durationMillis": 212736
    },
    "station": {
        "genre": "unrecognized",
        "name": "TEST STATION"
    },
    "timeToNextItemMillis": 180432
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
