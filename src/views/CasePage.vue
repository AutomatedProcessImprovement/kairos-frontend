<template>
  <div id="case">
    <div class="case-top">
      <router-link :to="{name: 'cases'}"><ion-icon name="chevron-back-outline"></ion-icon> Return</router-link>
      <h2>Case #{{caseId}}</h2>
  
      <div class="case-small-text">
        <small>Started: {{startDate}}</small>  <small>Last update: {{lastUpdate}}</small>
      </div>
      <div class="case-summary">
        <div class="case-kpi">
          <h4>Case {{ kpi.name }} </h4>
          <div class="row">
            <h5>{{ caseKpi }} {{ kpi.measurement }}
              <small v-if="kpi.name === 'duration'">since case start</small>
            </h5>
            <h5> /{{ kpi.value }} {{ kpi.measurement }}
              <small>target</small>
            </h5>
          </div>
        </div>
        <div class="case-details">
          <h4>Case details</h4>
          <div class="row">
            <h5 v-for="(value,name) in caseDetails" :key='name'>{{ value }}
              <small>{{ name }}</small>
            </h5>
          </div>
        </div>
      </div>
    </div>
    <div class="switch-views">
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
    export default {
      name: 'CasePage',
      components: {
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
          endDate: new Date("2022-12-22T10:30:00"),
          currentCase: {},
          kpi: {},
          startDate: "None",
          lastUpdate: "None",
          view: null,
          caseKpi: null,
          caseDetails: {},
        }
      },
      methods: {
        getCase(){
          this.caseId = (this.$route.params.caseId)
          Service.getCase(this.caseId).then(
            (response) => {
              this.currentCase = response.data.case;
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
          const arr = Object.entries(this.currentCase)
          const obj = arr.filter(([key,value]) => {
            return typeof value !== "object" && key !== "caseId"
          });
          this.caseDetails = Object.fromEntries(obj);

          if (!this.currentCase.activities.length) {
            return;
          } 
          var options = {dateStyle:"medium",timeStyle: "short"};
          this.startDate = new Date(this.currentCase.activities[0].timestamp).toLocaleString("en-GB",options)
          
          var lastActivity = this.currentCase.activities[this.currentCase.activities.length - 1]
          var endDate = new Date(lastActivity.timestamp).toLocaleString("en-GB",options)
          this.lastUpdate = "Task " + lastActivity.name + " completed by " + lastActivity.resource.name + " on " + endDate;
          
          this.caseKpi = Math.ceil(Math.abs(this.endDate - (new Date(this.currentCase.activities[0].timestamp)))/(1000*60*60*24))    
          
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