<template>
  <div class="box">
    <div>
      <svg class="icon pre-text"><use href="#iD-icon-apply" /></svg>
    </div>
    <span>
      <strong class="message">{{ state.message }}</strong>
      <br>
      <span class="details">{{ state.details }}</span>
    </span>
  </div>
  <div v-if="state.ignoredCount" class="reset-ignored section-footer">
    <a href="#" @click.prevent="state.resetIgnored">{{ state.resetIgnoredLabel }}</a>
  </div>
</template>

<script setup>
defineProps({ state: { type: Object, required: true } });
</script>
