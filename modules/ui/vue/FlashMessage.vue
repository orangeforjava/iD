<template>
  <div class="flash-content">
    <svg :class="'icon flash-icon ' + (state.iconClass || '')">
      <g transform="translate(10,10)">
        <circle r="9" />
        <use transform="translate(-7,-7)" width="14" height="14" :href="state.iconName" />
      </g>
    </svg>
    <div ref="labelEl" class="flash-text"></div>
  </div>
</template>

<script setup>
import { select as d3_select } from 'd3-selection';
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const labelEl = ref(null);

async function renderLabel() {
  await nextTick();
  const selection = d3_select(labelEl.value);
  const label = props.state.label;
  if (typeof label === 'function') {
    selection.text('').call(label);
  } else {
    selection.text(label || '');
  }
}

onMounted(renderLabel);
watch(() => props.state.label, renderLabel);
</script>
