<template>
    <div class="column">
        <div class="recommendation" v-for="(r,index) in batchRecommendations" :key="index" :class="{selected: selectedRec.batchId === batchId && selectedRec.index === index}">
                <div class="column">
                <h4>{{ r.rec }}</h4>
                <p>{{ r.recommended }}</p>            
                <div class="recommendation-status">{{ r.status }}</div>
            </div>
            <div class="column flex-end">
                <tooltip-component 
                :iconSize="15" 
                :tooltipSize="300">
                    <template v-slot:title>
                        <h3 class="bold">Details - calculation info</h3>
                    </template>
                    <template v-slot:content>
                        <h4> Model description</h4>
                        <p v-for="m in r.metrics" :key="m"> {{ m.name }}: {{ m.metric}}%</p>
                    </template>
                </tooltip-component>
                <p :class="['bold', r.status ==='accepted' ? 'green' : 'warning']">{{r.status }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import TooltipComponent from './TooltipComponent.vue';

export default{

    name: 'RecommendationComponent',

    components:{
        TooltipComponent
    },

    props: {
        batch: Object,
        current: Boolean,
        selectedRec: Object,
        parameters: Object,
    },

    data(){
        return{
            batchRecommendations: [],
            batchId: null,
            typeGuide: {
                'TEXT': {'EQUAL':'Text equals','NOT_EQUAL':'Text does not equal','CONTAINS':'Text contains','NOT_CONTAINS':'Text does not contain'},
                'NUMBER': {'EQUAL':'Number equals','NOT_EQUAL':'Number does not equal','GREATER_THAN':'Number is greater than','LESS_THAN':'Number is less than','GREATER_THAN_OR_EQUAL':'Number is greater than or equal to','LESS_THAN_OR_EQUAL':'Number is less than or equal to'},
                'BOOLEAN': {'IS_TRUE':'Is true','IS_FALSE':'Is false'},
                'DATETIME': {'EQUAL':'Time equals','NOT_EQUAL':'Time does not equal','LATER_THAN':'Time is later than','EARLIER_THAN':'Time is earlier than','LATER_THAN_OR_EQUAL':'Time is later than or equal','EARLIER_THAN_OR_EQUAL':'Time is earlier than or equal'},
                'ACTIVITY': {'EQUAL':'Perform','NOT_EQUAL':'Do not perform','CONTAINS':'Perform activity that contains','NOT_CONTAINS': 'Perform activity that does not contain'},
                'RESOURCE': {'EQUAL':'Resource is','NOT_EQUAL':'Resource is not','CONTAINS':'Resource contains','NOT_CONTAINS':'Resource does not contain'},
                'TIMESTAMP': {'EQUAL':'Perform activity at','NOT_EQUAL':'Do not perform activity at','LATER_THAN':'Perform activity later than','EARLIER_THAN':'Perform activity earlier than','LATER_THAN_OR_EQUAL':'Perform activity later than or at','EARLIER_THAN_OR_EQUAL':'Perform activity earlier than or at'},
                'START_TIMESTAMP': {'EQUAL':'Start activity at','NOT_EQUAL':'Do not start at','LATER_THAN':'Start later than','EARLIER_THAN':'Start earlier than','LATER_THAN_OR_EQUAL':'Start later than or at','EARLIER_THAN_OR_EQUAL':'Start earlier than or at'},
                'END_TIMESTAMP': {'EQUAL':'End activity at','NOT_EQUAL':'Do not end at','LATER_THAN':'End later than','EARLIER_THAN':'End earlier than','LATER_THAN_OR_EQUAL':'End later than or at','EARLIER_THAN_OR_EQUAL':'End earlier than or at'},
                'DURATION': {'EQUAL':'Duration equals','NOT_EQUAL':'Duration does not equal','GREATER_THAN':'Duration is greater than','LESS_THAN':'Duration is less than','GREATER_THAN_OR_EQUAL':'Duration is greater than or equal','LESS_THAN_OR_EQUAL':'Duration is less than or equal'},
                'COST': {'EQUAL':'Cost equals','NOT_EQUAL':'Cost does not equal','GREATER_THAN':'Cost is greater than','LESS_THAN':'Cost is less than','GREATER_THAN_OR_EQUAL':'Cost is greater than or equal','LESS_THAN_OR_EQUAL':'Cost is less than or equal'},
            }
        }
    },

    watch:{
        parameters: function(){
            this.formatRecommendations();
        }
    },

    methods: {
        selectRecommendation(index){
            this.$emit('recommendationSelected',{batchId: this.batchId,index: index}); 
        },

        formatRecommendations() {
            this.batchId = this.batch.event_id;

            for (let i = 0; i < this.batch.prescriptions.length; i++) {
                let p = this.batch.prescriptions[i];

                let recommendationAttr, recommendedAttr, recommendationMetrics;
                let recommendationStatus = this.current? null : p.status;

                if(p.type === 'NEXT_ACTIVITY'){
                    recommendationAttr = 'Perform ' + p.output;
                    recommendedAttr = 'It is likely that the application will comply with the KPI if you perform this recommendation now.';
                    recommendationMetrics = [
                        {name: 'Accuracy', metric: p.plugin.accuracy},
                        {name: 'Recall', metric: p.plugin.recall},
                        {name: 'Precision', metric: p.plugin.precision}
                    ]
                }
                else if(p.type === 'ALARM') {
                    recommendationAttr = 'Action required';
                    recommendedAttr = p.output < this.parameters.alarmThreshold ? 'Probability of not meeting the KPI is low. It is fine not to check on the application.' :
                                                                                    'Probability of not meeting the KPI is high. It is recommended to check on the application.' ;
                    recommendationMetrics = [
                        {name: 'Accuracy', metric: p.plugin.accuracy},
                        {name: 'Recall', metric: p.plugin.recall},
                        {name: 'Precision', metric: p.plugin.precision}
                    ]
                }
                else if(p.type==='TREATMENT_EFFECT'){
                    recommendationAttr = this.formatIntervention(p.output);
                    recommendedAttr = p.output.cate > 0 ? 'The causal effect of performing the intervention is positive.' :
                                                            'The causal effect of performing this intervention is negative.';
                    recommendationMetrics = [
                        {name: 'CATE score', metric: p.output.cate},
                        {name: 'Probability if treated', metric: p.output.proba_if_treated},
                        {name: 'Probability if untreated', metric: p.output.proba_if_treated}
                    ]
                }
                let data = {
                    rec: recommendationAttr,
                    status: recommendationStatus,
                    recommended: recommendedAttr,
                    metrics: recommendationMetrics
                }
                this.batchRecommendations.push(data);
            }
        },

        formatIntervention(prescription){
            let columnType = this.parameters.columnsDefinition[prescription.treatment[0][0].column];
            let recommendationAttr = this.typeGuide[columnType][prescription.treatment[0][0].operator] + ' ' + prescription.treatment[0][0].value;
            return recommendationAttr;
        }

    }
}

</script>