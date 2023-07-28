# Kairos client

![build](https://github.com/VisualPM/frontend/actions/workflows/node.js.yml/badge.svg) 
![production_build](https://github.com/VisualPM/frontend/actions/workflows/docker-image.yml/badge.svg)

This is the frontend of Kairos - a tool for visualising prescriptive process monitoring output. It produces visual overview of prescriptions produced by a presvriptive monitoring tool - [PrCore](https://prcore.gitlab.io/) - for each case in an event log. The tool accepts an event log, column definition and parameter definition as an input. This data is sent to and processed by PrCore to then produce prescriptions for each case, which are used to construct visualisations in Kairos.

## Start the client locally (via npm)

> Please, note that you need to have `Node.js` and `npm` installed on your computer in order to follow these steps. The instructions for installation can be found here: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#overview

1) Install all dependencies
    ```
    npm install
    ```
2) Start the client
    ```
    npm run serve
    ```

## Start the client locally (via Docker)

> Please, note that you need to have `Docker` installed in order to follow the following steps. The installation instructions can be found here: https://docs.docker.com/get-docker/
The frontend requires a running instance of `api`. The instructions on how to start the backend service can be found [here](https://github.com/VisualPM/backend-flask).

0) *Pre-requisite step*: Docker is running.
1) Build the image from the current code version.
    ```
    docker build -f Dockerfile.local -t kairos-client-local .
    ```

2) Start the container.
    ```
    docker run -p 80:80 kairos-client-local
    ```
3) Access http://localhost:80/
