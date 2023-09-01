<template>
  <div class="flow-diagram">
    <div id='flow-cy'></div>
  </div>
</template>

<script>

import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

export default {

  name: 'vue-cytoscape',
  props: {
    currentCase: Object,
    caseCompleted: Boolean,
    parameters: Object
  },

  data() {
    return {
      cy: null,
      elems: [],
    }
  },

  mounted() {
    this.createDiagram();
  },

  watch: {
    currentCase() {
      this.createNodes();
    }
  },

  methods: {
    displayDiagram() {
      this.cy.layout({
        fit: false,
        name: 'dagre',
        rankDir: 'LR',
        align: 'DR',
      }).run()
      this.cy.zoom(1.2);
    },

    createDiagram() {

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
              'background-color': '#d2d6da',
              'border-width': 0,
              'text-wrap': 'wrap',
              'text-max-width': width - 10,
              'height': height,
              'width': width,
              'font-size': 6,
              'font-family': 'arial'
            }
          },
          {
            selector: 'edge',
            style: {
              'curve-style': 'straight',
              'target-arrow-shape': 'vee',
              'width': lineWidth,
              'line-color': '#252F40',
              'target-arrow-color': '#252F40',
            }
          },
          {
            selector: '.nextActivity',
            style: {
              'label': 'data(label)',
              'background-color': '#EBF0FF',
            }
          },

          {
            selector: '.completedActivity',
            style: {
              'label': 'data(label)',
              'background-color': '#8392AB',
            }
          },
        ],
      });

      this.cy = cy;
      this.createNodes();

    },

    createNodes() {
      let activities = this.currentCase.activities;
      // activities = activities.slice(-3); // display only last 3 completed activities
      const l = activities.length;

      var elems = [];
      var lastNodeId = 'an' + (l - 1)

      for (let i = 0; i < l; i++) {
        const activity = activities[i];
        let content = activity[this.parameters.columnsDefinitionReverse['ACTIVITY']]

        elems.push({
          group: "nodes",
          data: {
            id: "an" + i,
            label: content,
          },
          classes: 'completedActivity'
        });

        if (i > 0) {
          elems.push({
            group: "edges",
            data: {
              id: "ae" + i,
              source: "an" + (i - 1),
              target: "an" + i,
            },
          });
        }
      }
      let lastRecommendations = activities[l - 1].prescriptions;
      if (lastRecommendations) {
        let nextActivityRecommendation = lastRecommendations.filter(r => r.type === 'NEXT_ACTIVITY');
        if (nextActivityRecommendation.length > 0) {
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
              source: "an" + (l - 1),
              target: "rn",
            },
          });
          lastNodeId = 'rn';
        }
      }

      if (elems.length > 0 && !this.currentCase.case_completed) {
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

      if (this.elems.length > 0) {
        this.cy.elements().remove();
      }
      this.cy.add(elems);
      this.elems = elems;
      this.displayDiagram();
    }

  }
}

</script>