<template>
<div class="diagram">
  <legend-component></legend-component>
  <div ref="container" class="vue-bpmn-diagram-container"></div>
</div>
</template>

<script>
import BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import LegendComponent from './LegendComponent.vue';


  
  export default {
  components: { LegendComponent },
    name: 'vue-bpmn',
    props: {
      url: {
        type: String,
        required: true
      },
      activities: {
        type: Object
      },
      options: {
        type: Object
      }
    },
    data: function() {
      return {
        diagramXML: null
      };
    },
    mounted: function () {
      var container = this.$refs.container;
      var self = this;
      var _options = Object.assign({
        container: container
      }, this.options)
      this.bpmnViewer = new BpmnJS(_options);
      this.bpmnViewer.on('import.done', function(event) {
        var error = event.error;
        var warnings = event.warnings;
        if (error) {
          self.$emit('error', error);
        } else {
          self.$emit('shown', warnings);
        }
        self.bpmnViewer.get('canvas').zoom('fit-viewport');
        // self.bpmnViewer.get("minimap").open();

        var interventions = document.querySelectorAll("[data-element-id^=intervention]")
        // console.log(interventions);
        interventions.forEach(function (intervention) {
          intervention.classList.add("intervention")
        });

        var activityElements = document.querySelectorAll("[data-element-id^=activity] > .djs-visual > text")
        activityElements.forEach((activity, index) => {
          var options = {dateStyle:"short",timeStyle: "short"};
          var date = new Date(self.activities[index].timestamp).toLocaleString("en-GB",options)
          activity.innerHTML = `<tspan x="43.0562499165535" y="25">${self.activities[index].name}</tspan>
                                <tspan x="0" y="39">____________________</tspan>
                                <tspan font-size="10px" x="8" y="53">${date}</tspan>
                                <tspan font-size="10px" x="8" y="70">${self.activities[index].resource.name}</tspan>` 
        });

      });
      if (this.url) {
        this.fetchDiagram(this.url);
      }
    },
    beforeUnmount: function() {
      this.bpmnViewer.destroy();
    },
    watch: {
      url: function(val) {
        this.$emit('loading');
        this.fetchDiagram(val);
      },
      diagramXML: function(val) {
        this.bpmnViewer.importXML(val);
      }
    },
    methods: {
      fetchDiagram: function(url) {
        var self = this;
        fetch(url)
          .then(function(response) {
            return response.text();
          })
          .then(function(text) {
            self.diagramXML = text;
          })
          .catch(function(err) {
            self.$emit('error', err);
          });
      }
    }
  };
</script>

<style>
@import 'diagram-js-minimap/assets/diagram-js-minimap.css';
</style>
