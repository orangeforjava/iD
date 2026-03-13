<template>
  <div ref="hostRef"></div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const hostRef = ref(null);

async function renderIntoHost() {
  await nextTick();
  if (hostRef.value) {
    props.state.renderInto(hostRef.value);
  }
}

onMounted(renderIntoHost);
watch(() => props.state.renderVersion, renderIntoHost);
</script>
