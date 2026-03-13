<template>
  <div class="nudge-container">
    <div class="nudge-instructions">{{ t('background.offset') }}</div>
    <div class="nudge-controls-wrap">
      <div class="nudge-outer-rect" @pointerdown="state.onDragStart">
        <div class="nudge-inner-rect">
          <input type="text" :aria-label="t('background.offset_label')" :class="{ error: state.error }" :value="state.valueText" @change="state.onInput">
        </div>
      </div>
      <div>
        <button v-for="dir in state.directions" :key="dir[0]" :title="t(`background.nudge.${dir[0]}`)" :class="dir[0] + ' nudge'" @click="state.onNudge(dir[1])"></button>
      </div>
      <button :title="t('background.reset')" :class="['nudge-reset', { disabled: state.isResetDisabled }]" @click.prevent="state.onReset">
        <svg class="icon"><use :href="state.resetIcon" /></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { t } from '../../core/localizer';
defineProps({ state: { type: Object, required: true } });
</script>
