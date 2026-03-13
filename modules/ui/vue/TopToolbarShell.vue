<template>
  <div v-for="item in state.tools" :key="item.key" :class="item.classes">
    <template v-if="item.type === 'spacer'"></template>
    <template v-else>
      <div class="item-content" :ref="(el) => setContentRef(item.key, el)"></div>
      <div class="item-label" :ref="(el) => setLabelRef(item.key, el)"></div>
    </template>
  </div>
</template>

<script setup>
import { select as d3_select } from 'd3-selection';
import { nextTick, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const contentRefs = new Map();
const labelRefs = new Map();
let prevTools = [];

function setContentRef(key, el) {
  if (el) contentRefs.set(key, el);
  else contentRefs.delete(key);
}

function setLabelRef(key, el) {
  if (el) labelRefs.set(key, el);
  else labelRefs.delete(key);
}

async function renderTools() {
  await nextTick();

  prevTools.forEach(item => {
    if (!props.state.tools.find(d => d.key === item.key) && item.tool && item.tool.uninstall) {
      item.tool.uninstall();
    }
  });

  props.state.tools.forEach(item => {
    if (item.type === 'spacer') return;
    const contentEl = contentRefs.get(item.key);
    const labelEl = labelRefs.get(item.key);
    if (contentEl) {
      d3_select(contentEl).html('');
      d3_select(contentEl).call(item.tool.render, props.state.barSelection);
    }
    if (labelEl) {
      d3_select(labelEl).html('');
      item.tool.label(d3_select(labelEl));
    }
  });

  prevTools = props.state.tools.slice();
}

onMounted(renderTools);
watch(() => props.state.tools, renderTools, { deep: true });

onUnmounted(() => {
  prevTools.forEach(item => {
    if (item.tool && item.tool.uninstall) {
      item.tool.uninstall();
    }
  });
});
</script>
