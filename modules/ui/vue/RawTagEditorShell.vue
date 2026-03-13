<template>
  <div ref="optionsRef" class="raw-tag-options" role="tablist"></div>
  <textarea ref="textRef" class="tag-text" :class="{ hide: state.tagView !== 'text' }"></textarea>
  <ul ref="listRef" class="tag-list" :class="{ hide: state.tagView !== 'list' }"></ul>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({ state: { type: Object, required: true } });
const optionsRef = ref(null);
const textRef = ref(null);
const listRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({
    options: optionsRef.value,
    text: textRef.value,
    list: listRef.value
  });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
