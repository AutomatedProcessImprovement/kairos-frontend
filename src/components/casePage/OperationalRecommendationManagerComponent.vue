<template>
  <div class="column">
    <div class="recommendation" v-for="(r, index) in batchRecommendations" :key="index"
         :class="[{ selected: selectedRec.batchId === batchId && selectedRec.index === index }, r.type.toLowerCase()]">
      <div class="recommendation-content">
        <div class="left-column">
          <div v-if="r.type !== 'NEXT_ACTIVITY'" class="next_activity">
            <div class="text-tooltip-container" v-if="current">
              <h4>{{ r.rec }}</h4>
              <tooltip-component v-if="r.type !== 'NEXT_ACTIVITY'" :iconSize="15" :tooltipSize="300">
                <template v-slot:title>
                  <h3 class="bold">Details - calculation info</h3>
                </template>
                <template v-slot:content>
                  <h4> Model description</h4>
                  <p v-for="m in r.metrics" :key="m"> {{ m.name }}: {{ m.metric }}</p>
                </template>
              </tooltip-component>
            </div>
            <p>{{ r.recommended }}</p>
            <div class="right-column" v-if="current">
              <div class="button-container">
                <button type="button" class="blue-button" @click="openModal = true">Assign to</button>
                <button type="button" class="blue-button" @click="discardRecommendation(index)">Discard</button>
              </div>
            </div>
            <modal-component v-if="openModal" title="Assign a resource to perform this action?" @closeModal="closeModal">
              <template v-slot:content>
                <div class="column">
                  <p>The system recommends to assign this resource to this action. If followed, the probability of reaching the target goal of the process is high.</p>
                  <div class="row">
                    <button type="submit" class="btn-blue" @click="openModal = false">Assign</button>
                    <button class="btn-blue margin-left" @click="openModal = false">Cancel</button>
                  </div>
                </div>
              </template>
            </modal-component>
          </div>
        </div>
        <p :class="['recommendation-status', 'bold', r.status === 'accepted' ? 'green' : 'warning']">{{ r.status }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import TooltipComponent from '@/components/TooltipComponent.vue';
import utils from '@/common/utils';
import ModalComponent from "@/components/ModalComponent";

export default {
  name: 'RecommendationManagerComponent',

  components: {
    TooltipComponent,
    ModalComponent
  },

  props: {
    batch: Object,
    current: Boolean,
    selectedRec: Object,
    parameters: Object,
  },

  data() {
    return {
      localBatch: Object.assign({}, this.batch),
      openModal: false,
      discardedRecommendations: []
    }
  },

  computed: {
    batchRecommendations() {
      return this.formatRecommendations();
    }
  },

  methods: {
    closeModal() {
      this.openModal = false;
    },

    discardRecommendation(index) {
      const discarded = this.localBatch.prescriptions.splice(index, 1)[0];
      this.discardedRecommendations.push(discarded);
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
          recommendationAttr = 'Perform ' + p.output;
          recommendedAttr = 'It is likely that the application will comply with the target if you perform this recommendation now.';
          recommendationMetrics = [
            {name: 'Accuracy', metric: Math.round(p.plugin.accuracy * 100) + '%'},
            {name: 'Recall', metric: Math.round(p.plugin.recall * 100) + '%'},
            {name: 'Precision', metric: Math.round(p.plugin.precision * 100) + '%'}
          ]
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
          ]
        } else if (p.type === 'TREATMENT_EFFECT') {
          recommendationAttr = utils.formatIntervention(p.output, this.parameters.columnsDefinition);
          if (p.output.cate <= 0) {
            continue;
          }
          recommendedAttr = 'The causal effect of performing the intervention is positive.';
          recommendationMetrics = [
            {name: 'CATE score', metric: p.output.cate},
            {name: 'Probability if treated', metric: Math.round(p.output.proba_if_treated * 100) + '%'},
            {name: 'Probability if untreated', metric: Math.round(p.output.proba_if_treated * 100) + '%'}
          ]
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

