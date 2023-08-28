<template>
    <div id="parameters">
        <loading v-if="isLoading" :text="loadingText"></loading>
        <div v-else class="column">
            <a @click="$router.go(-1)"><ion-icon name="chevron-back-outline"></ion-icon> Return</a>
            <h2 class="bold blue">Parameters</h2>
            <div v-if="!log">
                <h3 class="warning">No log has been selected.</h3>
            </div>
            <div class="column" v-else>
                <div class="parameter">
                    <p>Uploaded Log</p>
                    <div class='log-card'>
                        <p>{{ log.filename }}</p>
                        <p v-if="log.test_filename">Test set: {{ log.test_filename }}</p>
                        <small>{{ log.datetime }}</small>
                    </div>
                </div>

                <div class="parameter">
                    <div class="row">
                        <p>Case Completion</p>
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
                        <p>Positive Case Outcome</p>
                        <tooltip-component :iconSize="15" :tooltipSize="400">          
                            <template v-slot:title>
                                <h3 class="bold">What is positive case outcome?</h3>
                            </template>
                            <template v-slot:content>
                            <p>The positive case outcome parameter marks when the case is considered to have a positive outcome. This is the key performance indicator (KPI) or target for the log.</p>
                            <p>For example, if positive case outcome is 'Duration less than or equal 12 days', then all cases that last for 12 days or less are considered to have a positive outcome, and those that do not - negative.</p>
                            </template>
                        </tooltip-component>
                    </div>
                    <small>Please specify what is considered as the positive outcome of the case.</small>

                    <div class="input-group">
                        <small>Outcome Type</small>
                        <select v-model="positiveOutcome.column">
                            <option v-for="outcomeType in positiveOutcomeTypes" :key="outcomeType" :value="outcomeType">{{ outcomeType }}</option>
                        </select>
                    </div>

                    <div class="input-group">
                        <small>Outcome Evaluation Method</small>
                        <select v-if="positiveOutcome.column" v-model="positiveOutcome.operator">
                            <option v-for="evaluationMethod in getEvaluationMethods(positiveOutcome.column,'outcome')" :key="evaluationMethod">{{ evaluationMethod }}</option>
                        </select>
                        <select v-else disabled></select>
                    </div>

                    <div class="input-group">
                        <small>Outcome Value</small>
                        <select v-if="positiveOutcome.columnDefinition === 'ACTIVITY'" v-model="positiveOutcome.value">
                            <option v-for="activity in activities" :key="activity">{{ activity }}</option>
                        </select>
                        <span v-else-if="positiveOutcome.columnDefinition === 'BOOLEAN'"></span>
                        <div class="double-input" v-else-if="positiveOutcome.columnDefinition === 'DURATION'">
                            <input type="number" min="0" v-model="positiveOutcome.value"/>
                            <select v-model="positiveOutcome.unit">
                                <!-- <option>month</option> -->
                                <option>weeks</option>
                                <option>days</option>
                                <option>hours</option>
                                <option>minutes</option>
                                <option>seconds</option>
                            </select>
                        </div>
                        <input v-else-if="positiveOutcome.columnDefinition" :type="getInputType(positiveOutcome.columnDefinition)" v-model="positiveOutcome.value"/>
                        <select v-else disabled></select>
                    </div>
                </div>
                <h3>Recommendation Parameters</h3>
                <small>Kairos provides prescriptions based on different algorithms. Please specify the parameters for them.</small>
                <div class="parameter">
                    <div class="row">
                        <p>Intervention</p>
                        <tooltip-component :iconSize="15" :tooltipSize="500">           
                            <template v-slot:title>
                                <h3 class="bold">What is intervention?</h3>
                            </template>
                            <template v-slot:content>
                            <p>An intervention is a type of a recommendation that can be of different kinds, for example, an activity to carry out, a resource to use, a parameter to change, etc. It is prescribed by an algorithm that can estimate its potential effect on the case outcome. The estimation is expressed as a causal effect, which may be positive (performing an intervention increases the probability of the case finishing with a positive outcome) or negative (decreases the probability). The intervention is recommended when the algorithm estimates the effect of it to be positive.</p>
                            <em>Please specify the intervention that the algorithm should estimate.</em>
                            </template>
                        </tooltip-component>
                    </div>
                    <small>Please specify what is considered as intervention in the ongoing case.</small>
                    <div class="input-group">
                        <small>Intervention Kind</small>
                        <select v-model="intervention.column">
                            <option v-for="outcomeType in interventionTypes" :key="outcomeType" :value="outcomeType">{{ outcomeType }}</option>
                        </select>
                    </div>

                    <div class="input-group">
                        <small>Intervention Operator</small>
                        <select v-if="intervention.column" v-model="intervention.operator">
                            <option v-for="evaluationMethod in getEvaluationMethods(intervention.column,'intervention')" :key="evaluationMethod">{{ evaluationMethod }}</option>
                        </select>
                        <select v-else disabled></select>
                    </div>

                    <div class="input-group">
                        <small>Intervention Value</small>
                        <select v-if="intervention.columnDefinition === 'ACTIVITY'" v-model="intervention.value">
                            <option v-for="activity in activities" :key="activity">{{ activity }}</option>
                        </select>
                        <span v-else-if="intervention.columnDefinition === 'BOOLEAN'"></span>
                        <input v-else-if="intervention.columnDefinition" :type="getInputType(intervention.columnDefinition)" v-model="intervention.value"/>
                        <select v-else disabled></select>
                    </div>
                </div>
                

                <div class="parameter">
                    <div class="row">
                        <p>Alarm Threshold</p>
                        <tooltip-component :iconSize="15" :tooltipSize="500">           
                            <template v-slot:title>
                                <h3 class="bold">What is alarm threshold?</h3>
                            </template>
                            <template v-slot:content>
                            <p>An alarm is a type of a recommendation that does not specify an exact action to perform in the given moment, but rather notifies that the user should pay attention to the case. The exact action is left to be decided by the user. It is prescribed by an algorithm that estimates the probability of the case to end in a negative outcome. When the specified probability threshold is reached, an alarm is triggered.</p>
                            <em>Please specify the probability threshold for the alarm.</em>
                            </template>
                        </tooltip-component>
                    </div>
                    <small>Please specify when an alarm should be triggered. Enter a value between 0.1 and 0.9.</small>
                    <input type="number" min="0.1" max="0.9" step="0.1" v-model="alarmThreshold"/>
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
import logsService from "@/services/logs.service.js";
import shared from "@/services/shared";

