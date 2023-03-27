<template>
<side-bar></side-bar>
<loading v-if="isLoading"></loading>
<div id="cases">
  <h2>Cases</h2>
  <div class="stats">
    <div @click="filterCases(false)" :class="['stats-card','pointer',{'selected': completedCases === false}]">
      <div class="column">
        <small>Ongoing cases</small>
        <div class="row">
          <h4> {{cases.filter(c => !c.case_completed).length}}</h4>        
        </div>
      </div>
      <ion-icon name="albums"></ion-icon>
    </div>

    <div @click="filterCases(true)" :class="['stats-card','pointer',{'selected': completedCases}]">
      <div class="column">
        <small> Completed cases</small>
        <div class="row">
          <h4> {{cases.filter(c => c.case_completed).length}}</h4>
        </div>
      </div>
      <ion-icon name="albums"></ion-icon>
    </div>
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
    <template v-slot:recommendations="data">
      <div class="case-recommendations" :class="[data.value.recommendations ? 'available' : 'unavailable']"> 
        {{ data.value.recommendations ? "recommendations available" : "no new recommendations" }}
      </div>
    </template>
    <template v-slot:performance="data">
      <p>{{ data.value.performance.value}} {{ data.value.performance.unit }}</p>
    </template>
  
  </table-lite>
    
  </div>
  </div>
</template>

<script>

import casesService from "@/services/cases.service";
import SideBar from '@/components/SideBar.vue';
import Loading from "@/components/LoadingComponent.vue";
import TableLite from "vue3-table-lite";
import shared from '@/services/shared';

export default {
  name: 'CasesList',

  components: {
        SideBar,
        Loading,
        TableLite,
      },

  data() {
    return {
      isLoading: false,
      cases: [],
      kpi: [],
      casesData: [],
      
      performanceColumn: undefined,
      completedCases: undefined,
      table: {
        isLoading: false,
        headers: [
          {
            label: 'Case ID',
            field: 'id',
            width: "10%",
            sortable: true,
            isKey: true
          },
          {
            label: "Recommendations",
            field: "recommendations",
            width: "5%",
            sortable: false,
          },
          {
            label: "Intervened",
            field: "intervened",
            width: "5%",
            sortable: true,
          },
        ],
        rows: [],
        sortable: {
          order: null,
          sort: null
        },
      },
    };
  },

  mounted() {
    if (localStorage.logId !== 'null' && localStorage.logId !== undefined) this.getCases();
  },
  
  methods: {

    rowClicked(row){
      this.$router.push({name: 'case',params: {'caseId':row.id}})
    },

    doSort(offset,limit,order,sort){
      const sortOrder = sort === 'asc' ? 1 : -1;
      if (order === "performance" && this.cases[0].case_performance.column === "DURATION"){
        this.table.rows = this.table.rows.sort((a, b) => 
        (shared.parseDuration(a[order]) > shared.parseDuration(b[order])) ? (1 * sortOrder) : (-1 * sortOrder) );
      } else if (order === "performance"){
        this.table.rows = this.table.rows.sort((a, b) => 
        (a[order].value > b[order].value) ? (1 * sortOrder) : (-1 * sortOrder) );
      }
      else{
        this.table.rows = this.table.rows.sort((a, b) => (a[order] > b[order]) ? (1 * sortOrder) : (-1 * sortOrder) );
      }
      this.table.sortable.order = order;
      this.table.sortable.sort = sort;
    },

    
    getCases() {
      this.isLoading = true;
      casesService.getCasesByLog(localStorage.logId).then(
        (response) => {
          console.log(response.data)
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
      let data = {};
      
      for (const el of this.cases) {
        data = this.formatCase(el);
        this.casesData.push(data);
      }
      this.table.rows = this.casesData;

      this.table.headers.push({
        label: this.performanceColumn,
        field: 'performance',
        sortable: true
      })

      Object.keys(this.cases[0].case_attributes).forEach(k => {
        this.table.headers.push({
          label:k,
          field:k,
          sortable:true
        });
      })

      this.table.headers.push({
        label:'Completed',
        field:'completed',
        sortable:true
      })

      this.isLoading = false;
    },

    formatCase(singleCase){
        if (!this.performanceColumn && singleCase.case_performance.column !== null) this.performanceColumn = singleCase.case_performance.column;
        
        let caseActivities = singleCase.activities;
        let intervened = "No";

        caseActivities.forEach(activity => {
          activity.prescriptions.forEach(prescription => {
            if (prescription.status === 'accepted'){
              intervened = "Yes";
              return;
            }
          })
        });
        
        let data = {
          id: singleCase._id, 
          recommendations: singleCase.case_completed || caseActivities[caseActivities.length-1].prescriptions.length === 0 ? false : true,
          intervened: intervened,
          performance: {value:singleCase.case_performance.value,unit:singleCase.case_performance.unit}, 
        }
        
        Object.keys(singleCase.case_attributes).forEach(k => {
          data[k] = singleCase.case_attributes[k];
        })

        data['completed'] = singleCase.case_completed;
        return data;
    },

    filterCases(status){
      if (this.completedCases === status){
        this.completedCases = null;
        this.table.rows = this.casesData;
        return;
      }
      this.completedCases = status;
      this.table.rows = this.casesData.filter(r => r.completed === status);
    },
  }

}
</script>