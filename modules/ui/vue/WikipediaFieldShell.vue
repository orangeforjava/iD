<template>
  <div class="form-field-input-wrap form-field-input-wikipedia" ref="wrapRef">
    <div class="wiki-lang-container">
      <input
        ref="langInputRef"
        type="text"
        class="wiki-lang"
        :placeholder="state.languagePlaceholder"
      >
    </div>

    <div class="wiki-title-container">
      <input
        ref="titleInputRef"
        type="text"
        dir="auto"
        class="wiki-title"
        :id="state.domId"
      >
      <button ref="linkButtonRef" class="form-field-button wiki-link" :title="state.linkTitle">
        <svg class="icon"><use href="#iD-icon-out-link" /></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const wrapRef = ref(null);
const langInputRef = ref(null);
const titleInputRef = ref(null);
const linkButtonRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({
    wrap: wrapRef.value,
    langInput: langInputRef.value,
    titleInput: titleInputRef.value,
    linkButton: linkButtonRef.value
  });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
