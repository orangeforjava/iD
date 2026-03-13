<template>
  <div v-if="datum" class="data-header">
    <div class="data-header-icon">
      <div class="preset-icon-28">
        <svg class="icon note-fill">
          <use href="#iD-icon-data" />
        </svg>
      </div>
    </div>
    <div class="data-header-label">{{ t('map_data.layers.custom.title') }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { t } from '../../core/localizer';

const props = defineProps({
  state: { type: Object, required: true }
});

const datum = computed(() => props.state.datum);
</script>
