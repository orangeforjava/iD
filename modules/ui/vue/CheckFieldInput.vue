<template>
  <label class="form-field-input-wrap form-field-input-check" :class="{ set: !!state.value }">
    <input
      ref="inputRef"
      type="checkbox"
      :id="state.domId"
      :checked="state.checked"
      @click.stop="state.onToggle"
    >

    <span class="value" :class="{ mixed: state.isMixed }" v-html="state.textHtml"></span>

    <button
      v-if="state.showReverser"
      class="reverser"
      :class="{ hide: state.reverserHidden }"
      @click.prevent.stop="state.onReverse"
    >
      <span class="reverser-span" ref="reverserRef"></span>
    </button>
  </label>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const inputRef = ref(null);
const reverserRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({
    input: inputRef.value,
    reverser: reverserRef.value
  });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
