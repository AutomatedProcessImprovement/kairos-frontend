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
            <h4>{{ formattedData.length }}</h4>
          </div>
        </div>
        <ion-icon name="albums"></ion-icon>
      </div>
      <template v-if="selectedView === 'tactical'">
        <div v-if="parameters.kpi">
          <div v-for="(positiveOutcomeGroup, index1) in parameters.kpi" :key="index1" class="row align-center">
            <small class="outcome-grouping" v-if="index1 > 0">or</small>
            <div v-for="(positiveOutcomeItem, index2) in positiveOutcomeGroup" :key="index2" class="row align-center">
              <small class="outcome-grouping" v-if="index2 > 0">and</small>
              <PositiveOutcomeItemComponent v-if="positiveOutcomeItem" :object="positiveOutcomeItem"/>
            </div>
          </div>
        </div>
      </template>
      <button :disabled="formattedData.length < 1" class="btn-blue" @click="exportData()">Export recommendations as
        CSV
      </button>
    </div>
    <template v-if="selectedView === 'tactical'">
      <div class="recommendations-table">
        <table-lite :is-hide-paging="true" :is-slot-mode="true" :columns="tableManager.headers"
                    :rows="tableManager.rows"
                    :total="tableManager.rows.length" :sortable="tableManager.sortable" @row-clicked="rowClicked">
          <template v-slot:id="data">
            <p>{{ formatId(data.value.id) }}</p>
          </template>
          <template v-slot:performance="data">
            <p>{{ data.value.performance.value }} {{ data.value.performance.unit }}</p>
          </template>
          <template v-slot:details="data">
            <p>{{ data.value.details }}</p>
          </template>
          <template v-slot:showDetails="data">
            <button @click="rowClicked(data.value.id)" class="show-details">Show details</button>
          </template>
        </table-lite>
      </div>
    </template>
    <template v-else>
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
    </template>
  </div>
</template>

<script>
import logsService from "@/services/logs.service";
import SideBar from '@/components/SideBarComponent.vue';
import Loading from "@/components/LoadingComponent.vue";
import TableLite from "vue3-table-lite";
import utils from '@/common/utils';
import PositiveOutcomeItemComponent from "@/components/PositiveOutcomeItemComponent";

