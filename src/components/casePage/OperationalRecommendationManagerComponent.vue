<template>
  <div class="column">
    <div class="recommendation" v-for="(r, index) in batchRecommendations" :key="index"
         :class="[{ selected: selectedRec.batchId === batchId && selectedRec.index === index }, r.type.toLowerCase()]">
      <div class="recommendation-content">
        <div class="left-column">
          <div v-if="r.type !== 'NEXT_ACTIVITY'" class="next_activity">
            <div class="text-tooltip-container" v-if="current">
              <h4 v-if="!assigningResource">{{ r.rec }}</h4>
              <tooltip-component v-if="!assigningResource && r.type !== 'NEXT_ACTIVITY'" :iconSize="15" :tooltipSize="300">
                <template v-slot:title>
                  <h3 class="bold">Details - calculation info</h3>
                </template>
                <template v-slot:content>
                  <h4> Model description</h4>
                  <p v-for="m in r.metrics" :key="m"> {{ m.name }}: {{ m.metric }}</p>
                </template>
              </tooltip-component>
            </div>
            <p v-if="!assigningResource">{{ r.recommended }}</p>
            <div class="right-column" v-if="current && !assigningResource">
              <div class="button-container">
                <button type="button" class="blue-button" @click="openAssignModal(index)">Assign to</button>
                <button type="button" class="blue-button" @click="discardRecommendation(index)">Discard</button>
              </div>
            </div>
            <modal-component v-if="openModal === index" :title="modalTitle" @closeModal="closeModal">
              <template v-slot:content>
                <div class="column">
                  <template v-if="!assigningResource && !showResources && resources.length > 0">
                    <p>The system recommends to assign resource {{ recommendedResourceName }} to this action. If followed, the probability of reaching the target goal of the process is high.</p>
                    <div class="row">
                      <button type="submit" class="btn-blue" @click="assignResource(index)">Assign</button>
                      <button class="btn-blue margin-left" @click="showResourceOptions">Cancel</button>
                    </div>
                  </template>
                  <template v-if="assigningResource">
                    <p>Resource assigned to the action.</p>
                    <button class="btn-blue" @click="closeModal">OK</button>
                  </template>
                  <template v-if="!assigningResource && (showResources || resources.length === 0)">
                    <p>Choose a resource to assign</p>
                    <div class="resource-selection">
                      <div v-for="resource in resourcesGeneral" :key="resource.id" class="resource-item">
                        <span>{{ resource.name }}</span>
                        <button type="button" class="btn-blue" @click="assignResourceToAction(resource)">Assign</button>
                      </div>
                    </div>
                    <button class="btn-blue margin-left" @click="closeModal">Cancel</button>
                  </template>
                </div>
              </template>
            </modal-component>
          </div>
        </div>
        <p v-if="!assigningResource" :class="['recommendation-status', 'bold', r.status === 'accepted' ? 'green' : 'warning']">{{ r.status }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import TooltipComponent from '@/components/TooltipComponent.vue';
import utils from '@/common/utils';
import ModalComponent from "@/components/ModalComponent";

export default {
  name: 'OperationalRecommendationManagerComponent',

  components: {
    TooltipComponent,
    ModalComponent
  },

  props: {
    batch: Object,
    current: Boolean,
    selectedRec: Object,
    parameters: Object,
    resources: Array,
    resourcesGeneral: Array
  },

  data() {
    return {
      localBatch: Object.assign({}, this.batch),
      openModal: null,
      discardedRecommendations: [],
      recommendedResourceName: '',
      assigningResource: false,
      showResources: false
    }
  },

  computed: {
    batchRecommendations() {
      return this.formatRecommendations();
    },
    modalTitle() {
      if (this.assigningResource) {
        return "Resource Assigned";
      } else if (this.showResources || this.resources.length === 0) {
        return "Choose a Resource";
      } else {
        return "Assign a Resource to Perform this Action";
      }
    }
  },

  methods: {
    closeModal() {
      this.openModal = null;
      this.assigningResource = false;
      this.showResources = false;
    },

    discardRecommendation(index) {
      const discarded = this.localBatch.prescriptions.splice(index, 1)[0];
      this.discardedRecommendations.push(discarded);
    },

    assignResource() {
      this.assigningResource = true;
      this.showResources = false;
    },

    assignResourceToAction(resource) {
      this.assigningResource = true;
      this.showResources = false;
      this.recommendedResourceName = resource.name;
    },

    openAssignModal(index) {
      if (this.resources.length > 0) {
        this.recommendedResourceName = this.resources[0].name;
      }
      this.openModal = index;
    },

    showResourceOptions() {
      this.showResources = true;
    },

    formatRecommendations() {
      let temp = [];
      if (!this.localBatch.prescriptions) return [];
      for (let i = 0; i < this.localBatch.prescriptions.length; i++) {
        let p = this.localBatch.prescriptions[i];

        let recommendationAttr, recommendedAttr, recommendationMetrics;
        let recommendationStatus = this.current ? null : p.status;
        let recommendationType = p.type;

        if (p.type === 'NEXT_ACTIVITY') {
          continue;
        } else if (p.type === 'ALARM') {
          recommendationAttr = 'Action required';
          if (p.output < this.parameters.alarmThreshold) {
            continue;
          }
          recommendationStatus = '';
          recommendedAttr = 'Probability of not meeting the target is high. It is recommended to check on the application.';
          recommendationMetrics = [
            {name: 'Accuracy', metric: Math.round(p.plugin.accuracy * 100) + '%'},
            {name: 'Recall', metric: Math.round(p.plugin.recall * 100) + '%'},
            {name: 'Precision', metric: Math.round(p.plugin.precision * 100) + '%'}
          ];
        } else if (p.type === 'TREATMENT_EFFECT') {
          recommendationAttr = utils.formatIntervention(p.output, this.parameters.columnsDefinition);
          if (p.output.cate <= 0) {
            continue;
          }
          recommendedAttr = 'There is a high probability of reaching the KPI if you address this recommendation now.';
          recommendationMetrics = [
            {name: 'CATE score', metric: p.output.cate},
            {name: 'Probability if treated', metric: Math.round(p.output.proba_if_treated * 100) + '%'},
            {name: 'Probability if untreated', metric: Math.round(p.output.proba_if_treated * 100) + '%'}
          ];
        }
        let data = {
          rec: recommendationAttr,
          status: recommendationStatus,
          recommended: recommendedAttr,
          metrics: recommendationMetrics,
          type: recommendationType
        }
        temp.push(data);
      }
      return temp;
    },
  },

  watch: {
    batch: {
      handler(newValue) {
        this.localBatch = Object.assign({}, newValue);
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.resource-selection {
  margin-top: 5px;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  padding: 5px;
}
</style>
