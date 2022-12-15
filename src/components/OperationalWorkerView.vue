<template>    
    <div class="operational-view">
      <div class="column">
        <div class="prediction-container">
            <h4>Prediction</h4>
            <small>Case predicted to last 34 days.</small>
            <br/>
            <small>Probability: % Uncertainty: %</small>
        </div>
        <div class="recommendations-list">
          <h4>Recommendations list</h4>
          <div class="recommendation" v-for="(r,index) in caseRecommendations" :key="index">
            <div class="recommendation-heading">
                <p>{{r.name}}</p>
                <button class="btn" @click="selectRecommendation(index)" :class="{selected: index === selectedRec}">See details</button>
            </div>
            <small>Predicted effect: {{r.effect}}</small>
            <div class="similar-cases-table">
                <button class="btn" @click="toggleSimilarCases(index)">
                    Similar cases
                    <ion-icon v-if="index===selectedSimilarCases" name="chevron-up-outline"></ion-icon>
                    <ion-icon v-else name="chevron-down-outline"></ion-icon>
                </button>
                <table :class="{expanded: index === selectedSimilarCases}">
                    <thead>
                        <tr>
                            <th v-for="header in ['ID','Purpose','Amount','Similarity','Effect']" :key="header"> {{ header }}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="item in similarCases" :key='item'>
                            <td v-for="value in item" :key='value'>
                            {{ value }}
                            </td>
                        </tr>
                        </tbody>
                </table>
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
          similarCases: {type: Array}
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