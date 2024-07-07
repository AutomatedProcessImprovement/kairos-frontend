<template>
  <div class="stats-card column">
    <p>Target</p>
    <h3 class="blue target-value">{{ object.value }} {{ object.unit }}</h3>
    <small>Case {{ object.column }} {{ object.operator }}</small>
  </div>
</template>

<script>

export default {
  name: 'PositiveOutcomeItemComponent',
  props: {
    object: undefined
  },
  computed: {
    value() {
      return this.positiveOutcomeItems.value;
    },
    unit() {
      return this.positiveOutcomeItems.unit;
    },
    column() {
      return this.positiveOutcomeItems.column;
    },
    operator() {
      return this.positiveOutcomeItems.operator;
    }
  }
}
</script>