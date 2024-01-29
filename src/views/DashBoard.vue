<template>
    <side-bar></side-bar>
    <loading v-if="isLoading" :startPosition="200"></loading>
    <div id="dashboard">
        <h2>Dashboard</h2>
        <div class="column">
            <div class="column">
                <div class="row align-center">
                    <h3 class="bold blue">Event logs</h3>
                    <button class="btn-blue margin-left" @click="goToHome">Upload log</button>
                </div>
                <div class="row">
                    <ion-icon class="input-icon" name="search"></ion-icon>
                    <input type="text" id="find-log" @keyup.enter="findLog" v-model="findLogId" placeholder="Find log...">
                </div>
            </div>
            <div v-if="eventlogs.length > 0" class='wrap align-center row'>
                <div class='log-card' :class="{ 'selected': log._id === selectedLog._id }" v-for="log in eventlogs" :key='log'
                    @click="selectLog(log._id)">
                    <p>{{ log.filename }}</p>
                    <p v-if="log.test_filename">Test set: {{ log.test_filename }}</p>
                    <small>{{ log.parameters_description }}</small>
                    <small>{{ log.datetime }}</small>
                </div>
            </div>
            <div v-else>
                <p class="warning">Please upload or search for an event log (ID).</p>
            </div>
            <div v-if="selectedLog" class="column">
                <h3 class="bold blue">Event log details</h3>
                <steps-progress-bar :options="progressBarOptions" ref="progress" />
                <div class="row align-center">
                    <ion-icon v-if="selectedLogStatus.status !== 'TRAINED' && selectedLogStatus.status !== 'NULL'"
                        class="rotate status-icon" name="reload-circle-outline"></ion-icon>
                    <p>{{ selectedLogStatus.status }} </p>
                </div>


                <small>Event log status</small>
                <div v-if="selectedLog.result_key" class="row">
                    <button :disabled="selectedLogStatus.status !== 'TRAINED' || selectedLog.got_results" class="btn-blue"
                        @click="getStaticResults">Get results</button>
                    <button class="btn-blue margin-left" @click="openModal = true">Delete event log</button>
                </div>
                <div v-else class="row">
                    <button :disabled="selectedLogStatus.status !== 'TRAINED'" class="btn-blue"
                        @click="startSimulation">Start simulation</button>
                    <button :disabled="selectedLogStatus.status !== 'SIMULATING'" class="btn-blue margin-left"
                        @click="stopSimulation">Stop simulation</button>
                    <button :disabled="selectedLogStatus.status !== 'TRAINED'" class="btn-blue margin-left"
                        @click="clearSimulation">Clear stream data</button>
                    <button class="btn-blue margin-left" @click="openModal = true">Delete event log</button>
                </div>
                <modal-component v-if="openModal" title="Are you sure?" @closeModal="closeModal">
                    <template v-slot:content>
                        <div class="column">
                            <p>Deleting this event log will result in deletion of all cases associated with it.</p>
                            <div class="row">
                                <button type="submit" class="btn-blue" @click="deleteLog">Delete</button>
                                <button class="btn-blue margin-left" @click="openModal = false">Cancel</button>
                            </div>
                        </div>
                    </template>
                </modal-component>
            </div>
            <div v-if="selectedLog" class="column">
                <div class="row">
                    <h3 class="bold blue">Recommendation Parameters</h3>
                    <router-link class="btn-blue margin-left" :to="{ name: 'parameters' }">Change parameters</router-link>
                    <router-link class="btn-blue margin-left" :to="{ name: 'columns' }">Change column types</router-link>
                </div>
                <div v-if="selectedLog.case_completion" class="row">
                    <div class="parameter">
                        <small class="upper"> Activity EQUAL </small>
                        <p> {{ selectedLog.case_completion }}</p>
                        <small>Case completion</small>
                    </div>
                    <div class="parameter">
                        <small>{{ selectedLog.positive_outcome.column }} {{ selectedLog.positive_outcome.operator }}</small>
                        <p>{{ selectedLog.positive_outcome.value }} {{ selectedLog.positive_outcome.unit }}</p>
                        <small>Positive case outcome</small>
                    </div>
                    <div class="parameter">
                        <small>{{ selectedLog.treatment.column }} {{ selectedLog.treatment.operator }}</small>
                        <p> {{ selectedLog.treatment.value }}</p>
                        <small>Intervention</small>
                    </div>
                    <div class="parameter">
                        <small> Threshold more than </small>
                        <p>{{ selectedLog.alarm_threshold }}</p>
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
import ModalComponent from "@/components/ModalComponent.vue";
import shared from "@/services/shared";

