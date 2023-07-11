<template>
    <div class="completed-cases-charts row">
      <div class="completed-cases-chart shadow">
        <h3>Recommendations history</h3>
        <apexchart type="pie" width="350" :options="recommendationsHistory.chartOptions" :series="recommendationsHistory.series"></apexchart>
      </div>
  
      <div class="completed-cases-chart margin shadow">
        <h3>Models statistics</h3>
        <table-lite
            :columns="modelsStatistics.headers"
            :rows="modelsStatistics.rows"
            :is-hide-paging="true"
        ></table-lite>
      </div>

      <div class="completed-cases-chart margin shadow">
        <h3>Recommendations Acceptance</h3>
        <apexchart type="bar" :options="recommendationsAcceptance.chartOptions" :series="recommendationsAcceptance.series"></apexchart>
      </div>

    </div>
</template>

<script>

import VueApexCharts from 'vue3-apexcharts';
import shared from '@/services/shared';
import TableLite from "vue3-table-lite";

export default {
    name: "ChartsComponent",
    
    components: {
        apexchart: VueApexCharts,
        TableLite
        },

    props: {
        cases: Array,
        casesData: Array,
    },

    data() {
      return {

        modelsStatistics: {
          headers: [
            {
              label: "Alarm",
              field: "alarm",
              sortable: false,
              width: "30%"
            },
            {
                label: "Next activity",
                field: "nextActivity",
                sortable: false,
                width: "30%"
            },
            {
              label: "Intervention",
              field: "intervention",
              sortable: false,
              width: "30%"
            },
          ],
          rows: [],
        },

        recommendationsHistory: {
          series: [0, 0, 1],
          chartOptions: {
            colors: ['#17ad37','#F5222D','#a0a3a5'],
            chart: {
              animations:{
                enabled: false,
              },
              type: 'pie',
            },
            labels: ['Was successful', 'Was unsuccessful', 'No data'],
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
            colors: ['#17ad37','#F5222D','#a0a3a5'],
            chart: {
              type: 'bar',
              stacked: true,
              stackType: '100%'
            },
            plotOptions: {
              bar: {
                horizontal: false,
                columnWidth: '50%',
                borderRadius: 5
              },
            },
            dataLabels: {
              enabled: false
            },
            stroke: {
              show: true,
              width: 2,
              colors: ['transparent']
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

    watch:{
        cases(){
            this.createRecommendationsHistory();
            this.createRecommendationsAcceptance();
            this.createModelsStatistics();
        }
    },

    methods:{
        createRecommendationsHistory(){
        let outcomeCounts = shared.groupByAndCount(this.casesData,'outcome','intervened','Yes');
        if(Object.keys(outcomeCounts).length > 0){
          const propertiesToCheck = [true, false, null];
          this.recommendationsHistory.series = propertiesToCheck.map(property => {
            return outcomeCounts[property] || 0;
          });
        }
      },

      createRecommendationsAcceptance(){
        const propertiesToCheck = ['ALARM', 'NEXT_ACTIVITY', 'TREATMENT_EFFECT'];
        let prescriptions = this.cases.flatMap(({activities}) => activities.flatMap(a => a.prescriptions));
        let prescriptionCounts = shared.groupByAndCount(prescriptions,'type');
        let acceptedPrescriptionCounts = shared.groupByAndCount(prescriptions,'type','status','accepted');
        let acceptedPrescriptionPercentages = propertiesToCheck.reduce((o,p) => ({...o,[p] : Math.round(100*acceptedPrescriptionCounts[p]/prescriptionCounts[p])}),{});
        let discardedPrescriptionPercentages = propertiesToCheck.reduce((o,p) => ({...o,[p] : 100 - acceptedPrescriptionPercentages[p]}),{});
   
        this.recommendationsAcceptance.series[0].data = propertiesToCheck.map(property => {
          return acceptedPrescriptionPercentages[property] || 0;
        });
        this.recommendationsAcceptance.series[1].data = propertiesToCheck.map(property => {
          return discardedPrescriptionPercentages[property] || 0;
        });
      },

      createModelsStatistics(){
        
      },
    }
}

</script>