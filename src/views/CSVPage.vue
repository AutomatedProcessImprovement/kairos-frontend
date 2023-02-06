<template>
    <div id="csv">
        <loading v-if="isLoading"></loading>
        <div v-else class="column">

            <h2 class="bold-blue">Column definition</h2>
            <div v-if="values.length === 0">
                <h3 class="warning">Please upload a log first.</h3>
            </div>
            <div v-else class="csv-table shadow">
                <table>
                    <thead>
                        <tr>
                            <th v-for="head in header" :key="head">
                                {{head}}
                            </th>
                        </tr>
                        <tr>
                            <th v-for="head in header" :key="head">
                                <select class="dropdown" v-model="types[head]" required>
                                    <option v-for="type in typeList" :key="type" :value="type.type" :disabled="type.disabled"> {{type.text}} </option>
                                </select>
                            </th>
                        </tr>
    
                    </thead>
    
                    <tbody>
                    <tr v-for="row in values" :key="row">
                        <td v-for="cell in row" :key="cell">{{cell}}</td>
                    </tr>
                    </tbody>
                </table>
                <div class="buttons">
                    <button class="btn" v-on:click="submit">Upload log</button>
                    <button class="btn" v-on:click="goToHome">Cancel</button>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import Loading from "@/components/LoadingComponent.vue";
import Service from "@/services/service.js"

export default {
    name: "CSVPage",

    components: {
        Loading,
    },

    data () {
        return {
            typeList: [
                {type: undefined, text: "Choose a type", disabled: true},
                {type: 'case_id', text: 'Case id', disabled: false},
                {type: 'activity', text: 'Activity', disabled: false},
                {type: 'start_time', text: 'Start time', disabled: false},
                {type: 'end_time', text: 'End time', disabled: false},
                {type: 'timestamp', text: 'Timestamp', disabled: false},
                {type: 'resource', text: 'Resource', disabled: false},
                {type: 'case_attribute', text: 'Case attribute', disabled: false},
                {type: 'event_attribute', text: 'Event attribute', disabled: false}],
            header: [],
            types: {},
            values: [],
            dateFormat: '',
            isLoading: true,
        }
    },

    created() {
        this.loadCols();
    },

    methods: {
        loadCols() {
            let fileId = localStorage.fileId;
 
            Service.parseFile(fileId)
            .then(response => {
                this.header = response.data.header;
                this.header.forEach((head) => {
                    this.types[head] = null;
                })
                console.log(this.types);
                for (const r of response.data.rows) {
                    // for (const v of r) {
                    //     this.values.push(v)
                    // }
                    this.values.push(r)
                }
                this.isLoading = false;
            })
            .catch(error => {
              const resMessage =
                (error.response && error.response.data && error.response.data.message) ||
                error.message || error.toString();
                console.log(resMessage)
                this.isLoading = false;
            });
        },
        submit() {
            Service.updateTypes(localStorage.fileId,this.types)
            .then(response => {
                console.log(response)
                this.isLoading = false;
                this.$router.push({name: 'parameters'})
            })
            .catch(error => {
              const resMessage =
                (error.response && error.response.data && error.response.data.message) ||
                error.message || error.toString();
                console.log(resMessage)
            });

        },
        goToHome(){
            this.$router.push({name: 'home'});
        }
    },
}
</script>
