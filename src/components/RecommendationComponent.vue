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
                    let recommendationAttr = this.formatIntervention(p.output);
                    data = {
                        recType: 'Intervention',
                        color: 'background-purple',
                        rec: recommendationAttr,
                        metric: 'Causal effect: ' + p.output.cate + ' ' + (p.output.cate > 0 ? '(positive)': '(negative)'),
                        status: p.status,
                        recommended: p.output.cate > 0 ? true : false
                    }
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