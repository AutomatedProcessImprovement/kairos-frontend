<template>
  <side-bar></side-bar>
  <loading v-if="isLoading" :startPosition="200"></loading>
  <div id="cases">
    <h2>{{ completionString }} Cases Overview</h2>
    <div class="stats">
      <div class="stats-card">
        <div class="column">
          <small> {{ completionString }} cases</small>
          <div class="row">
            <h4> {{ casesData.length }}</h4>
          </div>
        </div>
        <ion-icon name="albums"></ion-icon>
      </div>

      <div v-if="!this.completion" class="stats-card wrap-text">
        <small>Cases with recommendations</small>
        <h3 class="large-number bg-green">{{ casesWithRecommendations }}</h3>
      </div>

      <div v-if="!this.completion" class="stats-card wrap-text">
        <small>Cases without recommendations</small>
        <h3 class="large-number bg-gray">{{ casesData.length - casesWithRecommendations }}</h3>
      </div>
    </div>

    <div class="column" v-show="!showTable">
      <completed-charts-component v-if="completion" :cases="cases" :casesData="casesData"></completed-charts-component>

      <ongoing-charts-component v-if="!completion" :cases="cases" :casesData="casesData"
        :alarmThreshold="alarmThreshold"></ongoing-charts-component>
    </div>

    <div v-if="!showTable" class="cases-table-preview-heading shadow">
      <h3>Cases Overview Table</h3>
      <button v-if="!showTable" @click="toggleShowTable" class="btn-link">Show full <ion-icon
          name="open-outline"></ion-icon></button>
    </div>
    <div class="column">
      <button v-if="showTable" @click="toggleShowTable" class="btn-link"><ion-icon name="chevron-back"></ion-icon> Return
        to overview</button>

      <cases-table-component :completed="completion" :performanceColumns="performanceColumns" :caseAttributes="caseAttributes" :cases="casesDataToShow"
        :isFullView="showTable"></cases-table-component>
    </div>

  </div>
</template>
  
<script>

import casesService from "@/services/cases.service";
import logsService from "@/services/logs.service";
import SideBar from '@/components/SideBar.vue';
import Loading from "@/components/LoadingComponent.vue";
import utils from '@/common/utils';
import CasesTableComponent from "@/components/CasesTableComponent.vue";
import CompletedChartsComponent from "@/components/CompletedChartsComponent.vue";
import OngoingChartsComponent from "@/components/OngoingChartsComponent.vue";

export default {
  name: 'CasesList',

  components: {
    SideBar,
    Loading,
    CasesTableComponent,
    CompletedChartsComponent,
    OngoingChartsComponent
  },

  computed: {
    completionString() {
      return this.completion ? 'Completed' : 'Ongoing';
    },
    casesWithRecommendations() {
      return this.casesData.filter(c => c.recommendations > 0).length;
    },
    casesDataToShow() {
      return this.showTable ? this.casesData : this.casesData.slice(0, 3);
    }
  },

  data() {
    return {
      timer: null,
      logStatus: 'NULL',
      completion: this.$route.params.completion === 'completed',
      showTable: utils.getLocal('casesListShowTable') || false,

      isLoading: false,
      cases: [],
      casesData: [],
      caseAttributes: [],
      costUnits: {},

      performanceColumns: undefined,
      alarmThreshold: undefined,
      columnsDefinition: undefined,
    };
  },

  mounted() {
    if (utils.getLocal('logId')) {
      this.setup();
    }
  },


  beforeUnmount() {
    clearInterval(this.timer);
  },

  methods: {

    setup() {
      this.isLoading = true;
      this.getCases();
      this.getProjectStatus();
    },

    toggleShowTable() {
      this.showTable = !this.showTable;
      utils.setLocal('casesListShowTable', this.showTable, 5);
    },

    getCases() {
      casesService.getCasesByLogAndCompletion(utils.getLocal('logId'), this.completionString.toLowerCase()).then(
        (response) => {
          if (this.cases !== response.data.cases && response.data.cases.length > 0) {
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

    async getParameters() {
      try {
        const response = await logsService.getParameters(utils.getLocal('logId'));
        this.alarmThreshold = response.data.parameters.alarmThreshold || 1.0;
        this.costUnits = response.data.parameters.costUnits || {};
        this.columnsDefinition = response.data.parameters.columnsDefinition;
      } catch (error) {
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
    },

    async formatCases() {
      if (this.casesData.length > 0) {
        this.casesData = [];
      } else {
        if (!this.performanceColumns) {
          await this.getParameters();

          let performanceColumns = {}

          let casePerformance = Array.isArray(this.cases[0].case_performance) ? this.cases[0].case_performance : [[this.cases[0].case_performance]];
          casePerformance.forEach(performanceGroup => {
            performanceGroup.forEach(performanceItem => {
              performanceColumns[performanceItem.column] = this.columnsDefinition[performanceItem.column] || performanceItem.column;
            });
          });
          this.performanceColumns = performanceColumns;
        }
        Object.keys(this.cases[0].case_attributes).forEach(k => {
          if (!this.performanceColumns[k]) {
            this.caseAttributes.push({
              label: k + (this.costUnits[k] ? ' (' + this.costUnits[k] + ')' : ''),
              field: k,
              sortable: true
            });
          }
        })
      }

      let data = {};
      for (const el of this.cases) {
        data = utils.formatCase(el, this.alarmThreshold);
        this.casesData.push(data);
      }

      this.isLoading = false;
    },

    getProjectStatus() {
      logsService.getProjectStatus(utils.getLocal('logId')).then(
        (response) => {
          let status = response.data.status;

          if (status === 'SIMULATING') {
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