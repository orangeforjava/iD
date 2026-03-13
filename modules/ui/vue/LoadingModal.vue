<template>
  <div v-if="state.visible" class="shaded" :style="{ opacity: 1 }">
    <div class="modal fillL">
      <div class="content loading-modal">
        <div class="modal-section fillL">
          <img class="loader" :src="state.imageSrc">
          <h3 v-html="state.message"></h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  state: { type: Object, required: true }
});
</script>
