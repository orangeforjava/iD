<template>
  <div class="form-field-input-wrap form-field-input-localized" ref="wrapRef">
    <input ref="inputRef" type="text" dir="auto" :id="state.domId" class="localized-main">
    <button ref="translateButtonRef" class="localized-add form-field-button" :aria-label="t('icons.plus')">
      <svg class="icon"><use href="#iD-icon-plus" /></svg>
    </button>
    <div ref="multilingualRef" class="localized-multilingual"></div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import { t } from '../../core/localizer';

const props = defineProps({
  state: { type: Object, required: true }
});

const wrapRef = ref(null);
const inputRef = ref(null);
const translateButtonRef = ref(null);
const multilingualRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({
    wrap: wrapRef.value,
    input: inputRef.value,
    translateButton: translateButtonRef.value,
    multilingual: multilingualRef.value
  });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
