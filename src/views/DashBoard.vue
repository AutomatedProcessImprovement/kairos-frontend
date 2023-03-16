<template>
<side-bar></side-bar>
<loading v-if="isLoading"></loading>
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
                <p>{{ log.filename }}</p>
                <p>{{log.parameters_description}}</p>
                <small>{{ log.datetime }}</small>
            </div>
        </div>
        <div v-else>
            <p class="warning">No event log uploaded.</p>
        </div>
        <div v-if="selectedLog" class="column">
            <h3 class="bold blue">Simulation details</h3>
            <p>{{ selectedLogStatus }} </p>
            <small>Project status</small>
            <div class="row">
                <button :disabled="selectedLogStatus !== 'TRAINED'" class="btn-blue" @click="startSimulation">Start simulation</button>
                <button :disabled="selectedLogStatus !== 'SIMULATING'" class="btn-blue margin" @click="stopSimulation">Stop simulation</button>
            </div>
        </div>
        <div v-if="selectedLog" class="column">
            <div class="row">
                <h3 class="bold blue">Recommendation Parameters</h3>
                <router-link class="btn-blue margin" :to="{name: 'parameters'}">Change</router-link>
            </div>
            <div v-if="selectedLog.case_completion" class="row">
                <div class="parameter">
                    <small class="upper"> Activity equals </small>
                    <p> {{ selectedLog.case_completion }}</p>
                    <small>Case completion</small>
                </div>
                <div class="parameter">
                    <small>{{ selectedLog.positive_outcome.column }} {{ selectedLog.positive_outcome.operator }}</small>
                    <p>{{ selectedLog.positive_outcome.value }}</p>
                    <small>Positive case outcome</small>
                </div>
                <div class="parameter">
                    <small>{{ selectedLog.treatment.column }} {{ selectedLog.treatment.operator }}</small>
                    <p> {{ selectedLog.treatment.value }}</p>
                    <small>Intervention</small>
                </div>
                <div class="parameter">
                    <small> Threshold less than </small>
                    <p>{{selectedLog.alarm_threshold}}</p>
                    <small>Alarm Threshold</small>
                </div>
            </div>
            <div v-else>
                <p class="warning">No parameters defined.</p>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import logsService from "@/services/logs.service.js";
import SideBar from '@/components/SideBar.vue';
import Loading from "@/components/LoadingComponent.vue";

export default {
    name: "DashBoard",

    components: {
        SideBar,
        Loading,
    },

    data () {
        return {
            timer: null,
            isLoading: true,
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

    mounted() {
        this.getLogs();
    },

    beforeUnmount() {
        if(this.timer) clearInterval(this.timer);
    },

    methods: {
        getLogs() {
            logsService.getLogs().then(
                (response) => {
                    this.eventlogs = response.data.event_logs;
                    if(this.eventlogs.length === 0){
                        localStorage.fileId = null;
                        this.isLoading = false;
                        return;
                    }
                    if (!localStorage.fileId){
                        localStorage.fileId = this.eventlogs[0]._id.toString();
                    }
                    this.timer = setInterval(() => {
                        if (localStorage.fileId){
                            this.getProjectStatus();
                        }
                    }, 4000)
                    this.selectedLog = this.eventlogs.find(e => e._id.toString() === localStorage.fileId);
                    this.getProjectStatus();
                },
                (error) => {
                const resMessage =
                    (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                    error.message ||
                    error.toString();
                    this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    }) 
                }
            );      
        },

        selectLog(fileId){
            fileId = fileId.toString();
            localStorage.fileId = fileId;
            this.selectedLog = this.eventlogs.find(e => e._id.toString() === fileId);
            this.getProjectStatus();
        },

        startSimulation(){
            logsService.startSimulation(localStorage.fileId).then(
                (response) => {
                    console.log(response);
                },
                (error) => {
                const resMessage =
                    (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                    error.message ||
                    error.toString();
                    this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    }) 
                }
            ); 
        },

        stopSimulation(){
            logsService.stopSimulation(localStorage.fileId).then(
                (response) => {
                    console.log(response)
                },
                (error) => {
                    this.isLoading = false;
                    const resMessage =
                        (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                        error.message ||
                        error.toString();
                    this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    }) 
                }
            ); 
        },

        getProjectStatus(){
            logsService.getProjectStatus(localStorage.fileId).then(
                (response) => {
                    let status = response.data.status;
                    if ((this.selectedLogStatus === 'TRAINED' && status === 'SIMULATING') ||
                        (this.selectedLogStatus === 'SIMULATING' && status === 'TRAINED')) {
                        let message = '';
                        if (status === 'SIMULATING') {
                            message = 'started';
                        } else if (status === 'TRAINED') {
                            message = 'stopped';
                        }
                        this.$notify({
                            title: 'Success',
                            text: `Successfully ${message} simulating log ${localStorage.fileId}`,
                            type: 'success',
                        });
                    }
                    this.selectedLogStatus = status;
                    this.isLoading = false;
                },
                (error) => {
                    this.isLoading = false;
                    const resMessage =
                        (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                        error.message ||
                        error.toString();
                    this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    });
                }
            ); 
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