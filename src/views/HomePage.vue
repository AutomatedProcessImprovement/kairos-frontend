<template>
  <div id="home">
      <h1>Kairos</h1>
      <small>Kairos is a tool that visualises prescriptive process monitoring output.</small>
      <div class="upload-file">
        <loading v-if="isLoading" text="preprocessing data..."></loading>
        <h2>Upload</h2>
        <p>Upload an eventlog to start:</p>
        <small>Supported file types: .csv and .xes</small>
        <small>Max file size: 100 MiB.</small>
        
        <input class='btn' type="file" name="fileToUpload" ref="file" id="fileToUpload" v-on:change="handleFileUpload()" />

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

export default {
    name: "HomePage",
    components: {
        Loading,
    },
    data: function () {
        return {
            file: '',
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
        handleFileUpload(){
            this.file = this.$refs.file.files[0];
            let fileSize = this.file.size/ 1024 / 1024; // in MiB
            if (fileSize > 100){
                this.$notify({
                        title: 'Warning',
                        text: 'File size should be less than 100 MiB.',
                        type: 'warning'
                    })
                return;
            }
            this.extension = this.file.name.split('.').pop();
            if(this.extension !== 'xes' && this.extension !== 'csv' && this.extension !== 'zip'){
                this.$notify({
                        title: 'Warning',
                        text: 'The uploaded file should be a .csv, .xes. or .zip',
                        type: 'warning'
                    });
                return;
            }
            if (fileSize > 100){
                this.$notify({
                        title: 'Warning',
                        text: 'File size should be less than 100 MiB.',
                        type: 'warning'
                    })
                return;
            }
            this.isDisabled = false;
        },

        submit() {
            this.isLoading = true;
            let formData = new FormData();

            formData.append('file', this.file);
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
                    error.response.data.message) ||
                    error.message ||
                    error.toString();
                    this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    })
            });
            
        }
    }
}
</script>

<style>

</style>