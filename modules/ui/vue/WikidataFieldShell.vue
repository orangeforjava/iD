<template>
  <div class="form-field-input-wrap form-field-input-wikidata" ref="wrapRef">
    <ul class="rows">
      <li class="wikidata-search">
        <input
          ref="searchInputRef"
          type="text"
          dir="auto"
          :id="state.domId"
          style="flex: 1"
        >
        <button ref="linkButtonRef" class="form-field-button wiki-link" :title="state.linkTitle">
          <svg class="icon"><use href="#iD-icon-out-link" /></svg>
        </button>
      </li>

      <li ref="descriptionRowRef" class="labeled-input preset-wikidata-description">
        <div class="label" v-html="state.descriptionLabel"></div>
        <input ref="descriptionInputRef" type="text" dir="auto" readonly>
        <button ref="descriptionCopyRef" class="form-field-button" :title="state.copyTitle">
          <svg class="icon"><use href="#iD-operation-copy" /></svg>
        </button>
      </li>

      <li ref="identifierRowRef" class="labeled-input preset-wikidata-identifier">
        <div class="label" v-html="state.identifierLabel"></div>
        <input ref="identifierInputRef" type="text" dir="auto" readonly>
        <button ref="identifierCopyRef" class="form-field-button" :title="state.copyTitle">
          <svg class="icon"><use href="#iD-operation-copy" /></svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const wrapRef = ref(null);
const searchInputRef = ref(null);
const linkButtonRef = ref(null);
const descriptionRowRef = ref(null);
const descriptionInputRef = ref(null);
const descriptionCopyRef = ref(null);
const identifierRowRef = ref(null);
const identifierInputRef = ref(null);
const identifierCopyRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({
    wrap: wrapRef.value,
    searchInput: searchInputRef.value,
    linkButton: linkButtonRef.value,
    descriptionRow: descriptionRowRef.value,
    descriptionInput: descriptionInputRef.value,
    descriptionCopy: descriptionCopyRef.value,
    identifierRow: identifierRowRef.value,
    identifierInput: identifierInputRef.value,
    identifierCopy: identifierCopyRef.value
  });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
