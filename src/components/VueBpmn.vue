<template>
<div class="diagram">
  <legend-component></legend-component>
  <div ref="container" class="vue-bpmn-diagram-container"></div>
</div>
</template>

<script>
import BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import LegendComponent from './LegendComponent.vue';
import ModelService from '@/services/model.service';

  
  export default {
  components: { LegendComponent },

    name: 'vue-bpmn',
    props: {
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

    created(){
      this.fetchDiagram()
    },

    beforeUnmount: function() {
      this.bpmnViewer.destroy();
    },
    watch: {
      diagramXML: function() {
        this.$emit('loading');
        this.displayDiagram();
      }
    },
    methods: {
      fetchDiagram(){
        ModelService.getCaseModel(this.$route.params.caseId).then(
          (response) => {
            this.diagramXML = response.data;
          },
          (error) => {
            this.content =
              (error.response &&
                error.response.data &&
                error.response.data.message) ||
              error.message ||
              error.toString();
          }
        );
      },

      displayDiagram(){
        var container = this.$refs.container;
        var self = this;
        var _options = Object.assign({
          container: container
        }, this.options)
        this.bpmnViewer = new BpmnJS(_options);
        this.bpmnViewer.importXML(this.diagramXML);
        this.bpmnViewer.on('import.done', function(event) {
          var error = event.error;
          var warnings = event.warnings;
          if (error) {
            self.$emit('error', error);
          } else {
            self.$emit('shown', warnings);
          }
          // self.bpmnViewer.get('canvas').zoom('fit-viewport');
          // self.bpmnViewer.get("minimap").open();

          var recommendationnodes = document.querySelectorAll("[data-element-id^=recommendationnode]")
          recommendationnodes.forEach(function (recommendationnodes) {
            recommendationnodes.classList.add("recommendationnode")
          }); 

          // var activityNodes = document.querySelectorAll("[data-element-id^=activity]")
          // activityNodes.forEach((activity,index) => {
          //   let activityNodeId = activity.getAttribute("data-element-id")
          //   activity.setAttribute('id',activityNodeId)
          //   var options = {dateStyle:"short",timeStyle: "short"};
          //   var date = new Date(self.activities[index].timestamp).toLocaleString("en-GB",options)
          //   activity.setAttribute('v-tippy',`'${date}\n ${self.activities[index].resource.name}'`)
          // });

        });
      }
    }
  };
</script>

<style>
@import 'diagram-js-minimap/assets/diagram-js-minimap.css';
</style>
