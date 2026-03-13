<template>
  <div class="form-field-input-wrap form-field-input-roadheight">
    <input ref="primaryRef" type="text" class="roadheight-number" :id="state.domId">
    <input ref="primaryUnitRef" type="text" class="roadheight-unit">
    <input ref="secondaryRef" type="text" class="roadheight-secondary-number">
    <input ref="secondaryUnitRef" type="text" class="roadheight-secondary-unit disabled" readonly>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({ state: { type: Object, required: true } });
const primaryRef = ref(null);
const primaryUnitRef = ref(null);
const secondaryRef = ref(null);
const secondaryUnitRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({
    primary: primaryRef.value,
    primaryUnit: primaryUnitRef.value,
    secondary: secondaryRef.value,
    secondaryUnit: secondaryUnitRef.value
  });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
