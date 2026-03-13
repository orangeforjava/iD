<template>
  <div ref="formRef"></div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const formRef = ref(null);

async function notify() {
  await nextTick();
  props.state.setFormRef(formRef.value);
}

onMounted(notify);
watch(() => props.state.renderVersion, notify);
</script>
