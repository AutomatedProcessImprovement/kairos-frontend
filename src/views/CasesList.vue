<template>
<div id="cases">
  <h2>Cases</h2>
  <div class="stats">
    <span>
      <p>Ongoing</p>
       {{formattedCases.filter(i => i.status == "Ongoing").length}} <small>cases</small> 
    </span>

    <span>
      <p> Cases with recommendations</p>
       {{formattedCases.filter(i => i.recs == "Yes").length}} <small>cases</small> 
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
      <tr v-for="item in formattedCases" :key='item'>
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
    const cases = null;
    const activities = null;
    const recommendations = null;
    const formattedCases = [];
    const headers = ["Case ID","Status","Start Date","Duration (d)","Recommendations","Last Update","Amount","Purpose"];
    return {cases,headers,activities,recommendations,formattedCases};
  },

  methods: {
    getCases() {
      ModelService.getCases().then(
        (response) => {
          this.cases = response.data;
          this.getRecommendations();  
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

    getRecommendations() {
      ModelService.getRecommendations().then(
        (response) => {
          this.recommendations = response.data;
          this.getActivities();
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

    getActivities() {
      ModelService.getActivities().then(
        (response) => {
          this.activities = response.data;
          this.formatCases();
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

    formatCases(){
      this.formattedCases = []
      var oneDay=1000*60*60*24;
      for (const el of this.cases) {
        let caseActivities = this.activities.filter(a => a.mycase.id === el.id)
        let caseRecommendations = this.recommendations.filter(r => r.mycase.id === el.id)
        if (!caseActivities.length) {
          this.formattedCases.push({id:el.id,
                          status: "Ongoing",
                          startdate: "NaN",
                          duration: "NaN",
                          recs: caseRecommendations.length ? "No" : "Yes",
                          update: "NaN",
                          amount: el.amount,
                          purpose: el.purpose})
          continue;
        }
        var startDate = new Date(caseActivities[0].timestamp)
        var endDate = new Date(caseActivities[caseActivities.length - 1].timestamp)
        this.formattedCases.push({id: el.id, status: "Ongoing",
                          startdate: startDate.toLocaleDateString("en-GB"), 
                          duration: Math.round((endDate - startDate)/oneDay), 
                          recs: !caseRecommendations.length ? "No" : "Yes",
                          update: caseActivities[caseActivities.length - 1].name + ' ' + endDate.toLocaleDateString("en-GB"),
                          amount: el.amount,
                          purpose: el.purpose})
    }
  }
  
  },
  created() {
    this.getCases();
  },

}
</script>