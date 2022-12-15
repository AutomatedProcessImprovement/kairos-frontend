<template>    
    <div class="prediction-recommendations-container">
      <div class="column">
        <div class="prediction-container">
            <h4>Prediction</h4>
            <small>Case predicted to last 34 days.</small>
            <br/>
            <small>Probability: % Uncertainty: %</small>
        </div>
        <div class="recommendations-list">
          <h4>Recommendations list</h4>
          <div class="recommendation" v-for="(r,index) in caseRecommendations" :key="index" 
          @click="selectRecommendation(index)" :class="{selected: index === selectedRec}">
            <p>{{r.name}}</p>
            <small>Predicted effect: {{r.effect}}</small>
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
  
                  <p>Accuracy: {{caseRecommendations[selectedRec].accuracy}}%</p>
                  <p>Recall: {{caseRecommendations[selectedRec].recall}}%</p>
                  <p>Precision: {{caseRecommendations[selectedRec].precision}}%</p>
  
                  <h5>Features contribution</h5>
                </div>
                <div class="recommendation-details-column">
                  
                  <h4>Effect</h4>
                  <p> {{caseRecommendations[selectedRec].effect}}</p>
                  <p>Probability: {{caseRecommendations[selectedRec].probability}}%,
                   uncertainty: {{caseRecommendations[selectedRec].uncertainty}}%</p>
                </div>
              </div>
            </div>
        <div v-else></div>
    </div>
  </template>
  
  <script>
  // import ModelService from '@/services/model.service';
  
    export default {
      name: 'OperationalWorkerView',
  
      props: {
          casePrediction: {type: Object},
          currentCase: {type: Object},
          caseId: {type: Number},
          caseRecommendations: {type: Array},
        },
        
        data() {
          return {
            selectedRec: null,
        }
      },

      methods: {
        selectRecommendation(index){
          this.selectedRec = index
          
        }
      
      }
  
    };
  </script>