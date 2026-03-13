<template>
  <div class="form-field-input-wrap form-field-input-roadspeed">
    <input ref="speedRef" type="text" class="roadspeed-number" :id="state.domId">
    <input ref="unitRef" type="text" class="roadspeed-unit" :aria-label="state.unitLabel">
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({ state: { type: Object, required: true } });
const speedRef = ref(null);
const unitRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({ speed: speedRef.value, unit: unitRef.value });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
