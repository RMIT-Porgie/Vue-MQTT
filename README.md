# Widget Template featuring Vue 3 with option API & Vuetify

## Try it using Run Your App

<https://getsensordata.shah.sg>

## Installation


### Install the development dependencies

Open a terminal in the location you've put the downloaded / cloned sources:

Then

```bash
npm install
```

The mqtt-pub folder contains a python script that publishes mocked sensor data to a MQTT broker.

Open a terminal on the mqtt-pub folder: 

Then 

```bash
py sensor.py
```

### Start the Widget

```bash
npm run start
```

## Introduction

1. This widget contains the publishing script to an MQTT broker (mqtt-pub/sensor.py). 
2. The published data goes to an MQTT broker. 
3. The widget will subscribe to the topic from the broker and displays the data into a table.

## Included features

-   [Vuetify](https://vuetifyjs.com) - This UI Framework will drastically save your time. Nevertheless, it's optional so feel free to remove the dependency and use your favorite.

## All commands

| Command           | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `npm run start`   | Build app continuously and serve @ `http://localhost:8081/widget` |
| `npm run startS3` | Build app continuously to `/dist/` and serve through AWS S3       |
| `npm run build`   | Build app to `/dist/`                                             |
| `npm run lint`    | Run ESLint                                                        |
| `npm run lintFix` | Run ESLint and fix issues                                         |
