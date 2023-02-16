<template>
<side-bar></side-bar>
  <div id="dashboard">
      <h2>Dashboard</h2>
      <div class="column">
        <p>Event logs</p>
        <div class="row">
            <ion-icon class="input-icon" name="search"></ion-icon>
            <input type="text" id="find-log" @keyup="findLog" placeholder="Find log...">
        </div>
        <div v-if="eventlogs.length > 0" class='wrap center row'>
            <div class='log-card' :class="{'selected': log._id === selectedLog._id}" v-for="log in eventlogs" :key='log' @click="selectLog(log._id)">
                <h4>{{ log.filename }}</h4>
                <small>{{ log.datetime }}</small>
            </div>
        </div>
        <div v-else>
            <p class="warning">No event logs uploaded.</p>
        </div>
        <div class="column">
            <h3 class="bold blue">Simulation details</h3>
            <p>{{ selectedLogStatus }} </p>
            <small>Project status</small>
            <div class="row">
                <button :disabled="selectedLogStatus !== 'TRAINED'" class="btn-blue" @click="startSimulation">Start simulation</button>
                <button :disabled="selectedLogStatus !== 'SIMULATING'" class="btn-blue margin" @click="stopSimulation">Stop simulation</button>
            </div>
        </div>
        <div class="column">
            <div class="row">
                <h3 class="bold blue">Recommendation Parameters</h3>
                <router-link class="btn-blue margin" :to="{name: 'parameters'}">Change</router-link>
            </div>
            <div v-if="selectedLog" class="row">
                <div class="parameter">
                    <p> {{ selectedLog.case_completion }}</p>
                    <small>Case completion</small>
                </div>
                <div class="parameter">
                    <p>{{ selectedLog.positive_outcome.value }}</p>
                    <small>Positive case outcome</small>
                </div>
                <div class="parameter">
                    <p> {{ selectedLog.treatment.value }}</p>
                    <small>Intervention</small>
                </div>
                <div class="parameter">
                    <p>{{selectedLog.alarm_threshold}}</p>
                    <small>Alarm Threshold</small>
                </div>
            </div>
            <div v-else>
                <p class="warning">No parameters defined.</p>
            </div>
        </div>
        <div class="column">
            <h3 class="bold blue">Actions</h3>
            <p>Display interface for:</p>
            <div class="select-view" v-for="view in views" :key="view">
                <input type="radio" id="{{ view.value }}" :checked="selectedView===view.value" @click="selectView(view.value)">
                <label for="{{view.value}}">{{ view.name }}</label>
            </div>
            <router-link class="btn-blue" :to="{name: 'cases'}">Show</router-link>
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
            selectedView: localStorage.view,
            selectedLogStatus: null,
        }
    },

      components: {
        SideBar
      },

      created() {
        this.getLogs();
        this.getProjectStatus();
      },

    methods: {

        getLogs() {
            Service.getLogs().then(
                (response) => {
                    this.eventlogs = response.data.event_logs;
                    if(this.eventlogs.length === 0){
                        localStorage.fileId == null;
                        return;
                    }
                    this.selectedLog = this.eventlogs.find(e => e._id.toString() === localStorage.fileId);
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
            this.selectedLog = this.eventlogs.find(e => e._id.toString() === fileId);
        },

        startSimulation(){
            Service.startSimulation(localStorage.fileId).then(
                (response) => {
                    console.log(response);
                    this.selectedLogStatus = response.data.status;
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

        stopSimulation(){
            Service.stopSimulation(localStorage.fileId).then(
                (response) => {
                    console.log(response)
                    this.selectedLogStatus = response.data.status;
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

        getProjectStatus(){
            Service.getProjectStatus(localStorage.fileId).then(
                (response) => {
                    console.log(response)
                    this.selectedLogStatus = response.data.status;
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

        streamProjectStatus(){
            let fileId = localStorage.fileId;
            const sse = new EventSource(`http://localhost:5000/projects/${fileId}/status/stream`);
            sse.addEventListener('message',(e) =>{
                if (e.data){
                    this.selectedLogStatus = e.data;
                }
            })
        },

        selectView(view){
          localStorage.view = view;
          this.selectedView = view;
        },

        findLog(){
            var input, filter, logCards, h4, filename;
            input = document.getElementById('find-log');
            filter = input.value.toUpperCase();
            logCards = document.getElementsByClassName("log-card");

            for (let i = 0; i < logCards.length; i++) {
                h4 = logCards[i].getElementsByTagName("h4")[0];
                filename = h4.textContent || h4.innerText;
                if (filename.toUpperCase().indexOf(filter) < 0) {
                    logCards[i].style.display = "none";
                } else{
                    logCards[i].style.display = "";
                }
            }
        }
    }
}
</script>

<style>

</style>