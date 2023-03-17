<template>
<side-bar></side-bar>
<loading v-if="isLoading"></loading>
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

import casesService from "@/services/cases.service";
import SideBar from '@/components/SideBar.vue';
import Loading from "@/components/LoadingComponent.vue";

export default {
  name: "ResourcesPage",

  components: {
        SideBar,
        Loading
      },

  data(){
    return {
      isLoading: true,
      headers: [],
      resources: null,
      available: 0,
      busy: 0
    }
  },
  mounted() {
    this.getResources();
  },

  methods:{
    getResources(){
        casesService.getCases().then(
          (response) => {
            console.log(response.data);
            this.isLoading = false;
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
  },

}
</script>

<style>

</style>