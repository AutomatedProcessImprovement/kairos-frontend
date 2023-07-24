<template>
  <div id="cases-table-component">
    <div class="cases-filter column">
      <div @click="filterActive = !filterActive" class="filter-toggle shadow">Filters <ion-icon :class="{active : filterActive}" name="chevron-up"></ion-icon></div>
      
      <div class="filters column shadow" :class="{active : filterActive}">
        <div class="row">
  
          <div class="filter-component">
            <h4 class="blue">Recommendations</h4>
            <select v-model="filters.recommendations" @change="filterCases('recommendations')">
              <option :value=true>Available</option>
              <option :value=false>Unavailable</option>
            </select>
          </div>
          <div class="filter-component">
            <h4 class="blue">Intervened</h4>
            <select v-model="filters.intervened" @change="filterCases('intervened')">
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        </div>

        <div class="row">
          <button @click="clearFilters()" class="btn-blue">clear filters</button>
        </div>
      </div>
      
    </div>

    <div class="applied-filters row">
      <div class="applied-filter shadow" v-for="key in appliedFilters" :key="key">
        {{ key }}: {{ this.filters[key] }} <ion-icon @click="clearFilters(key)" name="close"></ion-icon>
      </div>
    </div>

    <div class="cases-table">
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
    },
    
    watch: {
      cases(){
        this.setup();
      },

      performanceColumn(){
        this.setup();
      }
    },

    computed: {
      headers(){
        if(this.completed === true) return this.table.headers.concat([this.table.outcomeHeader]).concat(this.caseAttributes);
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

      appliedFilters(){
        return Object.keys(this.filters).filter(key => this.filters[key] !== null);
      }
    },

    data() {
      return {
        timer: null,
        logStatus: 'NULL',

        filterActive: false,
        filterButtonPressed: false,
        filters: {
          recommendations: shared.getLocal('casesListFilterRecommendations'),
          intervened: shared.getLocal('casesListFilterIntervened'),
        },

        table: {
          pageSize: shared.getLocal('casesListLimit') || 10,
          offset: shared.getLocal('casesListOffset') || 0,
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
              sortable: true,
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
        if(this.appliedFilters.length > 0) {
          this.table.isLoading = true;
          this.table.rows = this.sortCases(this.cases);
          this.filterCases(false,0);
          this.table.isLoading = false;
        }
        else {
          if (this.table.offset >= this.table.pageSize * this.pageNumber) this.table.offset = 0;
          this.doSearch(this.table.offset, this.table.pageSize, this.table.sortable.order, this.table.sortable.sort, true, true, this.cases);        
        }
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

      filterCases(key = false,timeout = 400){
        if (this.appliedFilters.length < 1) return;
        this.table.isLoading = true;

        setTimeout(() => {
          if(!key){
            this.appliedFilters.forEach(f => {
              this.table.rows.forEach(r => {
                if(!r['filters']) r['filters'] = []
                if(r[f] !== this.filters[f]) r['filters'].push(f)
              });
              shared.setLocal(`casesListFilter${shared.capitalise(f)}`,this.filters[f],5)
            })
          } else{
            this.table.rows.forEach(r => {
              if(!r['filters']) r['filters'] = [];
              if(r[key] !== this.filters[key]) r['filters'].push(key);
              else{
                let filterIndex = r['filters'].indexOf(key);
                if (filterIndex > -1) r['filters'].splice(filterIndex,1);
              }
            });
            shared.setLocal(`casesListFilter${shared.capitalise(key)}`,this.filters[key],5)
          }        
          this.table.isLoading = false;
        }, timeout);
      },
      
      clearFilters(key = false,timeout = 400){
        if (this.appliedFilters.length < 1) return;
        this.table.isLoading = true;
        setTimeout(() => {          
          if (key){
            this.table.rows.forEach(r => {
                r['filters'] = r['filters'].filter(f => f !== key);
            });
            this.filters[key] = null;
            shared.removeLocal(`casesListFilter${shared.capitalise(key)}`)
          } else{
            this.table.rows.forEach(r => {
              r['filters'] = [];
            });
            this.appliedFilters.forEach(f => {
              this.filters[f] = null;
              shared.removeLocal(`casesListFilter${shared.capitalise(f)}`)
            })
          }
          this.table.isLoading = false;
        }, timeout);
      },

    }
  
  }
  </script>