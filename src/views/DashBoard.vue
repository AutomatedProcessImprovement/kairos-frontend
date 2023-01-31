<template>
<side-bar></side-bar>
  <div id="dashboard">
      <h2>Dashboard</h2>
      <div class="center column ">
        <p>Event logs</p>
        <div class='center row'>
            <div class='log-card' v-for="log in eventLogs" :key='log'>
                {{log}}
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import Service from "@/services/service.js"
import SideBar from '@/components/SideBar.vue';

export default {
    name: "DashBoard",
    data: function () {
        return {
            eventLogs: []
        }
    },

      components: {
        SideBar
      },

    methods: {

        getLogs() {
            Service.getLogs().then(
                (response) => {
                    console.log(response.data)
                    this.eventLogs = response.data.logs
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
          
            
        }
    }
}
</script>

<style>

</style>