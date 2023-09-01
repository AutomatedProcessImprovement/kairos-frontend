<template>
    <div class="column">
        <div class="recommendation" v-for="(r, index) in batchRecommendations" :key="index"
            :class="{ selected: selectedRec.batchId === batchId && selectedRec.index === index }">
            <div class="column">
                <h4>{{ r.rec }}</h4>
                <p>{{ r.recommended }}</p>
            </div>
            <div class="column align-end content-space-between">
                <tooltip-component :iconSize="15" :tooltipSize="300">
                    <template v-slot:title>
                        <h3 class="bold">Details - calculation info</h3>
                    </template>
                    <template v-slot:content>
                        <h4> Model description</h4>
                        <p v-for="m in r.metrics" :key="m"> {{ m.name }}: {{ m.metric }}</p>
                    </template>
                </tooltip-component>
                <p :class="['recommendation-status', 'bold', r.status === 'accepted' ? 'green' : 'warning']">{{ r.status }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import TooltipComponent from './TooltipComponent.vue';
import shared from '@/services/shared';

export default {

    name: 'RecommendationComponent',

    components: {
        TooltipComponent
    },

    props: {
        batch: Object,
        current: Boolean,
        selectedRec: Object,
        parameters: Object,
    },

    data() {
        return {
            batchId: null,
        }
    },

    computed: {
        batchRecommendations() {
            return this.formatRecommendations();
        }
    },

    methods: {
        selectRecommendation(index) {
            this.$emit('recommendationSelected', { batchId: this.batchId, index: index });
        },

        formatRecommendations() {
            let temp = [];
            this.batchId = this.batch.event_id;
            if (!this.batch.prescriptions) return [];
            for (let i = 0; i < this.batch.prescriptions.length; i++) {
                let p = this.batch.prescriptions[i];

                let recommendationAttr, recommendedAttr, recommendationMetrics;
                let recommendationStatus = this.current ? null : p.status;

                if (p.type === 'NEXT_ACTIVITY') {
                    recommendationAttr = 'Perform ' + p.output;
                    recommendedAttr = 'It is likely that the application will comply with the target if you perform this recommendation now.';
                    recommendationMetrics = [
                        { name: 'Accuracy', metric: Math.round(p.plugin.accuracy * 100) + '%' },
                        { name: 'Recall', metric: Math.round(p.plugin.recall * 100) + '%' },
                        { name: 'Precision', metric: Math.round(p.plugin.precision * 100) + '%' }
                    ]
                }
                else if (p.type === 'ALARM') {
                    recommendationAttr = 'Action required';
                    if (p.output < this.parameters.alarmThreshold) {
                        continue;
                    }
                    recommendationStatus = '';
                    recommendedAttr = 'Probability of not meeting the target is high. It is recommended to check on the application.';
                    recommendationMetrics = [
                        { name: 'Accuracy', metric: Math.round(p.plugin.accuracy * 100) + '%' },
                        { name: 'Recall', metric: Math.round(p.plugin.recall * 100) + '%' },
                        { name: 'Precision', metric: Math.round(p.plugin.precision * 100) + '%' }
                    ]
                }
                else if (p.type === 'TREATMENT_EFFECT') {
                    recommendationAttr = shared.formatIntervention(p.output, this.parameters.columnsDefinition);
                    if (p.output.cate <= 0) {
                        continue;
                    }
                    recommendedAttr = 'The causal effect of performing the intervention is positive.';
                    recommendationMetrics = [
                        { name: 'CATE score', metric: p.output.cate },
                        { name: 'Probability if treated', metric: Math.round(p.output.proba_if_treated * 100) + '%' },
                        { name: 'Probability if untreated', metric: Math.round(p.output.proba_if_treated * 100) + '%' }
                    ]
                }
                let data = {
                    rec: recommendationAttr,
                    status: recommendationStatus,
                    recommended: recommendedAttr,
                    metrics: recommendationMetrics
                }
                temp.push(data);
            }
            return temp;
        },

    }
}

</script>