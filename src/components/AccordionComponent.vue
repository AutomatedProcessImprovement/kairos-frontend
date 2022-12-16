<template>
    <div class="accordion">
      <button
        @click="toggleAccordion()"
        class="btn"
        >
        <slot name="title"/>
        <ion-icon :class="{'arrow-down': isOpen,'arrow-up': !isOpen}" name="chevron-up-outline"></ion-icon>
      </button>
  
      <div v-show="isOpen">
          <slot name="content"/>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isOpen: false,
      };
    },
  
    methods: {
      toggleAccordion() {
        this.isOpen = !this.isOpen;
      },
    },
  };
  </script>