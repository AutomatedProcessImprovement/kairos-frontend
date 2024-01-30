<template>
  <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <ion-icon class="sidebar-collapse-icon pointer" :class="{ active: isCollapsed }" @click="toggleSidebar"
      name="chevron-back-outline"></ion-icon>

    <div class="sidebar-heading pointer" @click="gotToDashboard">
      <img src="../assets/img/laptop2.svg" class="kairos-logo" alt="Kairos logo" />
      <h3 class="bold">Kairos</h3>
    </div>

    <div class="sidebar-content">
      <div class="sidebar-items">
        <router-link class="sidebar-item" :to="{ name: 'dashboard' }"><ion-icon
            name="home"></ion-icon>Dashboard</router-link>
        <router-link :class="['sidebar-item', 'cases-sidebar-item', { 'active': isCasesActive }]"
          :to="{ name: 'cases', params: { logId: logId, completion: 'completed' } }"><ion-icon
            name="list"></ion-icon>Cases</router-link>
        <router-link class="sidebar-item sub-item"
          :to="{ name: 'cases', params: { logId: logId, completion: 'completed' } }"><ion-icon
            name="stats-chart"></ion-icon>Completed Cases</router-link>
        <router-link class="sidebar-item sub-item"
          :to="{ name: 'cases', params: { logId: logId, completion: 'ongoing' } }"><ion-icon
            name="stats-chart"></ion-icon>Ongoing Cases</router-link>
        <router-link class="sidebar-item" :to="{ logId: logId, name: 'recommendations' }"><ion-icon
            name="document-text"></ion-icon>Recommendations</router-link>
      </div>

      <div class="switch-views">
        <h4 class="blue2">SELECT VIEW FOR</h4>
        <button v-for="view in views" :key="view" class="sidebar-item" :class="{ active: selectedView === view.value }"
          @click="selectView(view.value)"><ion-icon :name="view.icon"></ion-icon>{{ view.name }}</button>
      </div>
    </div>

  </div>
</template>

<script>

import utils from '@/common/utils';
import { useShepherd } from 'vue-shepherd';
import { offset } from '@floating-ui/dom';

export default {
  name: 'SideBarComponent',

  data() {
    return {
      views: [
        { name: 'Process analyst', value: 'analytical', icon: 'analytics' },
        { name: 'Operational worker', value: 'operational', icon: 'albums' },
        { name: 'Tactical manager', value: 'tactical', icon: 'people' }
      ],
      selectedView: null,
      isCollapsed: utils.getLocal('isCollapsed') || false,
      logId: utils.getLocal('logId'),
    }
  },

  computed: {
    isCasesActive() {
      return this.$route.path.includes('/cases');
    }
  },

  mounted() {
    if (!utils.getLocal('view')) utils.setLocal('view', 'analytical', 30);
    if (!utils.getLocal('logId')) utils.setLocal('logId', this.$route.params.logId, 30);
    this.selectedView = utils.getLocal('view');
    window.addEventListener('dashboard-onboarding-completed', this.resumeOnboarding);
  },

  beforeUnmount() {
    window.removeEventListener('dashboard-onboarding-completed', this.resumeOnboarding);
  },

  methods: {
    selectView(view) {
      this.selectedView = view;
      utils.setLocal('view', view, 30);
      window.dispatchEvent(new CustomEvent('view-changed', {
        detail: {
          storage: utils.getLocal('view')
        }
      }));
    },
    gotToDashboard() {
      this.$router.push({ name: 'dashboard' });
    },
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      utils.setLocal('isCollapsed', this.isCollapsed, 5);
    },
    resumeOnboarding() {

      const tour = useShepherd({
        useModalOverlay: true,
        defaultStepOptions: {
          classes: 'onboarding-kairos',
          scrollTo: true
        }
      });
      tour.addStep(
        {
          id: 'step5',
          text: 'The streamed cases will show up in the cases pages.',
          classes: 'onboarding-step',
          attachTo: {
            element: '.cases-sidebar-item',
            on: 'right-end'
          },
          buttons: [
            {
              text: 'Done',
              classes: 'shepherd-button-blue',
              action: function () {
                utils.setLocal('onboardingCompleted', true, 10000);
                tour.complete();
              }
            }
          ],
          floatingUIOptions: {
              middleware: [offset({ mainAxis: 15, crossAxis: 10 })]
          }
        }
      );

      tour.start();
    }
  }

}

</script>