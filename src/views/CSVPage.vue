<template>
    <div>
        <loading v-if="isLoading"></loading>
        <div>
            <table class="table is-striped">
                <thead>
                    <tr class="bg-dark">
                        <th class="has-text-center text-white" v-for="head in headers" :key="head">
                            {{head}}
                        </th>
                    </tr>
                    <tr class="table-success">
                        <th class="text-center" v-for="head in headers" :key="head">
                            <select class="form-control" v-model="types[head]" required>
                                <option v-for="type in typeList" :key="type" :value="type.type" :selected="type.type == types[head]" :disabled="type.disabled"> {{type.text}} </option>
                            </select>
                        </th>
                    </tr>
                    <tr class="table-success">
                        <th class="text-center" v-for="head in headers" :key="head">
                            <input v-if="types[head] == 'timestamp'" placeholder="Date format" class="form-control" type="text" ref="dateFormat" v-model="dateFormat" required />
                        </th>
                    </tr>
                </thead>

                <tbody>
                <tr v-for="row in values" :key="row">
                    <td v-for="cell in row" :key="cell">{{cell}}</td>
                </tr>
                </tbody>
            </table>
        </div>

        <div class="btn">
            <p><input class="btn btn-success" @click.self="isLoading = true;" type="submit" value="Continue" name="submit" v-on:click="submit" /></p>
        </div>
    </div>
</template>

<script>
import Loading from "@/components/LoadingComponent.vue";
import Service from "@/services/service.js"

export default {
    name: "CSVPage",
    data: function () {
        return {
            typeList: [
                {type: undefined, text: "Choose a type", disabled: true},
                {type: 'caseId', text: 'case id', disabled: false},
                {type: 'activity', text: 'activity', disabled: false},
                {type: 'timestamp', text: 'timestamp', disabled: false},
                {type: 'resource', text: 'resource', disabled: false},
                {type: 'case_attribute', text: 'case attribute', disabled: false},
                {type: 'event_attribute', text: 'event attribute', disabled: false}],
            headers: [],
            types: [],
            values: [],
            fileId: '',
            delimiter: '',
            dateFormat: '',
            isLoading: true,
        }
    },

    components: {
        Loading,
    },

    params: {
          fileId:{
              type: String
          },
          delimiter: {
            type: String
          }
      },
    watch:{
        fileId: function(){
            this.loadCols();
          }
    },

    methods: {
        loadCols() {
            let formData = new FormData();

            formData.append('delimiter', this.delimiter);
            console.log(this.fileId)
            Service.parseFile(this.fileId,formData)
            .then(response => {
                this.headers = response.data.headers;
                this.headers.forEach((head) => {
                    this.types[head] = null;
                })
                this.values = response.data.rows;
                console.log(response.data)

                this.isLoading = false;
            })
            .catch(error => {
              const resMessage =
                (error.response && error.response.data && error.response.data.message) ||
                error.message || error.toString();
                console.log(resMessage)
            });
        },
        submit() {
            let formData = new FormData();
            formData.append('types', JSON.stringify(this.types));
            formData.append('dateFormat', this.dateFormat);
            Service.updateTypes(this.fileId,formData)
            .then(response => {
                console.log(response)
                this.isLoading = false;
                localStorage.fileId = this.fileId;
                this.$router.push({name: 'cases'})
            })
            .catch(error => {
              const resMessage =
                (error.response && error.response.data && error.response.data.message) ||
                error.message || error.toString();
                console.log(resMessage)
            });

        }
    },
}
</script>
