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
        <div class="recommendation" v-for="(r,index) in currentCase.recommendations" :key="index" 
        @click="selectRecommendation(index)" :class="{selected: index === selectedRec}">
          <p>{{r.name}}</p>
          <small>Predicted effect: <span class="bold">{{ r.effect }} {{ kpi.measurement }}</span> </small>
          <div class="divider"></div>
          <small>Type: <span class="bold"></span> </small>
          <small>Aspect: <span class="bold">Control-flow</span> </small>
        </div>
      </div>
  
      <div class="tabs-container shadow">
        <div class="tabs-header">
            <input type="radio" id="tab-diagram" name="tabs-container" checked="checked" @click="selectedTab='diagram'">
            <label for="tab-diagram" class="tab-label">Process model</label>
            
            <input type="radio" id="tab-details" name="tabs-container" @click="selectedTab='details'">
            <label for="tab-details" class="tab-label">Calculation details</label>
        </div>

          <div v-show="selectedTab==='diagram'" class="tab tab-diagram">
            <legend-component></legend-component>
            <vue-cytoscape
            :currentCase="currentCase"
            :selectedRec="selectedRec"
            ></vue-cytoscape>
            
          </div>

          <div v-show="selectedTab==='details'" class="tab tab-details">
            <div v-if="selectedRec !== null" class="recommendation-details">
              
                  <div class="row">
                    <div class="column">
                      <h4> Description</h4>
                      <div class="norb-text">
                        <span>Case predicted to last {{ currentCase.prediction.effect }} {{ kpi.measurement }}. </span>
                        <span v-if="currentCase.prediction.effect > kpi.value">This violates the target. </span>
                        <span>It is recommended to perform {{currentCase.recommendations[selectedRec].name}}. </span>
                        <br/>
                        <span>Probability: {{currentCase.prediction.probability}}% Uncertainty: {{currentCase.prediction.uncertainty}}%</span>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="column">
                      <h4>Model Description</h4>
      
                      <p>Accuracy: {{currentCase.recommendations[selectedRec].accuracy}}%</p>
                      <p>Recall: {{currentCase.recommendations[selectedRec].recall}}%</p>
                      <p>Precision: {{currentCase.recommendations[selectedRec].precision}}%</p>
      
                    </div>
  
                    <div class="column">
                      <h4>Predicted Effect</h4>
                      <p> Case {{ kpi.name }} is predicted to 
                        <span v-if="currentCase.prediction.effect - currentCase.recommendations[selectedRec].effect > 0">decrease</span>
                        <span v-else>increase</span>
                        by {{currentCase.prediction.effect - currentCase.recommendations[selectedRec].effect}} {{ kpi.measurement }}.</p>
                      <p>Probability: {{currentCase.recommendations[selectedRec].probability}}%,
                      uncertainty: {{currentCase.recommendations[selectedRec].uncertainty}}%</p>
                    </div>
                  </div>                  
              </div>
          <h3 v-else>Please select a recommendation.</h3>
          </div>
      </div>
    </div>
  </template>
  
  <script>
  import VueCytoscape from './VueCytoscape.vue';
  import LegendComponent from './LegendComponent.vue';
  import TooltipComponent from './TooltipComponent.vue';
  
    export default {
      name: 'CasePage',
      components: {
        VueCytoscape,
        LegendComponent,
        TooltipComponent
      },
  
      props: {
          currentCase: Object,
          kpi: Object
      },
  
      data() {
        return {
          selectedRec: null,
          selectedTab: 'diagram',
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
  
        selectRecommendation(index){
          this.selectedRec = index;
        }
      
      },
  
    };
  </script>