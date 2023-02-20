<template>
<side-bar></side-bar>
<div id="cases">
  <h2>Cases</h2>
  <div class="stats">
    <div @click="filterApplications(false)" :class="['stats-card',{'selected': completedApplications === false}]">
      <div class="column">
        <small>Ongoing applications</small>
        <div class="row">
          <h4> {{cases.filter(c => !c.case_completed).length}}</h4>        
        </div>
      </div>
      <ion-icon name="albums"></ion-icon>
    </div>

    <div @click="filterApplications(true)" :class="['stats-card',{'selected': completedApplications}]">
      <div class="column">
        <small> Completed applications</small>
        <div class="row">
          <h4> {{cases.filter(c => c.case_completed).length}}</h4>
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
      <tr v-for="item in casesData" :key='item'>
          <td v-for="(value,name) in item" :key='name'>
            <router-link :to="{name: 'case',params: {caseId: value}}" v-if="name==='id'">{{ value }}</router-link>
            <div v-else-if="name=='recommendations'" class="case-recommendations" :class="[value ? 'available' : 'unavailable']"> {{ value ? "recommendations available" : "no new recommendations" }}</div>
            <div v-else-if="name=='duration'">{{ value.value }} {{ value.measure }}</div>
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
import SideBar from '@/components/SideBar.vue';


export default {
  name: 'CasesList',

  components: {
        SideBar,
      },

  data() {
    return {
      cases: [],
      headers: ["Application ID","Recommendations","Duration","Intervened"],
      casesData: [],
      kpi: [],
      completedApplications: undefined,
    };
  },

  methods: {
    getCases() {
      Service.getCasesByLog(localStorage.fileId).then(
        (response) => {
          this.cases = response.data.cases;
          if (this.cases.length > 0) this.formatCases();
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
      
      for (const el of this.cases) {
        let caseActivities = el.activities;
        let data = {}
        if (!caseActivities.length) {
          data = {
              id: el._id,
              recommendations: false,
              duration: null,
              intervened: "No"
          }
        }
        else{
          const startDate = new Date(caseActivities[0]['TIMESTAMP']);
          const endDate = new Date(caseActivities[caseActivities.length - 1]['TIMESTAMP']);
          let measure, duration = Math.abs(endDate - startDate) / 1000;

          if (duration >= 86400) measure = 'days', duration /= 86400;
          else if (duration >= 3600) measure = 'hours', duration /= 3600;
          else if (duration >= 60) measure = 'minutes', duration /= 60;
          else measure = 'seconds';

          duration = Math.round(duration);

          let intervened = "No";
          caseActivities.forEach(activity => {
            activity.prescriptions.forEach(prescription => {
              if (prescription.status === 'accepted'){
                intervened = "Yes";
                return;
              }
            })
          });
          
          data = {
            id: el._id, 
            recommendations: caseActivities[caseActivities.length-1].prescriptions.length === 0 ? false : true,
            duration: {value: duration, measure: measure}, 
            intervened: intervened
          }
        }
        
        Object.keys(el.case_attributes).forEach(k => {
          data[k] = el.case_attributes[k];
        })
        
        this.casesData.push(data);
      }

      Object.keys(this.cases[0].case_attributes).forEach(k => {
        this.headers.push(k);
      })
    },

    filterApplications(status){
      var rows = document.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
      if (this.completedApplications === status){
        this.completedApplications = null;
        for (let i = 0; i < rows.length; i++) {
          rows[i].style.display = "";
        }
        return;
      }
      this.completedApplications = status;
      var filteredCases = this.cases.map(c => {if (c.case_completed === status) return c._id});
      for (let i = 0; i < rows.length; i++) {
        var routerLink = rows[i].getElementsByTagName("td")[0].getElementsByTagName("a")[0];
        var caseId = routerLink.textContent || routerLink.innerText;
        if (filteredCases.indexOf(caseId) < 0) {
            rows[i].style.display = "none";
        } else{
            rows[i].style.display = "";
        }
      }
    },
  },
  created() {
    this.getCases();
  },

}
</script>