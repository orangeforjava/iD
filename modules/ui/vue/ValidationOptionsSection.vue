<template>
  <div class="issues-options-container">
    <div v-for="opt in state.options" :key="opt.key" :class="'issues-option issues-option-' + opt.key">
      <div class="issues-option-title" v-html="opt.title"></div>
      <label v-for="val in opt.values" :key="val.value">
        <input type="radio" :name="'issues-option-' + opt.key" :value="val.value" :checked="val.checked" @change="state.updateOption(opt.key, val.value)">
        <span v-html="val.label"></span>
      </label>
    </div>
  </div>
</template>

<script setup>
defineProps({ state: { type: Object, required: true } });
</script>
