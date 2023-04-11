<template>
  <side-bar></side-bar>
  <loading v-if="isLoading" :startPosition="200"></loading>
  <div id="cases">
    <h2>Cases</h2>
    <div class="stats">
      <div @click="filterCases(false)" :class="['stats-card','pointer',{'selected': completedCases === false}]">
        <div class="column">
          <small>Ongoing cases</small>
          <div class="row">
            <h4> {{table.ongoingRows.length}}</h4>        
          </div>
        </div>
        <ion-icon name="albums"></ion-icon>
      </div>
  
      <div @click="filterCases(true)" :class="['stats-card','pointer',{'selected': completedCases}]">
        <div class="column">
          <small> Completed cases</small>
          <div class="row">
            <h4> {{table.completedRows.length}}</h4>
          </div>
        </div>
        <ion-icon name="albums"></ion-icon>
      </div>
    </div> 
    
    <div v-if="completedCases" id="chart" class="shadow">
      <h3>Recommendations history</h3>
      <apexchart type="pie" width="380" :options="pieChart.chartOptions" :series="pieChart.series"></apexchart>
    </div>
    
    <div class="cases-table">
      <table-lite
      :is-hide-paging="true"
      :is-slot-mode="true"
      :columns="table.headers"
      :rows="table.rows"
      :total="table.rows.length"
      :sortable="table.sortable"
      @do-search="doSort"
      @row-clicked="rowClicked"
      >
      <template v-slot:id="data">
        <p>{{ formatId(data.value.id) }}</p>
      </template>
      <template v-slot:recommendations="data">
        <div class="case-recommendations" :class="[data.value.recommendations ? 'available' : 'unavailable']"> 
          {{ data.value.recommendations ? "recommendations available" : "no new recommendations" }}
        </div>
      </template>

      <template v-slot:performance="data">
        <p>{{ data.value.performance.value}} {{ data.value.performance.unit }}</p>
      </template>

      <template v-slot:outcome="data">
        <p>{{ data.value.outcome ? 'Yes': 'No'}}</p>
      </template>
    
    </table-lite>
      
    </div>
    </div>
  </template>
  
  <script>
  
  import casesService from "@/services/cases.service";
  import logsService from "@/services/logs.service";
  import SideBar from '@/components/SideBar.vue';
  import Loading from "@/components/LoadingComponent.vue";
  import TableLite from "vue3-table-lite";
  import shared from '@/services/shared';
  import VueApexCharts from 'vue3-apexcharts';
  
  export default {
    name: 'CasesList',
  
    components: {
          SideBar,
          Loading,
          TableLite,
          apexchart: VueApexCharts,
        },
  
    data() {
      return {
        timer: null,
        logStatus: 'NULL',

        isLoading: false,
        cases: [],
        casesData: [],
        
        performanceColumn: undefined,
        completedCases: false,

        pieChart: {
          series: [0, 0, 1],
          chartOptions: {
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


        table: {
          isLoading: false,
          headers: [
            {
              label: 'Case ID',
              field: 'id',
              width: "10%",
              sortable: true,
            },
            {
              label: "Recommendations",
              field: "recommendations",
              width: "5%",
              sortable: false,
            },
            {
              label: "Performance",
              field: "performance",
              width: "5%",
              sortable: true,
            },
            {
              label: "Intervened",
              field: "intervened",
              width: "5%",
              sortable: true,
            },
            {
              label: "Positive outcome",
              field: "outcome",
              sortable: true,
            },
          ],
          rows: [],
          ongoingRows: [],
          completedRows:[],
          sortable: {
            order: localStorage.casesListOrder,
            sort:  localStorage.casesListSort
          },
        },


      };
    },
  
    mounted() {
      if (localStorage.logId !== 'null' && localStorage.logId !== undefined) {
        this.isLoading = true;
        this.getCases();
        this.getProjectStatus();
      }
    },

    beforeUnmount(){
      clearInterval(this.timer);
    },
    
    methods: {

      formatId(id){
        if(!id) return null;
        return id.slice(id.indexOf('-') + 1);
      },
  
      rowClicked(row){
        this.$router.push({name: 'case',params: {'caseId':row.id}})
      },
  
      doSort(offset,limit,order,sort){
        if (order === null || sort === null) return;
        const sortOrder = sort === 'asc' ? 1 : -1;
        if (order === "performance" && this.performanceColumn === "DURATION"){
          this.table.rows = this.table.rows.sort((a, b) => 
          (shared.parseDuration(a[order]) > shared.parseDuration(b[order])) ? (1 * sortOrder) : (-1 * sortOrder) );
        } else if (order === "performance"){
          this.table.rows = this.table.rows.sort((a, b) => 
          (a[order].value > b[order].value) ? (1 * sortOrder) : (-1 * sortOrder) );
        }
        else{
          this.table.rows = this.table.rows.sort((a, b) => (a[order] > b[order]) ? (1 * sortOrder) : (-1 * sortOrder) );
        }
        localStorage.casesListOrder = order;
        localStorage.casesListSort = sort;

        this.table.sortable.order = order;
        this.table.sortable.sort = sort;
      },

      createPieChart(){
        let outcomeCounts = shared.groupByAndCount(this.table.completedRows,'outcome','intervened');
        if(Object.keys(outcomeCounts).length > 0){
          const propertiesToCheck = [true, false, null];
          this.pieChart.series = propertiesToCheck.map(property => {
            return outcomeCounts[property] || 0;
          });
        }
      },
      
      getCases() {
        casesService.getCasesByLog(localStorage.logId).then(
          (response) => {
            this.cases = response.data.cases;
            if (this.cases.length > 0) this.formatCases();
            else this.isLoading = false;
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
  
      formatCases(){
        
        if (this.casesData.length > 0){
          this.casesData = [];
          this.table.ongoingRows = [];
          this.table.completedRows = [];
        } else{
          Object.keys(this.cases[0].case_attributes).forEach(k => {
          this.table.headers.push({
            label:k,
            field:k,
            sortable:true
          });
        })
      }
      
      let data = {};
        for (const el of this.cases) {
          data = this.formatCase(el);
          this.casesData.push(data);
        }  
        this.table.headers[2].label = this.performanceColumn;
        
        this.casesData.reduce((acc, row) => {
          if (row.completed === false) {
            acc[0].push(row);
          } else {
            acc[1].push(row);
          }
          return acc;
        }, [this.table.ongoingRows, this.table.completedRows]);

        if(this.completedCases){
          this.table.rows = this.table.completedRows;
        } else{
          this.table.rows = this.table.ongoingRows;
        }
        this.doSort(null,null,this.table.sortable.order,this.table.sortable.sort);

        this.createPieChart();

        this.cases = null;
        this.isLoading = false;
      },
  
      formatCase(singleCase){
          if (!this.performanceColumn && singleCase.case_performance.column !== null) this.performanceColumn = singleCase.case_performance.column;
          
          let caseActivities = singleCase.activities;
          let intervened = "No";
          let performance, outcome;
          if(singleCase.case_performance){
            performance = {value:singleCase.case_performance.value,unit:singleCase.case_performance.unit};
            outcome = singleCase.case_performance.outcome
          } else{
            performance = {value: null,unit:null};
            outcome = null
          }
  
          caseActivities.forEach(activity => {
            if(activity.prescriptions){
              activity.prescriptions.forEach(prescription => {
                if (prescription.status === 'accepted'){
                  intervened = "Yes";
                  return;
                }
              })
            }
          });
          let data = {
            id: singleCase._id, 
            recommendations: caseActivities[caseActivities.length-1].prescriptions.length === 0 ? false : true,
            intervened: intervened,
            performance: performance, 
            outcome: outcome
          }
          
          Object.keys(singleCase.case_attributes).forEach(k => {
            data[k] = singleCase.case_attributes[k];
          })
  
          data['completed'] = singleCase.case_completed;
          return data;
      },
  
      filterCases(status){
        if (this.completedCases === status){
          return;
        }
        this.completedCases = status;
        if(status) this.table.rows = this.table.completedRows;
        else this.table.rows = this.table.ongoingRows;
      },

      getProjectStatus(){
        logsService.getProjectStatus(localStorage.logId).then(
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
    }
  
  }
  </script>