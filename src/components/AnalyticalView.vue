<template>    
    <div class="analytical-view">
      <div class="recommendations-list">
        <h4>Recommendations list</h4>
        <div class="recommendation" v-for="(r,index) in caseRecommendations" :key="index" 
        @click="selectRecommendation(index)" :class="{selected: index === selectedRec}">
          <p>{{r.name}}</p>
          <small>Effect: {{r.effect}}</small>
          <small>Probability: {{r.probability}}%</small>
          <small>Uncertainty: {{r.uncertainty}}%</small>
        </div>
      </div>
  
      <div class="tabs-container">
        <div class="tabs-header">
            <input type="radio" id="tab-diagram" name="tabs-container" checked="checked" @click="selectedTab='diagram'">
            <label for="tab-diagram" class="tab-label">Diagram</label>
            
            <input type="radio" id="tab-details" name="tabs-container" @click="selectedTab='details'">
            <label for="tab-details" class="tab-label">Details</label>
        </div>

          <div v-show="selectedTab==='diagram'" class="tab tab-diagram">
            <vue-cytoscape
            :activities="caseActivities"
            :recommendations="caseRecommendations"
            ></vue-cytoscape>
            
          </div>

          <div v-show="selectedTab==='details'" class="tab tab-details">
            <div v-if="selectedRec !== null" class="recommendation-details">
              <h3>Perform "{{caseRecommendations[selectedRec].name}}"</h3>
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
                  <h4> Description</h4>
                  <p> Based on the prediction, it is recommended to perform {{caseRecommendations[selectedRec].name}}. [reasoning]</p>
  
                  <h4>Effect</h4>
                  <p> {{caseRecommendations[selectedRec].effect}}</p>
                  <p>Probability: {{caseRecommendations[selectedRec].probability}}%,
                   uncertainty: {{caseRecommendations[selectedRec].uncertainty}}%</p>
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
  
    export default {
      name: 'CasePage',
      components: {
        VueCytoscape
      },
  
      props: {
          caseActivities:{ type: Array},
          caseRecommendations:{ type: Array},
          currentCase: {type: Object},
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
          this.selectedRec = index
          // var recommendationnodes = Array.from(document.getElementsByClassName("recommendationnode"))
          // for (var i of recommendationnodes) {
          //   i.classList.remove("selected-recommendationnode")
          // }
          // recommendationnodes[index].classList.add("selected-recommendationnode")
        }
      
      },
  
    };
  </script>