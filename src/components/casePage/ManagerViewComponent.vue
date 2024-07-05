<template>
  <div class="operational-view">
    <div class="case-status shadow">
      <div v-if="parameters.columnsDefinitionReverse" class="column">
        <h4>Case status</h4>
        <p>{{ lastActivity[parameters.columnsDefinitionReverse['ACTIVITY']] }} complete</p>
        <small>{{ lastActivity[parameters.columnsDefinitionReverse['START_TIMESTAMP']] }}</small>
      </div>
      <flow-diagram-component :currentCase="currentCase" :parameters="parameters"></flow-diagram-component>
    </div>
    <div class="row">
      <div class="resource-details shadow">
        <h4>Resources</h4>
        <p>Recommended resource</p>
        <ResourcesTable :resources="resources" />
        <p>All resources</p>
        <ResourcesTable :resources="resourcesGeneral" />
      </div>
      <div class="recommendations-list shadow">
        <div class="row align-center">
          <h4>Recommendations</h4>
          <tooltip-component :iconSize="25" icon="information-circle" color="blue" :tooltipSize="600">
            <template v-slot:title>
              <h3 class="bold">Recommendation info</h3>
            </template>
            <template v-slot:content>
              <p>How are recommendations calculated?</p>
              <p>There are three different algorithms that prescribe recommendations.</p>
              <p class="bold">Intervention</p>
              <p>An algorithm estimates the causal effect of performing the intervention at a given point in time. It is shown as ”recommended” when an estimated effect is positive (above 0).</p>
              <p class="bold">Alarm</p>
              <p>Probability of not meeting the KPI is high. It is recommended to check on the application.</p>
              <p class="bold">Next activity</p>
              <p>There is a high probability of reaching the KPI if you address this recommendation now.</p>
            </template>
          </tooltip-component>
        </div>
        <tabs :options="tabOptions.recommendations">
          <tab name="Current" id="tab-current">
            <operational-recommendation-manager-component :batch="lastActivity" :current="true" :selectedRec="selectedRec" :parameters="parameters" @recommendationSelected="selectRecommendation"></operational-recommendation-manager-component>
          </tab>
          <tab name="Past" id="tab-past">
            <operational-recommendation-manager-component v-for="activity in oldActivities" v-bind:key="activity" :batch="activity" :current="false" :parameters="parameters" :selectedRec="selectedRec" @recommendationSelected="selectRecommendation"></operational-recommendation-manager-component>
          </tab>
        </tabs>
      </div>
    </div>

  </div>
</template>

<script>
import TooltipComponent from '@/components/TooltipComponent.vue';
import OperationalRecommendationManagerComponent from './OperationalRecommendationManagerComponent.vue';
import FlowDiagramComponent from './FlowDiagramComponent.vue';
import utils from '@/common/utils';
import ResourcesTable from '@/components/ResourcesTableComponent'
import resourceService from '@/services/resources.service';

export default {
  name: 'ManagerView',
  components: {
    TooltipComponent,
    OperationalRecommendationManagerComponent,
    FlowDiagramComponent,
    ResourcesTable
  },
  props: {
    currentCase: Object,
    parameters: Object
  },
  data() {
    return {
      selectedRec: {},
      selectedRecObject: null,
      resources: [],
      resourcesGeneral: [],
      tabOptions: {
        recommendations: { defaultTabHash: 'tab-current', useUrlFragment: false },
        recommendationDetails: { defaultTabHash: 'tab-diagram', useUrlFragment: false }
      },
    }
  },
  computed: {
    oldActivities() {
      return this.currentCase.activities.slice(0, -1);
    },
    lastActivity() {
      return this.currentCase.activities.slice(-1)[0];
    },
    caseKpi() {
      return Array.isArray(this.currentCase.case_performance) ? this.currentCase.case_performance : [[this.currentCase.case_performance]];
    },
    caseOutcome() {
      return utils.calculateCaseOutcome(this.caseKpi);
    }
  },
  methods: {
    async setup() {
      this.isLoading = true;
      try {
        this.resources = await resourceService.fetchResourceDataByCaseId(this.currentCase._id);
        this.resourcesGeneral = await resourceService.fetchResourceData();
      } catch (error) {
        this.$notify({
          title: 'An error occurred',
          text: error.response?.data?.error || error.message || 'Unknown error',
          type: 'error'
        });
      } finally {
        this.isLoading = false;
      }
    },
    selectRecommendation(selectedRec) {
      if (!selectedRec.index) {
        this.selectedRec = {};
        this.selectedRecObject = null;
        return;
      }
      this.selectedRec = selectedRec;
      this.selectedRecObject = this.currentCase.activities.filter(a => a.event_id === this.selectedRec.batchId)[0].prescriptions[this.selectedRec.index];
    }
  },
  mounted() {
    this.setup();
    console.log("currentCase", this.currentCase);
    console.log("parameters", this.parameters);
  }
};
</script>