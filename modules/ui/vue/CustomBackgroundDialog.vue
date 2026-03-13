<template>
  <div class="modal-section header">
    <h3>{{ t('settings.custom_background.header') }}</h3>
  </div>

  <div class="modal-section message-text">
    <div class="instructions-template" v-html="state.instructionsHtml"></div>
    <textarea
      ref="textareaRef"
      class="field-template"
      :placeholder="t('settings.custom_background.template.placeholder')"
      :value="state.template"
      @input="state.onInput"
    ></textarea>
  </div>

  <div class="modal-section buttons cf">
    <button class="button cancel-button secondary-action" @click="state.onCancel">{{ t('confirm.cancel') }}</button>
    <button class="button ok-button action" @click="state.onSave">{{ t('confirm.okay') }}</button>
  </div>
</template>

<script setup>
import { select as d3_select } from 'd3-selection';
import { nextTick, onMounted, ref } from 'vue';
import { t } from '../../core/localizer';
import { utilNoAuto } from '../../util';

const props = defineProps({ state: { type: Object, required: true } });
const textareaRef = ref(null);

onMounted(async () => {
  await nextTick();
  if (textareaRef.value) {
    utilNoAuto(d3_select(textareaRef.value));
  }
});
</script>
