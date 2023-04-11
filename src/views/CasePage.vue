<template>
  <side-bar></side-bar>
  <loading v-if="isLoading" :startPosition="200"></loading>
  <div id="case" v-if="currentCase._id">
    <div class="case-top">
      <router-link class="bold" :to="{name: 'cases'}"><ion-icon name="chevron-back"></ion-icon> Return</router-link>
      <div class="row">
        <h2>Case #{{caseId.slice(caseId.indexOf('-') + 1)}}</h2>
        <div class="case-recommendations" :class="[recommendationsAvailable ? 'available' : 'unavailable']"> 
          {{ recommendationsAvailable ? "recommendations available" : "no new recommendations" }}
        </div>
      </div>
  
      <div class="stats">
        <div v-if="parameters.kpi" class="stats-card column">
          <p>KPI</p>
          <h3 class="blue">{{ parameters.kpi.value }} {{ parameters.kpi.unit }}</h3>
          <small>Case {{ parameters.kpi.column }}  {{ parameters.kpi.operator }}</small>
        </div>
        <div class="stats-card">
          <div class="case-performance">
            <p>Case performance</p>
            <p :class="['bold', caseKpi.outcome? 'green' : 'warning']">{{ caseKpi.value }} {{ caseKpi.unit }}</p>
            <small>Case {{ caseKpi.column }}</small>
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
    <operational-view v-show="selectedView==='operational' || selectedView==='tactical'"
      :currentCase="currentCase"
      :parameters="parameters"
      ></operational-view>
      <analytical-view v-show="selectedView==='analytical'"
      :currentCase="currentCase"
      :parameters="parameters"
    ></analytical-view>
  </div>
  <error v-else></error>
  </template>
  
  <script>
    import casesService from "@/services/cases.service";
    import logsService from "@/services/logs.service";
    import OperationalView from '@/components/OperationalView.vue';
    import AnalyticalView from '@/components/AnalyticalView.vue';
    import SideBar from '@/components/SideBar.vue';
    import Loading from "@/components/LoadingComponent.vue";
    import Error from "@/components/ErrorComponent.vue";

    export default {
      name: 'CasePage',
      components: {
        SideBar,
        OperationalView,
        AnalyticalView,
        Loading,
        Error
      },
      params: {
          caseId:{
              type: Number
          }
      },
      data() {
        return {
          timer: null,
          isLoading: true,
          currentCase: {},
          parameters: {},
          selectedView: null,
          caseKpi: {value: null,column: null, outcome: false},
          caseDetails: {},
          recommendationsAvailable: false,
        }
      }, 

      mounted() {
        window.addEventListener('view-changed', this.changeView);
        this.selectedView = localStorage.view;
        if (localStorage.logId !== 'null' && localStorage.logId !== undefined){ 
          this.getParameters();
          this.getProjectStatus();
        }
      },

      beforeUnmount() {
        window.removeEventListener('view-changed',this.changeView);
        clearInterval(this.timer);
      },

      methods: {
        getCase(){
          this.caseId = (this.$route.params.caseId);
          casesService.getCase(this.caseId).then(
            (response) => {
              this.currentCase = response.data.case;
              this.getAdditionalInformation();
            },
            (error) => {
              this.isLoading = false;
              const resMessage=
                (error.response &&
                  error.response.data &&
                  error.response.data.error) ||
                error.message ||
                error.toString();
                this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    }) 
            }
          );
        },

        getParameters(){
          logsService.getParameters(localStorage.logId).then(
            (response) => {
              this.parameters = response.data.parameters;
              this.getCase();
            },
            (error) => {
              this.isLoading = false;
              const resMessage =
                (error.response &&
                  error.response.data &&
                  error.response.data.error) ||
                error.message ||
                error.toString();
                this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    }) 
            }
          );
        },

        getAdditionalInformation(){
          this.caseDetails = this.currentCase.case_attributes;
          const caseActivities = this.currentCase.activities
          this.recommendationsAvailable = caseActivities[caseActivities.length - 1]['prescriptions'].length === 0 ? false: true;
          
          if (this.currentCase.case_performance) {
            this.caseKpi = this.currentCase.case_performance;  
          }           
          this.isLoading = false;
        },

        changeView(event){
          this.selectedView = event.detail.storage;
        },

        getProjectStatus(){
        logsService.getProjectStatus(localStorage.logId).then(
            (response) => {
                let status = response.data.status;
                if(status === 'SIMULATING'){
                  this.timer = setInterval(() => {
                      this.getCase();
                  }, 5000);
                }
            },
            (error) => {
                console.log(error);
            }
        ); 
    },
        
      },
      
    };
  </script>