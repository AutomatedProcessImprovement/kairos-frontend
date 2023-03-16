<template>    
    <div class="analytical-view">
      <div class="recommendations-list shadow">
        <div class="row center">
          <h4>Recommendations</h4>
          <tooltip-component :iconSize="20" :tooltipSize="600">           
            <template v-slot:title>
                <h3 class="bold">Recommendation info</h3>
            </template>
            <template v-slot:content>
              <p>How are recommendations calculated?</p>
              <p class="bold">Intervention</p>
              <p>Intervention was defined by process owner in the settings. An algorithm estimates
                the causal effect of performing the intervention at a given point in time. It is shown
                as ”recommended” when an estimated effect is positive (above 0).</p>

              <p class="bold">Alarm</p>
              <p>A process owner defined in the settings the alarm threshold. When an alarm is 
              triggered, it shows that the case is likely to lead to an undesired outcome. This
              means that the worker should look closer into the case.</p>

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
              :parameters="myParameters"
              @recommendationSelected="selectRecommendation"
              ></recommendation-component>
          </tab>
          <tab name="Past" id="tab-past">       
            <recommendation-component v-for="activity in oldActivities" v-bind:key="activity"
              :batch="activity"
              :current="false"
              :parameters="myParameters"
              :selectedRec="selectedRec"
              @recommendationSelected="selectRecommendation"
              ></recommendation-component>
          </tab>
        </tabs>
      </div>

      <div class="recommendation-details shadow">
        <h4 bold>Recommendation details</h4>
        <tabs :options="tabOptions.recommendationDetails">
          <tab name="Process model" id="tab-diagram">
            <legend-component></legend-component>
              <vue-cytoscape
              :parameters="myParameters"
              :currentCase="currentCase"
              :selectedRec="selectedRec"
              @loading="handleLoading"
              ></vue-cytoscape>
          </tab>
  
          <tab name="Calculation details" id="tab-details" class="tab-details">
            <div v-if="selectedRecObject" class="details">
                
              <h4> Model description</h4>
                <div v-if="selectedRecObject.type === 'TREATMENT_EFFECT'">
                    <p>CATE score: {{ selectedRecObject.output.cate }}</p>
                    <p>Probability if treated: {{ selectedRecObject.output.proba_if_treated * 100 }} %</p>
                    <p>Probability if untreated: {{ selectedRecObject.output.proba_if_untreated * 100 }} %</p>

                  </div>
                  <div  v-else>
                    <p>Accuracy: {{ selectedRecObject.plugin.accuracy * 100 }} %</p>
                    <p>Recall: {{ selectedRecObject.plugin.recall * 100 }} %</p>
                    <p>Precision: {{ selectedRecObject.plugin.precision * 100 }} %</p>
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
  
    export default {
      name: 'CasePage',
      components: {
        VueCytoscape,
        LegendComponent,
        TooltipComponent,
        RecommendationComponent
      },
  
      props: {
          currentCase: Object,
          parameters: Object
      },
  
      data() {
        return {
          selectedRec: {},
          selectedRecObject: null,
          oldActivities: {},
          lastActivity: {},
          tabOptions: {
            recommendations: { defaultTabHash: 'tab-current', useUrlFragment: false},
            recommendationDetails: { defaultTabHash: 'tab-diagram', useUrlFragment: false}
        },
        }
      },
      computed: {
        myParameters(){
          return JSON.parse(JSON.stringify(this.parameters))
        }
      },

      watch:{
        currentCase(value){
          this.oldActivities = value.activities.slice(0,-1);
          this.lastActivity = value.activities.slice(-1)[0];
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