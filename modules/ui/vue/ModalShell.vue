<template>
  <div class="shaded" :style="{ opacity: 1 }" @click="handleBackdropClick">
    <div class="modal fillL">
      <input class="keytrap keytrap-first">
      <button v-if="!state.blocking" class="close" :title="t('icons.close')" @click="state.close()">
        <svg class="icon">
          <use href="#iD-icon-close" />
        </svg>
      </button>
      <div class="content"></div>
      <input class="keytrap keytrap-last">
    </div>
  </div>
</template>

<script setup>
import { t } from '../../core/localizer';

const props = defineProps({
  state: { type: Object, required: true }
});

function handleBackdropClick(e) {
  if (props.state.blocking) return;
  if (e.target === e.currentTarget) {
    props.state.close();
  }
}
</script>
