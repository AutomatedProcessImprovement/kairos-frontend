# Kairos frontend

This is the frontend of Kairos - a tool for visualising prescriptive process monitoring output. It produces visual overview of prescriptions produced by a presvriptive monitoring tool - [PrCore](https://prcore.gitlab.io/) - for each case in an event log. The tool accepts an event log, column definition and parameter definition as an input. This data is sent to and processed by PrCore to then produce prescriptions for each case, which are used to construct visualisations in Kairos.

<!-- ![ci](https://github.com/ESI2022-team-e/frontend/actions/workflows/node.js.yml/badge.svg?branch=main) -->

## Vue 

### Project setup
```
npm install
```

#### Compiles and hot-reloads for development
```
npm run serve
```

#### Compiles and minifies for production
```
npm run build
```

#### Lints and fixes files
```
npm run lint
```
<!-- #### Tests
```
npm run test:unit
```

 -->
