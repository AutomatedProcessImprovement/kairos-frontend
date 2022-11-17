<template>
  <aside class="sidebar">
        <ul class="sidebar-items">
          <router-link class = "sidebar-item"  :to="{ name: 'home'}"><ion-icon name="home-outline"></ion-icon>  Home</router-link>
          <router-link class = "sidebar-item"  :to="{ name: 'cases'}"><ion-icon name="stats-chart-outline"></ion-icon>  Cases</router-link>
          <router-link class = "sidebar-item"  :to="{ name: 'resources'}"><ion-icon name="people-outline"></ion-icon>  Resources</router-link>
        </ul>
  </aside>
</template>

<script>
export default {

}

</script>

<style>

</style>