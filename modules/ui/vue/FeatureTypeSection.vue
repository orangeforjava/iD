<template>
  <div class="preset-list-button-wrap">
    <button class="preset-list-button preset-reset" @click="state.onChoose" @pointerdown.prevent.stop @pointerup.prevent.stop @mousedown.prevent.stop @mouseup.prevent.stop>
      <div ref="iconRef" class="preset-icon-container"></div>
      <div class="label"><div ref="labelRef" class="label-inner"></div></div>
    </button>
    <div ref="accessoryRef" class="accessory-buttons" :style="{ display: state.showReference ? null : 'none' }"></div>
  </div>
  <div ref="bodyWrapRef" class="tag-reference-body-wrap" :style="{ display: state.showReference ? null : 'none' }"></div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';

const props = defineProps({ state: { type: Object, required: true } });

const iconRef = ref(null);
const labelRef = ref(null);
const accessoryRef = ref(null);
const bodyWrapRef = ref(null);

onMounted(async () => {
  await nextTick();
  props.state.setRefs({
    icon: iconRef.value,
    label: labelRef.value,
    accessory: accessoryRef.value,
    bodyWrap: bodyWrapRef.value
  });
});
</script>
