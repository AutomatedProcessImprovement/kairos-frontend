<template>    
    <div class="operational-view">
      <div class="case-status shadow">
        <div class="column">
          <h4>Case status</h4>
          <p>{{ lastActivity['ACTIVITY'] }} complete</p>
          <small>{{ lastActivity['TIMESTAMP'] }}</small>
        </div>
        <flow-diagram-component
        :oldActivities="oldActivities"
        :lastActivity="lastActivity"
        :caseCompleted="currentCase.case_completed"
        ></flow-diagram-component>
      </div>
      <div class="row">
        <div class="case-performance-details shadow">
          <h4>Case details</h4>
        </div>
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
              <operational-recommendation-component
                  :batch="lastActivity"
                  :current="true"
                  :selectedRec="selectedRec"
                  :parameters="myParameters"
                  @recommendationSelected="selectRecommendation"
                  ></operational-recommendation-component>
                </tab>
            <tab name="Past" id="tab-past">       
              <operational-recommendation-component v-for="activity in oldActivities" v-bind:key="activity"
                :batch="activity"
                :current="false"
                :parameters="myParameters"
                :selectedRec="selectedRec"
                @recommendationSelected="selectRecommendation"
                ></operational-recommendation-component>
            </tab>
          </tabs>
        </div>
      </div>
      

    </div>
  </template>
  
  <script>

  import TooltipComponent from './TooltipComponent.vue';
  import OperationalRecommendationComponent from './OperationalRecommendationComponent.vue';
  import FlowDiagramComponent from './FlowDiagramComponent.vue';
  
    export default {
      name: 'OperationalWorkerView',
      components:{
        TooltipComponent,
        OperationalRecommendationComponent,
        FlowDiagramComponent
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

      watch:{
        currentCase(value){
          this.oldActivities = value.activities.slice(0,-1);
          this.lastActivity = value.activities.slice(-1)[0];
        }
      },

      computed: {
        myParameters(){
          return JSON.parse(JSON.stringify(this.parameters))
        }
      },

      methods: {

        selectRecommendation(selectedRec){
          console.log('caught select recommendation')
          if (!selectedRec.index){
            this.selectedRec = {};
            this.selectedRecObject = null;
            return;
          }
          this.selectedRec = selectedRec;
          this.selectedRecObject = this.currentCase.activities.filter(a => a.event_id === this.selectedRec.batchId)[0].prescriptions[this.selectedRec.index];
        }
      
      }
  
    };
  </script>