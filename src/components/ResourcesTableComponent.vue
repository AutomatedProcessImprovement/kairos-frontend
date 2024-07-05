<template>
  <div class="resources-table">
    <table-lite
        :is-hide-paging="true"
        :is-slot-mode="true"
        :columns="headers"
        :rows="resources"
        :total="resources.length"
        @row-clicked="rowClicked"
    >
      <template v-slot:name="data">
        <td class="fixed-width">{{ data.value.name }}</td>
      </template>
      <template v-slot:role="data">
        <td class="fixed-width">{{ data.value.role }}</td>
      </template>
      <template v-slot:status="data">
        <td class="fixed-width">
          <div :class="['resource-status', getStatusClass(data.value.status)]">
            <span>{{ data.value.status }}</span>
          </div>
        </td>
      </template>
      <template v-slot:_id="data">
        <td class="fixed-width">
          <button @click="rowClicked(data.value)" class="show-details">{{ data.value.id }}</button>
        </td>
      </template>
    </table-lite>
  </div>
</template>

<script>
import TableLite from "vue3-table-lite";

export default {
  name: 'ResourcesTable',
  components: {
    TableLite,
  },
  props: {
    resources: {
      type: Array,
      required: true,
    },
  },
  computed: {
    headers() {
      return [
        { label: 'Name', field: 'name', sortable: false },
        { label: "Role", field: "role", width: "25%", sortable: false },
        { label: "Status", field: "status", width: "25%", sortable: false },
        { label: "Case ID", field: "_id", width: "25%", sortable: false }
      ];
    },
  },
  methods: {
    getStatusClass(status) {
      return status === 'Available' ? 'available' : 'unavailable';
    },
    rowClicked(row) {
      if (row && row.id) {
        this.$router.push({ name: 'case', params: { caseId: row.id, completion: 'ongoing' } });
      } else {
        console.error('Invalid row data:', row);
      }
    },
  },
};
</script>
