<template>
  <div id="home">
      <h2>Home</h2>
      <div class="center column ">
        <loading v-if="isLoading"></loading>
        <h3>Select file to upload (.csv or .xes):</h3>
        <div class="custom-file">
            <input class="custom-file-input" type="file" name="fileToUpload" ref="file" id="fileToUpload" v-on:change="handleFileUpload()" />
            <!-- <label class="custom-file-label" for="fileToUpload">{{file.name}}</label> -->
        </div>
        <div v-if="extension == 'csv'">
            <span>Separator for .csv:</span>
            <span  class="center">
                <input type="text" v-model="delimiter" ref="delimiter" minlength="1" maxlength="1" size="1" v-on:change="handleSeparator()" required />
            </span>
          </div>
        <div class="center">
            <td><input type="button" value="Upload" name="submit" @click.self="isLoading = true;" v-on:click="submit" class="btn btn-success"/></td>
        </div>
        
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
        },

        submit() {
            this.isLoading = true;
            let formData = new FormData();

            formData.append('file', this.file);

            Service.uploadFile(formData)
            .then(response => {
              this.isLoading = false;
              console.log(response.data.fileId);
              this.$router.push({name: this.extension, params: {
                                                              fileId: response.data.fileId,
                                                              delimiter: this.delimiter
                                                          }});
            })
            .catch(error => {
              const resMessage =
                (error.response &&
                  error.response.data &&
                  error.response.data.message) ||
                error.message ||
                error.toString();
                console.log(resMessage)
            });
            
        }
    }
}
</script>

<style>

</style>