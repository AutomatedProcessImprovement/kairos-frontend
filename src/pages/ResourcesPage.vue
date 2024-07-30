<template>
  <side-bar></side-bar>
  <loading v-if="isLoading" :startPosition="200"></loading>
  <div id="resource-management">
    <h2>Resources</h2>
    <div class="stats">
      <div class="kpi wrap-text">
        <div class="row"><small>Current Workload</small></div>
        <div class="row"><h3 class="kpi-number large-number">{{ currentWorkload }}%</h3></div>
      </div>
      <div class="stats-card bg-light-blue">
        <div class="column">
          <small>All Resources</small>
          <div class="row">
            <h4>{{ totalResources }}</h4>
          </div>
        </div>
      </div>
      <div class="stats-card bg-light-green">
        <div class="column">
          <small>Available Resources</small>
          <div class="row">
            <h4>{{ availableResources }}</h4>
          </div>
        </div>
      </div>
      <div class="stats-card bg-light-red">
        <div class="column">
          <small>Busy Resources</small>
          <div class="row">
            <h4>{{ busyResources }}</h4>
          </div>
        </div>
      </div>
    </div>
    <ResourcesTable :resources="resources" />
  </div>
</template>

<script>
import SideBar from '@/components/SideBarComponent.vue';
import Loading from "@/components/LoadingComponent.vue";
import ResourcesTable from '@/components/ResourcesTableComponent.vue';
import resourceService from '@/services/resources.service';
import store from '@/services/store';

export default {
  name: 'ResourcesPage',
  components: {
    SideBar,
    Loading,
    ResourcesTable,
  },
  data() {
    return {
      isLoading: true,
      resources: [],
    };
  },
  computed: {
    totalResources() {
      return this.resources.length;
    },
    availableResources() {
      return this.resources.filter(resource => resource.status === 'Available').length;
    },
    busyResources() {
      return this.resources.filter(resource => resource.status === 'Busy').length;
    },
    currentWorkload() {
      const total = this.totalResources;
      const busy = this.busyResources;
      return total > 0 ? Math.round((busy / total) * 100) : 0;
    }
  },
  methods: {
    async setup() {
      this.isLoading = true;
      try {
        const fetchedResources = await resourceService.fetchResourceData();
        this.resources = Array.from(new Set(fetchedResources.map(resource => resource.name)))
            .map(name => fetchedResources.find(resource => resource.name === name));
        console.log(this.resources);
        await store.dispatch('setResources', this.resources);
      } catch (error) {
        this.$notify({
          title: 'An error occurred',
          text: error.response?.data?.error || error.message || 'Unknown error',
          type: 'error'
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    this.setup();
  }
};
</script>
