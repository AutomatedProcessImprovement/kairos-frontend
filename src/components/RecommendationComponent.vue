<template>
    <div class="column">
        <p>Case status: {{ caseStatus }} complete</p>
        <div class="recommendation" v-for="(r,index) in batchRecommendations" :key="index" @click="selectRecommendation(index)" :class="{selected: selectedRec.batchId === batchId && selectedRec.index === index}">
            <div class="row">
                <small class="black">{{ r.recType }}</small>
                <div :class="['pill',r.color]"></div>
            </div>

            <p>{{ r.rec }}</p>

            <p :class="['bold',r.recommended && current ? 'green' : 'warning']">{{ r.recommended && current ? 'Recommended now' : 'Not recommended now' }}</p>
            
            <small>{{r.metric}}</small>
            <div class="recommendation-status">{{ r.status }}</div>
        </div>
    </div>
</template>

<script>


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
            batchRecommendations: [],
            caseStatus: null,
            batchId: null,
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
            // console.log(this.parameters);
            this.caseStatus = this.batch['ACTIVITY'];
            this.batchId = this.batch.event_id;
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
                    data = {
                        recType: 'Intervention',
                        color: 'background-purple',
                        rec: 'Perform '+ p.output.treatment[0][0].value,
                        metric: 'Causal effect: ' + p.output.cate + ' ' + (p.output.cate > 0 ? '(positive)': '(negative)'),
                        status: p.status,
                        recommended: p.output.cate > 0 ? true : false
                    }
                }
                this.batchRecommendations.push(data);
            }
        }
    }
}

</script>