<template>
    <div id="home">
        <h1 class="pointer" @click="goToHome">Kairos</h1>
        <small>Kairos is a tool that visualises prescriptive process monitoring output.</small>
        <button class="btn-blue margin-top" @click="gotToDashboard">Go to dashboard</button>
        <div class="upload-file">
            <loading v-if="isLoading" text="Preprocessing data..."></loading>
            <h2>Upload</h2>
            <div class="row align-center">
                <p>Upload an event log to start </p>
                <tooltip-component :iconSize="15" :tooltipSize="500">
                    <template v-slot:title>
                        <h3 class="bold">Upload Info</h3>
                    </template>
                    <template v-slot:content>
                        <p>Please choose if you want to upload an event log with a test set or without a test set. </p>
                        <p>In the first option, please upload two event logs: one that will be used as a train set, and the
                            other that will be used as a test set. In this case, the streaming is not enabled and all
                            prescriptions are produced at once.</p>

                        <p>In the second option, the single event log you upload will be split into train (80%) and test
                            sets (20%). The sets will be used for training and streaming the prescription results,
                            respectively.</p>
                    </template>
                </tooltip-component>
            </div>
            <small>Supported file types: .csv, .xes and .zip. (max file size: 100 MiB)</small>

            <input class='btn' type="file" name="fileToUpload" ref="trainLog" v-on:change="handleFileUpload(true)" />
            <p>Upload test set?
                <toggle v-model="uploadTestSet" />
            </p>

            <input v-if="uploadTestSet" class='btn' type="file" name="fileToUpload" ref="testLog"
                v-on:change="handleFileUpload(false)" />

            <div v-if="extension == 'csv'">
                <span>Separator for .csv: </span>
                <span class="align-center">
                    <input class="input-text" type="text" v-model="delimiter" ref="delimiter" minlength="1" maxlength="1"
                        size="1" v-on:change="handleSeparator()" required />
                </span>
            </div>

            <input class='submit-btn' type="button" value="Upload" name="submit" v-on:click="submit"
                :disabled="isDisabled" />

        </div>
    </div>
</template>

<script>
import Loading from "@/components/LoadingComponent.vue";
import logsService from "@/services/logs.service";
import Toggle from '@vueform/toggle'
import TooltipComponent from "@/components/TooltipComponent.vue";
import utils from "@/common/utils";

export default {
    name: "HomePage",
    components: {
        Loading,
        Toggle,
        TooltipComponent
    },
    data: function () {
        return {
            trainLog: '',
            testLog: '',
            uploadTestSet: false,
            extension: '',
            delimiter: ',',
            isLoading: false,
            isDisabled: true
        }
    },
    methods: {
        handleSeparator() {
            this.delimiter = this.$refs.delimiter.value;
        },
        handleFileUpload(train) {
            var file = null;
            if (train) {
                this.trainLog = this.$refs.trainLog.files[0];
                file = this.trainLog;
            } else {
                this.testLog = this.$refs.testLog.files[0];
                file = this.testLog;
            }
            this.validateFileUpload(file);
        },

        validateFileUpload(file) {
            if (!file) {
                this.isDisabled = true;
                return;
            }
            let fileSize = file.size / 1024 / 1024; // in MiB
            this.extension = file.name.split('.').pop();
            if (this.extension !== 'xes' && this.extension !== 'csv' && this.extension !== 'zip') {
                this.isDisabled = true;
                this.$notify({
                    title: 'Warning',
                    text: 'The uploaded file should be a .csv, .xes. or .zip',
                    type: 'warning'
                });
                return;
            }
            if (fileSize > 100) {
                this.isDisabled = true;
                this.$notify({
                    title: 'Warning',
                    text: 'File size should be less than 100 MiB.',
                    type: 'warning'
                })
                return;
            }
            if (this.trainLog) this.isDisabled = false;
        },

        submit() {
            if (this.trainLog === null) {
                this.$notify({
                    title: 'Warning',
                    text: 'Please upload the main log.',
                    type: 'error'
                })
            }
            this.isLoading = true;
            var formData = new FormData();

            formData.append('file', this.trainLog);
            if (this.testLog) {
                formData.append('test', this.testLog);
            }
            formData.append('delimiter', this.delimiter);

            logsService.uploadLog(formData)
                .then(response => {
                    this.isLoading = false;
                    utils.setLocal('logId', response.data.logId, 10);
                    this.$router.push({ name: "columns" });
                })
                .catch(error => {
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
                        type: 'error',
                        duration: 6000
                    })
                });

        },

        goToHome() {
            this.$router.push({ name: 'home' });
        },

        gotToDashboard() {
            this.$router.push({ name: 'dashboard' });
        },
    }
}
</script>

<style></style>