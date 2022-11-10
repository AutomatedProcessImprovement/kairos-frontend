<template>
  <side-bar></side-bar>
  <router-view></router-view>
</template>

<script>
import SideBar from './components/SideBar.vue'


export default {
  name: 'App',

  components: {
      SideBar
    },

};
</script>