<template>
<side-bar></side-bar>
<loading v-if="isLoading"></loading>
<div id="cases">
  <h2>Cases</h2>
  <div class="stats">
    <div @click="filterCases(false)" :class="['stats-card','pointer',{'selected': completedCases === false}]">
      <div class="column">
        <small>Ongoing cases</small>
        <div class="row">
          <h4> {{cases.filter(c => !c.case_completed).length}}</h4>        
        </div>
      </div>
      <ion-icon name="albums"></ion-icon>
    </div>

    <div @click="filterCases(true)" :class="['stats-card','pointer',{'selected': completedCases}]">
      <div class="column">
        <small> Completed cases</small>
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
        <th v-for="header in headers" :key="header"> {{ header }}
        </th>
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

import casesService from "@/services/cases.service";
import SideBar from '@/components/SideBar.vue';
import Loading from "@/components/LoadingComponent.vue";

export default {
  name: 'CasesList',

  components: {
        SideBar,
        Loading
      },

  data() {
    return {
      isLoading: false,
      cases: [],
      headers: ["Case ID","Recommendations","Intervened"],
      casesData: [],
      kpi: [],
      completedCases: undefined,
    };
  },

  mounted() {
    if (localStorage.logId !== 'null') this.getCases();
  },
  
  methods: {
    getCases() {
      this.isLoading = true;
      casesService.getCasesByLog(localStorage.logId).then(
        (response) => {
          console.log(response);
          this.cases = response.data.cases;
          if (this.cases.length > 0) this.formatCases();
          else this.isLoading = false;
          },
        (error) => {
          this.isLoading = false;
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
            this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    }) 
        }
      );
    },

    formatCases(){
      let performanceColumn = null;
      
      for (const el of this.cases) {
        if(!performanceColumn){
          performanceColumn = el.case_performance.column;
        }
        let performanceValue = el.case_performance.value;
        
        let caseActivities = el.activities;
        let data = {}
        if (!caseActivities.length) {
          data = {
              id: el._id,
              recommendations: false,
              intervened: "No",
              performance: performanceValue,
          }
        }
        else{
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
            intervened: intervened,
            performance: performanceValue, 
          }
        }
        
        Object.keys(el.case_attributes).forEach(k => {
          data[k] = el.case_attributes[k];
        })
        
        this.casesData.push(data);
      }

      this.headers.push(performanceColumn)

      Object.keys(this.cases[0].case_attributes).forEach(k => {
        this.headers.push(k);
      })

      this.isLoading = false;
    },

    filterCases(status){
      var rows = document.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
      if (this.completedCases === status){
        this.completedCases = null;
        for (let i = 0; i < rows.length; i++) {
          rows[i].style.display = "";
        }
        return;
      }
      this.completedCases = status;
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

}
</script>