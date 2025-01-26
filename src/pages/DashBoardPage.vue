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
          <input type="text" id="find-log" @keyup.enter="findLog" v-model="findLogId" placeholder="Find log...">
          <button @click="findLog" class="btn-input">
            <ion-icon class="input-icon" name="search"></ion-icon>
          </button>
        </div>
      </div>
      <div v-if="eventlogs.length > 0" class='wrap align-center row'>
        <div class='log-card' :class="{ 'selected': log._id === selectedLog?._id }" v-for="log in eventlogs"
             :key='log._id' @click="selectLog(log._id)">
          <p>{{ log.filename }}</p>
          <small>Log ID: {{ log._id }}</small>
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
          <button :disabled="selectedLogStatus.status !== 'TRAINED' || selectedLogStatus.status === 'SIMULATING'" class="btn-blue"
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
      <div v-if="selectedLog" class="parameters-container column">
        <div class="row">
          <h3 class="bold blue">Recommendation Parameters</h3>
          <router-link class="btn-blue margin-left" :to="{ name: 'parameters', params: { logId: selectedLog._id } }" :disabled="!selectedLog">Change parameters</router-link>
          <router-link class="btn-blue margin-left" :to="{ name: 'columns', params: { logId: selectedLog._id } }" :disabled="!selectedLog">Change column types</router-link>
        </div>
        <div v-if="selectedLog.case_completion" class="parameters row">
          <div class="parameter">
            <small class="upper"> Activity EQUAL </small>
            <p> {{ selectedLog.case_completion }}</p>
            <small>Case completion</small>
          </div>
          <div class="positive-outcome column">
            <div class="row">
              <div v-for="(positiveOutcomeGroup, index1) in selectedLog.positive_outcome" :key="index1"
                   class="row align-center">
                <span v-if="index1 > 0">or</span>
                <div class="positive-outcome-group container">
                  <div v-for="(positiveOutcomeItem, index2) in positiveOutcomeGroup" :key="index2"
                       class="row align-center">
                    <span v-if="index2 > 0">and</span>
                    <div class="positive-outcome-group parameter">
                      <small>{{ positiveOutcomeItem.column }} {{ positiveOutcomeItem.operator }}</small>
                      <p>{{ positiveOutcomeItem.value }} {{ positiveOutcomeItem.unit }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          <div v-if="selectedLog.additional_info" class="parameter">
            <small> Treatment Duration </small>
            <p>{{ selectedLog.additional_info.plugin_causallift_resource_allocation.treatment_duration.value }}
              {{ selectedLog.additional_info.plugin_causallift_resource_allocation.treatment_duration.unit }}
            </p>
            <small>Additional Information</small>
          </div>
          <div v-if="selectedLog.additional_info" class="parameter">
            <small> Available Resources </small>
            <p>{{ selectedLog.additional_info.plugin_causallift_resource_allocation.available_resources.join(',') }}</p>
            <small>Additional Information</small>
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
import SideBar from '@/components/SideBarComponent.vue';
import Loading from "@/components/LoadingComponent.vue";
import ModalComponent from "@/components/ModalComponent.vue";
import utils from "@/common/utils";

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
      eventlogs: [],
      selectedLog: null,
      findLogId: null,
      selectedLogStatus: { id: null, status: null },
      lastNotifiedStatus: null,
    };
  },

  mounted() {
    this.getLogs();
    this.startPolling();
  },
  methods: {
    startPolling() {
      this.pollingInterval = setInterval(() => {
        if (this.selectedLog && this.selectedLog._id) {
          this.getProjectStatus();
        }
      }, 3000);
    },

    goToHome() {
      this.$router.push({ name: 'home' });
    },

    getLogs() {
      this.isLoading = true;
      const uploadedLogIds = utils.getLocal('uploadedLogIds') || [];

      if (!uploadedLogIds.length) {
        this.isLoading = false;
        return;
      }

      logsService.getLogs(uploadedLogIds).then(
          (response) => {
            this.eventlogs = response.data.event_logs;

            if (!this.eventlogs.length) {
              utils.setLocal('logId', null);
              this.selectedLog = null;
              this.selectedLogStatus = { id: null, status: null };
              this.isLoading = false;
              return;
            }

            const currentLogId = utils.getLocal('logId') || this.eventlogs[0]._id;

            if (this.eventlogs.find((log) => log._id === currentLogId)) {
              this.selectLog(currentLogId);
            } else {
              console.warn("Log ID not found in loaded event logs:", currentLogId);
              this.selectedLog = null;
            }

            this.isLoading = false;
          },
          (error) => {
            console.error("Error fetching logs:", error);
            this.isLoading = false;
          }
      );
    },

    selectLog(logId) {
      if (!logId) {
        console.warn("No log ID provided to selectLog.");
        return;
      }

      const selected = this.eventlogs.find((log) => log._id === logId);

      if (!selected) {
        console.warn("Log not found in eventlogs for ID:", logId);
        this.selectedLog = null;
        return;
      }

      utils.setLocal('logId', logId, 30); // Save log ID in local storage
      this.selectedLog = selected;
      console.log("Selected Log:", this.selectedLog);

      this.getProjectStatus(true); // Fetch log status
    },

    getProjectStatus(delay = false) {
      let oldLogStatus = this.selectedLogStatus;

      if (delay) this.selectedLogStatus.status = null;

      logsService.getProjectStatus(utils.getLocal('logId')).then(
          (response) => {
            let status = response.data.status;
            let newLogStatus = { id: utils.getLocal('logId'), status: status };
            this.notifyForNewStatus(oldLogStatus, newLogStatus);
            this.selectedLogStatus = newLogStatus;
          },
          (error) => {
            console.error("Error fetching project status:", error);
            this.selectedLogStatus = { id: null, status: 'NULL' };
          }
      );
    },

    notifyForNewStatus(oldLogStatus, newLogStatus) {
      if (oldLogStatus.id !== newLogStatus.id) return;

      if (
          this.lastNotifiedStatus === newLogStatus.status &&
          oldLogStatus.status === newLogStatus.status
      ) {
        return;
      }

      this.lastNotifiedStatus = newLogStatus.status;

      if (oldLogStatus.status === 'TRAINED' && newLogStatus.status === 'SIMULATING') {
        this.$notify({
          title: 'Success',
          text: `Successfully started simulating log ${utils.getLocal('logId')}`,
          type: 'success',
        });
      }
    },


    findLog() {
      if (!this.findLogId?.trim()) {
        console.warn("Log ID cannot be empty.");
        return;
      }

      logsService.getLog(this.findLogId.trim()).then(
          (response) => {
            const foundLog = response.data.event_log;

            if (!foundLog) {
              console.warn("No log found with ID:", this.findLogId.trim());
              return;
            }

            if (!this.eventlogs.find((log) => log._id === foundLog._id)) {
              this.eventlogs.push(foundLog);
            }

            this.selectLog(foundLog._id);
          },
          (error) => {
            console.error("Error finding log:", error);
          }
      );
    },

    closeModal() {
      this.openModal = false;
    },

    startSimulation() {
      logsService.startSimulation(utils.getLocal('logId')).then(
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
      logsService.stopSimulation(utils.getLocal('logId')).then(
          (response) => {
            console.log(response.data.message.message);
            this.$notify({
              title: 'Success',
              text: `Successfully stopped simulating log ${utils.getLocal('logId')}`,
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
      logsService.clearSimulation(utils.getLocal('logId')).then(
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

      logsService.deleteLog(utils.getLocal('logId')).then(
          (response) => {
            this.$notify({
              title: 'Success',
              text: response.data.message,
              type: 'success'
            });
            utils.removeLocal(`casesListClickedRows${utils.getLocal('logId')}`);
            utils.removeLocal('logId');
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
      logsService.getStaticResults(utils.getLocal('logId')).then(
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

  },
};
</script>