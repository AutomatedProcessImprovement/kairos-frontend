<template>
<div id="case">
  <div class="case-top">
    <router-link :to="{name: 'cases'}"><i class="fa fa-angle-left"></i> Return</router-link>
    <h2>Case #{{caseId}}</h2>

    <div class="case-small-text">
      <small>Started: {{startDate}}</small>  <small>Last update: {{lastUpdate}}</small>
    </div>
  </div>

  <div class="diagram-container">
    <div class="recommendations-list">
      <h4>Recommendations list</h4>
      <div class="recommendation" v-for="(r,index) in currentCase.interventions" :key="index" 
      @click="selectRecommendation(index)" :class="{selected: index === selectedRec}">
        <p>{{r.name}}</p>
        <small>Effect: {{r.effect}}</small>
        <small>Probability: {{r.probability}}%</small>
        <small>Uncertainty: {{r.uncertainty}}%</small>
      </div>

    </div>

    <vue-bpmn
        :url="model"
        :activities="caseActivities"
        :options="options"
        v-on:error="handleError"
        v-on:shown="handleShown"
        v-on:loading="handleLoading"
    ></vue-bpmn>
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
        selectedRec: null,
        currentCase: null,
        startDate: null,
        lastUpdate: null,
      }
    },
    methods: {
        getCaseModel() {
          this.model = this.baseUrl + `${this.caseId}` + '/model'
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
          this.caseActivities = this.currentCase.activities
          this.getCaseModel();
          this.getAdditionalInformation()
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
      var interventions = Array.from(document.getElementsByClassName("intervention"))
      for (var i of interventions) {
        i.classList.remove("selected-intervention")
      }
      interventions[index].classList.add("selected-intervention")
    }
    
    },
  created() {
    this.getCase();
  }

  };
</script>