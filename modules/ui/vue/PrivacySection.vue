<template>
  <ul class="layer-list privacy-options-list">
    <li class="privacy-third-party-icons-item" :class="{ active: state.enabled }">
      <label :title="t('preferences.privacy.third_party_icons.tooltip')">
        <input type="checkbox" :checked="state.enabled" @change="state.toggle">
        <span>{{ t('preferences.privacy.third_party_icons.description') }}</span>
      </label>
    </li>
  </ul>
  <div class="privacy-link">
    <a target="_blank" href="https://github.com/openstreetmap/iD/blob/release/PRIVACY.md">
      <svg class="icon inline"><use href="#iD-icon-out-link" /></svg>
      <span>{{ t('preferences.privacy.privacy_link') }}</span>
    </a>
  </div>
</template>

<script setup>
import { t } from '../../core/localizer';
defineProps({ state: { type: Object, required: true } });
</script>
