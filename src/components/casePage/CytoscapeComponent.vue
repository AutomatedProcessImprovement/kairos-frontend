<template>
  <div class="diagram">
    <div id="cy"></div>
    <div class="zooming-buttons">
      <ion-icon @click="diagramZoom(1)" name="add-outline"></ion-icon>
      <ion-icon @click="diagramZoom(-1)" name="remove-outline"></ion-icon>
    </div>
  </div>
</template>

<script>
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

export default {

  name: 'vue-cytoscape',
  props: {
    parameters: Object,
    currentCase: Object,
    selectedRec: Object,
    showPastRecommendations: Boolean,
  },

  data: function () {
    return {
      cy: null,
      elems: [],
      colours: {
        default: { light: '#8392AB', dark: '#074EE8' },
        nextActivity: { light: '#F2994A', dark: '#be6415' },
        activity: { light: '#d7d7d7', dark: '#474747' },
        intervention: { light: '#BB6BD9', dark: '#7e2a9d' },
        selectedNode: { light: '#074EE8', dark: '#042f8b' },
      },
      recommendationTypes: {
        'ALARM': null,
        'NEXT_ACTIVITY': {
          label: (recommendation) => recommendation.output,
          nodeClass: 'nextActivity',
          edgeClass: 'nextActivityEdge'
        },
        'TREATMENT_EFFECT': {
          label: (recommendation) => recommendation.output.treatment[0][0].value,
          nodeClass: 'intervention',
          edgeClass: 'interventionEdge',
          isValidNode: (recommendation, columnsDefinition) =>
            columnsDefinition[recommendation.output.treatment[0][0].column] === 'ACTIVITY' &&
            recommendation.output.treatment[0][0].operator === 'EQUAL' && recommendation.output.cate > 0
        }
      }
    };
  },

  mounted() {
    this.createDiagram();
  },

  watch: {
    currentCase() {
      this.createNodes();
    },
    showPastRecommendations() {
      this.togglePastRecommendations();
    },
    selectedRec(newValue, oldValue) {
      let oldRec = oldValue ? '#rn' + oldValue.batchId + '-' + oldValue.index : null;
      this.panToElement('#rn' + newValue.batchId + '-' + newValue.index, oldRec, true);
    }
  },

  methods: {
    displayDiagram() {
      this.cy.layout({
        fit: false,
        name: 'dagre',
        rankDir: 'LR',
        align: 'DR',
      }).run();
      this.panToElement('.selectedNode');
    },

    panToElement(el, oldEl, isRecommendation = false) {

      if (oldEl) {
        let oldSelectedNodes = this.cy.nodes(oldEl);
        if (oldSelectedNodes.length > 0) {
          const oldSelectedNode = oldSelectedNodes[0];
          let newBorderColour = this.filterNodeColour(oldSelectedNode, 'light');
          oldSelectedNode.style({
            'border-color': newBorderColour,
            'border-width': 2,
            'background-color': 'white'
          })
        }
      }

      let selectedNodes = this.cy.nodes(el);
      if (selectedNodes.length > 0) {
        const selectedNode = selectedNodes[0];

        if (selectedNode.visible()) {
          if (isRecommendation) {
            let newBorderColour = this.filterNodeColour(selectedNode, 'dark');
            selectedNode.style({
              'border-color': newBorderColour,
              'border-width': 4,
              'background-color': '#EBF0FF'
            })
            var eles = { eles: selectedNode };
            this.cy.animate({
              zoom: 1.1,
              center: eles,
            });

          } else {
            let bb = selectedNode.boundingBox();
            let w = this.cy.width()
            let h = this.cy.height();
            var pan = {
              x: (w - (bb.x1 + bb.x2)) / 2 + 200,
              y: (h - (bb.y1 + bb.y2)) / 2 + 100
            };
            this.cy.animate({
              zoom: 1.1,
              pan: pan,
            });
          }
        }
      }
    },

    filterNodeColour(node, shade) {
      if (shade === 'light' && shade === 'dark') return;
      let nodeClasses = node.classes();
      if (nodeClasses.length > 0)
        return this.colours[nodeClasses[0]][shade];
      return node.style()['border-color'];
    },

    togglePastRecommendations() {
      let displayStyle = this.showPastRecommendations ? 'element' : 'none';
      var activityNodes = this.cy.nodes('.activity');
      activityNodes.forEach(activityNode => {
        activityNode.outgoers().nodes().forEach(outgoingNode => {
          if (!outgoingNode.hasClass('selectedNode') && !outgoingNode.hasClass('activity')) {
            outgoingNode.style('display', displayStyle);
          }
        })
      });
    },

    diagramZoom(scale) {
      let level = this.cy.zoom() + scale / 10;
      if (level < 0) return;
      const w = this.cy.width()
      const h = this.cy.height();
      this.cy.zoom({
        level: level,
        renderedPosition: { x: w / 2, y: h / 2 }
      });
    },

    createDiagram() {
      // this.$emit('loading');      

      var width = 120;
      var height = 60;
      var lineWidth = 2;
      var cy = cytoscape({
        container: document.getElementById('cy'),
        wheelSensitivity: 0.6,
        style: [
          {
            selector: '.nextActivity',
            style: {
              'label': 'data(label)',
              'border-color': this.colours.nextActivity.light
            }
          },
          {
            selector: '.nextActivityEdge',
            style: {
              'line-color': this.colours.nextActivity.light,
              'target-arrow-color': this.colours.nextActivity.light,
            }
          },

          {
            selector: '.activity',
            style: {
              'label': 'data(label)',
              'border-color': this.colours.activity.light,
            }
          },
          {
            selector: '.activityEdge',
            style: {
              'line-color': this.colours.activity.light,
              'target-arrow-color': this.colours.activity.light,
            }
          },
          {
            selector: '.intervention',
            style: {
              'label': 'data(label)',
              'border-color': this.colours.intervention.light
            }
          },

          {
            selector: '.interventionEdge',
            style: {
              'line-color': this.colours.intervention.light,
              'target-arrow-color': this.colours.intervention.light,
            }
          },

          {
            selector: '.selectedNode',
            style: {
              'label': 'data(label)',
              'border-color': this.colours.selectedNode.light,
            }
          },
          {
            selector: '.selectedEdge',
            style: {
              'line-color': this.colours.selectedNode.light,
              'target-arrow-color': this.colours.selectedNode.light,
            }
          },

          {
            selector: 'node',
            style: {
              'text-valign': 'center',
              'text-halign': 'center',
              'shape': 'round-rectangle',
              'background-color': 'white',
              'border-width': lineWidth,
              'text-wrap': 'wrap',
              'text-max-width': width - 10,
              'height': height,
              'width': width,
              'font-size': 10,
              'font-family': 'arial'
            }
          },
          {
            selector: 'edge',
            style: {
              'curve-style': 'bezier',
              'target-arrow-shape': 'triangle',
              'width': lineWidth,
              'label': node => node.data('label') > 1 ? node.data('label') : "",
              'font-size': 12,
              'font-family': 'arial',
            }
          },
          {
            selector: '.start',
            style: {
              'shape': 'ellipse',
              'height': 40,
              'width': 40,
              'border-color': '#d7d7d7',
            }
          },
          {
            selector: '.end',
            style: {
              'shape': 'ellipse',
              'height': 40,
              'width': 40,
              'border-color': '#d7d7d7',
              'border-width': 4,

            }
          },
        ],
      });
      this.cy = cy;
      this.createNodes();
    },

    createNodes() {
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

        var options = { dateStyle: "short", timeStyle: "short" };
        var date = new Date(activity[this.parameters.columnsDefinitionReverse['START_TIMESTAMP']]).toLocaleString("en-GB", options);
        var content = activity[this.parameters.columnsDefinitionReverse['ACTIVITY']] + "\n\n" + date;
        var activityClass = (i === (l - 1)) ? 'selectedNode' : 'activity';

        elems.push({
          group: "nodes",
          data: {
            id: "an" + i,
            label: content,
          },
          classes: activityClass
        });

        elems.push({
          group: "edges",
          data: {
            id: "ae" + i,
            source: "an" + (i - 1),
            target: "an" + i,
          },
          classes: 'activityEdge'
        });

        let recommendations = activity.prescriptions;

        if (recommendations) {
          for (let j = 0; j < recommendations.length; j++) {
            const recommendation = recommendations[j];
            const recommendationType = this.recommendationTypes[recommendation.type];

            if (!recommendationType) continue;
            if (recommendationType.isValidNode && !recommendationType.isValidNode(recommendation, this.parameters.columnsDefinition)) continue;

            const label = recommendationType.label(recommendation);
            const nodeClass = recommendationType.nodeClass;
            const edgeClass = recommendationType.edgeClass;

            const index = activity.event_id + '-' + j;
            elems.push({
              group: "nodes",
              data: {
                id: "rn" + index,
                label: label,
              },
              classes: nodeClass
            });

            elems.push({
              group: "edges",
              data: {
                id: "re" + index,
                source: "an" + i,
                target: "rn" + index,
              },
              classes: edgeClass
            });
          }
        }

      }


      if (this.currentCase.case_completed) {
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
            source: "an" + (l - 1),
            target: "endnode",
          },
          classes: 'activityEdge'
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
};
</script>
    
    