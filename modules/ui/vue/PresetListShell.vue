<template>
  <div class="header fillL">
    <h2 ref="messageRef"></h2>
    <button class="preset-choose" :title="state.closeTitle" @click="state.onCancel">
      <svg class="icon"><use href="#iD-icon-close" /></svg>
    </button>
  </div>

  <div class="search-header">
    <svg class="icon pre-text"><use href="#iD-icon-search" /></svg>
    <input
      ref="searchRef"
      class="preset-search-input"
      :placeholder="state.searchPlaceholder"
      type="search"
    >
  </div>

  <div class="inspector-body">
    <div ref="listRef" class="preset-list"></div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const messageRef = ref(null);
const searchRef = ref(null);
const listRef = ref(null);

onMounted(async () => {
  await nextTick();
  props.state.setRefs({
    message: messageRef.value,
    search: searchRef.value,
    list: listRef.value
  });
});
</script>
