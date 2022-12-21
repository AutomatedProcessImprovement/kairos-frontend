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
                      'border-style' : 'dashed',
                      'border-color' : '#7e7e7e'
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
                      'border-color' : 'black',
                  }
                },
                {
                  selector: 'node',
                  style: {
                    'label': 'data(id)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'shape': 'round-rectangle',
                    'background-color' : 'white',
                    'border-width' : 1,
                    'text-wrap' : 'wrap',
                    'text-max-width' : width-10,
                    'height' : height,
                    'width' : width,
                    'font-size' : 12,
                    'font-family' : 'arial'
                  }
                },
                {
                  selector: 'edge',
                  style: {
                    'curve-style': 'taxi',
                    'target-arrow-shape': 'triangle',
                    'line-color' : 'black',
                    'target-arrow-color': 'black',
                    'width': 1
                  }
                }
              ],
            });
            
            var elems = [];

            for (let i = 0; i < this.activities.length; i++) {
              elems.push({
                group: "nodes",
                data: {
                  id: this.activities[i].name, 
                },
                classes: 'activity'
              });
              if(i == this.activities.length - 1) break;

              elems.push({
                group: "edges",
                data: {
                  id: "e" + i,
                  source: this.activities[i].name,
                  target: this.activities[i+1].name,
                  label: "e" + i
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
    
    