<template>
  <div class="form-field-input-wrap form-field-input-lanes" ref="wrapRef">
    <svg ref="surfaceRef" class="surface"></svg>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const wrapRef = ref(null);
const surfaceRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({
    wrap: wrapRef.value,
    surface: surfaceRef.value
  });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
