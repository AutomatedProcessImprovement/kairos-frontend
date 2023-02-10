<template>
    <div id="log-columns">
        <loading v-if="isLoading" text="getting supported parameters..."></loading>
        <div v-else class="column">
            <div class="row">
                <h2 class="bold blue">Column definition</h2>
                <tooltip-component>
                    <template v-slot:icon>
                        <ion-icon class="blue" name="information-circle"></ion-icon>
                    </template>
                    <template v-slot:title>
                        <h3 class="bold">Column definition info</h3>
                    </template>
                    <template v-slot:content>
                        <div v-for="t in typeList" :key="t" class="sub-content">
                            <h4 class="bold">{{ t.text }}</h4>
                            <p>: {{ t.definition }}</p>
                        </div>
                    </template>
                </tooltip-component>
            </div>

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
                                    <option v-for="myType in typeList" :key="myType" :selected="types[head] == myType.type" :value="myType.type"> {{myType.text}} </option>
                                </select>
                            </th>
                        </tr>
                        <tr>
                            <th v-for="head in headers" :key="head">
                                <button @click="toggleCaseAttribute(head)" class="btn-blue" :class="{selected: caseAttributes.indexOf(head) >= 0}">Case attribute</button>
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
                    <button class="btn-blue" v-on:click="submit">Upload log</button>
                    <button class="btn-blue" v-on:click="goToHome">Cancel</button>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import Loading from "@/components/LoadingComponent.vue";
import Service from "@/services/service.js"
import TooltipComponent from "@/components/TooltipComponent.vue";

export default {
    name: "ColumnsDefinitionPage",

    components: {
        Loading,
        TooltipComponent,
    },

    data () {
        return {
            typeList: [
                {type: 'CASE_ID', text: 'Case id',definition:'Identifier associated with each trace. At least one column with given type should be defined.'},
                {type: 'TEXT', text: 'Text',definition:'Textual information.'},
                {type: 'NUMBER', text: 'Number',definition:'Numerical information.'},
                {type: 'BOOLEAN', text: 'Boolean',definition:'True or false.'},
                {type: 'DATETIME', text: 'Datetime',definition:'Time information.'},
                {type: 'TRANSITION', text: 'Transition',definition:'Not sure'},
                {type: 'ACTIVITY', text: 'Activity',definition:'Name of the activity carried out during the event. At least one column with given type should be defined.'},
                {type: 'RESOURCE', text: 'Resource',definition:'The resource that carried out the event.'},
                {type: 'TIMESTAMP', text: 'Timestamp',definition:'Date and time of the event execution. At least one column with given type should be specified.'},
                {type: 'START_TIMESTAMP', text: 'Start time',definition:'Date and time at which the event started. If defined, the user must also define "End time".'},
                {type: 'END_TIMESTAMP', text: 'End time',definition:'Date and time at which the event ended. If defined, the user must also define "Start time".'},
                {type: 'DURATION', text: 'Duration',definition:'Duration of the trace or corresponding event.'},
                {type: 'COST', text: 'Cost',definition:'Cost associated with the trace or corresponding event.'},
            ],
            headers: [],
            types: {},
            values: [],
            caseAttributes: [],
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
                for (let i = 0; i < this.headers.length; i++) {
                    this.types[this.headers[i]] = types[i];                    
                }
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
            let alarm = false;
            Object.values(this.types).forEach(value => {  
                if (!value){
                    alarm = true;
                    return;
                }
            })
            if (alarm){
                alert("Please define all columns!");
                return;
            }
            
            this.isLoading = true;

            var data = {
                "types": this.types,
                "case_attributes": this.caseAttributes
            }

            Service.updateTypes(localStorage.fileId,data)
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

        toggleCaseAttribute(head){
            var ind = this.caseAttributes.indexOf(head);
            if (ind < 0){
                this.caseAttributes.push(head);  
                return;
            }
            this.caseAttributes.splice(ind,1);
        },

        goToHome(){
            this.$router.push({name: 'home'});
        }
    },
}
</script>