export default {
  name: 'CasesList',
  components: {
    SideBar,
    Loading,
    TableLite,
    PositiveOutcomeItemComponent
  },
  data() {
    return {
      timer: null,
      isLoading: false,
      recommendations: [],
      formattedData: [],
      performanceColumn: undefined,
      parameters: null,
      selectedView: null,
      tableManager: {
        isLoading: false,
        headers: [
          {
            label: 'Case ID',
            field: 'id',
            width: "5%",
            sortable: true,
          },
          {
            label: "Duration",
            field: "duration",
            width: "10%",
            sortable: false,
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
          {
            label: "",
            field: "showDetails",
            width: "5%",
            sortable: false,
          }
        ],
        rows: [],
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
  watch: {
    selectedView() {
      this.setup();
    }
  },
  mounted() {
    window.addEventListener('view-changed', this.changeView);
    this.selectedView = utils.getLocal('view');
    this.setup();
  },
  beforeUnmount() {
    window.removeEventListener('view-changed', this.changeView);
    clearInterval(this.timer);
  },
  methods: {
    setup() {
      this.isLoading = true;
      if (this.selectedView === 'tactical') {
        this.getParametersManager();
      } else {
        this.getParameters();
      }
    },
    formatId(id) {
      if (!id) return null;
      return id.slice(id.indexOf('-') + 1);
    },
    rowClicked(row) {
      this.$router.push({name: 'case', params: {'caseId': row.id, 'completion': 'ongoing'}});
    },
    doSort(offset, limit, order, sort) {
      const sortOrder = sort === 'asc' ? 1 : -1;
      if (order === "performance" && this.performanceColumn === "DURATION") {
        this.table.rows = this.table.rows.sort((a, b) =>
            (utils.parseDuration(a[order]) > utils.parseDuration(b[order])) ? (1 * sortOrder) : (-1 * sortOrder));
      } else if (order === "performance") {
        this.table.rows = this.table.rows.sort((a, b) =>
            (a[order].value > b[order].value) ? (1 * sortOrder) : (-1 * sortOrder));
      } else {
        this.table.rows = this.table.rows.sort((a, b) => (a[order] > b[order]) ? (1 * sortOrder) : (-1 * sortOrder));
      }
      utils.setLocal('recommendationsOrder', order, 30);
      utils.setLocal('recommendationsSort', sort, 30);
      this.table.sortable.order = order;
      this.table.sortable.sort = sort;
    },
    async exportData() {
      if (!this.recommendations.length) {
        this.isLoading = true;
        try {
          const response = await logsService.getRecommendations(utils.getLocal('logId'));
          this.recommendations = response.data.prescriptions;
          if (this.recommendations.length > 0) {
            if (this.selectedView === 'tactical') {
              this.formatRecommendationsManager();
            } else {
              this.formatRecommendations();
            }
          }
          this.isLoading = false;
        } catch (error) {
          this.isLoading = false;
          const resMessage = (error.response && error.response.data && error.response.data.error) || error.message || error.toString();
          this.$notify({
            title: 'An error occurred',
            text: resMessage,
            type: 'error'
          });
          return;
        }
      }

      let csv = this.table.headers.map(h => h.label).join(',');
      this.table.rows.forEach((row) => {
        let rowData = Object.values(row).map(data => {
          if (data.value) {
            return [data.value, data.unit].filter(Boolean).join(' ')
          } else {
            return data
          }
        });
        csv += "\n";
        csv += rowData.join(',');
      });

      const anchor = document.createElement('a');
      anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      anchor.target = '_blank';
      anchor.download = 'recommendations.csv';
      anchor.click();
    },
    async getRecommendations() {
      try {
        const response = await logsService.getRecommendations(utils.getLocal('logId'));
        this.recommendations = response.data.prescriptions;
        if (this.recommendations.length > 0) {
          if (this.selectedView === 'tactical') {
            this.formatRecommendationsManager();
          } else {
            this.formatRecommendations();
          }
        }
        this.isLoading = false;
      } catch (error) {
        this.isLoading = false;
        const resMessage = (error.response && error.response.data && error.response.data.error) || error.message || error.toString();
        this.$notify({
          title: 'An error occurred',
          text: resMessage,
          type: 'error'
        });
      }
    },
    getParameters() {
      logsService.getParameters(utils.getLocal('logId')).then(
          (response) => {
            this.parameters = response.data.parameters;
            this.getRecommendations();
          },
          (error) => {
            this.isLoading = false;
            const resMessage = (error.response && error.response.data && error.response.data.error) || error.message || error.toString();
            this.$notify({
              title: 'An error occurred',
              text: resMessage,
              type: 'error'
            });
          }
      );
    },
    getParametersManager() {
      logsService.getParameters(utils.getLocal('logId')).then(
          (response) => {
            this.parameters = response.data.parameters;
            if (!this.parameters.costUnits) this.parameters.costUnits = {};
            if (!Array.isArray(this.parameters.kpi)) this.parameters.kpi = [[this.parameters.kpi]];
            this.getRecommendations();
          },
          (error) => {
            this.isLoading = false;
            const resMessage = (error.response &&
                    error.response.data &&
                    error.response.data.error) ||
                error.message ||
                error.toString();
            this.$notify({
              title: 'An error occurred',
              text: resMessage,
              type: 'error'
            });
          }
      );
    },
    formatRecommendationsManager() {
      this.formattedData = [];
      for (const el of this.recommendations) {
        var caseId = el._id;
        var casePerformance = el.case_performance[0][0];
        for (const batch of el.activities) {
          for (const rec of batch.prescriptions) {
            let formattedRec = this.formatRecommendationManager(caseId, casePerformance, rec);
            if (formattedRec !== null) {
              this.formattedData.push(formattedRec);
            }
          }
        }
      }
      this.tableManager.rows = this.formattedData;
      if (this.tableManager.sortable && this.tableManager.sortable.order && this.tableManager.sortable.sort) {
        this.doSort(null, null, this.tableManager.sortable.order, this.tableManager.sortable.sort);
      }
    },
    formatRecommendationManager(id, performance, p) {
      let recommendationAttr, recommendedAttr;

      if (p.type === 'NEXT_ACTIVITY') {
        return null;
      }

      if (p.type === 'ALARM') {
        recommendationAttr = 'Check the application';
        if (p.output < this.parameters.alarmThreshold) return null;
        recommendedAttr = 'Probability of not meeting the KPI is high. It is recommended to check on the application.';
      } else if (p.type === 'TREATMENT_EFFECT') {
        recommendationAttr = utils.formatIntervention(p.output, this.parameters.columnsDefinition);
        if (p.output.cate <= 0) return null;

        recommendedAttr = 'There is a high probability of reaching the KPI if you address this recommendation now.';
      } else if (p.type === 'RESOURCE_ALLOCATION') {
        recommendationAttr = utils.formatIntervention(p.output, this.parameters.columnsDefinition);
        if (p.output.cate <= 0) return null;

        recommendedAttr = 'Resource allocation';
      }

      let data = {
        id: id,
        duration: performance.value + " " + performance.unit,
        recommendationAttribute: recommendationAttr,
        details: recommendedAttr,
      };

      return data;
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
      } else if (p.type === 'ALARM') {
        recommendationAttr = 'Action required';
        if (p.output < this.parameters.alarmThreshold) return null;
        recommendedAttr = 'Predicted probability of not meeting the target is high.';
      } else if (p.type === 'TREATMENT_EFFECT') {
        recommendationAttr = utils.formatIntervention(p.output, this.parameters.columnsDefinition);
        if (p.output.cate <= 0) return null;
        recommendedAttr = 'Predicted effect is positive.';
      }

      let data = {
        id: id,
        performance: {value: performance.value, unit: performance.unit},
        recommendationAttribute: recommendationAttr,
        details: recommendedAttr,
      };
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
    changeView(event) {
      this.selectedView = event.detail.storage;
      this.setup();
    }
  }
};
</script>
