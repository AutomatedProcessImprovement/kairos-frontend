<template>
    <div id="log-columns">
        <loading v-if="isLoading"></loading>
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
                                    <option v-for="type in typeList" :key="type" :selected="types[head] == type.type" :value="type.type" :disabled="type.disabled"> {{type.text}} </option>
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
                {type: undefined, text: "Choose a type", disabled: true},
                {type: 'CASE_ID', text: 'Case id', disabled: false},
                {type: 'TEXT', text: 'Text', disabled: false},
                {type: 'NUMBER', text: 'Number', disabled: false},
                {type: 'BOOLEAN', text: 'Bollean', disabled: false},
                {type: 'DATETIME', text: 'Datetime', disabled: false},
                {type: 'TRANSITION', text: 'Transition', disabled: false},
                {type: 'ACTIVITY', text: 'Activity', disabled: false},
                {type: 'RESOURCE', text: 'Resource', disabled: false},
                {type: 'TIMESTAMP', text: 'Timestamp', disabled: false},
                {type: 'START_TIMESTAMP', text: 'Start time', disabled: false},
                {type: 'END_TIMESTAMP', text: 'End time', disabled: false},
                {type: 'DURATION', text: 'Duration', disabled: false},
                {type: 'COST', text: 'Cost', disabled: false},
                {type: 'CASE_ATTRIBUTE', text: 'Case attribute', disabled: false},
                {type: 'EVENT_ATTRIBUTE', text: 'Event attribute', disabled: false},
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
