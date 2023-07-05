<template>
  <div id="cases-table-component">
    <div class="cases-filter column">
      <div @click="filterActive = !filterActive" class="filter-toggle shadow">Filters <ion-icon :class="{active : filterActive}" name="chevron-up"></ion-icon></div>
      
      <div class="filters column shadow" :class="{active : filterActive}">
        <div class="row">
  
          <div class="filter-component">
            <h4 class="blue">Recommendations</h4>
            <select v-model="filters.recommendations">
              <option :value=true>Available</option>
              <option :value=false>Unavailable</option>
            </select>
          </div>
          <div class="filter-component">
            <h4 class="blue">Intervened</h4>
            <select v-model="filters.intervened">
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        </div>

        <div class="row">
          <button @click="filterCases" class="btn-blue">filter</button>
          <button @click="clearFilters()" class="btn-blue">clear filters</button>
        </div>
      </div>
      
    </div>

    <div v-if="filterButtonPressed" class="applied-filters row">
      <div class="applied-filter shadow" v-for="key in appliedFilters" :key="key">
        {{ key }} <ion-icon @click="clearFilters(key)" name="close"></ion-icon>
      </div>
    </div>

    <div class="cases-table">
      <table-lite
      :is-loading="table.isLoading"
      :page-size="table.pageSize"
      :is-slot-mode="true"
      :columns="headers"
      :rows="table.rows"
      :rowClasses="getRowClasses"
      :total="table.totalRecordCount"
      :sortable="table.sortable"
      @do-search="doSearch"
      @row-clicked="rowClicked"
      @is-finished="table.isLoading = false"
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

  import TableLite from "vue3-table-lite";
  import shared from '@/services/shared';

  export default {
    name: 'CasesList',
  
    components: {
          TableLite,
        },

    computed: {
      appliedFilters(){
        return Object.keys(this.filters).filter(key => this.filters[key] !== null);
      },
      headers(){
        return this.table.headers.concat(this.caseAttributes);
      }
    },

    props:{
      completed: Boolean,
      caseAttributes: Array,
      cases: Array,
      performanceColumn: String,
    },

    mounted(){
      if(this.completed){
        this.table.headers.push(this.table.outcomeHeader);
      }
      let isLoading = this.cases ? true : false;
      this.doSearch(0,this.table.pageSize,this.table.sortable.order,this.table.sortable.sort,true,isLoading);
    },

    watch: {
      cases(value){
        this.table.rows = this.doSearchAndSort(value);
      }
    },

    data() {
      return {
        timer: null,
        logStatus: 'NULL',

        filterActive: false,
        filterButtonPressed: false,
        filters: {
          recommendations: null,
          intervened: null,
        },

        table: {
          pageSize: 10,
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

      doSearch(offset,limit,order,sort,doSort=false,isLoading=true){
        if (order === null || sort === null) return;

        this.table.isLoading = isLoading;
        setTimeout(() => {
          let tempRows;
          
          doSort = order !== this.table.sortable.order || sort !== this.table.sortable.sort || doSort;
          
          this.table.sortable.order = order;
          this.table.sortable.sort = sort;

          tempRows = doSort ? this.sortCases(this.cases) : this.cases;

          this.table.rows = tempRows.slice(offset,offset+limit);
          this.table.totalRecordCount = tempRows.length;
          tempRows = null;

          shared.setLocal('casesListOrder',order,5);
          shared.setLocal('casesListSort',sort,5);
          shared.setLocal('casesListOffset',offset,5);
          shared.setLocal('casesListLimit',limit,5);
          
        }, 400);
      },

      sortCases(rows){
        let sort = this.table.sortable.sort;
        let order = this.table.sortable.order;
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

      doSearchAndSort(rows){
        let offset = shared.getLocal('casesListOffset');
        let limit = shared.getLocal('casesListLimit');
        rows = this.sortCases(rows);
        rows = rows.slice(offset,offset+limit);
        return rows;
      },

      filterCases(){
        if (this.appliedFilters.length < 1) return;
        this.table.isLoading = true;
        
        this.filterButtonPressed = true;
        shared.setLocal("appliedFilters", this.filters);
        
        let tempRows = this.cases;
        
        if(this.filters.recommendations !== null){
          tempRows = tempRows.filter(r => r.recommendations === this.filters.recommendations);
        }
        if(this.filters.intervened !== null){
          tempRows = tempRows.filter(r => r.intervened === this.filters.intervened);
        }
        this.table.rows = this.doSearchAndSort(tempRows);
        this.table.totalRecordCount = this.table.rows.length;
        tempRows = null;
        this.table.isLoading = false;
      },
      
      clearFilters(key = false){
        if (this.appliedFilters.length < 1) return;
        console.log(key);
        this.table.isLoading = true;
        let tempRows = this.cases;
        if (key){
          tempRows = tempRows.filter(r => r[key] !== this.filters[key])
          this.filters[key] = null;
          tempRows = tempRows.concat(this.table.rows);
        } else{
          this.filters.intervened = null;
          this.filters.recommendations = null;
        }
        this.filterButtonPressed = this.appliedFilters.length > 0 ? true : false;
        console.log(this.filters);
        this.table.rows = this.doSearchAndSort(tempRows);
        this.table.totalRecordCount = this.table.rows.length;
        tempRows = null;
        this.table.isLoading = false;
      }

    }
  
  }
  </script>