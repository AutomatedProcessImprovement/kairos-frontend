<template>
    <div id="parameters">
        <loading v-if="isLoading"></loading>
        <div v-else class="column">
            <a @click="$router.go(-1)"><ion-icon name="chevron-back-outline"></ion-icon> Return</a>
            <h2 class="bold-blue">Recommendation Parameters</h2>
            <div v-if="!log">
                <h3 class="warning">No log has been selected.</h3>
            </div>
            <div class="column" v-else>
                <div class="parameter">
                    <p>Uploaded log</p>
                    <div class='log-card'>
                        <h4>{{ log.path.split(/_(.*)/s)[1] }}</h4>
                        <small>{{ log.datetime }}</small>
                    </div>
                </div>

                <div class="parameter">
                    <p>Case completion</p>
                    <small>Please specify what activity marks the case completion.</small>
                    <select v-model="caseCompletion" required="required">
                        <option v-for="activity in activities" :key="activity">{{ activity }}</option>
                    </select>
                </div>

                <div class="parameter">
                    <p>Positive case outcome</p>
                    <small>Please specify what is considered as the positive outcome of the case.</small>
                    <select v-model="positiveOutcomeType" required>
                        <option value='' disabled selected>Select positive case outcome type</option>
                        <option v-for="outcomeType in positiveOutcomeTypes" :key="outcomeType" :value="outcomeType">{{ outcomeType }}</option>
                    </select>
                    <select v-if="positiveOutcomeType" v-model="positiveOutcomeEvaluationMethod" required="required">
                        <option value='' disabled selected>Select evaluation method</option>
                        <option v-for="evaluationMethod in evaluationMethods[positiveOutcomeType]" :key="evaluationMethod">{{ evaluationMethod }}</option>
                    </select>
                    <select v-if="positiveOutcomeType === 'Activity'" v-model="positiveOutcome" required="required">
                        <option value='' disabled selected>Select positive case outcome</option>
                        <option v-for="activity in activities" :key="activity">{{ activity }}</option>
                    </select>
                    <input v-else-if="isTimestamp" type="datetime-local" v-model="positiveOutcome" required="required"/>
                    <input v-else type="number" v-model="positiveOutcome" required="required"/>
                </div>

                <div class="parameter">
                    <p>Intervention</p>
                    <small>Please specify what activity is considered as the intervention in the ongoing case.</small>
                    <select v-model="interventionType" required>
                        <option value='' disabled selected>Select intervention type</option>
                        <option v-for="intType in interventionTypes" :key="intType" :value="intType">{{ intType }}</option>
                    </select>
                    <select v-if="interventionType" v-model="interventionEvaluationMethod" required="required">
                        <option value='' disabled selected>Select evaluation method</option>
                        <option v-for="evaluationMethod in evaluationMethods[interventionType]" :key="evaluationMethod">{{ evaluationMethod }}</option>
                    </select>
                    <select v-if="interventionType" v-model="intervention" required="required">
                        <option value='' disabled selected>Select intervention</option>
                        <option v-for="activity in activities" :key="activity">{{ activity }}</option>
                    </select>
                </div>

                <div class="parameter">
                    <p>Alarm Threshold</p>
                    <small>Please specify when an alarm should be triggered. Enter a value between 0.1 and 0.9.</small>
                    <input type="number" v-model="alarmProbability" :required="true"/>
                </div>

                <button type="submit" class="btn" @click="submit">Submit</button>
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
            log: null,
            activities: ['A','B','C'],
            isLoading: false,

            caseCompletion: null,

            positiveOutcomeTypes: ["Timestamp", "Start timestamp","End timestamp", 
                                    "Text", "Activity", "Resource", 
                                    "Number", "Duration", "Cost",
                                    "Boolean"],
            positiveOutcomeType: null,
            positiveOutcomeEvaluationMethod: null,
            positiveOutcome: null,
            
            interventionTypes: ['Activity'],
            interventionType: null,
            interventionEvaluationMethod: null,
            intervention: null,
            
            evaluationMethods: {
                'Text': ['equal','not equal','contains','not contains'],
                'Activity': ['equal','not equal','contains','not contains'],
                'Resource': ['equal','not equal','contains','not contains'],

                'Number': ['equal','not equal','greater than','less than','greater than or equal','less than or equal'],
                'Duration': ['equal','not equal','greater than','less than','greater than or equal','less than or equal'],
                'Cost': ['equal','not equal','greater than','less than','greater than or equal','less than or equal'],

                'Start timestamp': ['equal','not equal','later than','earlier than','later than or equal','earlier than or equal'],
                'End timestamp': ['equal','not equal','later than','earlier than','later than or equal','earlier than or equal'], 
                'Timestamp': ['equal','not equal','later than','earlier than','later than or equal','earlier than or equal'],
                
                'Boolean': ['is true','is false']
            },

            alarmProbability: null
        }
    },

    created() {
        this.getLog();
    },

    methods: {
        getLog() {
            this.isLoading = true;
            let fileId = localStorage.fileId;
 
            Service.getLog(fileId)
            .then(response => {
                this.log = response.data.eventlog;
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

        getActivities() {
            // TODO connect to PrCore 
        },

        submit() {
            if(!this.caseCompletion || !this.interventionType || !this.interventionEvaluationMethod || !this.intervention ||
                ! this.positiveOutcome || !this.positiveOutcomeType || !this.positiveOutcomeEvaluationMethod){
                    alert("Please fill in all the fields!");
                    return;
                }
            this.isLoading = true;

            let positiveOutcome = {
                "type": this.format(this.positiveOutcomeType),
                "operator": this.format(this.positiveOutcomeEvaluationMethod),
                "value": this.positiveOutcome
            }

            let intervention = {
                "type": this.format(this.interventionType),
                "operator": this.format(this.interventionEvaluationMethod),
                "value": this.intervention,
            }
            let data = {
                'case_completion': this.caseCompletion,
                'positive_outcome': positiveOutcome,
                'treatment': intervention,
                'alarm_probability': this.alarmProbability
            }          

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

        isTimestamp(){
            return this.positiveOutcomeType in ['Timestamp','Start timestamp', 'End timestamp'];
        },

        format(s){
            return s.replace(/\s+/g, '-').toUpperCase();
        }

    },
}
</script>
