<template>
  <aside class="sidebar">
        <ul class="sidebar-items">
          <router-link class = "sidebar-item"  :to="{ name: 'home'}"><i class="fa fa-home"></i>  Home</router-link>
          <router-link class = "sidebar-item"  :to="{ name: 'cases'}"><i class="fa fa-bar-chart-o"></i>  Cases</router-link>
          <router-link class = "sidebar-item"  :to="{ name: 'resources'}"><i class="fa fa-user"></i>  Resources</router-link>
        </ul>
  </aside>
</template>

<script>
export default {

}

</script>

<style>

</style>