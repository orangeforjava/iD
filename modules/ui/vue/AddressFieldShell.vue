<template>
  <div class="form-field-input-wrap form-field-input-address" ref="wrapRef"></div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const wrapRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({
    wrap: wrapRef.value
  });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
