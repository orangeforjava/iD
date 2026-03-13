<template>
  <ul class="layer-list layer-fill-list">
    <li v-for="item in state.fillItems" :key="item.id" :class="{ active: item.active }" :title="item.tooltip">
      <label>
        <input type="radio" name="area_fill" :checked="item.active" @change="state.setFill(item.id)">
        <span v-html="item.description"></span>
      </label>
    </li>
  </ul>
  <ul class="layer-list layer-visual-diff-list">
    <li v-for="item in state.diffItems" :key="item.id" :class="{ active: item.active }" :title="item.tooltip">
      <label>
        <input type="checkbox" name="visual_diff" :checked="item.active" @change="state.toggleHighlight">
        <span v-html="item.description"></span>
      </label>
    </li>
  </ul>
</template>

<script setup>
defineProps({ state: { type: Object, required: true } });
</script>
