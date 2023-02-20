<template>
  <side-bar></side-bar>
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
        <div class="stats-card column">
          <h4>KPI</h4>
          <h3 class="bold blue">{{ kpi.value }}</h3>
          <small>Case {{ kpi.column }}  {{ kpi.operator }}</small>
        </div>
        <div class="stats-card">
          <div class="case-performance">
            <h4>Case performance</h4>
            <p class="bold">{{ caseKpi.duration }} {{ caseKpi.measure }}</p>
            <small>Case duration</small>
          </div>
          <div class="case-details">
            <h4>Case details</h4>
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
      <button class="btn" :class="{ active: view==='operational' }" @click="selectView('operational')">Operational</button>
      <button class="btn" :class="{ active: view==='tactical' }">Tactical</button>
    </div>
    <operational-view v-show="view==='operational'"
      :currentCase="currentCase"
      :kpi="kpi"
      ></operational-view>
      <analytical-view v-show="view==='analytical'"
      :currentCase="currentCase"
      :kpi="kpi"
    ></analytical-view>
  </div>
  </template>
  
  <script>
    import Service from "@/services/service";
    import OperationalView from '@/components/OperationalView.vue';
    import AnalyticalView from '@/components/AnalyticalView.vue';
    import SideBar from '@/components/SideBar.vue';

    export default {
      name: 'CasePage',
      components: {
        SideBar,
        OperationalView,
        AnalyticalView
      },
      params: {
          caseId:{
              type: Number
          }
      },
      data() {
        return {
          currentCase: {},
          kpi: {},
          view: null,
          caseKpi: {},
          caseDetails: {},
          recommendationsAvailable: false,
        }
      },
      methods: {
        getCase(){
          this.caseId = (this.$route.params.caseId)
          Service.getCase(this.caseId).then(
            (response) => {
              console.log(response.data);
              this.currentCase = response.data.case;
              this.getKPI();
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

        getKPI(){
          Service.getKPI(localStorage.fileId).then(
            (response) => {
              console.log(response.data);
              this.kpi = response.data.kpi;
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