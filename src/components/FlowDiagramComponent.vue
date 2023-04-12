<template>
    <div class="flow-diagram">
        <div id='flow-cy'></div>
    </div>
</template>

<script>

import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use( dagre );

export default{

    name: 'vue-cytoscape',
        props: {
          lastActivity: Object, 
          oldActivities: Array,
          caseCompleted: Boolean,
          parameters: Object
        },
    
        data(){
            return{
                cy: null
            }
        },

        mounted(){
          this.createDiagram();
        },
    
        watch: {
          cy(){
            this.displayDiagram();
          },
          currentCase(){
            this.createDiagram();
          }
        },

    methods: {
          displayDiagram(){
            this.cy.layout({
                name:'dagre',
                rankDir: 'LR', 
                align: 'DR',
            }).run()
            this.cy.zoom(1.2);
          },

          createDiagram(){
            // this.$emit('loading');      

            var width = 15;
            var height = 15;
            var lineWidth = 1;
            var cy = cytoscape({
                container: document.getElementById('flow-cy'),
                // zoomingEnabled: false,
                // panningEnabled: false,
                autoungrabify: true,
                // autounselectify: true,

                style: [
                  
                {
                  selector: 'node',
                  style: {
                    'text-halign': 'center',
                    'text-valign': 'bottom',
                    'text-margin-y': 5,
                    'shape': 'ellipse',
                    'background-color' : '#d2d6da',
                    'border-width' : 0,
                    'text-wrap' : 'wrap',
                    'text-max-width' : width-10,
                    'height' : height,
                    'width' : width,
                    'font-size' : 6,
                    'font-family' : 'arial'
                  }
                },
                {
                  selector: 'edge',
                  style: {
                    'curve-style': 'straight',
                    'target-arrow-shape': 'vee',
                    'width': lineWidth,
                    'line-color' : '#252F40',
                    'target-arrow-color': '#252F40',
                  }
                },
                {
                    selector: '.nextActivity',
                    style : {
                      'label' : 'data(label)',
                      'background-color' : '#EBF0FF',
                    }
                  },
                  
                {
                  selector: '.completedActivity',
                    style : {
                      'label': 'data(label)',
                      'background-color' : '#8392AB',
                  }
                },
              ],
            });
            let activities = JSON.parse(JSON.stringify(this.oldActivities));
            activities.push(this.lastActivity);
            // activities = activities.slice(-3);
            const l = activities.length;
            var elems = [];
            var lastNodeId = 'an'+(l-1)

            for (let i = 0; i < l; i++) {
              const activity = activities[i];
              let content = activity[this.parameters.columnsDefinitionReverse['ACTIVITY']]

              elems.push({
                group: "nodes",
                data: {
                  id: "an"+ i, 
                  label: content,
                },
                classes: 'completedActivity'
              });

              if(i > 0){
                  elems.push({
                    group: "edges",
                    data: {
                      id: "ae" + i,
                      source: "an" + (i-1),
                      target: "an" + i,
                    },
                  });
              }
            }
            let lastRecommendations = this.lastActivity.prescriptions;
            if (lastRecommendations){
                let nextActivityRecommendation = lastRecommendations.filter(r => r.type === 'NEXT_ACTIVITY');
                if (nextActivityRecommendation.length > 0){
                  let content = nextActivityRecommendation[0].output;
                  elems.push({
                  group: "nodes",
                  data: {
                    id: "rn", 
                    label: content,
                  },
                  classes: 'nextActivity'
                });
  
                  elems.push({
                  group: "edges",
                  data: {
                      id: "re",
                      source: "an" + (l-1),
                      target: "rn",
                  },
                  });
                  lastNodeId = 'rn';
              }
            }

            if(elems.length > 0 && !this.caseCompleted){
                elems.push({
                group: "nodes",
                data: {
                    id: "nn", 
                    },
                });

            elems.push({
                group: "edges",
                data: {
                    id: "ne",
                    source: lastNodeId,
                    target: "nn",
                    },
                });
            }

            cy.add(elems);
            this.cy = cy;
                            
            }
                    
        }
}

</script>