export default {
    name: "DashBoard",

    components: {
        SideBar,
        Loading,
        ModalComponent,
    },

    data() {
        return {
            isLoading: false,
            openModal: false,

            timer: null,
            eventlogs: [],
            selectedLog: null,
            parameters: [],
            findLogId: null,
            selectedView: shared.getLocal('view'),
            selectedLogStatus: { id: null, status: null },
        }
    },

    mounted() {
        this.getLogs();
    },

    beforeUnmount() {
        this.clearTimer();
    },

    methods: {
        goToHome() {
            this.$router.push({ name: 'home' });
        },

        clearTimer() {
            if (this.timer) clearInterval(this.timer);
        },

        closeModal() {
            this.openModal = false;
        },
        getLogs() {
            this.isLoading = true;
            
            const logId = shared.getLocal('logId');
            let uploadedLogIds = shared.getLocal('uploadedLogIds');
            
            if (!uploadedLogIds && logId){
                uploadedLogIds = [logId];
                shared.setLocal('uploadedLogIds',uploadedLogIds,1000);
            }

            if (!uploadedLogIds) {
                this.isLoading = false;
                return;
            }

            logsService.getLogs(uploadedLogIds).then(
                (response) => {
                    this.eventlogs = response.data.event_logs;
                    if (this.eventlogs.length === 0) {
                        shared.setLocal('logId', null);
                        this.selectedLog = null;
                        this.selectedLogStatus = { id: null, status: null };
                        this.clearTimer();
                        this.isLoading = false;
                        return;
                    }
                    if (!shared.getLocal('logId')) {
                        shared.setLocal('logId', this.eventlogs[0]._id, 30);
                    }
                    this.selectedLog = this.eventlogs.find(e => e._id === shared.getLocal('logId'));

                    if (!this.selectedLog) {
                        this.selectLog(this.eventlogs[0]._id);
                    } else {
                        this.getProjectStatus(true);
                    }

                    this.timer = setInterval(() => {
                        if (this.selectedLogStatus !== 'NULL') this.getProjectStatus();
                    }, 4000);

                    this.isLoading = false;

                },
                (error) => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.error) ||
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

        selectLog(logId) {
            if (!logId) return;
            shared.setLocal('logId', logId, 30);
            this.selectedLog = this.eventlogs.find(e => e._id === logId);
            this.getProjectStatus(true);
        },

        startSimulation() {
            logsService.startSimulation(shared.getLocal('logId')).then(
                (response) => {
                    console.log(response.data.message.message);
                },
                (error) => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.error) ||
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

        stopSimulation() {
            logsService.stopSimulation(shared.getLocal('logId')).then(
                (response) => {
                    console.log(response.data.message.message);
                    this.$notify({
                        title: 'Success',
                        text: `Successfully stopped simulating log ${shared.getLocal('logId')}`,
                        type: 'success',
                    });
                },
                (error) => {
                    this.isLoading = false;
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.error) ||
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

        clearSimulation() {
            logsService.clearSimulation(shared.getLocal('logId')).then(
                (response) => {
                    this.$notify({
                        title: 'Success',
                        text: response.data.message,
                        type: 'success'
                    })
                },
                (error) => {
                    this.isLoading = false;
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.error) ||
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

        deleteLog() {
            clearInterval(this.timer);
            this.closeModal();

            logsService.deleteLog(shared.getLocal('logId')).then(
                (response) => {
                    this.$notify({
                        title: 'Success',
                        text: response.data.message,
                        type: 'success'
                    });
                    shared.removeLocal(`casesListClickedRows${shared.getLocal('logId')}`);
                    shared.removeLocal('logId');
                    this.selectedLogStatus.status = null;
                    this.getLogs();
                },
                (error) => {
                    this.isLoading = false;
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.error) ||
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

        getStaticResults() {
            this.$notify({
                title: 'warning',
                text: "Getting results may take a while, please wait...",
                type: 'warning'
            })
            logsService.getStaticResults(shared.getLocal('logId')).then(
                (response) => {
                    let type = 'success';
                    if (response.data.message === 'Ongoing dataset result is still processing') {
                        type = 'warning';
                    }
                    if (type === 'success') this.selectedLog.got_results = true;
                    this.$notify({
                        title: type,
                        text: response.data.message,
                        type: type
                    })
                },
                (error) => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.error) ||
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

        getProjectStatus(delay = false) {
            let oldLogstatus = this.selectedLogStatus;
            if (delay) this.selectedLogStatus.status = null;
            logsService.getProjectStatus(shared.getLocal('logId')).then(
                (response) => {
                    let status = response.data.status;
                    let newLogStatus = { id: shared.getLocal('logId'), status: status };
                    this.notifyForNewStatus(oldLogstatus, newLogStatus);
                    this.selectedLogStatus = newLogStatus;
                },
                (error) => {
                    this.isLoading = false;
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.error) ||
                        error.message ||
                        error.toString();
                    this.selectedLogStatus = 'NULL';
                    this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    });
                }
            );
        },

        notifyForNewStatus(oldLogStatus, newLogStatus) {
            if (oldLogStatus.id !== newLogStatus.id) return;
            if ((oldLogStatus.status === 'TRAINED' && newLogStatus.status === 'SIMULATING')) {
                this.$notify({
                    title: 'Success',
                    text: `Successfully started simulating log ${shared.getLocal('logId')}`,
                    type: 'success',
                });
            }
        },

        findLog() {
            this.isLoading = true;
            const findLogId = this.findLogId;
            this.findLogId = null
            if (!findLogId) {
                this.$notify({
                    title: 'Warning',
                    text: `Log ID cannot be empty.`,
                    type: 'warning',
                });
                return;
            }

            logsService.getLog(findLogId).then(
                (response) => {
                    const foundLog = response.data.event_log;
                    if (!foundLog) {
                        this.$notify({
                            title: 'Warning',
                            text: `Could not find an event log with ID ${findLogId}.`,
                            type: 'warning',
                        });
                        this.isLoading = false;
                        return;
                    }

                    const uploadedLogIds = shared.getLocal('uploadedLogIds') || [];
                    
                    if (!(uploadedLogIds.includes(foundLog._id))){
                        this.eventlogs.push(foundLog);
                        uploadedLogIds.push(foundLog._id);
                        shared.setLocal('uploadedLogIds',uploadedLogIds,1000);
                    }
                    this.selectLog(foundLog._id);

                    if (!this.timer){
                        this.timer = setInterval(() => {
                            if (this.selectedLogStatus !== 'NULL') this.getProjectStatus();
                        }, 4000);
                    }

                    this.isLoading = false;
                },
                (error) => {
                    this.isLoading = false;
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.error) ||
                        error.message ||
                        error.toString();
                    this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    })
                }
            );
        }
    }
}
</script>