<template>
  <ul v-if="state.chipMode" :class="state.listClass" ref="containerRef">
    <li class="input-wrap" ref="inputWrapRef">
      <input ref="inputRef" type="text" dir="auto" :id="state.domId">
    </li>
  </ul>

  <div v-else class="form-field-input-wrap form-field-input-combo" ref="containerRef">
    <input ref="inputRef" type="text" dir="auto" :id="state.domId">
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const containerRef = ref(null);
const inputWrapRef = ref(null);
const inputRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({
    container: containerRef.value,
    inputWrap: inputWrapRef.value,
    input: inputRef.value
  });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
