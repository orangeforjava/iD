<template>
  <ul ref="listRef" class="member-list"></ul>
  <div ref="addRowRef" class="add-row"></div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({ state: { type: Object, required: true } });
const listRef = ref(null);
const addRowRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({ list: listRef.value, addRow: addRowRef.value });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
