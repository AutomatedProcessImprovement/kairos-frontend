<template>
    <div v-if="data" class="column">
        <!-- <p>Case status: {{ batch['ACTIVITY'] }} complete</p> -->
        <div class="recommendation" v-for="r in data" :key="r">
            <div class="row">
                <small class="black">{{ r.type }}</small>
                <div :class="['pill',r.color]"></div>
            </div>

            <p v-if="r.type='NEXT_ACTIVITY'">{{ r.rec }}</p>

            <p :class="['bold',current ? 'green' : 'warning']">{{ current ? 'Recommended now' : 'Not recommended now' }}</p>
            
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
    },

    data(){
        return{
            data: []
        }
    },

    watch:{
        batch: function(){
            console.log(this.batch);
            this.formatRecommendations();
        }
    },

    methods: {
        formatRecommendations() {
            for (let i = 0; i < this.batch.prescriptions.length; i++) {
                const r = this.batch.prescriptions[i];
                let data
                if(r.type === 'NEXT_ACTIVITY'){
                    data = {
                        type: 'Next activity',
                        color: 'background-orange2',
                        rec: 'Perform' + r.output,
                        metric: '',
                        status: r.status
                    }
                }
                else if(r.type === 'ALARM') {
                    data = {
                        type: 'Alarm',
                        color: 'background-blue5',
                        rec: 'Action required',
                        metric: 'Probability ' + r.output + '(defined threshold)',
                        status: ''
                    }
                }
                else{
                    data = {
                        type: 'Intervention',
                        color: 'background-purple',
                        rec: 'Perform '+ r.output.treatment[0][0].value,
                        metric: 'Causal effect: ' + r.output.cate + ' ' + (r.output.cate >= 0 ? 'positive': 'negative'),
                        status: r.status
                    }
                }
                this.data.push(data);
            }

            console.log(this.data);
        }
    }
}

</script>