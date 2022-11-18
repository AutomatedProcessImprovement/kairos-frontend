<template>
<div id="case">
  <div class="case-top">
    <router-link :to="{name: 'cases'}"><ion-icon name="chevron-back-outline"></ion-icon> Return</router-link>
    <h2>Case #{{caseId}}</h2>

    <div class="case-small-text">
      <small>Started: {{startDate}}</small>  <small>Last update: {{lastUpdate}}</small>
    </div>
  </div>

  <div class="diagram-container">
    <div class="recommendations-list">
      <h4>Recommendations list</h4>
      <div class="recommendation" v-for="(r,index) in caseRecommendations" :key="index" 
      @click="selectRecommendation(index)" :class="{selected: index === selectedRec}">
        <p>{{r.name}}</p>
        <small>Effect: {{r.effect}}</small>
        <small>Probability: {{r.probability}}%</small>
        <small>Uncertainty: {{r.uncertainty}}%</small>
      </div>

    </div>

    <div class="tabs-container">
      <input type="radio" id="tab-diagram" name="tabs-container" checked="checked">
        <label for="tab-diagram" class="tab-label">Diagram</label>
        <div class="tab">
          <vue-bpmn
            :url="model"
            :activities="caseActivities"
            :options="options"
            v-on:error="handleError"
            v-on:shown="handleShown"
            v-on:loading="handleLoading"
        ></vue-bpmn>
        </div>

        <input type="radio" id="tab-details" name="tabs-container">
        <label for="tab-details" class="tab-label">Details</label>
        <div class="tab details-tab">
          <div v-if="selectedRec !== null" class="recommendation-details">
            <h3>Perform "{{caseRecommendations[selectedRec].name}}"</h3>
            <h4> Description</h4>
            <p> Based on the prediction, it is recommended to perform {{caseRecommendations[selectedRec].name}}. [reasoning]</p>

            <h4>Effect</h4>
            <p> {{caseRecommendations[selectedRec].effect}}.</p>

            <h4>Stats</h4>
            <p>Probability: {{caseRecommendations[selectedRec].probability}}%</p>
            <p>Uncertainty: {{caseRecommendations[selectedRec].uncertainty}}%</p>
          </div>
        <h3 v-else>Please select a recommendation.</h3>
        </div>
    </div>
  </div>
</div>
</template>

<script>
  import VueBpmn from '../components/VueBpmn';
  import minimapModule from 'diagram-js-minimap';
  import ModelService from "@/services/model.service";

  export default {
    name: 'CasePage',
    components: {
      VueBpmn
    },

    params: {
        caseId:{
            type: Number
        }
    },
    data() {
      return {
        options: {
          propertiesPanel: {},
          additionalModules: [minimapModule],
          moddleExtensions: []
        },
        model: null,
        baseUrl: "http://localhost:5000/cases/",
        caseActivities: null,
        caseRecommendations: null,
        selectedRec: null,
        currentCase: null,
        startDate: null,
        lastUpdate: null,
      }
    },
    methods: {
      getCaseModel() {
        this.model = this.baseUrl + `${this.caseId}` + '/model'
        this.getAdditionalInformation()
      },

      handleError: function(err) {
        console.error('failed to show diagram', err);
      },
      handleShown: function() {
        console.log('diagram shown');
      },
      handleLoading: function() {
        console.log('diagram loading');
      },
      getCase(){
        this.caseId = (this.$route.params.caseId)
        ModelService.getCase(this.caseId).then(
          (response) => {
            // console.log(response.data);
            this.currentCase = response.data;
            this.getCaseActivities(this.caseId);
          },
          (error) => {
            this.content =
              (error.response &&
                error.response.data &&
                error.response.data.message) ||
              error.message ||
              error.toString();
          }
        );
      },

      getCaseActivities() {
        ModelService.getCaseActivities(this.caseId).then(
          (response) => {
            this.caseActivities = response.data
            this.getCaseRecommendations()
            },
          (error) => {
            this.content =
              (error.response &&
                error.response.data &&
                error.response.data.message) ||
              error.message ||
              error.toString();
          }
        );
      },

      getCaseRecommendations() {
        ModelService.getCaseRecommendations(this.caseId).then(
          (response) => {
            this.caseRecommendations = response.data
            this.getCaseModel();
            },
          (error) => {
            this.content =
              (error.response &&
                error.response.data &&
                error.response.data.message) ||
              error.message ||
              error.toString();
          }
        );
      },

      getAdditionalInformation(){
        if (!this.caseActivities.length) {
          this.startDate = "None"
          this.lastUpdate = "None"
        } else{
          var options = {dateStyle:"medium",timeStyle: "short"};
          this.startDate = new Date(this.caseActivities[0].timestamp).toLocaleString("en-GB",options)

          var lastActivity = this.caseActivities[this.caseActivities.length - 1]
          var endDate = new Date(lastActivity.timestamp).toLocaleString("en-GB",options)
          this.lastUpdate = "Task " + lastActivity.name + " completed by " + lastActivity.resource.name + " on " + endDate
        }
      },

      selectRecommendation(index){
        this.selectedRec = index
        var recommendationnodes = Array.from(document.getElementsByClassName("recommendationnode"))
        for (var i of recommendationnodes) {
          i.classList.remove("selected-recommendationnode")
        }
        recommendationnodes[index].classList.add("selected-recommendationnode")
      }
    
    },

    created() {
      this.getCase();
    }

  };
</script>