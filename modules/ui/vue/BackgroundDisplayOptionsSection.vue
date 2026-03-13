<template>
  <div class="display-options-container controls-list">
    <label v-for="slider in state.sliders" :key="slider.id" :class="'display-control display-control-' + slider.id">
      <span v-html="slider.label"></span>
      <span :class="'display-option-value display-option-value-' + slider.id">{{ slider.valueText }}</span>
      <div class="control-wrap">
        <input class="display-option-input" type="range" :min="state.minVal" :max="state.maxVal" step="0.01" :value="slider.value" @input="state.onInput(slider.id, $event.target.value)">
        <button :title="slider.resetTitle" :class="['display-option-reset', { disabled: slider.value === 1 }]" @click.prevent="state.onReset(slider.id)">
          <svg class="icon"><use :href="state.resetIcon" /></svg>
        </button>
      </div>
    </label>
    <a class="display-option-resetlink" role="button" href="#" @click.prevent="state.onResetAll">{{ state.resetAllText }}</a>
  </div>
</template>

<script setup>
defineProps({ state: { type: Object, required: true } });
</script>
