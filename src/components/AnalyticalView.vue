<template>
  <div class="analytical-view">
    <div class="recommendations-list shadow">
      <div class="row justify-start">
        <h4>Recommendations</h4>
        <tooltip-component :iconSize="25" icon="information-circle" color="blue" :tooltipSize="600">
          <template v-slot:title>
            <h3 class="bold">How are recommendations calculated?</h3>
          </template>
          <template v-slot:content>
            <p>There are three different algorithms that prescribe recommendations.</p>
            <p class="bold">Next activity</p>
            <p>A next activity is a type of a recommendation that is prescribed by an algorithm that predicts what the
              next best activity in the case is and prescribes it.</p>

            <p class="bold">Alarm</p>
            <p>An alarm is a type of a recommendation that does not specify an exact action to perform in the given
              moment, but rather notifies that the user should pay attention to the case. The exact action is left to be
              decided by the user. It is prescribed by an algorithm that estimates the probability of the case to end in a
              negative outcome. When the specified probability threshold is reached, an alarm is triggered. The threshold
              is specified upon event log upload.</p>

            <p class="bold">Intervention</p>
            <p>An intervention is a type of a recommendation that can be of different kinds, for example, an activity to
              carry out, a resource to use, a parameter to change, etc. It is prescribed by an algorithm that can estimate
              its potential effect on the case outcome. The estimation is expressed as a causal effect, which may be
              positive (performing an intervention increases the probability of the case finishing with a positive
              outcome) or negative (decreases the probability). The intervention is recommended when the algorithm
              estimates the effect of it to be positive. The exact kind of an intervention is specified upon event log
              upload.</p>
          </template>
        </tooltip-component>
      </div>

      <tabs :options="tabOptions.recommendations">
        <tab name="Current" id="tab-current">
          <recommendation-component :batch="lastActivity" :current="true" :selectedRec="selectedRec"
            :parameters="parameters" @recommendationSelected="selectRecommendation"></recommendation-component>
        </tab>
        <tab name="Past" id="tab-past">
          <recommendation-component v-for="activity in oldActivities" v-bind:key="activity" :batch="activity"
            :current="false" :parameters="parameters" :selectedRec="selectedRec"
            @recommendationSelected="selectRecommendation"></recommendation-component>
        </tab>
      </tabs>
    </div>

    <div class="recommendation-details shadow">
      <div class="row content-space-between">
        <h4 bold>Recommendation details</h4>
        <p>Show past recommendations
          <toggle v-model="showPastRecommendations" />
        </p>
      </div>
      <tabs :options="tabOptions.recommendationDetails">
        <tab name="Process model" id="tab-diagram">
          <legend-component></legend-component>
          <vue-cytoscape :parameters="parameters" :currentCase="currentCase" :selectedRec="selectedRec"
            :showPastRecommendations="showPastRecommendations" @loading="handleLoading"></vue-cytoscape>
        </tab>

        <tab name="Calculation details" id="tab-details" class="tab-details">
          <div v-if="selectedRecObject" class="details">

            <h4> Model description</h4>
            <div v-if="selectedRecObject.type === 'TREATMENT_EFFECT'">
              <p>Causal effect: {{ selectedRecObject.output.cate_category }} ({{ selectedRecObject.output.cate }})</p>
              <p>Probability if treated: {{ Math.round(selectedRecObject.output.proba_if_treated * 100) }} %</p>
              <p>Probability if untreated: {{ Math.round(selectedRecObject.output.proba_if_untreated * 100) }} %</p>

            </div>
            <div v-else>
              <p>Accuracy: {{ Math.round(selectedRecObject.plugin.accuracy * 100) }} %</p>
              <p>Recall: {{ Math.round(selectedRecObject.plugin.recall * 100) }} %</p>
              <p>Precision: {{ Math.round(selectedRecObject.plugin.precision * 100) }} %</p>
            </div>

          </div>
          <h4 v-else>Please select a recommendation.</h4>

        </tab>
      </tabs>
    </div>

  </div>
</template>
  
<script>
import VueCytoscape from './VueCytoscape.vue';
import LegendComponent from './LegendComponent.vue';
import TooltipComponent from './TooltipComponent.vue';
import RecommendationComponent from './RecommendationComponent.vue';
import Toggle from '@vueform/toggle'

export default {
  name: 'CasePage',
  components: {
    VueCytoscape,
    LegendComponent,
    TooltipComponent,
    RecommendationComponent,
    Toggle
  },

  props: {
    currentCase: Object,
    parameters: Object
  },

  data() {
    return {
      selectedRec: {},
      selectedRecObject: null,
      tabOptions: {
        recommendations: { defaultTabHash: 'tab-current', useUrlFragment: false },
        recommendationDetails: { defaultTabHash: 'tab-diagram', useUrlFragment: false }
      },
      showPastRecommendations: true,
    }
  },
  computed: {

    oldActivities() {
      return this.currentCase.activities.slice(0, -1);
    },

    lastActivity() {
      return this.currentCase.activities.slice(-1)[0];
    }
  },

  methods: {

    handleError: function (err) {
      console.error('failed to show diagram', err);
    },
    handleShown: function () {
      console.log('diagram shown');
    },
    handleLoading: function () {
      console.log('diagram loading');
    },

    selectRecommendation(selectedRec) {
      this.selectedRec = selectedRec;
      this.selectedRecObject = this.currentCase.activities.filter(a => a.event_id === this.selectedRec.batchId)[0].prescriptions[this.selectedRec.index];
    }

  },

};
</script>