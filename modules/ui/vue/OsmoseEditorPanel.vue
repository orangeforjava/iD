<template>
  <div class="header fillL">
    <button class="close" :title="t('icons.close')" @click="closeEditor">
      <svg class="icon"><use href="#iD-icon-close" /></svg>
    </button>
    <h2>{{ t('QA.osmose.title') }}</h2>
  </div>

  <div class="body">
    <div ref="editorRef" class="modal-section qa-editor"></div>
  </div>

  <div class="footer" ref="footerRef"></div>
</template>

<script setup>
import { select as d3_select } from 'd3-selection';
import { nextTick, onMounted, ref, watch } from 'vue';
import { t } from '../../core/localizer';
import { services } from '../../services';
import { modeBrowse } from '../../modes/browse';
import { uiOsmoseDetails } from '../osmose_details';
import { uiOsmoseHeader } from '../osmose_header';
import { uiViewOnOsmose } from '../view_on_osmose';
import { useContext } from './useContext';

const props = defineProps({ state: { type: Object, required: true } });
const { context } = useContext();
const editorRef = ref(null);
const footerRef = ref(null);

const qaDetails = uiOsmoseDetails(context);
const qaHeader = uiOsmoseHeader(context);
const viewOnOsmose = uiViewOnOsmose(context);

function closeEditor() {
  context.enter(modeBrowse(context));
}

function postUpdate(status) {
  const d = props.state.qaItem;
  const qaService = services.osmose;
  if (qaService && d) {
    d.newStatus = status;
    qaService.postUpdate(d, (err, item) => props.state.onChange(err, item));
  }
}

async function renderContent() {
  await nextTick();
  const qaItem = props.state.qaItem;
  if (editorRef.value) {
    const selection = d3_select(editorRef.value).html('');
    selection.call(qaHeader.issue(qaItem));
    selection.call(qaDetails.issue(qaItem));

    const isSelected = qaItem && qaItem.id === context.selectedErrorID();
    if (isSelected) {
      const saveSection = selection.append('div').attr('class', 'qa-save save-section cf');
      const buttons = saveSection.append('div').attr('class', 'buttons');
      buttons.append('button')
        .attr('class', 'button close-button action')
        .text(t('QA.keepRight.close'))
        .on('click', function() {
          this.blur();
          postUpdate('done');
        });
      buttons.append('button')
        .attr('class', 'button ignore-button action')
        .text(t('QA.keepRight.ignore'))
        .on('click', function() {
          this.blur();
          postUpdate('false');
        });
    }
  }
  if (footerRef.value) {
    d3_select(footerRef.value).html('').call(viewOnOsmose.what(qaItem));
  }
}

onMounted(renderContent);
watch(() => [props.state.qaItem, context.selectedErrorID()], renderContent, { deep: true });
</script>
