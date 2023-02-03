<template>
<div id="cases">
  <h2>Cases</h2>
  <div class="stats">
    <div class="stats-card">
      <div class="column">
        <small>Ongoing applications</small>
        <div class="row">
          <h4> {{formattedCases.filter(i => i.status === "Open").length}}</h4>        
        </div>
      </div>
      <ion-icon name="albums"></ion-icon>
    </div>

    <div class="stats-card">
      <div class="column">
        <small> Completed applications</small>
        <div class="row">
          <h4> {{formattedCases.filter(i => i.status !== "Open").length}}</h4>
        </div>
      </div>
      <ion-icon name="albums"></ion-icon>
    </div>
  </div>


  <div class="cases-table">
    <table class="shadow">
      <thead>
      <tr>
        <th v-for="header in headers" :key="header"> {{ header }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in formattedCases" :key='item'>
        <td v-for="(value,name) in item" :key='name'>
          <router-link v-if="name=='id'" :to="{ name: 'case', params: {caseId: value} }">{{value}}</router-link>
          <div v-else-if="name=='status'" class="status" :class="[value === 'Open'? 'open' : 'completed']"> {{ value }}</div>
          <p v-else>{{ value }}</p>
          </td>
      </tr>
      </tbody>
    </table>
  </div>
  </div>
</template>

<script>

import Service from "../services/service";

export default {
  name: 'CasesList',
  data() {
    const cases = [];
    const kpi = [];
    const formattedCases = [];
    const headers = ["Case ID","Status","Start Date","Duration (d)","Recommendations","Last Update","Amount","Purpose"];
    return {cases,headers,formattedCases,kpi};
  },

  methods: {
    getCases() {
      Service.getCases().then(
        (response) => {
          this.cases = response.data.cases;
          console.log(this.cases);
          this.kpi = response.data.kpi;
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
        let caseActivities = el.activities;
        let caseRecommendations = el.recommendations;
        if (!caseActivities.length) {
          this.formattedCases.push({id: el.caseId,
                          status: el.status,
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
        this.formattedCases.push({id: el.caseId, status: el.status,
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