<template>
  <div id="case">
    <div class="case-top">
      <router-link :to="{name: 'cases'}"><ion-icon name="chevron-back-outline"></ion-icon> Return</router-link>
      <h2>Case #{{caseId}}</h2>
  
      <div class="case-small-text">
        <small>Started: {{startDate}}</small>  <small>Last update: {{lastUpdate}}</small>
      </div>
    </div>
    <div class="switch-views">
      <button class="btn" :class="{ active: view===1 }" @click="view=1">Analytical</button>
      <button class="btn" :class="{ active: view===0 }" @click="view=0">Operational</button>
    </div>
    <operational-worker-view v-show="view===0"
    :caseRecommendations="caseRecommendations"
      :currentCase="currentCase"
      ></operational-worker-view>
      <process-analyst-view v-show="view===1"
      :caseRecommendations="caseRecommendations"
      :caseActivities="caseActivities"
      :currentCase="currentCase"
    ></process-analyst-view>
  </div>
  </template>
  
  <script>
    import ModelService from "@/services/model.service";
    import OperationalWorkerView from '@/components/OperationalWorkerView.vue';
    import ProcessAnalystView from '@/components/ProcessAnalystView.vue';
    export default {
      name: 'CasePage',
      components: {
        OperationalWorkerView,
        ProcessAnalystView
      },
      params: {
          caseId:{
              type: Number
          }
      },
      data() {
        return {
          caseActivities: null,
          caseRecommendations: null,
          currentCase: null,
          startDate: null,
          lastUpdate: null,
          view: 1
        }
      },
      methods: {
        getCase(){
          this.caseId = (this.$route.params.caseId)
          ModelService.getCase(this.caseId).then(
            (response) => {
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
        
      
      },
      created() {
        this.getCase();
      }
    };
  </script>