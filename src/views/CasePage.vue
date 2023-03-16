<template>
  <side-bar></side-bar>
  <loading v-if="isLoading"></loading>
  <div id="case">
    <div class="case-top">
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
            <p :class="['bold', caseKpi.outcome? 'green' : 'warning']">{{ caseKpi.value }}</p>
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
    <operational-view v-show="selectedView==='operational'"
      :currentCase="currentCase"
      :parameters="parameters"
      ></operational-view>
      <analytical-view v-show="selectedView==='analytical'"
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
          selectedView: null,
          caseKpi: {value: null,column: null, outcome: false},
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
              const resMessage=
                (error.response &&
                  error.response.data &&
                  error.response.data.message) ||
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
          Service.getParameters(localStorage.fileId).then(
            (response) => {
              this.parameters.kpi = response.data.kpi;
              this.parameters.caseCompletion = response.data.caseCompletion;
              this.parameters.alarmThreshold = response.data.alarmThreshold;
              this.parameters.treatment = response.data.treatment;
              this.parameters.columnsDefinition = response.data.columnsDefinition;
              this.getAdditionalInformation();
            },
            (error) => {
              const resMessage =
                (error.response &&
                  error.response.data &&
                  error.response.data.message) ||
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
        }
        
      },
      mounted() {
        this.getCase();
        this.selectedView = localStorage.view;
        window.addEventListener('view-changed', this.changeView);
      },

      beforeUnmount() {
        window.removeEventListener('view-changed',this.changeView);
      },
    };
  </script>