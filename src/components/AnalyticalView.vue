<template>    
    <div class="analytical-view">
      <div class="recommendations-list shadow">
        <div class="row center">
          <h4>Recommendations</h4>
          <tooltip-component>
            <template v-slot:icon>
              <ion-icon name="information-circle-outline"></ion-icon>
            </template>            
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

        <tabs :options="tabOptions">
          <tab name="Past" id="past-recommendations">         
              <recommendation-component  v-for="a in oldActivities" :key="a"
              :batch="a"
              :current="false"
              :selectedRec="selectedRec"
              @recommendationSelected="selectRecommendation"
              ></recommendation-component>
          </tab>
          <tab name="Current" id="current-recommendations">
            <recommendation-component
              :batch="lastActivity"
              :current="true"
              :selectedRec="selectedRec"
              @recommendationSelected="selectRecommendation"
              ></recommendation-component>
          </tab>
        </tabs>
      </div>

      <tabs :options="tabOptions" class="shadow">
        <tab name="Process model" id="tab-diagram" class="tab">
          <legend-component></legend-component>
            <vue-cytoscape
            :currentCase="currentCase"
            :selectedRec="selectedRec"
            ></vue-cytoscape>
        </tab>

        <tab name="Calculation details" id="tab-details" class="tab">
          <div v-if="selectedRec !== null" class="recommendation-details">
              
              <div class="row">
                <div class="column">
                  <h4> Description</h4>

                </div>
              </div>
              <div class="row">
                <div class="column">
                  <h4>Model Description</h4>
  
                </div>

                <div class="column">
                  <h4>Predicted Effect</h4>
                 
                </div>
              </div>                  
          </div>
      <h3 v-else>Please select a recommendation.</h3>

        </tab>
      </tabs>

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
          kpi: Object
      },
  
      data() {
        return {
          selectedRec: {},
          oldActivities: [],
          lastActivity: {},
          tabOptions: { defaultTabHash: 'tab-diagram', useUrlFragment: false},
        }
      },

      watch: {
        currentCase(value){
          this.oldActivities = value.activities.slice(0,-1);
          console.log(this.oldActivities);
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
        }
      
      },
  
    };
  </script>