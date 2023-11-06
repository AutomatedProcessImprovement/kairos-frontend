<template>
    <div class="column">
        <p class="bold" v-if="batchRecommendations.length > 0 || current">Case status: {{ caseStatus }} complete</p>
        <div class="recommendation" v-for="(r, index) in batchRecommendations" :key="index"
            @click="selectRecommendation(index)"
            :class="{ selected: selectedRec.batchId === batchId && selectedRec.index === index }">
            <div class="row">
                <small class="black">{{ r.recType }}</small>
                <div :class="['pill', r.color]"></div>
            </div>

            <p>{{ r.rec }}</p>

            <p :class="['bold', r.recommended ? 'green' : 'warning']">{{ r.recommended ? 'Recommended now' : 'Not recommended now' }}</p>

            <small>{{ r.metric }}</small>
            <div :class="['recommendation-status', 'bold', r.status === 'accepted' ? 'green' : 'warning']">{{ r.status }}
            </div>
        </div>
    </div>
</template>

<script>
import utils from '@/common/utils';

export default {
    name: 'RecommendationComponent',

    props: {
        batch: Object,
        current: Boolean,
        selectedRec: Object,
        parameters: Object,
    },

    data() {
        return {
            caseStatus: null,
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
            this.caseStatus = this.batch[this.parameters.columnsDefinitionReverse['ACTIVITY']];
            this.batchId = this.batch.event_id;

            if (!this.batch.prescriptions) return [];

            for (let i = 0; i < this.batch.prescriptions.length; i++) {
                let p = this.batch.prescriptions[i];
                let prescriptionObject = utils.prescriptionAttributes[p.type];

                let data = {
                    recType: prescriptionObject.pType,
                    color: prescriptionObject.pColor,
                    rec: prescriptionObject.pText(p, this.parameters.columnsDefinition),
                    metric: prescriptionObject.pMetric(p, this.parameters.alarmThreshold),
                    status: prescriptionObject.pStatus(p),
                    recommended: prescriptionObject.pIsRecommended(p, this.parameters.alarmThreshold)
                };

                temp.push(data);
            }
            return temp;
        },

    }
}

</script>