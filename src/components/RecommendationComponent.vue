<template>
    <div class="column">
        <p class="bold" v-if="batchRecommendations.length > 0 || current">Case status: {{ caseStatus }} complete</p>
        <div class="recommendation" v-for="(r,index) in batchRecommendations" :key="index" @click="selectRecommendation(index)" :class="{selected: selectedRec.batchId === batchId && selectedRec.index === index}">
            <div class="row">
                <small class="black">{{ r.recType }}</small>
                <div :class="['pill',r.color]"></div>
            </div>

            <p>{{ r.rec }}</p>

            <p :class="['bold',r.recommended ? 'green' : 'warning']">{{ r.recommended ? 'Recommended now' : 'Not recommended now' }}</p>
            
            <small>{{r.metric}}</small>
            <div :class="['recommendation-status','bold',r.status === 'accepted' ? 'green' : 'warning']">{{ r.status }}</div>
        </div>
    </div>
</template>

<script>
import shared from '@/services/shared';

export default{
    name: 'RecommendationComponent',

    props: {
        batch: Object,
        current: Boolean,
        selectedRec: Object,
        parameters: Object,
    },

    data(){
        return{
            caseStatus: null,
            batchId: null,
        }
    },

    computed:{
        batchRecommendations(){
            return this.formatRecommendations();
        }
    },

    methods: {
        selectRecommendation(index){
            this.$emit('recommendationSelected',{batchId: this.batchId,index: index}); 
        },

        formatRecommendations() {
            let temp = [];
            this.caseStatus = this.batch[this.parameters.columnsDefinitionReverse['ACTIVITY']];
            this.batchId = this.batch.event_id;
            if (!this.batch.prescriptions) return [];

            for (let i = 0; i < this.batch.prescriptions.length; i++) {
                let p = this.batch.prescriptions[i];
                let data = {};
                if(p.type === 'NEXT_ACTIVITY'){
                    data = {
                        recType: 'Next activity',
                        color: 'background-orange2',
                        rec: 'Perform ' + p.output,
                        metric: '',
                        status: p.status,
                        recommended: true
                    }
                }
                else if(p.type === 'ALARM') {
                    let recommendedAttr = p.output < this.parameters.alarmThreshold ? false : true
                    data = {
                        recType: 'Alarm',
                        color: 'background-blue5',
                        rec: 'Action required',
                        metric: 'Probability ' + p.output + ' (' + (recommendedAttr ? '> ' : '< ') + 'defined threshold)',
                        status: '',
                        recommended: recommendedAttr
                    }
                }
                else{
                    let recommendationAttr = shared.formatIntervention(p.output,this.parameters.columnsDefinition);
                    data = {
                        recType: 'Intervention',
                        color: 'background-purple',
                        rec: recommendationAttr,
                        metric: 'Causal effect: ' + p.output.cate + ' ' + (p.output.cate > 0 ? '(positive)': '(negative)'),
                        status: p.status,
                        recommended: p.output.cate > 0 ? true : false
                    }
                }
                temp.push(data);
            }
            return temp;
        },

    }
}

</script>