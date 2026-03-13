<template>
  <div class="form-field-input-wrap" :class="'form-field-input-' + state.type" style="position: relative">
    <textarea
      ref="textareaRef"
      :id="state.domId"
      dir="auto"
      :placeholder="state.placeholder"
      :title="state.title"
      :class="{ mixed: state.isMixed }"
      @input="state.onInput"
      @blur="state.onBlur"
      @change="state.onChange"
    ></textarea>
    <span ref="lengthRef"></span>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const textareaRef = ref(null);
const lengthRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({
    textarea: textareaRef.value,
    length: lengthRef.value
  });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
