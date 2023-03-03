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
          currentCase: Object, 
          selectedRec: Object
        },

        data: function() {
          return {
            cy: null,
            elems: []
          };
        },

        watch: {
          currentCase: function(){
            this.$emit('loading');      
            this.createDiagram();
          },
          // selectedRec: function(newVal,oldVal){
          //   this.selectRecommendation(newVal,oldVal);
          // },
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
            }).run()
            // var node = this.cy.getElementById("an" + (this.currentCase.activities.length-1));
            // this.cy.fit(node,100);
            // this.cy.zoom(1);
          },

          createDiagram(){
            var width = 120;
            var height = 60;
            var lineWidth = 2;
            var cy = cytoscape({
                container: document.getElementById('cy'),
                // autoungrabify: true, // lets you grab nodes in the diagram

                style: [
                
                  {
                    selector: '.nextActivity',
                    style : {
                      'label' : 'data(label)',
                      'border-color' : '#F2994A'
                    }
                  },
                  {
                  selector: '.nextActivityEdge',
                  style: {
                    'line-color' : '#F2994A',
                    'target-arrow-color': '#F2994A',
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
                  selector: '.activityEdge',
                  style: {
                    'line-color' : '#d7d7d7',
                    'target-arrow-color': '#d7d7d7',
                  }
                },
                {
                  selector: '.intervention',
                  style: {
                    'label' : 'data(label)',
                    'border-color' : '#BB6BD9'
                  }
                },

                {
                  selector: '.interventionEdge',
                  style: {
                    'line-color' : '#BB6BD9',
                    'target-arrow-color': '##BB6BD9',
                  }
                },

                {
                    selector: '.selectedNode',
                    style: {
                      'label': 'data(label)',
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
                    'border-width' : lineWidth,
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
                    'width': lineWidth,
                    'label' : node => node.data('label') > 1 ? node.data('label') : "",
                    'font-size' : 12,
                    'font-family' : 'arial',
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
                  {
                    selector: '.end',
                    style : {
                      'shape': 'ellipse',
                      'height' : 40,
                      'width' : 40,
                      'border-color' : '#d7d7d7',
                      'border-width': 4,

                    }
                  },
              ],
            });

            const activities = this.currentCase.activities;
            const l = activities.length;
            var elems = [];
            
            elems.push({
                  group: "nodes",
                  data: {
                    id: "an-1", 
                  },
                  classes: 'start'
                });

            for (let i = 0; i < l; i++) {
              const activity = activities[i];

              var options = {dateStyle:"short",timeStyle: "short"};
              var date = new Date(activity['TIMESTAMP']).toLocaleString("en-GB",options);
              var content = activity['ACTIVITY'] + "\n\n" + date;
              var activityClass = (i === (l-1)) ? 'selectedNode' :'activity';

              elems.push({
                group: "nodes",
                data: {
                  id: "an"+ i, 
                  label: content,
                },
                classes: activityClass
              });

              elems.push({
                group: "edges",
                data: {
                  id: "ae" + i,
                  source: "an" + (i-1),
                  target: "an" + i,
                },
                classes: 'activityEdge'
              });

              let recommendations = activity.prescriptions;

              for (let j=0; j < recommendations.length; j++) {
                if(recommendations[j].type === 'ALARM') {continue}
                let label = '';
                let nodeClass = '';
                let edgeClass = '';
                let index = activity.event_id + "-" + j;
                
                if(recommendations[j].type === 'NEXT_ACTIVITY'){
                  label = recommendations[j].output;
                  nodeClass = 'nextActivity';
                  edgeClass = 'nextActivityEdge';
                } else{ 
                  label = recommendations[j].output.treatment[0][0].value;
                  nodeClass = 'intervention';
                  edgeClass = 'interventionEdge';
                }
                elems.push({
                  group: "nodes",
                  data: {
                    id: "rn"+ index, 
                    label: label,
                  },
                  classes: nodeClass
                });
  
                elems.push({
                  group: "edges",
                  data: {
                    id: "re" + index,
                    source: "an" + i,
                    target: "rn"+ index,
                  },
                  classes: edgeClass
                });
              }
            }

            if(this.currentCase.case_completed){
              elems.push({
                group: "nodes",
                data: {
                  id: "endnode", 
                },
                classes: 'end'
              });

              elems.push({
                group: "edges",
                data: {
                  id: "endedge",
                  source: "an" + (l-1),
                  target: "endnode",
                },
                classes: 'activityEdge'
              }); 
            }
            this.elems = elems;
            cy.add(elems);
            this.cy = cy;
                            
            }
                    
        }
      };
    </script>
    
    