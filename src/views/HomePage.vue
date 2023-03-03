<template>
  <div id="home">
      <h1>Kairos</h1>
      <small>Kairos is a tool that visualises prescriptive process monitoring output.</small>
      <div class="upload-file">
        <loading v-if="isLoading" text="preprocessing data..."></loading>
        <h2>Upload</h2>
        <p>Upload an eventlog to start:</p>
        <small>Supported file types: .csv, .xes, .zip. (Please make sure to indicate file type in the file name when uploading .zip)</small>
        
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
import Service from "@/services/service.js"

export default {
    name: "HomePage",
    data: function () {
        return {
            file: '',
            extension: '',
            delimiter: ',',
            isLoading: false,
            isDisabled: true
        }
    },

    components: {
        Loading,
    },

    methods: {
        handleSeparator(){
            this.delimiter = this.$refs.delimiter.value;
        },
        handleFileUpload(){
            this.file = this.$refs.file.files[0];
            this.extension = this.file.name.split('.').pop();
            if(this.extension === 'zip'){
                this.extension = this.file.name.toLowerCase().indexOf('csv') < 0 ? 'xes' : 'csv';
            }
            this.isDisabled = false;
        },

        submit() {
            this.isLoading = true;
            let formData = new FormData();

            formData.append('file', this.file);
            formData.append('delimiter',this.delimiter);
            Service.uploadFile(formData)
            .then(response => {
              this.isLoading = false;
              localStorage.fileId = response.data.fileId;
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