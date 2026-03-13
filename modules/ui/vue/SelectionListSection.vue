<template>
  <ul class="feature-list">
    <li v-for="item in state.items" :key="item.id" class="feature-list-item" @mouseover="state.onHover(item.id, true)" @mouseout="state.onHover(item.id, false)">
      <button class="label" @click="state.onSelect(item.id)">
        <span class="entity-geom-icon">
          <svg class="icon pre-text"><use :href="'#iD-icon-' + item.geometry" /></svg>
        </span>
        <span class="entity-type">{{ item.type }}</span>
        <span class="entity-name">{{ item.name }}</span>
      </button>
      <button class="close" :title="t('icons.deselect')" @click="state.onDeselect(item.id)">
        <svg class="icon"><use href="#iD-icon-close" /></svg>
      </button>
    </li>
  </ul>
</template>

<script setup>
import { t } from '../../core/localizer';

defineProps({
  state: { type: Object, required: true }
});
</script>
