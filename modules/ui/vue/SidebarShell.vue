<template>
  <div ref="resizerRef" class="sidebar-resizer"></div>
  <div ref="featureListRef" class="feature-list-pane"></div>
  <div ref="inspectorWrapRef" class="inspector-hidden inspector-wrap"></div>
  <div ref="currentHostRef" class="sidebar-current-host"></div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';

const props = defineProps({ state: { type: Object, required: true } });

const resizerRef = ref(null);
const featureListRef = ref(null);
const inspectorWrapRef = ref(null);
const currentHostRef = ref(null);

onMounted(async () => {
  await nextTick();
  props.state.setRefs({
    resizer: resizerRef.value,
    featureList: featureListRef.value,
    inspectorWrap: inspectorWrapRef.value,
    currentHost: currentHostRef.value
  });
});
</script>
