<template>    
    <div class="operational-view">
      <div class="column shadow">
        <div class="prediction-container" v-if="currentCase.prediction !== undefined">
            <h4>Prediction</h4>
            <div class="prediction-details">
              <small>Case predicted to last {{ currentCase.prediction.effect }} {{ kpi.measurement }}.</small>
              <small v-if="currentCase.prediction.effect > kpi.value"> This violates the target.</small>
              <br/>
              <small>Probability: {{currentCase.prediction.probability}}% Uncertainty: {{currentCase.prediction.uncertainty}}%</small>
            </div>
        </div>
        <div class="recommendations-list">
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
          <div class="recommendation" v-for="(r,index) in currentCase.recommendations" :key="index">
            <div class="recommendation-heading">
              <p>{{r.name}}</p>
              <button class="btn shadow" @click="selectRecommendation(index)" :class="{selected: index === selectedRec}">See details</button>
            </div>
            <small>Predicted effect: case lasts {{r.effect}} {{ kpi.measurement }}</small>
            <div class="similar-cases">
              <accordion-component>
                <template v-slot:title>
                  <span>Similar cases</span>
                </template>
                <template v-slot:content>
                    <div class="similar-cases-table">
                      <table :class="{expanded: index === selectedSimilarCases}">
                          <thead>
                              <tr>
                                  <th v-for="header in ['ID','Similarity','Purpose','Amount','Effect']" :key="header"> {{ header }}</th>
                              </tr>
                              </thead>
                              <tbody>
                              <tr v-for="item in r.similarCases" :key='item'>
                                <td v-for="value in item" :key='value'>
                                  {{ value }}
                                </td>
                              </tr>
                              </tbody>
                      </table>
                    </div>
                  </template>
                </accordion-component>
            </div>
          </div>
    
        </div>
      </div>

      <div v-if="selectedRec !== null" class="recommendation-details">
        <h3>Details</h3>
              <div class = "recommendation-details-column-container">
                <div class="recommendation-details-column">
                  <p>Predicted case duration</p>
  
                  <h4>Calculations explanation</h4>
  
                  <h5>Model description</h5>
  
                  <p>Accuracy: {{currentCase.recommendations[selectedRec].accuracy}}%</p>
                  <p>Recall: {{currentCase.recommendations[selectedRec].recall}}%</p>
                  <p>Precision: {{currentCase.recommendations[selectedRec].precision}}%</p>
  
                  <h5>Features contribution</h5>
                </div>
                <div class="recommendation-details-column">
                  
                  <h4>Effect</h4>
                  <p> Case will last for {{currentCase.recommendations[selectedRec].effect}} {{ kpi.measurement }}.</p>
                  <p>Probability: {{currentCase.recommendations[selectedRec].probability}}%,
                   uncertainty: {{currentCase.recommendations[selectedRec].uncertainty}}%</p>
                </div>
              </div>
            </div>
        <div v-else></div>
    </div>
  </template>
  
  <script>

  import AccordionComponent from './AccordionComponent.vue';
  import TooltipComponent from './TooltipComponent.vue';
  
    export default {
      name: 'OperationalWorkerView',
      components:{
        AccordionComponent,
        TooltipComponent
      },
  
      props: {
          currentCase: Object,
          kpi: Object
        },
        
        data() {
          return {
            selectedRec: null,
            selectedSimilarCases: null,
        }
      },

      methods: {
        selectRecommendation(index){
          this.selectedRec = index;
        },

        toggleSimilarCases(index){
            this.selectedSimilarCases = index;
        }
      
      }
  
    };
  </script>