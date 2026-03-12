<!--
  VueRoot - Invisible root component for the singleton Vue app.

  Renders nothing at its own mount point. All actual UI output is
  teleported to d3-created DOM nodes via <Teleport>.

  The reactive `state.components` array is managed by app.js
  (registerComponent / unregisterComponent). Each entry contains:
    { id, component, target (DOM element), props }
-->
<template>
  <Teleport v-for="entry in state.components" :key="entry.id" :to="entry.target">
    <component :is="entry.component" v-bind="entry.props" />
  </Teleport>
</template>

<script setup>
defineProps({
  state: {
    type: Object,
    required: true
  }
});
</script>
