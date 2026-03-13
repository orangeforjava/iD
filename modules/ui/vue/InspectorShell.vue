<template>
  <div class="panewrap" :style="{ right: state.showPreset ? '-100%' : '0%' }">
    <div class="preset-list-pane pane" :class="{ hide: !state.showPreset }" ref="presetRef"></div>
    <div class="entity-editor-pane pane" :class="{ hide: state.showPreset }" ref="editorRef"></div>
  </div>
  <div class="footer" ref="footerRef"></div>
</template>

<script setup>
import { select as d3_select } from 'd3-selection';
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({ state: { type: Object, required: true } });

const presetRef = ref(null);
const editorRef = ref(null);
const footerRef = ref(null);

async function renderChildren() {
  await nextTick();
  if (presetRef.value) {
    d3_select(presetRef.value).call(props.state.presetList);
  }
  if (editorRef.value) {
    d3_select(editorRef.value).call(props.state.entityEditor);
  }
  if (footerRef.value) {
    d3_select(footerRef.value).call(props.state.viewOnOSM.what(props.state.footerEntity));
  }
}

onMounted(renderChildren);
watch(() => [props.state.showPreset, props.state.footerEntity, props.state.renderVersion], renderChildren, { deep: true });
</script>
