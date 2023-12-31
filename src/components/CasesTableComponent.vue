<template>
  <div id="cases-table-component">
    <div class="cases-filter column">
      <div v-if="isFullView" @click="filterActive = !filterActive" class="filter-toggle shadow">Filters <ion-icon :class="{active : filterActive}" name="chevron-up"></ion-icon></div>
      
      <div v-if="isFullView" class="filters column shadow" :class="{active : filterActive}">
        <div class="row wrap-on-media">
  
          <div class="filter-component">
            <h4 class="blue">RECOMMENDATIONS</h4>
            <select v-model="filters.recommendations.value">
              <option :value=true>Available</option>
              <option :value=false>Unavailable</option>
            </select>
          </div>
          <div class="filter-component">
            <h4 class="blue">INTERVENED</h4>
            <select v-model="filters.intervened.value">
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>

          <div class="filter-component" v-if="performanceColumnType">
            <h4 class="blue">{{performanceColumn.toUpperCase()}}</h4>

            <div class="column">

                <select v-model="filters.performance.value.operator">
                  <option v-for="evaluationMethod in getPerformanceEvaluationMethods()" :key="evaluationMethod" :value="evaluationMethod">{{ formatEvaluationMethod(evaluationMethod) }}</option>
                </select>

    
                <span v-if="performanceColumnType === 'BOOLEAN'"></span>

                <div class="row" v-else-if="performanceColumnType === 'DURATION'">
                  <input type="number" min="0" v-model="filters.performance.value.value"/>

                  <select v-model="filters.performance.value.unit">
                    <option>weeks</option>
                    <option>days</option>
                    <option>hours</option>
                    <option>minutes</option>
                    <option>seconds</option>
                  </select>
                </div>

                <input v-else :type="getPerformanceInputType()" v-model="filters.performance.value.value"/>
            </div>

          </div>
        </div>

        <div class="row">
          <button @click="applyFilters()" class="btn-blue">Apply filters</button>
          <button @click="clearFilters()" class="btn-blue">clear filters</button>
        </div>
      </div>
      
    </div>

    <div v-if="isFullView" class="applied-filters row">
      <div class="applied-filter shadow" v-for="(value,key) in appliedFilters" :key="key">
        {{ key === "performance" ? performanceColumn : key }}: {{ this.filters[key].label(value) }} <ion-icon @click="clearFilters(key)" name="close"></ion-icon>
      </div>
    </div>

    <div class="cases-table" :class="{'hide-paging': !isFullView}">
      <table-lite
      :is-loading="table.isLoading"
      :page-size="table.pageSize"
      :page="pageNumber"
      :is-slot-mode="true"
      :columns="headers"
      :rows="tableRows"
      :rowClasses="getRowClasses"
      :total="tableRowsCount"
      :sortable="table.sortable"
      @do-search="doSearch"
      @row-clicked="rowClicked"
      @is-finished="table.isLoading = false"
      >
      <template v-slot:id="data">
        <p>{{ formatId(data.value.id) }}</p>
      </template>
      <template v-slot:recommendations="data">
        <div class="case-recommendations" :class="[data.value.recommendations > 0 ? 'available' : 'unavailable']"> 
          {{ data.value.recommendations }}
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

  import TableLite from "vue3-table-lite";
  import shared from '@/services/shared';

  export default {
    name: 'CasesList',
  
    components: {
          TableLite,
        },

    props:{
      completed: Boolean,
      caseAttributes: Array,
      cases: Array,
      performanceColumn: String,
      performanceColumnType: String,
      isFullView: Boolean,
    },
    
    watch: {
      cases(){
        this.setup();
      },
      
      performanceColumn(value){
        this.table.headers[2].label = value;
        this.setup();
      },
    },

    computed: {

      headers(){
        if(this.completed === true) return [...this.table.headers.slice(0,1), ...this.table.headers.slice(2)].concat([this.table.outcomeHeader]).concat(this.caseAttributes);
        return this.table.headers.concat(this.caseAttributes);
      },

      pageNumber(){
        const totalPages = Math.ceil(this.tableRowsCount / this.table.pageSize); 

        if (totalPages === 0) return 1;

        const page = Math.floor(this.table.offset / this.table.pageSize) + 1; 
        if (page < 1) return 1; 
        if (page > totalPages) return totalPages; 

        return page; 
      },

      tableRows(){
        return this.table.rows.filter(r => r['filters'].length === 0).slice(this.table.offset,this.table.offset+this.table.pageSize);
      },

      tableRowsCount(){
        return this.table.rows.filter(r => r['filters'].length === 0).length;
      },
    },

    data() {
      return {
        timer: null,
        logStatus: 'NULL',

        filterActive: false,
        filterButtonPressed: false,

        filters: {
          recommendations: {
            value: shared.getLocal('casesListFilterRecommendations'),
            label: (value) => value ? 'Available' : 'Unavailable',
            isFiltered: (row,filterValue) =>
            filterValue ? row.recommendations > 0 : row.recommendations < 1,
            applied: shared.getLocal('casesListFilterRecommendations') !== null,
          },
          intervened: {
            value: shared.getLocal('casesListFilterIntervened'),
            label: (value) => value,
            isFiltered: (row,filterValue) => row.intervened === filterValue,
            applied: shared.getLocal('casesListFilterIntervened') !== null,
          },
          performance: {
            value: shared.getLocal('casesListFilterPerformance') || {operator: null, value: null, unit: null},
            label: (value) => value.operator  + " " + value.value + " " + (value.unit ?? ""),
            isFiltered: (row,filterValue) => this.isFilteredPerformance(row,filterValue),
            applied: shared.getLocal('casesListFilterPerformance') !== null,
          }
        },

        appliedFilters: {},

        table: {
          pageSize: shared.getLocal('casesListLimit') || 10,
          offset: shared.getLocal('casesListOffset') || 0,
          isLoading: false,
          headers: [
            {
              label: 'Case ID',
              field: 'id',
              width: "5%",
              sortable: true,
            },
            {
              label: "Recommendations",
              field: "recommendations",
              sortable: true,
            },
            {
              label: "Performance",
              field: "performance",
              width: "15%",
              sortable: true,
            },
            {
              label: "Intervened",
              field: "intervened",
              width: "5%",
              sortable: true,
            },
          ],
          outcomeHeader: {
              label: "Positive outcome",
              field: "outcome",
              sortable: true,
            },
          sortable: {
            order: shared.getLocal('casesListOrder'),
            sort:  shared.getLocal('casesListSort')
          },
          rows: [],
          totalRecordCount: 0,
          clickedRows: shared.getLocal(`casesListClickedRows${shared.getLocal('logId')}`) || [],
        },
      };
    },
  
    
    methods: {

      setup(){
        this.computeAppliedFilters();
        if(Object.keys(this.appliedFilters).length > 0) {
          this.table.isLoading = true;
          this.table.rows = this.sortCases(this.cases);
          this.applyFilters(0);
          this.table.isLoading = false;
        }
        else {
          if (this.table.offset >= this.table.pageSize * this.pageNumber) this.table.offset = 0;
          this.doSearch(this.table.offset, this.table.pageSize, this.table.sortable.order, this.table.sortable.sort, true, true, this.cases);        
        }
      },

      formatEvaluationMethod(evaluationMethod){
        return shared.deformat(evaluationMethod);
      },

      getRowClasses(row){
        let index = this.table.clickedRows.indexOf(row.id);
        if (index < 0) return '';
        if (index === 0) return 'last-clicked-row';
        return 'clicked-row';
      },

      formatId(id){
        if(!id) return null;
        return id.slice(id.indexOf('-') + 1);
      },
  
      rowClicked(row){
        let index = this.table.clickedRows.indexOf(row.id);
        if(index > -1) {
          this.table.clickedRows.splice(index, 1);
        }
        this.table.clickedRows.unshift(row.id);

        shared.setLocal(`casesListClickedRows${shared.getLocal('logId')}`,this.table.clickedRows,1);
        this.$router.push({name: 'case',params: {'caseId': row.id}})
      },

      doSearch(offset,limit,order,sort,doSort=false,isLoading=true, rowsData = null){
        this.table.isLoading = isLoading;
        setTimeout(() => {
          let tempRows = rowsData ?? this.table.rows;
          
          if(sort !== null && order !== null){
            doSort = order !== this.table.sortable.order || sort !== this.table.sortable.sort || doSort;
            
            this.table.sortable.order = order;
            this.table.sortable.sort = sort;
            shared.setLocal('casesListOrder',order,5);
            shared.setLocal('casesListSort',sort,5);
            
            tempRows = doSort ? this.sortCases(tempRows) : tempRows;
          }
          
          this.table.rows = tempRows;
          tempRows = null;
          
          this.table.offset = offset;
          this.table.pageSize = limit;

          shared.setLocal('casesListOffset',offset,5);
          shared.setLocal('casesListLimit',limit,5);      
          this.table.isLoading = false;    
        }, 400);
      },

      sortCases(rows){
        let sort = this.table.sortable.sort;
        let order = this.table.sortable.order;
        if(!sort || !order) return rows;
        const sortOrder = sort === 'asc' ? 1 : -1;
        if (order === "performance" && this.performanceColumn === "DURATION"){
          rows = rows.sort((a, b) => 
          (shared.parseDuration(a[order]) > shared.parseDuration(b[order])) ? (1 * sortOrder) : (-1 * sortOrder));
        } else if (order === "performance"){
          rows = rows.sort((a, b) => 
          (a[order].value > b[order].value) ? (1 * sortOrder) : (-1 * sortOrder));
        }
        else{
          rows = rows.sort((a, b) => (a[order] > b[order]) ? (1 * sortOrder) : (-1 * sortOrder));
        }
        return rows;
      },

      applyFilters(timeout = 400){
        this.computeAppliedFilters(true);
        if (this.appliedFilters.length < 1) return;
        this.table.isLoading = true;

        setTimeout(() => {
          Object.keys(this.appliedFilters).forEach(k => this.applyFilterByKey(k));
          this.table.isLoading = false;
        }, timeout);
      },

      applyFilterByKey(key){
        this.table.rows.forEach(r => {
          let filter = this.filters[key].isFiltered(r,this.filters[key].value);
          if(!filter) r['filters'].push(key)
          else{
            let filterIndex = r['filters'].indexOf(key);
            if (filterIndex > -1) r['filters'].splice(filterIndex,1);
          }
        });
        shared.setLocal(`casesListFilter${shared.capitalise(key)}`,this.filters[key].value,5);
        this.filters[key].applied = true;
      },
      
      clearFilters(key = false,timeout = 400){
        this.computeAppliedFilters();
        if (Object.keys(this.appliedFilters).length < 1) return;

        this.table.isLoading = true;

        setTimeout(() => {          
          if (key) this.clearFilterByKey(key);
          else this.clearAllFilters();

          this.computeAppliedFilters();
          this.table.isLoading = false;
        }, timeout);
      },

      clearFilterByKey(key){
        this.table.rows.forEach(r => {
            r['filters'] = r['filters'].filter(f => f !== key);
        });
        this.removeFilterFromMemory(key);
      },

      clearAllFilters(){
        this.table.rows.forEach(r => {
          r['filters'] = [];
        });

        Object.keys(this.appliedFilters).forEach(f => {
          this.removeFilterFromMemory(f);
        });
      },

      removeFilterFromMemory(key){
        if(!this.filters[key]) return;

        let filterValue = this.filters[key].value;

        if (key === 'performance') Object.keys(filterValue).forEach(k => filterValue[k] = null);
        else this.filters[key].value = null;

        this.filters[key].applied = false;
        shared.removeLocal(`casesListFilter${shared.capitalise(key)}`);
      },

      getPerformanceEvaluationMethods(){
        let method = shared.evaluationMethods[this.performanceColumnType];
        return Object.keys(method.operators);
      },

      getPerformanceInputType(){
        return shared.evaluationMethods[this.performanceColumnType].inputType;
      },

      isFilteredPerformance(row,filterValue){
        if (this.performanceColumn === "DURATION")
          return shared.operatorEvaluationMethods[filterValue.operator](shared.parseDuration(row.performance),shared.parseDuration(filterValue));
        return shared.operatorEvaluationMethods[filterValue.operator](row.performance.value, filterValue.value);
      },

      computeAppliedFilters(filterByValue = false){
        this.appliedFilters = Object.keys(this.filters)
          .filter(k => {
            let flag = false;
            if (filterByValue){
              const element = this.filters[k].value;
              if (k === 'performance' && this.performanceColumn === 'DURATION') flag = element.value !== null && element.operator !== null && element.unit !== null;
              else if(k == 'performance') flag = element.value !== null && element.operator !== null;
              else flag = element !== null;
            } else{
              flag = this.filters[k].applied === true;
            }
            return flag;
          })
          .reduce((res,k) => (res[k] = JSON.parse(JSON.stringify(this.filters[k].value)),res),{});
      }
    }
  }
</script>