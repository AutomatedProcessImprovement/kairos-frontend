<template>
  <div class="sidebar">

    <div class="sidebar-heading pointer" @click="goToHome">
      <ion-icon name="laptop-outline"></ion-icon>
      <h3 class="bold">Kairos</h3>
    </div>

    <div class="sidebar-content">
      <div class="sidebar-items">
        <router-link class = "sidebar-item"  :to="{ name: 'dashboard'}"><ion-icon name="home"></ion-icon>Dashboard</router-link>
        <router-link class = "sidebar-item"  :to="{ name: 'cases'}"><ion-icon name="stats-chart"></ion-icon>Cases</router-link>
        <router-link class = "sidebar-item"  :to="{ name: 'recommendations'}"><ion-icon name="document-text"></ion-icon>Recommendations</router-link>
      </div>
  
      <div class="switch-views">
        <h4 class="blue2">SELECT VIEW FOR</h4>
        <button v-for="view in views" :key="view" class="sidebar-item" :class="{ active: selectedView===view.value }" @click="selectView(view.value)"><ion-icon :name="view.icon"></ion-icon>{{view.name}}</button>
      </div>
    </div>

  </div>
</template>

<script>

import shared from '@/services/shared';

export default {
  name: 'SideBarComponent',

  data(){
    return{
      views: [
        {name: 'Process analyst',value:'analytical',icon:'analytics'},
        {name: 'Operational worker',value:'operational',icon:'albums'},
        {name: 'Tactical manager',value:'tactical',icon:'people'}
      ],
      selectedView: null,
    }
  },

  mounted() {
    if(!shared.getLocal('view')){
      
      shared.setLocal('view','analytical',30);
    }
    this.selectedView = shared.getLocal('view');
  },

  methods:{
    selectView(view){
      this.selectedView = view;
      shared.setLocal('view',view,30);
      window.dispatchEvent(new CustomEvent('view-changed', {
        detail: {
          storage: shared.getLocal('view')
        }
      }));
    },
    goToHome(){
      this.$router.push({name: 'home'});
    }
  }

}

</script>