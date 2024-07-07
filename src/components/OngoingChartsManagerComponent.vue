<template>
  <div class="cases-charts">
    <div class="cases-chart shadow">
      <h3>{{ recommendationTypesTitle }}</h3>
      <apexchart
          type="pie"
          :options="recommendationTypes.chartOptions"
          :series="recommendationTypes.series">
      </apexchart>
    </div>
    <div class="cases-chart shadow">
      <h3>{{ recommendationsAcceptanceTitle }}</h3>
      <apexchart type="pie"
                 :options="recommendationsAcceptance.chartOptions"
                 :series="recommendationsAcceptance.series">
      </apexchart>
    </div>
  </div>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts';

export default {
  name: "CustomChartsComponent",
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    cases: {
      type: Array,
      required: true,
    },
    casesData: {
      type: Array,
      required: true,
      validator: function (value) {
        return value.length === 2 && value.every(v => typeof v === 'number');
      }
    },
    alarmThreshold: {
      type: Number,
      required: true,
    },
    recommendationTypesTitle: {
      type: String,
      default: 'Recommendation Types',
    },
    recommendationsAcceptanceTitle: {
      type: String,
      default: 'Recommendations Acceptance',
    },
  },
  data() {
    return {
      recommendationTypes: {
        series: this.casesData,
        chartOptions: this.initChartOptions(['#56CCF2', '#F2994A'], ['Cases with recommendations', 'Cases without recommendations']),
      },
      recommendationsAcceptance: {
        series: [],
        chartOptions: this.initChartOptions(['#17ad37', '#7e7e7e'], ['Recommendations accepted', 'Recommendations declined']),
      },
    };
  },
  watch: {
    cases: {
      immediate: true,
      handler() {
        this.processData();
      },
    },
    casesData: {
      immediate: true,
      handler(newVal) {
        this.recommendationTypes.series = newVal;
      },
    }
  },
  methods: {
    initChartOptions(colors, labels) {
      return {
        colors: colors,
        chart: {
          animations: {
            enabled: false,
          },
          type: 'pie',
        },
        labels: labels,
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom',
            }
          }
        }]
      };
    },
    processData() {
      const typeCounts = { total: 0, accepted: 0 };
      this.cases.forEach(caseItem => {
        caseItem.activities.forEach(activity => {
          activity.prescriptions.forEach(prescription => {
            if (prescription.status === 'accepted') {
              typeCounts.accepted++;
            }
            typeCounts.total++;
          });
        });
      });

      this.recommendationsAcceptance.series = [typeCounts.accepted, typeCounts.total - typeCounts.accepted];
    }
  },
};
</script>