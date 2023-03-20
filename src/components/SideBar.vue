<template>
  <div class="sidebar">

    <div class="sidebar-heading">
      <ion-icon name="laptop-outline"></ion-icon>
      <h3 class="bold">Kairos</h3>
    </div>

    <div class="sidebar-content">
      <div class="sidebar-items">
        <router-link class = "sidebar-item"  :to="{ name: 'dashboard'}"><ion-icon name="home"></ion-icon>Dashboard</router-link>
        <router-link class = "sidebar-item"  :to="{ name: 'cases'}"><ion-icon name="stats-chart"></ion-icon>Cases</router-link>
        <!-- <router-link class = "sidebar-item"  :to="{ name: 'resources'}"><ion-icon name="people"></ion-icon>Resources</router-link> -->
      </div>
  
      <div class="switch-views">
        <h4 class="blue2">SELECT VIEW FOR</h4>
        <button v-for="view in views" :key="view" class="sidebar-item" :class="{ active: selectedView===view.value }" @click="selectView(view.value)"><ion-icon :name="view.icon"></ion-icon>{{view.name}}</button>
      </div>
    </div>

  </div>
</template>

<script>
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
    if(!localStorage.view){
      localStorage.view = 'analytical';
    }
    this.selectedView = localStorage.view;
  },

  methods:{
    selectView(view){
      this.selectedView = view;
      localStorage.view = view;
      window.dispatchEvent(new CustomEvent('view-changed', {
        detail: {
          storage: localStorage.view
        }
      }));
    }
  }

}

</script>