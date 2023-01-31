<template>
<side-bar></side-bar>
  <div id="dashboard">
      <h2>Dashboard</h2>
      <div class="column">
        <p>Event logs</p>
        <div class='wrap center row'>
            <div class='log-card' :class="{'selected': log._id === selectedLog}" v-for="log in eventlogs" :key='log' @click="selectLog(log._id)">
                <h4>{{ log.filename }}</h4>
                <small>{{ log.uploadDate }}</small>
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
    data () {
        return {
            eventlogs: [],
            selectedLog: null
        }
    },

      components: {
        SideBar
      },

      created() {
        this.selectedLog = localStorage.fileId;
        this.getLogs();
      },

    methods: {

        getLogs() {
            Service.getLogs().then(
                (response) => {
                    this.eventlogs = response.data.eventlogs;
                    console.log(this.eventlogs);
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

        selectLog(fileId){
            localStorage.fileId = fileId;
            this.selectedLog = fileId;
        }
    }
}
</script>

<style>

</style>