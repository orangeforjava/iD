<template>
  <div class="form-field-input-wrap form-field-input-restrictions" ref="wrapRef">
    <div ref="containerRef" class="restriction-container">
      <div class="restriction-help"></div>
    </div>
    <div class="restriction-controls-container">
      <div ref="controlsRef" class="restriction-controls"></div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const wrapRef = ref(null);
const containerRef = ref(null);
const controlsRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({
    wrap: wrapRef.value,
    container: containerRef.value,
    controls: controlsRef.value
  });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
