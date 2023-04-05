<template>
  <div id="home">
      <h1>Kairos</h1>
      <small>Kairos is a tool that visualises prescriptive process monitoring output.</small>
      <div class="upload-file">
        <loading v-if="isLoading" text="Preprocessing data..."></loading>
        <h2>Upload</h2>
        <div class="row">
            <p>Upload an eventlog to start: </p>
                <tooltip-component :iconSize="15" :tooltipSize="400">  
                    <template v-slot:title>
                        <h3 class="bold">Uploading info</h3>
                    </template>
                    <template v-slot:content>
                        <p>The user may upload two event logs.</p>
                        <p>If the test set is not uploaded then the first event log is split into train (80%) and test sets (20%). The sets are used for training and streaming the prescription results respectively.</p>
                        <p>If the test set is uploaded, then the first event log is used for training and the test set is used for producing all prescriptions at once. Please note that in this case streaming is not enabled.</p>
                    </template>
                </tooltip-component>
            </div>
        <small>Supported file types: .csv, .xes and .zip. (max file size: 100 MiB)</small>
        
        <input class='btn' type="file" name="fileToUpload" ref="trainLog" v-on:change="handleFileUpload(true)" />
        <p>Upload test set? <toggle v-model="uploadTestSet"/></p>
            
        <input v-if="uploadTestSet" class='btn' type="file" name="fileToUpload" ref="testLog" v-on:change="handleFileUpload(false)" />

        <div v-if="extension == 'csv'">
            <span>Separator for .csv: </span>
            <span  class="center">
                <input class="input-text" type="text" v-model="delimiter" ref="delimiter" minlength="1" maxlength="1" size="1" v-on:change="handleSeparator()" required />
            </span>
        </div>
        
        <input class='submit-btn' type="button" value="Upload" name="submit" v-on:click="submit" :disabled="isDisabled"/>
        
    </div>
  </div>
</template>

<script>
import Loading from "@/components/LoadingComponent.vue";
import logsService from "@/services/logs.service";
import Toggle from '@vueform/toggle'
import TooltipComponent from "@/components/TooltipComponent.vue";

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
        handleSeparator(){
            this.delimiter = this.$refs.delimiter.value;
        },
        handleFileUpload(train){
            var file = null;
            if(train){
                this.trainLog = this.$refs.trainLog.files[0];
                file = this.trainLog;
            } else{
                this.testLog = this.$refs.testLog.files[0];
                file = this.testLog;
            }
            this.validateFileUpload(file);
        },

        validateFileUpload(file){
            if(!file) {
                this.isDisabled = true;
                return;
            }
            let fileSize = file.size/ 1024 / 1024; // in MiB
            this.extension = file.name.split('.').pop();
            if(this.extension !== 'xes' && this.extension !== 'csv' && this.extension !== 'zip'){
                this.isDisabled = true;
                this.$notify({
                        title: 'Warning',
                        text: 'The uploaded file should be a .csv, .xes. or .zip',
                        type: 'warning'
                    });
                return;
            }
            if (fileSize > 100){
                this.isDisabled = true;
                this.$notify({
                    title: 'Warning',
                    text: 'File size should be less than 100 MiB.',
                    type: 'warning'
                })
                return;
            }
            if(this.trainLog) this.isDisabled = false;
        },

        submit() {
            if(this.trainLog === null){
                this.$notify({
                        title: 'Warning',
                        text: 'Please upload the main log.',
                        type: 'error'
                    }) 
            }
            this.isLoading = true;
            var formData = new FormData();

            formData.append('file', this.trainLog);
            if(this.testLog){
                formData.append('test',this.testLog);
            }
            formData.append('delimiter',this.delimiter);

            logsService.uploadLog(formData)
            .then(response => {
              this.isLoading = false;
              localStorage.logId = response.data.logId;
              this.$router.push({name: "columns"});
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
            
        }
    }
}
</script>

<style>

</style>