<template>
  <div class="sidebar">
    <div class="sidebar-heading">
      <ion-icon name="laptop-outline"></ion-icon>
      <h4>PrPM</h4>
    </div>
        <div class="sidebar-items">
          <router-link class = "sidebar-item"  :to="{ name: 'dashboard'}"><ion-icon name="home"></ion-icon>Dashboard</router-link>
          <router-link class = "sidebar-item"  :to="{ name: 'cases'}"><ion-icon name="stats-chart"></ion-icon>Cases</router-link>
          <router-link class = "sidebar-item"  :to="{ name: 'resources'}"><ion-icon name="people"></ion-icon>Resources</router-link>
        </div>
    </div>
</template>

<script>
export default {

}

</script>

<style>

</style>