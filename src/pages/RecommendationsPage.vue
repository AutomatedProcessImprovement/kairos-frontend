<template>
  <side-bar></side-bar>
  <loading v-if="isLoading" :startPosition="200"></loading>
  <div id="recommendations">
    <h2>Recommendations</h2>
    <div class="stats">
      <div class="stats-card">
        <div class="column">
          <small>Total current recommendations</small>
          <div class="row">
            <h4> {{ formattedData.length }}</h4>
          </div>
        </div>
        <ion-icon name="albums"></ion-icon>
      </div>
      <button :disabled="table.rows.length < 1" class="btn-blue" @click="exportData()">Export recommendations as
        CSV</button>
    </div>

    <div class="recommendations-table">
      <table-lite :is-hide-paging="true" :is-slot-mode="true" :columns="table.headers" :rows="table.rows"
        :total="table.rows.length" :sortable="table.sortable" @do-search="doSort" @row-clicked="rowClicked">

        <template v-slot:id="data">
          <p>{{ formatId(data.value.id) }}</p>
        </template>

        <template v-slot:performance="data">
          <p>{{ data.value.performance.value }} {{ data.value.performance.unit }}</p>
        </template>

      </table-lite>

    </div>
  </div>
</template>
    
<script>

import logsService from "@/services/logs.service";
import SideBar from '@/components/SideBarComponent.vue';
import Loading from "@/components/LoadingComponent.vue";
import TableLite from "vue3-table-lite";
import utils from '@/common/utils'

export default {
  name: 'CasesList',

  components: {
    SideBar,
    Loading,
    TableLite,
  },

  data() {
    return {
      timer: null,
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
            width: "10%",
            sortable: true,
          },
          {
            label: "Performance",
            field: "performance",
            width: "10%",
            sortable: true,
          },
          {
            label: "Recommendation",
            field: "recommendationAttribute",
            width: "10%",
            sortable: false,
          },
          {
            label: "Details",
            field: "details",
            width: "20%",
            sortable: false,
          },
        ],
        rows: [],
        sortable: {
          order: utils.getLocal('recommendationsOrder'),
          sort: utils.getLocal('recommendationsSort')
        },
      },
    };
  },

  mounted() {
    if (utils.getLocal('logId')) {
      this.getParameters();
      this.getProjectStatus();
    }
  },

  beforeUnmount() {
    clearInterval(this.timer);
  },

  methods: {

    formatId(id) {
      if (!id) return null;
      return id.slice(id.indexOf('-') + 1);
    },

    rowClicked(row) {
      this.$router.push({ name: 'case', params: { 'caseId': row.id } })
    },

    doSort(offset, limit, order, sort) {
      const sortOrder = sort === 'asc' ? 1 : -1;
      if (order === "performance" && this.performanceColumn === "DURATION") {
        this.table.rows = this.table.rows.sort((a, b) =>
          (utils.parseDuration(a[order]) > utils.parseDuration(b[order])) ? (1 * sortOrder) : (-1 * sortOrder));
      } else if (order === "performance") {
        this.table.rows = this.table.rows.sort((a, b) =>
          (a[order].value > b[order].value) ? (1 * sortOrder) : (-1 * sortOrder));
      }
      else {
        this.table.rows = this.table.rows.sort((a, b) => (a[order] > b[order]) ? (1 * sortOrder) : (-1 * sortOrder));
      }
      utils.setLocal('recommendationsOrder', order, 30);
      utils.setLocal('recommendationsSort', sort, 30);

      this.table.sortable.order = order;
      this.table.sortable.sort = sort;
    },

    exportData() {
      let csv = this.table.headers.map(h => h.label);
      this.table.rows.forEach((row) => {
        row = Object.values(row);
        row = row.map(data => {
          if (data.value) {
            return [data.value, data.unit].filter(Boolean).join(' ')
          } else {
            return data
          }
        })
        csv += "\n";
        csv += row.join(',');
      });

      const anchor = document.createElement('a');
      anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      anchor.target = '_blank';
      anchor.download = 'recommendations.csv';
      anchor.click();
    },

    getRecommendations() {
      logsService.getRecommendations(utils.getLocal('logId')).then(
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
    getParameters() {
      this.isLoading = true;
      logsService.getParameters(utils.getLocal('logId')).then(
        (response) => {
          this.parameters = response.data.parameters;
          this.getRecommendations();
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

    formatRecommendations() {
      this.formattedData = [];
      for (const el of this.recommendations) {
        if (!this.performanceColumn && el.case_performance.column !== null) this.performanceColumn = el.case_performance.column;
        var caseId = el._id;
        var casePerformance = el.case_performance;
        for (const batch of el.activities) {
          for (const rec of batch.prescriptions) {
            let data = this.formatRecommendation(caseId, casePerformance, rec);
            if (data !== null) this.formattedData.push(data);
          }
        }
      }
      this.table.headers[1].label = this.performanceColumn;
      this.table.rows = this.formattedData;
      this.doSort(null, null, this.table.sortable.order, this.table.sortable.sort);
    },

    formatRecommendation(id, performance, p) {
      let recommendationAttr, recommendedAttr;
      if (p.type === 'NEXT_ACTIVITY') {
        recommendationAttr = 'Perform ' + p.output;
        recommendedAttr = 'Recommended now';
      }
      else if (p.type === 'ALARM') {
        recommendationAttr = 'Action required';
        if (p.output < this.parameters.alarmThreshold) return null;
        recommendedAttr = 'Predicted probability of not meeting the target is high.';
      }
      else if (p.type === 'TREATMENT_EFFECT') {
        recommendationAttr = utils.formatIntervention(p.output, this.parameters.columnsDefinition);
        if (p.output.cate <= 0) return null;

        recommendedAttr = 'Predicted effect is positive.';
      }
      let data = {
        id: id,
        performance: { value: performance.value, unit: performance.unit },
        recommendationAttribute: recommendationAttr,
        details: recommendedAttr,
      }
      return data;
    },

    getProjectStatus() {
      logsService.getProjectStatus(utils.getLocal('logId')).then(
        (response) => {
          let status = response.data.status;

          if (status === 'SIMULATING') {
            this.timer = setInterval(() => {
              this.getRecommendations();
            }, 4000);
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