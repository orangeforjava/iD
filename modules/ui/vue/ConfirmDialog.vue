<template>
  <div class="modal-section header"></div>
  <div class="modal-section message-text"></div>
  <div class="modal-section buttons cf">
    <button
      v-if="state.showOk"
      ref="okButton"
      class="button ok-button action"
      @click="state.close()"
    >{{ t('confirm.okay') }}</button>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';
import { t } from '../../core/localizer';

const props = defineProps({
  state: { type: Object, required: true }
});

const okButton = ref(null);

watch(() => props.state.showOk, async (val) => {
  if (!val) return;
  await nextTick();
  okButton.value?.focus();
}, { immediate: true });
</script>
