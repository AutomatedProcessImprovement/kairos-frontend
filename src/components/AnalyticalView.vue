<template>    
    <div class="analytical-view">
      <div class="recommendations-list">
        <h4>Recommendations list</h4>
        <div class="recommendation" v-for="(r,index) in currentCase.recommendations" :key="index" 
        @click="selectRecommendation(index)" :class="{selected: index === selectedRec}">
          <p>{{r.name}}</p>
          <small>Effect: case will last {{ r.effect }} {{ kpi.measurement }}. </small>
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
            <legend-component></legend-component>
            <vue-cytoscape
            :currentCase="currentCase"
            :selectedRec="selectedRec"
            ></vue-cytoscape>
            
          </div>

          <div v-show="selectedTab==='details'" class="tab tab-details">
            <div v-if="selectedRec !== null" class="recommendation-details">
              <h3>Perform "{{currentCase.recommendations[selectedRec].name}}"</h3>
              <div class = "recommendation-details-column-container">
                <div class="recommendation-details-column">

                  <p>Predicted case {{kpi.name}}</p>
                  <div class="row">
                    <div class="column center" v-if="currentCase.prediction.effect > kpi.value">
                      <ion-icon name="alert-outline"></ion-icon>
                      <h6>Violation</h6>
                    </div>
                    <h5>{{ currentCase.prediction.effect }} {{ kpi.measurement }}</h5>
                    <h5> /{{ kpi.value }} {{ kpi.measurement }}
                      <small>target</small>
                    </h5>
                  </div>
                  <div class="recommendation-metrics">
                    <h4>Calculations</h4>
    
                    <small>Accuracy: {{currentCase.recommendations[selectedRec].accuracy}}%</small>
                    <small>Recall: {{currentCase.recommendations[selectedRec].recall}}%</small>
                    <small>Precision: {{currentCase.recommendations[selectedRec].precision}}%</small>
    
                  </div>
                </div>
                <div class="recommendation-details-column">
                  <h4> Description</h4>
                  <p> Based on the prediction, it is recommended to perform {{currentCase.recommendations[selectedRec].name}}. [reasoning]</p>
  
                  <h4>Effect</h4>
                  <p> Case will last for {{currentCase.recommendations[selectedRec].effect}} {{ kpi.measurement }}.</p>
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
  
    export default {
      name: 'CasePage',
      components: {
        VueCytoscape,
        LegendComponent
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