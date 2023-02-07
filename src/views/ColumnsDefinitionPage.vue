<template>
    <div id="log-columns">
        <loading v-if="isLoading" text="getting supported parameters..."></loading>
        <div v-else class="column">

            <h2 class="bold-blue">Column definition</h2>
            <div v-if="values.length === 0">
                <h3 class="warning">Please upload a log first.</h3>
            </div>
            <div v-else class="log-table shadow">
                <table>
                    <thead>
                        <tr>
                            <th v-for="head in headers" :key="head">
                                {{head}}
                            </th>
                        </tr>
                        <tr>
                            <th v-for="head in headers" :key="head">
                                <select class="dropdown" v-model="types[head]" required>
                                    <option v-for="type in typeList" :key="type" :selected="types[head] == type.type" :value="type.type"> {{type.text}} </option>
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
    name: "ColumnsDefinitionPage",

    components: {
        Loading,
    },

    data () {
        return {
            typeList: [
                {type: 'CASE_ID', text: 'Case id'},
                {type: 'TEXT', text: 'Text'},
                {type: 'NUMBER', text: 'Number'},
                {type: 'BOOLEAN', text: 'Boolean'},
                {type: 'DATETIME', text: 'Datetime'},
                {type: 'TRANSITION', text: 'Transition'},
                {type: 'ACTIVITY', text: 'Activity'},
                {type: 'RESOURCE', text: 'Resource'},
                {type: 'TIMESTAMP', text: 'Timestamp'},
                {type: 'START_TIMESTAMP', text: 'Start time'},
                {type: 'END_TIMESTAMP', text: 'End time'},
                {type: 'DURATION', text: 'Duration'},
                {type: 'COST', text: 'Cost'},
                // {type: 'CASE_ATTRIBUTE', text: 'Case attribute'},
                // {type: 'EVENT_ATTRIBUTE', text: 'Event attribute'},
            ],
            headers: [],
            types: {},
            values: [],
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
                this.headers = response.data.header;
                let types = response.data.types;
                console.log(response.data.types);
                console.log(types);
                for (let i = 0; i < this.headers.length; i++) {
                    this.types[this.headers[i]] = types[i];                    
                }
                console.log(this.types);
                for (const r of response.data.rows) {
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
