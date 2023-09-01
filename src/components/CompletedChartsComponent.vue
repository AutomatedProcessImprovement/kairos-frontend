<template>
    <div class="cases-charts">
      <div class="cases-chart shadow">
        <div class="row">
          <h3>Recommendations History</h3>
          <tooltip-component :iconSize="25" icon="information-circle" color="grey" :tooltipSize="400">           
            <template v-slot:title>
                <h3>What does recommendations history describe?</h3>
            </template>
            <template v-slot:content>
              <p>The graph shows the percentage of cases where a recommendation was performed and the case ended in a positive or a negative outcome.</p>
            </template>
          </tooltip-component>
        </div>
        <apexchart type="pie" :options="recommendationsHistory.chartOptions" :series="recommendationsHistorySeries"></apexchart>
      </div>
  
      <div class="cases-chart shadow">
        <div class="row justify-start">
          <h3>Recommendations Statistics</h3>
          <tooltip-component :iconSize="25" icon="information-circle" color="grey" :tooltipSize="400">           
            <template v-slot:title>
                <h3>What do model statistics describe?</h3>
            </template>
            <template v-slot:content>
              <p>Each number represents the percentage of a type of prescription (alarm, next activity, intervention) 
                prescribed and accepted in cases with different outcomes (positive, negative).</p>
            </template>
          </tooltip-component>
        </div>

        <table>
          <th v-for="header in modelsStatistics.headers" :key="header">
            {{ header.label }}
          </th>
          <tr v-for="(row,key) in modelsStatistics.rows" :key="key">
            <td>{{ key === "true" ? 'Positive' : 'Negative' }}</td>
            <td v-for="count in row" :key="count"> {{ Math.round(100 * count.accepted/count.total) || 0 }}</td>
          </tr>
        </table>
      </div>

      <div class="cases-chart shadow">
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
          chartOptions: {
            colors: ['#17ad37','#F5222D','#a0a3a5'],
            chart: {
              animations:{
                enabled: false,
              },
              type: 'pie',
            },
            labels: ['Was positive', 'Was negative', 'No data'],
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
            colors: ['#17ad37','#7e7e7e'],
            chart: {
              type: 'bar',
              stacked: true,
              stackType: '100%',
              animations:{
                enabled: false,
              }
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

    computed:{
      recommendationsHistorySeries(){
        let series = [];
        let outcomeCounts = shared.groupByAndCount(this.casesData,'outcome','intervened','Yes');
        if(Object.keys(outcomeCounts).length > 0){
          const propertiesToCheck = [true, false, null];
          series = propertiesToCheck.map(property => {
            return outcomeCounts[property] || 0;
          });
        }
        return series;
      }
    },

    watch:{
        cases(){
          this.createModelsStatistics();
          this.createRecommendationsAcceptance();
        },
      },

    methods:{

      createRecommendationsAcceptance(){
        let a = this.modelsStatistics.rows['true'];
        for (let i = 0; i < Object.keys(a).length; i++) {
          const t = Object.values(a)[i];
          this.recommendationsAcceptance.series[0].data[i] = Math.round(100 * t.accepted/t.total) || 0;
          this.recommendationsAcceptance.series[1].data[i] = Math.round(100 * (t.total - t.accepted)/t.total) || 0;
        }
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
      },
    }
}

</script>