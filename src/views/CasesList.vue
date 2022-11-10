<template>
<div id="cases">
  <h2>Cases</h2>
  <div class="stats">
    <span>
      <p>Ongoing</p>
       {{cases.filter(i => i.status == "Ongoing").length}} <small>cases</small> 
    </span>

    <span>
      <p> Cases with recommendations</p>
       {{cases.filter(i => i.recs == "Yes").length}} <small>cases</small> 
       </span>
  </div>


  <div class="cases-table">
    <table>
      <thead>
      <tr>
        <th v-for="header in headers" :key="header"> {{ header }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in cases" :key='item'>
        <td v-for="(value,name) in item" :key='name'>
          <router-link v-if="name=='id'" :to="{ name: 'case', params: {caseId: value} }">{{value}}</router-link>
          <p v-else>{{ value }}</p>
          </td>
      </tr>
      </tbody>
    </table>
  </div>
  </div>
</template>

<script>

import ModelService from "../services/model.service";

export default {
  name: 'CasesList',
  data() {
    const cases = [];
    const headers = ["Case ID","Status","Start Date","Duration (d)","Recommendations","Last Update"];
    return {cases,headers};
  },

  methods: {
    getCases() {
      ModelService.getCases().then(
        (response) => {
          console.log(response.data);
          this.processCases(response.data);
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
    processCases(data){
      var oneDay=1000*60*60*24;
      for (const el of data) {
        if (!el.activities.length) {
          this.cases.push({id:el.caseId,
                          status: "Ongoing",
                          startdate: "NaN",
                          duration: "NaN",
                          recs: !el.interventions.length ? "No" : "Yes",
                          update: "NaN"})
          continue;
        }
        var startDate = new Date(el.activities[0].timestamp)
        var endDate = new Date(el.activities[el.activities.length - 1].timestamp)
        this.cases.push({id: el.caseId, status: "Ongoing",
                          startdate: startDate.toLocaleDateString("en-GB"), 
                          duration: Math.round((endDate - startDate)/oneDay), 
                          recs: !el.interventions.length ? "No" : "Yes",
                          update: el.activities[el.activities.length - 1].name + ' ' + endDate.toLocaleDateString("en-GB")})
    }
    }
  },
  created() {
    this.getCases();
  }

};
</script>