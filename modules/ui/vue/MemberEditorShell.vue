<template>
  <ul ref="listRef" class="member-list"></ul>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({ state: { type: Object, required: true } });
const listRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({ list: listRef.value });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
