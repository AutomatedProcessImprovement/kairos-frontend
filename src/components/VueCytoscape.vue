<template>
    <div class="diagram">
      <div id='cy'></div>
    </div>
    </template>

<script>    
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use( dagre );

      export default {
    
        name: 'vue-cytoscape',
        props: {
          currentCase: {
            type: Object
          },  
          selectedRec: {
            type: Number
          }
          
        },

        data: function() {
          return {
            cy: null
          };
        },

        watch: {
          currentCase: function(){
            this.$emit('loading');      
            this.createDiagram();
          },
          selectedRec: function(newVal,oldVal){
            this.selectRecommendation(newVal,oldVal);
          },
          cy: function(){
            this.displayDiagram();
          }
        },
        methods: {
          displayDiagram(){
            this.cy.layout({
              name:'dagre',
              rankDir: 'LR', 
              align: 'DR',
              // acyclicer: 'greedy'
                          }).run()
          },

          createDiagram(){
            var width = 100;
            var height = 80;
            var cy = cytoscape({
                container: document.getElementById('cy'),
                autoungrabify: true,

                style: [
                
                  {
                    selector: '.recommendation',
                    style : {
                      'label' : 'data(id)',
                      'border-color' : 'black'
                    }
                  },
                  
                {
                  selector: '.activity',
                    style : {
                      'label': 'data(label)',
                      'border-color' : '#d7d7d7',
                  }
                },
                {
                  selector: '.prediction',
                  style: {
                    'label' : 'data(label)',
                    'border-style' : 'dashed',
                    'border-color' : '#d7d7d7'
                  }
                },

                {
                  selector: '.activityEdge',
                  style: {
                    'line-color' : '#d7d7d7',
                    'target-arrow-color': '#d7d7d7',
                  }
                },

                {
                  selector: '.recommendationEdge',
                  style: {
                    'line-color' : 'black',
                    'target-arrow-color': 'black',
                  }
                },

                {
                  selector: '.predictionEdge',
                  style: {
                    'line-color' : '#d7d7d7',
                    'line-style': 'dashed',
                    'target-arrow-color': '#d7d7d7',
                  }
                },

                {
                    selector: '.selectedRec',
                    style: {
                      'border-color' : '#579aff',
                    }
                  },
                  {
                    selector: '.selectedEdge',
                    style: {
                      'line-color' : '#579aff',
                      'target-arrow-color': '#579aff',
                    }
                  },
                {
                  selector: 'node',
                  style: {
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'shape': 'round-rectangle',
                    'background-color' : 'white',
                    'border-width' : 1,
                    'text-wrap' : 'wrap',
                    'text-max-width' : width-10,
                    'height' : height,
                    'width' : width,
                    'font-size' : 10,
                    'font-family' : 'arial'
                  }
                },
                {
                  selector: 'edge',
                  style: {
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'width': 1,
                    'label' : node => node.data('label') > 1 ? node.data('label') : "",
                    'font-size' : 12,
                    'font-family' : 'arial',
                    'color' : '#7e7e7e'
                  }
                },
                
                {
                    selector: '.start',
                    style : {
                      'shape': 'ellipse',
                      'height' : 40,
                      'width' : 40,
                      'border-color' : '#d7d7d7',

                    }
                  },
              ],
            });

            const activities = this.currentCase.activities;
            const recommendations = this.currentCase.recommendations;
            const prediction = this.currentCase.prediction;
            
            var elems = [];

            for (let i = 0; i < activities.length; i++) {
              const activity = activities[i];
              var options = {dateStyle:"short",timeStyle: "short"};
              var date = new Date(activity.timestamp).toLocaleString("en-GB",options);
              var content = activity.name + "\n\n" + date + "\n" + activity.resource.name;
              elems.push({
                group: "nodes",
                data: {
                  id: activity.name, 
                  label: content,
                },
                classes: 'activity'
              });
              if(i == 0) {
                elems.push({
                  group: "nodes",
                  data: {
                    id: "start event", 
                    label: content,
                  },
                  classes: 'start'
                });
                elems.push({
                  group: "edges",
                  data: {
                    id: "ae" + i,
                    source: "start event",
                    target: activity.name,
                    label: 1
                  },
                  classes: 'activityEdge'
                });
                continue;
              }

              const oldEdge = elems.findIndex(e => e.data.source === activities[i-1].name && e.data.target === activity.name);
              if(oldEdge > -1){
                elems[oldEdge].data.label = elems[oldEdge].data.label + 1;
                continue;
              }

              elems.push({
                group: "edges",
                data: {
                  id: "ae" + i,
                  source: activities[i-1].name,
                  target: activity.name,
                  label: 1
                },
                classes: 'activityEdge'
              });
            }

            var l = activities.length

            elems.push({
              group: "nodes",
              data: {
                id: "prediction",
                label: prediction.name
              },
              classes: 'prediction',
            });

            elems.push({
              group: "edges",
              data: {
                id: "pe",
                source: activities[l-1].name,
                target: 'prediction',
              },
              classes: 'predictionEdge'
            });
           

            for (let i=0; i < recommendations.length; i++) {
              elems.push({
                group: "nodes",
                data: {
                  id: recommendations[i].name,
                },
                classes: 'recommendation',
              });

              elems.push({
                group: "edges",
                data: {
                  id: "re" + i,
                  source: activities[l-1].name,
                  target: recommendations[i].name,
                },
                classes: 'recommendationEdge'
              });
            }

            cy.add(elems);
            this.cy = cy;
                            
            },
          
          selectRecommendation(newVal,oldVal){
            if(oldVal !== null) {
              this.cy.getElementById(this.currentCase.recommendations[oldVal].name).removeClass('selectedRec')
              this.cy.getElementById("re" + oldVal).removeClass('selectedEdge')
            }
            this.cy.getElementById(this.currentCase.recommendations[newVal].name).addClass('selectedRec')
            this.cy.getElementById("re" + newVal).addClass('selectedEdge')
          }
                    
        }
      };
    </script>
    
    