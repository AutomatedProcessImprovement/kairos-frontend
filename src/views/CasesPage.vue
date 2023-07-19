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
    </div>

    <div class="column"  v-show="!showTable">
      <charts-component
      :cases="cases"
      :casesData="casesData"
      ></charts-component>
      
      <button @click="showTable = !showTable" class="link-btn">Show cases table <ion-icon name="open-outline"></ion-icon></button>
    </div>
    
    
    <div class="column" v-show="showTable">
      <button @click="showTable = !showTable" class="link-btn"><ion-icon name="chevron-back"></ion-icon> Return to overview</button>

      <cases-table-component 
      :completed="completion"
      :performanceColumn="performanceColumn"
      :caseAttributes="caseAttributes"
      :cases="casesData"
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
  import ChartsComponent from "@/components/ChartsComponent.vue";

  export default {
    name: 'CasesList',
  
    components: {
          SideBar,
          Loading,
          CasesTableComponent,
          ChartsComponent
        },

    computed: {
      completionString(){
        return this.completion ? 'Completed' : 'Ongoing';
      }
    },
  
    data() {
      return {
        timer: null,
        logStatus: 'NULL',
        completion: this.$route.params.completion === 'completed',
        showTable: false,

        isLoading: false,
        cases: [],
        casesData: [],
        caseAttributes: [],
        
        performanceColumn: undefined,
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

      getCases() {
        casesService.getCasesByLogAndCompletion(shared.getLocal('logId'),this.completionString.toLowerCase()).then(
          (response) => {
            if (this.cases !== response.data.cases){
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
          if (!this.performanceColumn) this.performanceColumn = this.cases[0].case_performance.column;
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
      }
    }
  
  }
  </script>