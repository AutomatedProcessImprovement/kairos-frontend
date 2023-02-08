<template>
<side-bar></side-bar>
  <div id="dashboard">
      <h2>Dashboard</h2>
      <div class="column">
        <p>Event logs</p>
        <div class="row">
            <ion-icon class="input-icon" name="search"></ion-icon>
            <input type="text" placeholder="Find log...">
        </div>
        <div class='wrap center row'>
            <div class='log-card' :class="{'selected': log._id === selectedLog._id}" v-for="log in eventlogs" :key='log' @click="selectLog(log._id)">
                <h4>{{ log.filename }}</h4>
                <small>{{ log.datetime }}</small>
            </div>
        </div>
        <div class="column">
            <div class="row">
                <h3 class="bold blue">Recommendation Parameters</h3>
            </div>
            <div class="row">
                <div class="parameter">
                    <p>Activity {{ selectedLog.caseCompletion }}</p>
                    <small>Case completion</small>
                </div>
                <div class="parameter">
                    <p>{{selectedLog.positiveOutcome.type}} {{ selectedLog.positiveOutcome.value }}</p>
                    <small>Positive case outcome</small>
                </div>
                <div class="parameter">
                    <p>{{selectedLog.treatment.type}} {{ selectedLog.treatment.value }}</p>
                    <small>Intervention</small>
                </div>
                <div class="parameter">
                    <p>{{selectedLog.alarmProbability}}</p>
                    <small>Alarm probability</small>
                </div>
            </div>
        </div>
        <div class="column">
            <h3 class="bold blue">Actions</h3>
            <p>Display interface for:</p>
            <div class="select-view" v-for="view in views" :key="view">
                <input type="radio" id="{{ view.value }}" :checked="selectedView===view.value" @click="selectView(view.value)">
                <label for="{{view.value}}">{{ view.name }}</label>
            </div>
            <router-link class="btn" :to="{name: 'cases'}">Show</router-link>
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
            selectedLog: null,
            parameters: [],
            views: [
                {value: 'analytical', name:'Process analyst'},
                {value: 'operational', name:'Operational worker'},
                {value: 'tactical', name:'Tactical manager'}
            ],
            selectedView: localStorage.view
        }
    },

      components: {
        SideBar
      },

      created() {
        this.getLogs();
      },

    methods: {

        getLogs() {
            Service.getLogs().then(
                (response) => {
                    this.eventlogs = response.data.eventlogs;
                    if(this.eventlogs.length === 0){
                        localStorage.fileId == null;
                        return;
                    }
                    this.selectedLog = this.eventlogs.find(e => e._id === localStorage.fileId);
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
            this.selectedLog = this.eventlogs.find(e => e._id === fileId);
        },

        selectView(view){
          localStorage.view = view;
          this.selectedView = view;
          console.log(this.selectedView);
        }
    }
}
</script>

<style>

</style>