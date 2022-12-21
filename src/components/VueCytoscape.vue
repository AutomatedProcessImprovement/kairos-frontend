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
          activities: {
            type: Object
          },
          recommendations: {
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
          activities: function(){
            this.$emit('loading');      
          },
          recommendations: function() {
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
            this.cy.layout({name:'dagre',rankDir: 'LR'}).run()
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
                    selector: '.selected',
                    style: {
                      'border-color' : '#579aff',
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
                    'label' : 'data(id)',
                    'border-style' : 'dashed',
                    'border-color' : '#d7d7d7'
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
                    'curve-style': 'taxi',
                    'target-arrow-shape': 'triangle',
                    'width': 1
                  }
                }
              ],
            });
            
            var elems = [];

            for (let i = 0; i < this.activities.length; i++) {
              const activity = this.activities[i];
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
              if(i == this.activities.length - 1) break;

              elems.push({
                group: "edges",
                data: {
                  id: "e" + i,
                  source: activity.name,
                  target: this.activities[i+1].name,
                  label: "e" + i
                },
                style: {
                  'line-color' : '#d7d7d7',
                  'target-arrow-color': '#d7d7d7',
                }
              });
            }

            var l = this.activities.length

            for (let i=0; i < this.recommendations.length; i++) {
              elems.push({
                group: "nodes",
                data: {
                  id: this.recommendations[i].name,
                },
                classes: 'recommendation',
              });

              elems.push({
                group: "edges",
                data: {
                  id: "e" + (i+l),
                  source: this.activities[l-1].name,
                  target: this.recommendations[i].name,
                },
                style: {
                  'line-color' : 'black',
                  'target-arrow-color': 'black',
                }
              });
            }

            cy.add(elems);
            this.cy = cy;
                            
            },
          
          selectRecommendation(newVal,oldVal){
            if(oldVal !== null) {
              this.cy.getElementById(this.recommendations[oldVal].name).removeClass('selected')
            }
            this.cy.getElementById(this.recommendations[newVal].name).addClass('selected')
          }
                    
        }
      };
    </script>
    
    