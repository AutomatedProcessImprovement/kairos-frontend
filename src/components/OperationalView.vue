<template>    
    <div class="operational-view">
      <div class="column">
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
          <h4>Recommendations list</h4>
          <div class="recommendation" v-for="(r,index) in currentCase.recommendations" :key="index">
            <div class="recommendation-heading">
              <p>{{r.name}}</p>
              <button class="btn" @click="selectRecommendation(index)" :class="{selected: index === selectedRec}">See details</button>
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
                  <p> {{currentCase.recommendations[selectedRec].effect}}</p>
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
  
    export default {
      name: 'OperationalWorkerView',
      components:{
        AccordionComponent
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