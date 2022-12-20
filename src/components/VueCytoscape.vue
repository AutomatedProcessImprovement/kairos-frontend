<template>
    <div class="diagram">
      <div id='cy'></div>
    </div>
    </template>

<script>    
import cytoscape from 'cytoscape';

      export default {
    
        name: 'vue-cytoscape',
        props: {
          activities: {
            type: Object
          },
          recommendations: {
            type: Object
          }
          
        },
        watch: {
            activities: function(){
                this.$emit('loading');
                this.displayDiagram();
          }
        },
        methods: {
          displayDiagram(){
            var cy = cytoscape({
                container: document.getElementById('cy'),
                autoungrabify: true,
                layout: {
                  name: 'grid'
                },

                style: [
                {
                  selector: 'node',
                  css: {
                    'label': 'data(id)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'shape': 'round-rectangle',
                    'background-color' : 'white',
                    'border-width' : 1,
                    'border-color' : 'black',
                    'padding' : 2,
                    'text-wrap' : 'wrap',
                    'text-max-width' : 10,
                    'height' : 80,
                    'width' : 100,
                    'font-size' : 12,
                    'font-family' : 'arial'
                  }
                },
                {
                  selector: 'edge',
                  css: {
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
            for (var i = 0; i < this.activities.length; i++) {
              elems.push({
                group: "nodes",
                data: {
                  id: this.activities[i].name, 
                },
                position:{
                  x: (100 + 150*i),
                  y: 100
                }
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

            cy.add(elems)

                            
            },
                    
        }
      };
    </script>
    
    