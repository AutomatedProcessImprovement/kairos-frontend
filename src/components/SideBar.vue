<template>
  <div class="sidebar" :class="{'collapsed': isCollapsed}">
    <ion-icon class="sidebar-collapse-icon pointer" :class="{active: isCollapsed}" @click="isCollapsed = !isCollapsed" name="chevron-back-outline"></ion-icon>

    <div class="sidebar-heading pointer" @click="goToHome">
      <img src="../assets/img/laptop2.svg" class="kairos-logo" alt="Kairos logo"/>
      <h3 class="bold">Kairos</h3>
    </div>

    <div class="sidebar-content">
      <div class="sidebar-items">
        <router-link class = "sidebar-item"  :to="{ name: 'dashboard'}"><ion-icon name="home"></ion-icon>Dashboard</router-link>
        <router-link :class="['sidebar-item', {'active': isCasesActive}]"  :to="{ name: 'cases',params: {completion: 'completed'}}"><ion-icon name="list"></ion-icon>Cases</router-link>
        <router-link class = "sidebar-item sub-item"  :to="{ name: 'cases',params: {completion: 'completed'}}"><ion-icon name="stats-chart"></ion-icon>Completed Cases</router-link>
        <router-link class = "sidebar-item sub-item"  :to="{ name: 'cases',params: {completion: 'ongoing'}}"><ion-icon name="stats-chart"></ion-icon>Ongoing Cases</router-link>
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
      isCollapsed: false,
    }
  },

  computed:{
    isCasesActive(){
      return this.$route.path.startsWith('/cases');
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