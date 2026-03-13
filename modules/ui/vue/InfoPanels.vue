<template>
  <div class="info-panels">
    <div
      v-for="id in activeIds"
      :key="id"
      :class="'fillD2 panel-container panel-container-' + id"
    >
      <div class="panel-title fillD2">
        <h3 :ref="(el) => setTitleRef(id, el)"></h3>
        <button class="close" :title="t('icons.close')" @click.prevent.stop="state.toggle(id)">
          <svg class="icon">
            <use href="#iD-icon-close" />
          </svg>
        </button>
      </div>
      <div :class="'panel-content panel-content-' + id" :ref="(el) => setContentRef(id, el)"></div>
    </div>
  </div>
</template>

<script setup>
import { select as d3_select } from 'd3-selection';
import { computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { t } from '../../core/localizer';

const props = defineProps({
  state: { type: Object, required: true }
});

const activeIds = computed(() => props.state.ids.filter(id => props.state.active[id]).sort());
const titleRefs = new Map();
const contentRefs = new Map();
let renderedIds = [];

function setTitleRef(id, el) {
  if (el) {
    titleRefs.set(id, el);
  } else {
    titleRefs.delete(id);
  }
}

function setContentRef(id, el) {
  if (el) {
    contentRefs.set(id, el);
  } else {
    contentRefs.delete(id);
  }
}

async function renderPanels() {
  await nextTick();

  renderedIds.forEach(id => {
    if (!activeIds.value.includes(id) && props.state.panels[id]?.off) {
      const content = contentRefs.get(id);
      if (content) {
        d3_select(content).call(props.state.panels[id].off);
      }
    }
  });

  activeIds.value.forEach(id => {
    const titleEl = titleRefs.get(id);
    const contentEl = contentRefs.get(id);
    if (titleEl) {
      d3_select(titleEl).html('');
      props.state.panels[id].label(d3_select(titleEl));
    }
    if (contentEl) {
      d3_select(contentEl).call(props.state.panels[id]);
    }
  });

  renderedIds = activeIds.value.slice();
}

onMounted(renderPanels);
watch(activeIds, renderPanels, { deep: true });

onUnmounted(() => {
  renderedIds.forEach(id => {
    const content = contentRefs.get(id);
    if (content && props.state.panels[id]?.off) {
      d3_select(content).call(props.state.panels[id].off);
    }
  });
});
</script>
