<template>
  <side-bar></side-bar>
  <loading v-if="isLoading"></loading>
  <div id="case">
    <div class="case-top">
      <router-link :to="{name: 'cases'}"><ion-icon name="chevron-back-outline"></ion-icon> Return</router-link>
      <div class="row">
        <h2>Case #{{caseId}}</h2>
        <div class="case-recommendations" :class="[recommendationsAvailable ? 'available' : 'unavailable']"> 
          {{ recommendationsAvailable ? "recommendations available" : "no new recommendations" }}
        </div>
      </div>
  
      <div class="stats">
        <div v-if="parameters.kpi" class="stats-card column">
          <p>KPI</p>
          <h3 class="blue">{{ parameters.kpi.value }}</h3>
          <small>Case {{ parameters.kpi.column }}  {{ parameters.kpi.operator }}</small>
        </div>
        <div class="stats-card">
          <div class="case-performance">
            <p>Case performance</p>
            <p class="bold">{{ caseKpi.duration }} {{ caseKpi.measure }}</p>
            <small>Case duration</small>
          </div>
          <div class="case-details">
            <p>Case details</p>
            <div class="row">
              <div class="column" v-for="(value,name) in caseDetails" :key='name'>
                <p class="bold">{{ value }}</p>
                <small>{{ name }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="switch-views shadow">
      <button class="btn" :class="{ active: view==='analytical' }" @click="selectView('analytical')">Analytical</button>
      <button class="btn" :class="{ active: view==='operational' }">Operational</button>
      <button class="btn" :class="{ active: view==='tactical' }">Tactical</button>
    </div>
    <operational-view v-show="view==='operational'"
      :currentCase="currentCase"
      :kpi="parameters.kpi"
      ></operational-view>
      <analytical-view v-show="view==='analytical'"
      :currentCase="currentCase"
      :parameters="parameters"
    ></analytical-view>
  </div>
  </template>
  
  <script>
    import Service from "@/services/service";
    import OperationalView from '@/components/OperationalView.vue';
    import AnalyticalView from '@/components/AnalyticalView.vue';
    import SideBar from '@/components/SideBar.vue';
    import Loading from "@/components/LoadingComponent.vue";


    export default {
      name: 'CasePage',
      components: {
        SideBar,
        OperationalView,
        AnalyticalView,
        Loading
      },
      params: {
          caseId:{
              type: Number
          }
      },
      data() {
        return {
          isLoading: false,
          currentCase: {},
          parameters: {},
          view: null,
          caseKpi: {},
          caseDetails: {},
          recommendationsAvailable: false,
        }
      },
      methods: {
        getCase(){
          this.isLoading = true;
          this.caseId = (this.$route.params.caseId)
          Service.getCase(this.caseId).then(
            (response) => {
              console.log(response.data);
              this.currentCase = response.data.case;
              this.getParameters();
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

        getParameters(){
          Service.getParameters(localStorage.fileId).then(
            (response) => {
              this.parameters.kpi = response.data.kpi;
              this.parameters.caseCompletion = response.data.caseCompletion;
              this.parameters.alarmThreshold = response.data.alarmThreshold;
              this.parameters.treatment = response.data.treatment;
              this.getAdditionalInformation();
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
          this.caseDetails = this.currentCase.case_attributes;
          const caseActivities = this.currentCase.activities
          this.recommendationsAvailable = caseActivities[caseActivities.length - 1]['prescriptions'].length === 0 ? false: true;
          if (!caseActivities.length) {
            return;
          } 
          const startDate = new Date(caseActivities[0]['TIMESTAMP']);
          const endDate = new Date(caseActivities[caseActivities.length - 1]['TIMESTAMP']);
          let measure, duration = Math.abs(endDate - startDate) / 1000;

          if (duration >= 86400) measure = 'days', duration /= 86400;
          else if (duration >= 3600) measure = 'hours', duration /= 3600;
          else if (duration >= 60) measure = 'minutes', duration /= 60;
          else measure = 'seconds';

          duration = Math.round(duration);
          this.caseKpi = {duration: duration, measure: measure};  
          
          this.isLoading = false;
        },

        selectView(view){
          localStorage.view = view;
          this.view = view;
        }
        
      },
      created() {
        this.getCase();
        if(!localStorage.view){
          this.selectView('analytical')
        } else{
          this.view = localStorage.view
        }
      }
    };
  </script>