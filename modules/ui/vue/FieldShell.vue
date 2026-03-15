<template>
  <div
    :class="[
      'form-field',
      'form-field-' + state.safeid,
      { nowrap: !state.wrap, locked: state.locked, modified: state.modified, present: state.present }
    ]"
  >
    <label v-if="state.wrap" class="field-label" :for="state.domId">
      <span class="label-text">
        <span ref="labelValueRef" class="label-textvalue"></span>
        <span ref="labelAnnotationRef" class="label-textannotation"></span>
      </span>
      <button v-if="state.showRemove" class="remove-icon" :title="t('icons.remove')" @click="state.onRemove">
        <svg class="icon"><use href="#iD-operation-delete" /></svg>
      </button>
      <button v-if="state.showRevert" class="modified-icon" :title="t('icons.undo')" @click="state.onRevert">
        <svg class="icon"><use :href="state.revertIcon" /></svg>
      </button>
      <span v-if="state.locked" ref="lockIconRef" class="label-lock-wrap">
        <svg class="icon"><use href="#fas-lock" /></svg>
      </span>
    </label>

    <div ref="implRef"></div>
  </div>
</template>

<script setup>
import { select as d3_select } from 'd3-selection';
import { nextTick, onMounted, ref, watch } from 'vue';
import { t } from '../../core/localizer';

const props = defineProps({
  state: { type: Object, required: true }
});

const labelValueRef = ref(null);
const labelAnnotationRef = ref(null);
const implRef = ref(null);
const lockIconRef = ref(null);

async function wireRefs() {
  await nextTick();
  props.state.setRefs({
    labelValue: labelValueRef.value,
    labelAnnotation: labelAnnotationRef.value,
    impl: implRef.value,
    lockIcon: lockIconRef.value
  });

  if (labelValueRef.value) {
    d3_select(labelValueRef.value).html('');
    props.state.renderLabel(d3_select(labelValueRef.value));
  }

  props.state.onRendered();
}

onMounted(wireRefs);
watch(() => props.state.renderVersion, wireRefs);
</script>
