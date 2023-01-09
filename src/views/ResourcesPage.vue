<template>
  <div id="resources">
      <h2>Resources</h2>
      <div class="stats">
        <div class="stats-card">
          <div class="column">
            <p>Available</p>
            <p>{{available}}</p>
          </div>
          <ion-icon name="person"></ion-icon>
        </div>

        <div class="stats-card">
          <div class="column">
            <p> Busy </p>
            <p>{{busy}}</p>
          </div>
          <ion-icon name="person"></ion-icon>
        </div>

        <div class="stats-card">
          <div class="column">
            <p>Current workload </p>
            <p>{{Math.round(available/(busy+available)*100)}}%</p>
          </div>
          <ion-icon name="analytics"></ion-icon>
        </div>
      </div>



      <div class="resources-table">
      <table class="shadow">
        <thead>
        <tr>
          <th v-for="header in headers" :key="header"> {{ header }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in resources" :key='item'>
          <td v-for="value in item" :key='value'>
            <p>{{ value }}</p>
            </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>

import Service from "@/services/service";

export default {

  data(){
    return {
      headers: [],
      resources: null,
      available: 0,
      busy: 0
    }
  },

  methods:{
    getResources(){
        Service.getCases().then(
          (response) => {
            const cases = response.data.cases;

            const resources = []
            for (const c of cases) {
              for (const a of c.activities) {
                resources.push(a.resource)
              }
            }
            
            this.resources = [...new Map(resources.map(v => [v.name, v])).values()]

            if(this.resources){
              this.headers = Object.keys(this.resources[0]).map(h => h.charAt(0).toUpperCase() + h.slice(1))

              this.resources.forEach(r => r.available? this.available += 1 : this.busy += 1)
            }
          },
          (error) => {
            this.content =
              (error.response &&
                error.response.data &&
                error.response.data.message) ||
              error.message ||
              error.toString();
          }
        );
      },
  },
  created() {
    this.getResources();
  }

}
</script>

<style>

</style>