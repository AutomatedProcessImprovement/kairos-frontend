<template>
    <div class="completed-cases-charts">
      <div class="completed-cases-chart shadow">
        <h3>Recommendations history</h3>
        <apexchart type="pie" :options="recommendationsHistory.chartOptions" :series="recommendationsHistory.series"></apexchart>
      </div>
  
      <div class="completed-cases-chart shadow">
        <div class="row content-start">
          <h3>Models statistics</h3>
            <tooltip-component :iconSize="25" icon="information-circle" color="grey" :tooltipSize="400">           
              <template v-slot:title>
                  <h3>What do model statistics describe?</h3>
              </template>
              <template v-slot:content>
                <p>Each number represents the percentage of a type of prescription (alarm, next activity, intervention) 
                  prescribed and accepted in cases with different outcomes (successful, unsuccessful).</p>
              </template>
            </tooltip-component>
        </div>

        <table>
          <th v-for="header in modelsStatistics.headers" :key="header">
            {{ header.label }}
          </th>
          <tr v-for="(row,key) in modelsStatistics.rows" :key="key">
            <td>{{ key === "true" ? 'Successful' : 'Unsuccessful' }}</td>
            <td v-for="count in row" :key="count"> {{ Math.round(100 * count.accepted/count.total) || 0 }}</td>
          </tr>
        </table>
      </div>

      <div class="completed-cases-chart shadow">
        <h3>Recommendations Acceptance</h3>
        <apexchart type="bar" :options="recommendationsAcceptance.chartOptions" :series="recommendationsAcceptance.series"></apexchart>
      </div>

    </div>
</template>

<script>

import VueApexCharts from 'vue3-apexcharts';
import shared from '@/services/shared';
import TooltipComponent from './TooltipComponent.vue';

export default {
    name: "ChartsComponent",
    
    components: {
        apexchart: VueApexCharts,
        TooltipComponent
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
              label: "",
              field: "blank",
            },
            {
              label: "Alarm",
              field: "ALARM",
            },
            {
                label: "Next activity",
                field: "NEXT_ACTIVITY",
            },
            {
              label: "Intervention",
              field: "TREATMENT_EFFECT",
            },
          ],
          rows: {
            true: {
              'ALARM' : {total: 0, accepted: 0},
              'NEXT_ACTIVITY' : {total: 0, accepted: 0},
              'TREATMENT_EFFECT' : {total: 0, accepted: 0}
            },
            false: {
              'ALARM' : {total: 0, accepted: 0},
              'NEXT_ACTIVITY' : {total: 0, accepted: 0},
              'TREATMENT_EFFECT' : {total: 0, accepted: 0}
            }
        }
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
        this.cases.forEach(({case_performance,activities}) => {
          const outcome = case_performance.outcome;
          const prescriptions = activities.map(a => a.prescriptions).flat();

          prescriptions.forEach(p => {
            if(p.status === 'accepted') this.modelsStatistics.rows[outcome][p.type].accepted += 1;
            this.modelsStatistics.rows[outcome][p.type].total += 1
          });
        });
        console.log(this.modelsStatistics.rows);
      },
    }
}

</script>