<template>
  <div class="header fillL">
    <button class="close" :title="t('icons.close')" @click="closeEditor">
      <svg class="icon"><use href="#iD-icon-close" /></svg>
    </button>
    <h2>{{ t('map_data.title') }}</h2>
  </div>

  <div class="body">
    <div ref="headerRef" class="modal-section data-editor"></div>
    <div ref="rawTagRef" class="raw-tag-editor data-editor"></div>
  </div>
</template>

<script setup>
import { select as d3_select } from 'd3-selection';
import { nextTick, onMounted, watch, ref } from 'vue';
import { t } from '../../core/localizer';
import { modeBrowse } from '../../modes/browse';
import { stringifyProperties } from '../../util/object';
import { uiDataHeader } from '../data_header';
import { uiSectionRawTagEditor } from '../sections/raw_tag_editor';
import { useContext } from './useContext';

const props = defineProps({ state: { type: Object, required: true } });
const { context } = useContext();

const headerRef = ref(null);
const rawTagRef = ref(null);

const dataHeader = uiDataHeader();
const rawTagEditor = uiSectionRawTagEditor('custom-data-tag-editor', context)
  .expandedByDefault(true)
  .readOnlyTags([/.*/]);

function closeEditor() {
  context.enter(modeBrowse(context));
}

async function renderContent() {
  await nextTick();
  if (headerRef.value) {
    d3_select(headerRef.value).call(dataHeader.datum(props.state.datum));
  }
  if (rawTagRef.value) {
    d3_select(rawTagRef.value)
      .call(rawTagEditor
        .tags(stringifyProperties(props.state.datum?.properties || {}))
        .state('hover')
        .render
      )
      .selectAll('textarea.tag-text')
      .attr('readonly', true)
      .classed('readonly', true);
  }
}

onMounted(renderContent);
watch(() => props.state.datum, renderContent, { deep: true });
</script>
