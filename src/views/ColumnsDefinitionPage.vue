<template>
    <div id="log-columns">
        <loading v-if="isLoading" :text="loadingText"></loading>
        <div v-else class="column">
            <div class="row">
                <h2 class="bold blue">Column definition</h2>
                <tooltip-component icon="information-circle" :iconSize="25" color="blue">
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
            <div v-else class="log-table">
                <table>
                    <thead>
                        <tr>
                            <th v-for="head in headers" :key="head">
                                {{head}}
                            </th>
                        </tr>
                        <tr>
                            <th v-for="head in headers" :key="head">
                                <div class="column">
                                    <select class="dropdown" v-model="types[head]" required>
                                        <option v-for="myType in typeList" :key="myType" :selected="types[head] == myType.type" :value="myType.type"> {{myType.text}} </option>
                                    </select>
                                    <select class="dropdown cost-unit" :class="{active: types[head] === 'COST'}" v-model="costUnits[head]" required>
                                        <option v-for="currency in currencies" :key="currency" > {{currency}} </option>
                                    </select>
                                </div>
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
import logsService from "@/services/logs.service";
import TooltipComponent from "@/components/TooltipComponent.vue";
import shared from "@/services/shared";

export default {
    name: "ColumnsDefinitionPage",

    components: {
        Loading,
        TooltipComponent,
    },

    data () {
        return {
            isLoading: false,
            loadingText: "Please wait...",

            currencies: ['AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BIF','BMD','BND','BOB','BRL','BSD','BWP','BZD','CAD','CDF','CHF','CLP','CNY','COP','CRC','CVE','CZK','DJF','DKK','DOP','DZD','EGP','ETB','EUR','FJD','FKP','GBP','GEL','GIP','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS','INR','ISK','JMD','JPY','KES','KGS','KHR','KMF','KRW','KYD','KZT','LAK','LBP','LKR','LRD','LSL','MAD','MDL','MGA','MKD','MNT','MOP','MRO','MUR','MVR','MWK','MXN','MYR','MZN','NAD','NGN','NIO','NOK','NPR','NZD','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SEK','SGD','SHP','SLL','SOS','SRD','STD','SVC','SZL','THB','TJS','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','UYU','UZS','VND','VUV','WST','XAF','XCD','XOF','XPF','YER','ZAR','ZMW'],
            typeList: [
                {type: 'CASE_ID', text: 'Case id',definition:'Identifier associated with each trace. At least one column with given type should be defined.'},
                {type: 'TEXT', text: 'Text',definition:'Textual information.'},
                {type: 'NUMBER', text: 'Number',definition:'Numerical information.'},
                {type: 'BOOLEAN', text: 'Boolean',definition:'True or false.'},
                {type: 'DATETIME', text: 'Datetime',definition:'Time information.'},
                {type: 'TRANSITION', text: 'Transition',definition:'An indication of the status of an activity instance. Possible values are start, complete, schedule, suspend, resume, etc.'},
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
            costUnits: {},
            values: [],
            caseAttributes: [],
        }
    },

    mounted() {
        if(shared.getLocal('logId')) this.loadCols();
    },

    methods: {
        loadCols() {
            this.isLoading = true;

            let logId = shared.getLocal('logId');
 
            logsService.getLog(logId)
            .then(response => {
                let log = response.data.event_log;
                this.headers = log.columns_header;
                this.types = log.columns_definition;
                this.costUnits = log.cost_units ?? {};
                for (const r of log.columns_data) {
                    this.values.push(r)
                }
                this.isLoading = false;
            })
            .catch(error => {
                this.isLoading = false;
                const resMessage =
                (error.response && error.response.data && error.response.data.error) ||
                error.message || error.toString();
                this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    })
            });
        },
        submit() {

            Object.values(this.types).forEach(value => {  
                if (!value){
                    this.$notify({
                        title: 'Warning',
                        text: 'Please define all the columns!',
                        type: 'warning'
                    })
                    return;
                }
            })

            this.loadingText = "Getting supported parameters...";
            this.isLoading = true;

            var data = {
                "columns_definition": this.types,
                "cost_units": this.costUnits,
                "case_attributes": this.caseAttributes
            }

            logsService.defineColumnTypes(shared.getLocal('logId'),data)
            .then(response => {
                console.log(response.data)
                this.isLoading = false;
                this.$router.push({name: 'parameters'})
            })
            .catch(error => {
                this.isLoading = false;
                const resMessage =
                (error.response && error.response.data && error.response.data.error) ||
                error.message || error.toString();
                this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    })
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
