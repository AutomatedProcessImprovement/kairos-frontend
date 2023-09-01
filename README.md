# Kairos client

![build](https://github.com/AutomatedProcessImprovement/kairos-frontend/actions/workflows/node.js.yml/badge.svg) 
![production_build](https://github.com/AutomatedProcessImprovement/kairos-frontend/actions/workflows/docker-image.yml/badge.svg)

This is the frontend of Kairos - a tool for visualising prescriptive process monitoring output. It produces visual overview of prescriptions produced by a presvriptive monitoring tool - [PrCore](https://prcore.gitlab.io/) - for each case in an event log. The tool accepts an event log, column definition and parameter definition as an input. This data is sent to and processed by PrCore to then produce prescriptions for each case, which are used to construct visualisations in Kairos.

## Example logs

The interface and the prescriptive process monitoring output may be tested using the following event logs and configurations.

### BPIC 2012 

**The log:** [BPIC 2012](https://github.com/AutomatedProcessImprovement/kairos-frontend/examples/logs/BPI_Challenge_2012.zip)

**Data column types:**

* `Org:resource` - Resource
* `Lifecycle:transition` - Transition
* `Concept:name` - Activity
* `Time:timestamp` - Timestamp
* `Case:reg_date` - Datetime - *case attribute*
* `Case:concept:name` - Case id
* `Case:amount_req` - Cost (custom currency, e.g. EUR) - *case attribute*

**Parameters:**

In this example, the case is considered completed when the application is finalized (`A_Finalized`). The case is considered to have a positive outcome if the customer accepts the offer (`O_Accepted`). An intervention that will be estimated by the causal algorithm is considered a follow-up about the offer to the customer (`W_Nabellen offertes`).

* Case completion - `A_Finalized`
* Positive case outcome - `concept:name EQUAL O_Accepted`
* Intervention - `concept:name EQUAL W_Nabellen offertes`
* Alarm threshold - custom, e.g. 0.6

### Road Traffic Fine Management Process

**The log:** [Road Traffic Management Process](https://github.com/AutomatedProcessImprovement/kairos-frontend/examples/logs/Road_Traffic_Fine_Management_Process.zip)

**Data column types:**

* `CASE_ID` - Case id 
* `END_TIME` - Timestamp
* `VEHICLEREGISTRATIONNUMBER` - Text - *case attribute*
* `AMOUNT` - Numerical
* `ACTIVITY` - Activity
* `DISMISSAL` - Text
* `EXPENSE` - Numerical
* `LASTSENT` - Text
* `NOTIFICATIONTYPE` - Text
* `RESOURCE` - Resource
* `PAYMENTAMOUNT` - Cost (custom currency, e.g. EUR) - *case attribute*
* `POINTSDEDUCTED` - Numerical - *case attribute*
* `TOTALPAYMENTAMOUNT` - Numerical
* `VEHICLECLASS` - Text - *case attribute*
* `VIOLATIONTYPE` - Numerical - *case attribute*

**Parameters:**

In this example, the case is considered completed when the fine is paid (`Payment`). The case is considered to have a positive outcome if the customer pays the fine (`Payment`). An intervention that will be estimated by the causal algorithm is considered adding a penalty to the fine (`Add penalty`).

This event log has many cases, and it takes longer for recommendations to appear in the ongoing simulated cases.

* Case completion - `Payment`
* Positive case outcome - `Activity EQUAL Payment`
* Intervention - `Activity EQUAL Add penalty`
* Alarm threshold - 0.8


### Claims Management Simplified

**The log:** [Claims Management Simplified](https://github.com/AutomatedProcessImprovement/kairos-frontend/examples/logs/Claims_Management_Simplified.zip)

**Data column types:**

* `CASE_ID` - Case id
* `START_TIME` - Start time
* `END_TIME` - End time
* `CLAIM_VALUE` - Cost (custom currency, e.g. EUR)
* `PRODUCT_GROUP` - Text
* `ACTIVITY` - Activity
* `RESOURCE` - Resource
* `ROLE` - Text

**Parameters:**

In this example, the case is considered completed when the claim settlement is executed (`Execute Claim Settlement`). The case is considered to have a positive outcome if the case is resolved within 10 days (`Duration <= 10 days`). An intervention that will be estimated by the causal algorithm is considered requesting customer info (`Request Customer Info`).

* Case completion - `Execute Claim Settlement`
* Positive case outcome - `Duration LESS_THAN_OR_EQUAL` custom, e.g. 10 days
* Intervention - `Activity EQUAL Request Customer Info`
* Alarm threshold - custom, e.g. 0.7


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
