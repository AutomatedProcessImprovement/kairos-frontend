<template>    
  <div class="analytical-view">
    <div class="recommendations-list shadow">
      <div class="row content-start">
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
            <p>A threshold is defined in the settings for when an alarm should be triggered. When an alarm is triggered, it means that the case is likely to lead to an undesired outcome. This means that the worker should look closer into the case..</p>

            <p class="bold">Next activity</p>
            <p>Another algorithm predicts the next best activity in the case and displays it.</p>
          </template>
        </tooltip-component>
      </div>

      <tabs :options="tabOptions.recommendations">
        <tab name="Current" id="tab-current">
          <recommendation-component
            :batch="lastActivity"
            :current="true"
            :selectedRec="selectedRec"
            :parameters="parameters"
            @recommendationSelected="selectRecommendation"
            ></recommendation-component>
        </tab>
        <tab name="Past" id="tab-past">       
          <recommendation-component v-for="activity in oldActivities" v-bind:key="activity"
            :batch="activity"
            :current="false"
            :parameters="parameters"
            :selectedRec="selectedRec"
            @recommendationSelected="selectRecommendation"
            ></recommendation-component>
        </tab>
      </tabs>
    </div>

    <div class="recommendation-details shadow">
      <div class="row content-space-between">
        <h4 bold>Recommendation details</h4>
        <p>Show past recommendations <toggle v-model="showPastRecommendations"/></p>
      </div>
      <tabs :options="tabOptions.recommendationDetails">
        <tab name="Process model" id="tab-diagram">
          <legend-component></legend-component>
            <vue-cytoscape
            :parameters="parameters"
            :currentCase="currentCase"
            :selectedRec="selectedRec"
            :showPastRecommendations="showPastRecommendations"
            @loading="handleLoading"
            ></vue-cytoscape>
        </tab>

        <tab name="Calculation details" id="tab-details" class="tab-details">
          <div v-if="selectedRecObject" class="details">
              
            <h4> Model description</h4>
            <div v-if="selectedRecObject.type === 'TREATMENT_EFFECT'">
              <p>CATE score: {{ selectedRecObject.output.cate }}</p>
              <p>Probability if treated: {{ Math.round((selectedRecObject.output.proba_if_treated * 100 + Number.EPSILON)*100)/100 }}%</p>
              <p>Probability if untreated: {{ Math.round((selectedRecObject.output.proba_if_untreated * 100 + Number.EPSILON)*100)/100 }}%</p>

            </div>
            <div v-else>
              <p>Accuracy: {{ Math.round((selectedRecObject.plugin.accuracy * 100 + Number.EPSILON)*100)/100 }}%</p>
              <p>Recall: {{ Math.round((selectedRecObject.plugin.recall * 100 + Number.EPSILON)*100)/100 }}%</p>
              <p>Precision: {{ Math.round((selectedRecObject.plugin.precision * 100 + Number.EPSILON)*100)/100 }}%</p>
            </div>
          </div>
      <h4 v-else>Please select a recommendation.</h4>

        </tab>
      </tabs>
    </div>

    <openai-chat
    :currentCase="currentCase"
    :selectedRec="selectedRec"
    :selectedRecObject="selectedRecObject"
    ></openai-chat>
  </div>
</template>

<script>
import VueCytoscape from './CytoscapeComponent.vue';
import LegendComponent from './LegendComponent.vue';
import TooltipComponent from '@/components/TooltipComponent.vue';
import RecommendationComponent from './RecommendationComponent.vue';
import OpenaiChat from "@/components/casePage//OpenaiChatComponent.vue";
import Toggle from '@vueform/toggle'

  export default {
    name: 'CasePage',
    components: {
      VueCytoscape,
      LegendComponent,
      TooltipComponent,
      RecommendationComponent,
      Toggle,
      OpenaiChat
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
          recommendations: { defaultTabHash: 'tab-current', useUrlFragment: false},
          recommendationDetails: { defaultTabHash: 'tab-diagram', useUrlFragment: false}
      },
      showPastRecommendations: true,
      }
    },
    computed: {

      oldActivities(){
        return this.currentCase.activities.slice(0,-1);
      },

      lastActivity(){
        return this.currentCase.activities.slice(-1)[0];
      }
    },
    
    methods: {

      handleError: function(err) {
        console.error('failed to show diagram', err);
      },
      handleShown: function() {
        console.log('diagram shown');
      },
      handleLoading: function() {
        console.log('diagram loading');
      },

      selectRecommendation(selectedRec){
        this.selectedRec = selectedRec;
        this.selectedRecObject = this.currentCase.activities.filter(a => a.event_id === this.selectedRec.batchId)[0].prescriptions[this.selectedRec.index];
      }
    
    },

  };
</script>