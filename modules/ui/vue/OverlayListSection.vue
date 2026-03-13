<template>
  <ul class="layer-list layer-overlay-list" dir="auto">
    <li v-for="item in state.items" :key="item.id" :class="{ active: item.active }" :title="item.tooltip || null">
      <label>
        <input type="checkbox" name="layers" :checked="item.active" @change.prevent="state.toggle(item.id)">
        <span v-html="item.labelHtml"></span>
      </label>
    </li>
  </ul>
</template>

<script setup>
defineProps({ state: { type: Object, required: true } });
</script>
