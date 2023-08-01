<template>
  <side-bar></side-bar>
  <loading v-if="isLoading" :startPosition="200"></loading>
  <div id="cases">
    <h2>{{completionString}} Cases Overview</h2>
    <div class="stats">
      <div class="stats-card">
        <div class="column">
          <small> {{ completionString }} cases</small>
          <div class="row">
            <h4> {{casesData.length}}</h4>
          </div>
        </div>
        <ion-icon name="albums"></ion-icon>
      </div>

      <div v-if="!this.completion" class="stats-card wrap-text">
        <small>Cases with recommendations</small>
        <h3 class="large-number bg-green">{{ casesWithRecommendations }}</h3>
      </div>
      
      <div v-if="!this.completion" class="stats-card wrap-text">
        <small>Cases without recommendations</small>
        <h3 class="large-number bg-gray">{{ casesData.length - casesWithRecommendations }}</h3>
      </div>
    </div>

    <div class="column"  v-show="!showTable">
      <completed-charts-component v-if="completion"
      :cases="cases"
      :casesData="casesData"
      ></completed-charts-component>
      
      <ongoing-charts-component v-if="!completion"
      :cases="cases"
      :casesData="casesData"
      ></ongoing-charts-component>
    </div>    
    
    <div v-if="!showTable" class="cases-table-preview-heading shadow">
      <h3>Cases Overview Table</h3>
      <button v-if="!showTable" @click="toggleShowTable" class="link-btn">Show full <ion-icon name="open-outline"></ion-icon></button>
    </div>
    <div class="column">
      <button v-if="showTable" @click="toggleShowTable" class="link-btn"><ion-icon name="chevron-back"></ion-icon> Return to overview</button>

      <cases-table-component 
      :completed="completion"
      :performanceColumn="performanceColumn"
      :performanceColumnType="performanceColumnType"
      :caseAttributes="caseAttributes"
      :cases="casesDataToShow"
      :isFullView="showTable"
      ></cases-table-component>
    </div>
      
    </div>
  </template>
  
  <script>
  
  import casesService from "@/services/cases.service";
  import logsService from "@/services/logs.service";
  import SideBar from '@/components/SideBar.vue';
  import Loading from "@/components/LoadingComponent.vue";
  import shared from '@/services/shared';
  import CasesTableComponent from "@/components/CasesTableComponent.vue";
  import CompletedChartsComponent from "@/components/CompletedChartsComponent.vue";
  import OngoingChartsComponent from "@/components/OngoingChartsComponent.vue";

  export default {
    name: 'CasesList',
  
    components: {
          SideBar,
          Loading,
          CasesTableComponent,
          CompletedChartsComponent,
          OngoingChartsComponent
        },

    computed: {
      completionString(){
        return this.completion ? 'Completed' : 'Ongoing';
      },
      casesWithRecommendations(){
        return this.casesData.filter(c => c.recommendations > 0).length;
      },
      casesDataToShow(){
        return this.showTable ? this.casesData : this.casesData.slice(0,3);
      }
    },
  
    data() {
      return {
        timer: null,
        logStatus: 'NULL',
        completion: this.$route.params.completion === 'completed',
        showTable: shared.getLocal('casesListShowTable') || false,

        isLoading: false,
        cases: [],
        casesData: [],
        caseAttributes: [],
        
        performanceColumn: undefined,
        performanceColumnType: undefined,
      };
    },
  
    mounted() {
      if (shared.getLocal('logId')) {
        this.setup();       
      }
    },

    watch: {
      $route(){
        this.completion = this.$route.params.completion === 'completed';
        this.setup();
      }
    },

    beforeUnmount(){
      clearInterval(this.timer);
    },
    
    methods: {

      setup(){
        this.isLoading = true;
        this.getCases();
        this.getProjectStatus(); 
      },

      toggleShowTable(){
        this.showTable = !this.showTable;
        shared.setLocal('casesListShowTable',this.showTable,5);
      },

      getCases() {
        casesService.getCasesByLogAndCompletion(shared.getLocal('logId'),this.completionString.toLowerCase()).then(
          (response) => {
            if (this.cases !== response.data.cases && response.data.cases.length > 0){
              this.cases = response.data.cases;
              this.formatCases();
            }
            else this.isLoading = false;
            },
          (error) => {
            this.isLoading = false;
            if (error.response.status === 504) return;
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
  
      formatCases(){
        if (this.casesData.length > 0){
          this.casesData = [];
        }else{
          Object.keys(this.cases[0].case_attributes).forEach(k => {
            this.caseAttributes.push({
              label:k,
              field:k,
              sortable:true
            });
          })
          if (!this.performanceColumn) {
            this.performanceColumn = this.cases[0].case_performance.column;
            this.getPerformanceColumnType();
          }
        }
        
        let data = {};
        for (const el of this.cases) {
          data = shared.formatCase(el);
          this.casesData.push(data);
        }

        this.isLoading = false;
      },

      getProjectStatus(){
        logsService.getProjectStatus(shared.getLocal('logId')).then(
            (response) => {
                let status = response.data.status;

                if(status === 'SIMULATING'){
                  this.timer = setInterval(() => {
                      this.getCases();
                  }, 5000);
                }
            },
            (error) => {
                console.log(error);
            }
        ); 
      },

      getPerformanceColumnType(){
          logsService.getParameters(shared.getLocal('logId')).then(
            (response) => {
              const columnsDefinition = response.data.parameters.columnsDefinition;
              this.performanceColumnType = columnsDefinition[this.performanceColumn];
              if (!this.performanceColumnType){
                this.performanceColumnType = this.performanceColumn;
              }
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
  
    }
  
  }
  </script>