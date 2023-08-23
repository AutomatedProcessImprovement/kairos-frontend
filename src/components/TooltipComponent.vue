<template>
    <div id="tooltip">
      <div class="row" @click="toggleTooltip">
        <ion-icon :class="['info-icon',{'icon-selected': showTooltip}]" :style="iconStyle" :name="icon"></ion-icon>
      </div>
      <div v-if="showTooltip" class="tooltip" :style="tooltipStyle">
        <slot name="title"/>
        <slot name="content"/>
        <ion-icon @click="toggleTooltip" class="close-icon" name="close-outline"></ion-icon>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "TooltipComponent",

    props: {
          icon:{
            type: String,
            default: 'information-circle-outline'
          },
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

    computed:{
      iconStyle(){
        return {
          color: this.color,
          height: this.iconSize + 'px',
          width: this.iconSize + 'px'}
      },
      tooltipStyle(){
        return{
          width: this.tooltipSize + 'px',
          height: 'max-content'
        }
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

  