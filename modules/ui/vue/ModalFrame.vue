<template>
  <div class="modal fillL">
    <input class="keytrap keytrap-first" @focus="state.moveFocusToLast">
    <button v-if="!blocking" class="close" :title="closeTitle" @click="state.close">
      <svg class="icon"><use href="#iD-icon-close" /></svg>
    </button>
    <div class="content"></div>
    <input class="keytrap keytrap-last" @focus="state.moveFocusToFirst">
  </div>
</template>

<script setup>
defineProps({
  state: { type: Object, required: true },
  blocking: { type: Boolean, default: false },
  closeTitle: { type: String, required: true }
});
</script>
