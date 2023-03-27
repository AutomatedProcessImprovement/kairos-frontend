<template>
    <side-bar></side-bar>
    <loading v-if="isLoading"></loading>
    <div id="recommendations">
      <h2>Recommendations</h2>
      <div class="stats">
        <div class="stats-card">
          <div class="column">
            <small>Total current recommendations</small>
            <div class="row">
              <h4> {{formattedData.length}}</h4>        
            </div>
          </div>
          <ion-icon name="albums"></ion-icon>
        </div>
      </div>  
      
      <div class="recommendations-table">
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
        <template v-slot:performance="data">
          <p>{{ data.value.performance.value}} {{ data.value.performance.unit }}</p>
        </template>
      
      </table-lite>
        
      </div>
      </div>
    </template>
    
    <script>
    
    import logsService from "@/services/logs.service";
    import SideBar from '@/components/SideBar.vue';
    import Loading from "@/components/LoadingComponent.vue";
    import TableLite from "vue3-table-lite";
    import shared from '@/services/shared'
    
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
          recommendations: [],
          formattedData: [],
          performanceColumn: undefined,
          parameters: null,

          table: {
            isLoading: false,
            headers: [
            {
                label: 'Case ID',
                field: 'id',
                sortable: false,
                isKey: true
            },
            {
                label: "Performance",
                field: "performance",
                sortable: false,
            },
            {
                label: "Recommendation",
                field: "recommendationAttribute",
                sortable: false,
            },
            {
                label: "Details",
                field: "details",
                sortable: false,
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
        if (localStorage.logId !== 'null' && localStorage.logId !== undefined) this.getParameters();
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
        
        getRecommendations() {
          logsService.getRecommendations(localStorage.logId).then(
            (response) => {
                this.recommendations = response.data.prescriptions;
                if (this.recommendations.length > 0) this.formatRecommendations();
                this.isLoading = false;
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
        getParameters(){
            this.isLoading = true;
          logsService.getParameters(localStorage.logId).then(
            (response) => {
              this.parameters = response.data.parameters;
              this.getRecommendations();
            },
            (error) => {
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
    
        formatRecommendations(){
            for (const el of this.recommendations) {
                if (!this.performanceColumn && el.case_performance.column !== null) this.performanceColumn = el.case_performance.column;
                var caseId = el._id;
                var casePerformance = el.case_performance;
                for(const batch of el.activities){
                    for (const rec of batch.prescriptions){
                        let data = this.formatRecommendation(caseId,casePerformance,rec);
                        if (data !== null) this.formattedData.push(data);
                    }
                }
            }
            this.table.headers[1].label = this.performanceColumn;
            this.table.rows = this.formattedData;
            },
    
        formatRecommendation(id,performance,p){
            let recommendationAttr,recommendedAttr;
            if(p.type === 'NEXT_ACTIVITY'){
                recommendationAttr = 'Perform ' + p.output;
                recommendedAttr = 'Recommended now.';
            }
            else if(p.type === 'ALARM') {
                recommendationAttr = 'Action required';
                if (p.output < this.parameters.alarmThreshold) return null;
                recommendedAttr = 'Predicted probability of violating KPI is high.' ;
            }
            else if(p.type==='TREATMENT_EFFECT'){
                recommendationAttr = shared.formatIntervention(p.output,this.parameters.columnsDefinition);
                if(p.output.cate <= 0) return null;
                
                recommendedAttr =  'Predicted effect is positive.';
            }
            let data = {
                id:id,
                performance: {value: performance.value,unit:performance.unit},
                recommendationAttribute: recommendationAttr,
                details: recommendedAttr,
            }
            return data;
        }
    
        
      }
    
    }
    </script>