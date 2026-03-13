<template>
  <div class="header fillL">
    <button class="preset-reset preset-choose" :title="t('inspector.back_tooltip')" @click="state.onChoose()">
      <svg class="icon"><use :href="state.backIcon" /></svg>
    </button>
    <button class="close" :title="t('icons.close')" @click="state.onClose()">
      <svg class="icon"><use :href="state.closeIcon" /></svg>
    </button>
    <h2>{{ state.headerText }}</h2>
  </div>

  <div ref="bodyRef" class="entity-editor inspector-body sep-top"></div>
</template>

<script setup>
import { select as d3_select } from 'd3-selection';
import { nextTick, onMounted, ref, watch } from 'vue';
import { t } from '../../core/localizer';

const props = defineProps({ state: { type: Object, required: true } });
const bodyRef = ref(null);

async function renderSections() {
  await nextTick();
  if (!bodyRef.value) return;
  props.state.renderSections(d3_select(bodyRef.value));
}

onMounted(renderSections);
watch(() => props.state.renderVersion, renderSections);
</script>