export  default {
    name: "ParametersPage",

    components: {
        Loading,
        TooltipComponent,
        ModalComponent
    },

    data () {
        return {
            isLoading: false,
            loadingText: "Please wait...",
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
            parametersDescription: null

        }
    },

    mounted() {
        if(shared.getLocal('logId')) this.getLog();
    },

    methods: {
        getLog() {
            this.isLoading = true;
            let logId = shared.getLocal('logId');
 
            logsService.getLog(logId)
            .then(response => {
                this.log = response.data.event_log;
                this.activities = this.log.activities;
                this.positiveOutcomeTypes = this.log.outcome_options;
                this.interventionTypes = this.log.treatment_options;
                this.columnsDefinition = this.log.columns_definition;
                this.isLoading = false;
                if(this.log.parameters_description){
                    this.formatParameters();
                }
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

        formatParameters(){
            this.caseCompletion = this.log.case_completion;
            this.alarmThreshold = this.log.alarm_threshold;
            this.positiveOutcome = this.log.positive_outcome;
            // this.positiveOutcome.operator = this.deformat(this.positiveOutcome.operator);
            this.intervention = this.log.treatment;
            // this.intervention.operator = this.deformat(this.intervention.operator);
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
            this.loadingText = "Creating project...";
            this.isLoading = true;
            
            let positiveOutcome = {
                "column": this.positiveOutcome.column,
                "operator": shared.format(this.positiveOutcome.operator),
                "value": this.positiveOutcome.value,
                "unit": this.positiveOutcome.unit
            }

            let intervention = {
                "column": this.intervention.column,
                "operator": shared.format(this.intervention.operator),
                "value": this.intervention.value,
            }
            let data = {
                'case_completion': this.caseCompletion,
                'positive_outcome': positiveOutcome,
                'treatment': intervention,
                'alarm_threshold': this.alarmThreshold,
                'parameters_description': this.parametersDescription
            }    

            logsService.defineParameters(shared.getLocal('logId'),data)
            .then(response => {
                console.log(response.data)
                this.isLoading = false;
                this.$router.push({name: 'dashboard'})
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

        getEvaluationMethods(type,parameter){
            let definition = this.columnsDefinition[type];
            if (!definition){
                definition = type;
            }
            if(parameter === 'outcome') this.positiveOutcome.columnDefinition = definition;
            else this.intervention.columnDefinition = definition;
            let method = shared.evaluationMethods[definition];
            return Object.keys(method.operators);
        },

        getInputType(method){
            return shared.evaluationMethods[method].inputType;
        },

    },
}
</script>
