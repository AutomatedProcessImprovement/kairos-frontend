<template>
    <div id="parameters">
        <loading v-if="isLoading" text="creating project..."></loading>
        <div v-else class="column">
            <a @click="$router.go(-1)"><ion-icon name="chevron-back-outline"></ion-icon> Return</a>
            <h2 class="bold blue">Recommendation Parameters</h2>
            <div v-if="!log">
                <h3 class="warning">No log has been selected.</h3>
            </div>
            <div class="column" v-else>
                <div class="parameter">
                    <p>Uploaded log</p>
                    <div class='log-card'>
                        <h4>{{ log.filename }}</h4>
                        <small>{{ log.datetime }}</small>
                    </div>
                </div>

                <div class="parameter">
                    <p>Case completion</p>
                    <small>Please specify what activity marks the case completion.</small>
                    <select v-model="caseCompletion">
                        <option v-for="activity in activities" :key="activity">{{ activity }}</option>
                    </select>
                </div>

                <div class="parameter">
                    <p>Positive case outcome</p>
                    <small>Please specify what is considered as the positive outcome of the case.</small>

                    <div class="input-group">
                        <small>Outcome type</small>
                        <select v-model="positiveOutcome.column">
                            <option v-for="outcomeType in positiveOutcomeTypes" :key="outcomeType" :value="outcomeType">{{ outcomeType }}</option>
                        </select>
                    </div>

                    <div class="input-group">
                        <small>Outcome evaluation method</small>
                        <select v-if="positiveOutcome.column" v-model="positiveOutcome.operator">
                            <option v-for="evaluationMethod in getEvaluationMethods(positiveOutcome.column,'outcome')" :key="evaluationMethod">{{ evaluationMethod }}</option>
                        </select>
                        <select v-else disabled></select>
                    </div>

                    <div class="input-group">
                        <small>Outcome value</small>
                        <select v-if="positiveOutcome.columnDefinition === 'ACTIVITY'" v-model="positiveOutcome.value">
                            <option v-for="activity in activities" :key="activity">{{ activity }}</option>
                        </select>
                        <span v-else-if="positiveOutcome.columnDefinition === 'BOOLEAN'"></span>
                        <input v-else-if="positiveOutcome.columnDefinition" :type="getInputType(positiveOutcome.columnDefinition)" v-model="positiveOutcome.value"/>
                        <select v-else disabled></select>
                    </div>
                </div>

                <div class="parameter">
                    <p>Intervention</p>
                    <small>Please specify what is considered as intervention in the ongoing case.</small>
                    <div class="input-group">
                        <small>Intervention type</small>
                        <select v-model="intervention.column">
                            <option v-for="outcomeType in interventionTypes" :key="outcomeType" :value="outcomeType">{{ outcomeType }}</option>
                        </select>
                    </div>

                    <div class="input-group">
                        <small>Intervention evaluation method</small>
                        <select v-if="intervention.column" v-model="intervention.operator">
                            <option v-for="evaluationMethod in getEvaluationMethods(intervention.column,'intervention')" :key="evaluationMethod">{{ evaluationMethod }}</option>
                        </select>
                        <select v-else disabled></select>
                    </div>

                    <div class="input-group">
                        <small>Intervention value</small>
                        <select v-if="intervention.columnDefinition === 'ACTIVITY'" v-model="intervention.value">
                            <option v-for="activity in activities" :key="activity">{{ activity }}</option>
                        </select>
                        <span v-else-if="intervention.columnDefinition === 'BOOLEAN'"></span>
                        <input v-else-if="intervention.columnDefinition" :type="getInputType(intervention.columnDefinition)" v-model="intervention.value"/>
                        <select v-else disabled></select>
                    </div>
                </div>
                

                <div class="parameter">
                    <p>Alarm Threshold</p>
                    <small>Please specify when an alarm should be triggered. Enter a value between 0.1 and 0.9.</small>
                    <input type="number" v-model="alarmThreshold"/>
                </div>

                <button type="submit" class="btn-blue" @click="submit">Submit</button>
            </div>
        </div>


    </div>
</template>


<script>
import Loading from "@/components/LoadingComponent.vue";
import  Service from "@/services/service.js"

