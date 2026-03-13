<template>
  <div class="layer-feature-list-container">
    <ul class="layer-list layer-feature-list">
      <li v-for="feature in state.features" :key="feature.id" :class="{ active: feature.active }" :title="feature.tooltip">
        <label>
          <input type="checkbox" name="feature" :checked="feature.active" :indeterminate="feature.autoHidden" @change="state.toggle(feature.id)">
          <span v-html="feature.description"></span>
        </label>
      </li>
    </ul>
    <div class="feature-list-links section-footer">
      <a class="feature-list-link" role="button" href="#" @click.prevent="state.disableAll">{{ t('issues.disable_all') }}</a>
      <a class="feature-list-link" role="button" href="#" @click.prevent="state.enableAll">{{ t('issues.enable_all') }}</a>
    </div>
  </div>
</template>

<script setup>
import { t } from '../../core/localizer';
defineProps({ state: { type: Object, required: true } });
</script>
