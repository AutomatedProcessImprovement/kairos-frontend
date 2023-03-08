<template>
    <div id="tooltip">
      <div class="row center" @click="toggleTooltip">
        <slot name="icon"/>
      </div>
      <div class="relative">
        <div v-if="showTooltip" class="tooltip">
          <slot name="title"/>
          <slot name="content"/>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "TooltipComponent",

    props: {
          color: {
            type: String,
            default: 'black'
          },
          iconSize: {
            type: Number,
            default: 25
          },
          tooltipSize: {
            type: Number,
            default: 750
          }
      },
    
    data() {
      return {
        showTooltip: false,
      };
    },

  mounted() {
    document.addEventListener("click", this.closeTooltip);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.closeTooltip);
  },
  methods: {
    toggleTooltip() {
      this.showTooltip = !this.showTooltip;
    },
    closeTooltip(event) {
      if (!this.$el.contains(event.target)) {
        this.showTooltip = false;
      }
    },
  },
};
  </script>

  