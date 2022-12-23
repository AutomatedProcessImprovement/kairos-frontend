<template>
  <div id="resources">
      <h2>Resources</h2>
      <div class="stats">
        <span>
          <p>Available</p>
          {{available}} <small>resources</small> 
        </span>

        <span>
          <p> Busy </p>
          {{busy}} <small>resources</small> 
        </span>

        <span>
          <p> Current workload </p>
          {{Math.round(available/(busy+available)*100)}}% <small>resources</small> 
        </span>
      </div>



      <div class="resources-table">
      <table>
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
      headers: ["ID","Name","Available","Role"],
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
            this.resources = cases.foreach(e => {
              e.activities.foreach(a => {
                return a.resource;
              })
            })
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