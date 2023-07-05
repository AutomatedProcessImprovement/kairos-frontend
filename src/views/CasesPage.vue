<template>
  <side-bar></side-bar>
  <loading v-if="isLoading" :startPosition="200"></loading>
  <div id="cases">
    <h2>{{completionString}} Cases Overview</h2>
    <div class="stats">
      <div class="stats-card pointer">
        <div class="column">
          <small> {{ completionString }} cases</small>
          <div class="row">
            <h4> {{casesData.length}}</h4>
          </div>
        </div>
        <ion-icon name="albums"></ion-icon>
      </div>
    </div>

    <div v-if="completion" class="row">
      <div id="history-chart" class="shadow">
        <h3>Recommendations history</h3>
        <apexchart type="pie" width="380" :options="pieChart.chartOptions" :series="pieChart.series"></apexchart>
      </div>
  
      <div id="statistics-table" class="shadow">
        <h3>Models statistics</h3>
      </div>
    </div>
    

    <cases-table-component
    :completed="completion"
    :performanceColumn="performanceColumn"
    :caseAttributes="caseAttributes"
    :cases="casesData"
    ></cases-table-component>
      
    </div>
  </template>
  
  <script>
  
  import casesService from "@/services/cases.service";
  import logsService from "@/services/logs.service";
  import SideBar from '@/components/SideBar.vue';
  import Loading from "@/components/LoadingComponent.vue";
  import shared from '@/services/shared';
  import VueApexCharts from 'vue3-apexcharts';
  import CasesTableComponent from "@/components/CasesTableComponent.vue";

  export default {
    name: 'CasesList',
  
    components: {
          SideBar,
          Loading,
          apexchart: VueApexCharts,
          CasesTableComponent
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
        completion: undefined,

        isLoading: false,
        cases: [],
        casesData: [],
        caseAttributes: [],
        
        performanceColumn: undefined,

        pieChart: {
          series: [0, 0, 1],
          chartOptions: {
            colors: ['#17ad37','#F5222D','#a0a3a5'],
            chart: {
              animations:{
                enabled: false,
              },
              width: 380,
              type: 'pie',
            },
            labels: ['Was successful', 'Was unsuccessful', 'No data'],
            responsive: [{
              breakpoint: 480,
              options: {
                chart: {
                  width: 200
                },
                legend: {
                  position: 'right'
                }
              }
            }]
          },
        },
      };
    },
  
    mounted() {
      if (shared.getLocal('logId')) {
        this.setup();       
      }
    },

    watch: {
      $route(){
        this.setup();
      }
    },

    beforeUnmount(){
      clearInterval(this.timer);
    },
    
    methods: {

      setup(){
        this.completion = this.$route.params.completion === 'completed';
        this.isLoading = true;
        this.getCases();
        this.getProjectStatus(); 
      },

      createPieChart(){
        console.log('making piechart');
        let outcomeCounts = shared.groupByAndCount(this.casesData,'outcome','intervened');
        if(Object.keys(outcomeCounts).length > 0){
          const propertiesToCheck = [true, false, null];
          this.pieChart.series = propertiesToCheck.map(property => {
            return outcomeCounts[property] || 0;
          });
        }
      },
      
      getCases() {
        casesService.getCasesByLogAndCompletion(shared.getLocal('logId'),this.completionString.toLowerCase()).then(
          (response) => {
            this.cases = response.data.cases;
            if (this.cases.length > 0) this.formatCases();
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
        if(this.completion){
          this.createPieChart();
          this.calculateModelsStatistics();
        }

        this.cases = null;
        this.isLoading = false;
      },

      calculateModelsStatistics(){
        console.log('models stats');
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