export  default {
    name: "ParametersPage",

    components: {
        Loading,
    },

    data () {
        return {
            isLoading: false,

            log: null,
            activities: null,
            columnsDefinition: null,

            caseCompletion: null,

            positiveOutcomeTypes: null,
            positiveOutcome: {},
            
            interventionTypes: null,
            intervention: {},
            
            alarmThreshold: null,

            evaluationMethods: {
                'TEXT': {operators:['equal','not equal','contains','not contains'],inputType:'text'},
                'NUMBER': {operators:['equal','not equal','greater than','less than','greater than or equal','less than or equal'],inputType:'number'},
                'BOOLEAN': {operators:['is true','is false'],inputType:'boolean'},
                'DATETIME': {operators:['equal','not equal','later than','earlier than','later than or equal','earlier than or equal'],inputType:'datetime-local'},
                'ACTIVITY': {operators:['equal','not equal','contains','not contains'],inputType:'activity'},
                'RESOURCE': {operators:['equal','not equal','contains','not contains'],inputType:'text'},
                'TIMESTAMP': {operators:['equal','not equal','later than','earlier than','later than or equal','earlier than or equal'],inputType:'datetime-local'},
                'START_TIMESTAMP': {operators:['equal','not equal','later than','earlier than','later than or equal','earlier than or equal'],inputType:'datetime-local'},
                'END_TIMESTAMP': {operators:['equal','not equal','later than','earlier than','later than or equal','earlier than or equal'],inputType:'datetime-local'},
                'DURATION': {operators:['equal','not equal','greater than','less than','greater than or equal','less than or equal'],inputType:'number'},
                'COST': {operators:['equal','not equal','greater than','less than','greater than or equal','less than or equal'],inputType:'number'},
        },

        }
    },

    created() {
        this.getLog();
    },

    methods: {
        getLog() {
            let fileId = localStorage.fileId;
 
            Service.getLog(fileId)
            .then(response => {
                this.log = response.data.event_log;
                this.activities = this.log.activities;
                this.positiveOutcomeTypes = this.log.outcome_options;
                this.interventionTypes = this.log.treatment_options;
                this.columnsDefinition = this.log.columns_definition;
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
            if(!this.caseCompletion || !this.alarmThreshold|| !this.intervention.column || !this.intervention.operator || !this.intervention.value ||
                ! this.positiveOutcome.value || !this.positiveOutcome.column || !this.positiveOutcome.operator){
                    alert("Please fill in all the fields!");
                    return;
                }
            if(this.alarmThreshold < 0.1 || this.alarmThreshold > 0.9){
                alert("Alarm threshold must be between 0.1 and 0.9!");
                return;
            }
            this.isLoading = true;

            let positiveOutcome = {
                "column": this.positiveOutcome.column,
                "operator": this.format(this.positiveOutcome.operator),
                "value": this.positiveOutcome.value
            }

            let intervention = {
                "column": this.intervention.column,
                "operator": this.format(this.intervention.operator),
                "value": this.intervention.value,
            }
            let data = {
                'case_completion': this.caseCompletion,
                'positive_outcome': positiveOutcome,
                'treatment': intervention,
                'alarm_threshold': this.alarmThreshold
            }    
            console.log(data);      

            Service.parameters(localStorage.fileId,data)
            .then(response => {
                console.log(response)
                this.isLoading = false;
                this.$router.push({name: 'dashboard'})
            })
            .catch(error => {
              const resMessage =
                (error.response && error.response.data && error.response.data.message) ||
                error.message || error.toString();
                console.log(resMessage)
            });

        },

        getEvaluationMethods(type,parameter){
            let definition = this.columnsDefinition[type];
            if (!definition){
                definition = type;
            }
            if(parameter === 'outcome') this.positiveOutcome.columnDefinition = definition;
            else this.intervention.columnDefinition = definition;
            let method = this.evaluationMethods[definition];
            return method.operators;
        },

        getInputType(method){
            return this.evaluationMethods[method].inputType;
        },

        format(s){
            return s.replace(/\s+/g, '_').toUpperCase();
        }

    },
}
</script>
