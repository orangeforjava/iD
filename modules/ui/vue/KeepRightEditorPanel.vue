<template>
  <div class="header fillL">
    <button class="close" :title="t('icons.close')" @click="closeEditor">
      <svg class="icon"><use href="#iD-icon-close" /></svg>
    </button>
    <h2>{{ t('QA.keepRight.title') }}</h2>
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
import { utilNoAuto } from '../../util';
import { uiKeepRightDetails } from '../keepRight_details';
import { uiKeepRightHeader } from '../keepRight_header';
import { uiViewOnKeepRight } from '../view_on_keepRight';
import { useContext } from './useContext';

const props = defineProps({ state: { type: Object, required: true } });
const { context } = useContext();
const editorRef = ref(null);
const footerRef = ref(null);

const qaDetails = uiKeepRightDetails(context);
const qaHeader = uiKeepRightHeader(context);
const viewOnKeepRight = uiViewOnKeepRight();

function closeEditor() {
  context.enter(modeBrowse(context));
}

function postUpdate(item, status) {
  const qaService = services.keepRight;
  if (!qaService || !item) return;
  item.newStatus = status;
  qaService.postUpdate(item, (err, updated) => props.state.onChange(err, updated));
}

async function renderContent() {
  await nextTick();
  const qaItem = props.state.qaItem;
  if (editorRef.value) {
    const selection = d3_select(editorRef.value).html('');
    selection.call(qaHeader.issue(qaItem));
    selection.call(qaDetails.issue(qaItem));

    const isSelected = qaItem && qaItem.id === context.selectedErrorID();
    const isShown = qaItem && (isSelected || qaItem.newComment || qaItem.comment);
    if (isShown) {
      const saveSection = selection.append('div').attr('class', 'qa-save save-section cf');
      saveSection.append('h4').call(t.append('QA.keepRight.comment'));
      saveSection.append('textarea')
        .attr('class', 'new-comment-input')
        .attr('placeholder', t('QA.keepRight.comment_placeholder'))
        .attr('maxlength', 1000)
        .property('value', qaItem.newComment || qaItem.comment)
        .call(utilNoAuto)
        .on('input', changeInput)
        .on('blur', changeInput);

      if (isSelected) {
        const buttons = saveSection.append('div').attr('class', 'buttons');
        buttons.append('button')
          .attr('class', 'button comment-button action')
          .text(t('QA.keepRight.save_comment'))
          .attr('disabled', qaItem.newComment ? null : true)
          .on('click', function() {
            this.blur();
            const qaService = services.keepRight;
            if (qaService) qaService.postUpdate(qaItem, (err, item) => props.state.onChange(err, item));
          });
        buttons.append('button')
          .attr('class', 'button close-button action')
          .html(t.html(`QA.keepRight.close${qaItem.newComment ? '_comment' : ''}`))
          .on('click', function() {
            this.blur();
            postUpdate(qaItem, 'ignore_t');
          });
        buttons.append('button')
          .attr('class', 'button ignore-button action')
          .html(t.html(`QA.keepRight.ignore${qaItem.newComment ? '_comment' : ''}`))
          .on('click', function() {
            this.blur();
            postUpdate(qaItem, 'ignore');
          });
      }

      function changeInput() {
        const input = d3_select(this);
        let val = input.property('value').trim();
        if (val === qaItem.comment) val = undefined;
        props.state.qaItem = qaItem.update({ newComment: val });
        const qaService = services.keepRight;
        if (qaService) qaService.replaceItem(props.state.qaItem);
        renderContent();
      }
    }
  }

  if (footerRef.value) {
    d3_select(footerRef.value).html('').call(viewOnKeepRight.what(props.state.qaItem));
  }
}

onMounted(renderContent);
watch(() => [props.state.qaItem, context.selectedErrorID()], renderContent, { deep: true });
</script>
