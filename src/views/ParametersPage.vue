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
                        <p>{{ log.filename }}</p>
                        <small>{{ log.datetime }}</small>
                    </div>
                </div>

                <div class="parameter">
                    <div class="row">
                        <p>Case completion</p>
                        <tooltip-component :iconSize="15" :tooltipSize="400">  
                            <template v-slot:title>
                                <h3 class="bold">What is case completion?</h3>
                            </template>
                            <template v-slot:content>
                            <p>The case completion parameter marks the event that is considered the end of a case.</p>
                            </template>
                        </tooltip-component>
                    </div>
                    <small>Please specify what activity marks the case completion.</small>
                    <select v-model="caseCompletion">
                        <option v-for="activity in activities" :key="activity">{{ activity }}</option>
                    </select>
                </div>

                <div class="parameter">
                    <div class="row">
                        <p>Positive case outcome</p>
                        <tooltip-component :iconSize="15" :tooltipSize="400">
                            <template v-slot:icon>
                                <ion-icon class="small" name="information-circle-outline"></ion-icon>
                            </template>            
                            <template v-slot:title>
                                <h3 class="bold">What is positive case outcome?</h3>
                            </template>
                            <template v-slot:content>
                            <p>The positive case outcome parameter marks when the case is considered to have a positive outcome. This is the key performance indicator (KPI) for the log.</p>
                            <p>For example, if positive case outcome is 'Duration less than or equal 12 days', then all cases that last for 12 days or less are considered to have a positive outcome, and those that do not - negative.</p>
                            </template>
                        </tooltip-component>
                    </div>
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
                        <div class="double-input" v-else-if="positiveOutcome.columnDefinition === 'DURATION'">
                            <input type="number" v-model="positiveOutcome.value"/>
                            <select v-model="positiveOutcome.unit">
                                <!-- <option>month</option> -->
                                <option>week</option>
                                <option>day</option>
                                <option>hour</option>
                                <option>minute</option>
                                <option>second</option>
                            </select>
                        </div>
                        <input v-else-if="positiveOutcome.columnDefinition" :type="getInputType(positiveOutcome.columnDefinition)" v-model="positiveOutcome.value"/>
                        <select v-else disabled></select>
                    </div>
                </div>

                <div class="parameter">
                    <div class="row">
                        <p>Intervention</p>
                        <tooltip-component :iconSize="15" :tooltipSize="400">
                            <template v-slot:icon>
                                <ion-icon class="small" name="information-circle-outline"></ion-icon>
                            </template>            
                            <template v-slot:title>
                                <h3 class="bold">What is intervention?</h3>
                            </template>
                            <template v-slot:content>
                            <p>The intervention parameter indicates the best possible course of action for achieveing a positive outcome as perceoved by the user.</p>
                            <p>For example, if intervention is 'Activity equals offer-sent', then an algorithm estimates the causal effect of performing this activity at a given point in time. Causal effect may be positive or negative.</p>
                            </template>
                        </tooltip-component>
                    </div>
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

                <button type="submit" class="btn-blue" @click="validate">Submit</button>
            </div>
        </div>
        <modal-component v-if="openModal" title="Parameters group name" @closeModal="closeModal">
            <template v-slot:content>
                <div class="column">
                    <input type="text" minlength="2" maxlength="100" placeholder="Description..." v-model="parametersDescription"/>
                    <button type="submit" class="btn-blue" @click="submit">Submit</button>
                </div>
            </template>
        </modal-component>

    </div>
</template>


<script>
import Loading from "@/components/LoadingComponent.vue";
import TooltipComponent from "@/components/TooltipComponent.vue";
import ModalComponent from "@/components/ModalComponent.vue";
import logsService from "@/services/logs.service.js"

export  default {
    name: "ParametersPage",

    components: {
        Loading,
        TooltipComponent,
        ModalComponent
    },

    data () {
        return {
            isLoading: true,
            openModal: false,

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
            parametersDescription: null

        }
    },

    mounted() {
        this.getLog();
    },

    methods: {
        getLog() {
            let logId = localStorage.logId;
 
            logsService.getLog(logId)
            .then(response => {
                this.log = response.data.event_log;
                this.activities = this.log.activities;
                this.positiveOutcomeTypes = this.log.outcome_options;
                this.interventionTypes = this.log.treatment_options;
                this.columnsDefinition = this.log.columns_definition;
                this.isLoading = false;
            })
            .catch(error => {
                this.isLoading = false;
                const resMessage =
                (error.response && error.response.data && error.response.data.message) ||
                error.message || error.toString();
                this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    })            
                });
        },

        closeModal(){
            this.openModal = false;
        },

        validate(){
            if(!this.caseCompletion || !this.alarmThreshold|| !this.intervention.column || !this.intervention.operator || !this.intervention.value ||
                ! this.positiveOutcome.value || !this.positiveOutcome.column || !this.positiveOutcome.operator || (this.positiveOutcome.column ==='DURATION' && !this.positiveOutcome.unit)){
                    this.$notify({
                        title: 'Warning',
                        text: 'Please fill in all the fields!',
                        type: 'warning'
                    })
                    return;
                }
            if(this.alarmThreshold < 0.1 || this.alarmThreshold > 0.9){
                this.$notify({
                        title: 'Warning',
                        text: 'Alarm threshold must be between 0.1 and 0.9!',
                        type: 'warning'
                    })
                return;
            }
            this.openModal=true;
        },

        submit() {
            this.openModal=false;
            this.isLoading = true;

            let outcomeValue = !this.positiveOutcome.unit ? this.positiveOutcome.value : this.positiveOutcome.value + ' ' + this.positiveOutcome.unit;
            if (this.positiveOutcome.column === 'DURATION' && this.positiveOutcome.value > 1) outcomeValue += 's';

            
            let positiveOutcome = {
                "column": this.positiveOutcome.column,
                "operator": this.format(this.positiveOutcome.operator),
                "value": outcomeValue
            }
            console.log(positiveOutcome)

            let intervention = {
                "column": this.intervention.column,
                "operator": this.format(this.intervention.operator),
                "value": this.intervention.value,
            }
            let data = {
                'case_completion': this.caseCompletion,
                'positive_outcome': positiveOutcome,
                'treatment': intervention,
                'alarm_threshold': this.alarmThreshold,
                'parameters_description': this.parametersDescription
            }    

            logsService.defineParameters(localStorage.logId,data)
            .then(response => {
                console.log(response)
                this.isLoading = false;
                this.$router.push({name: 'dashboard'})
            })
            .catch(error => {
                this.isLoading = false;
                const resMessage =
                (error.response && error.response.data && error.response.data.message) ||
                error.message || error.toString();
                this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    })            
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
