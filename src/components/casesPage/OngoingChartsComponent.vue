<template>
  <div class="cases-charts">
    <div class="cases-chart shadow">
      <h3>Recommendation Types</h3>
      <apexchart type="pie" :options="recommendationTypes.chartOptions" :series="recommendationTypes.series"></apexchart>
    </div>

    <div class="cases-chart shadow">
      <h3>Recommendations Acceptance</h3>
      <apexchart type="bar" :options="recommendationsAcceptance.chartOptions" :series="recommendationsAcceptance.series">
      </apexchart>
    </div>

  </div>
</template>

<script>

import VueApexCharts from 'vue3-apexcharts';
import utils from '@/common/utils';

export default {
  name: "ChartsComponent",

  components: {
    apexchart: VueApexCharts,
  },

  props: {
    cases: Array,
    casesData: Array,
    alarmThreshold: Number,
  },

  data() {
    return {
      recommendationsByType: {
        'ALARM': { total: 0, accepted: 0, recommended: 0 },
        'NEXT_ACTIVITY': { total: 0, accepted: 0, recommended: 0 },
        'TREATMENT_EFFECT': { total: 0, accepted: 0, recommended: 0 }
      },

      recommendationTypes: {
        series: [0, 0, 0],
        chartOptions: {
          colors: ['#56CCF2', '#F2994A', '#BB6BD9'],
          chart: {
            animations: {
              enabled: false,
            },
            type: 'pie',
          },
          labels: ['Alarm', 'Next activity', 'Intervention'],
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
        },
      },

      recommendationsAcceptance: {
        series: [{
          name: "Accepted",
          data: [0, 0, 0],
        },
        {
          name: 'Discarded',
          data: [0, 0, 0]
        }
        ],
        chartOptions: {
          colors: ['#17ad37', '#7e7e7e'],
          chart: {
            type: 'bar',
            stacked: true,
            stackType: '100%',
            animations: {
              enabled: false,
            },
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '50%',
              borderRadius: 0
            },
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            show: true,
            width: 1,
            colors: ['#fff']
          },
          xaxis: {
            categories: ['Alarm', 'Next activity', 'Intervention'],
          },
          yaxis: {
            min: 0,
            max: 100,
            tickAmount: 5,
          },
          fill: {
            opacity: 1
          },
          tooltip: {
            y: {
              formatter: function (val) {
                return val + "%"
              }
            }
          }
        },
      },
    };
  },
  
  watch: {
    alarmThreshold(){
      this.createRecommendationTypes();
      this.createRecommendationsAcceptance();
    },
    cases() {
      if(this.alarmThreshold){
        this.createRecommendationTypes();
        this.createRecommendationsAcceptance();
      }
    }
  },

  methods: {

    createRecommendationsAcceptance() {
      for (let i = 0; i < Object.keys(this.recommendationsByType).length; i++) {
        const t = Object.values(this.recommendationsByType)[i];
        this.recommendationsAcceptance.series[0].data[i] = Math.round(100 * t.accepted / t.total) || 0;
        this.recommendationsAcceptance.series[1].data[i] = Math.round(100 * (t.total - t.accepted) / t.total) || 0;
      }
    },

    async createRecommendationTypes() {
      this.resetRecommendationCounts();
      this.cases.forEach(({ activities }) => {
        const l = activities.length;
        if (l < 1) return;


        for (let i = 0; i < l; i++) {
          const prescriptions = activities[i].prescriptions;
          prescriptions.forEach(p => {
            if (p.status === 'accepted') this.recommendationsByType[p.type].accepted += 1;
            this.recommendationsByType[p.type].total += 1;
            if (i === (l - 1) && utils.prescriptionAttributes[p.type].pIsRecommended(p, this.alarmThreshold)) this.recommendationsByType[p.type].recommended += 1;
          });
        }
      });

      this.recommendationTypes.series = Object.keys(this.recommendationsByType).map(k => this.recommendationsByType[k].recommended)
    },

    resetRecommendationCounts() {
      Object.keys(this.recommendationsByType).forEach(t => {
        const recType = this.recommendationsByType[t];
        recType.accepted = 0;
        recType.recommended = 0;
        recType.total = 0;
      });
    },
  }
}

</script>