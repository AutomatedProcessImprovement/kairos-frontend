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
                container: document.getElementById('cy')
            });
            cy.add([
                { group: 'nodes', data: { id: 'n0' }, position: { x: 100, y: 100 } },
                { group: 'nodes', data: { id: 'n1' }, position: { x: 200, y: 200 } },
                { group: 'edges', data: { id: 'e0', source: 'n0', target: 'n1' } }
                ]);

                            
            },
                    
        }
      };
    </script>
    
    