<template>
  <a v-if="url" class="view-on-osmose" target="_blank" rel="noopener" :href="url">
    <svg class="icon inline">
      <use href="#iD-icon-out-link" />
    </svg>
    <span>{{ t('inspector.view_on_osmose') }}</span>
  </a>
</template>

<script setup>
import { computed } from 'vue';
import { t } from '../../core/localizer';
import { QAItem } from '../../osm';
import { services } from '../../services';

const props = defineProps({
  state: { type: Object, required: true }
});

const url = computed(() => {
  const qaItem = props.state.what;
  if (services.osmose && qaItem instanceof QAItem) {
    return services.osmose.itemURL(qaItem);
  }
  return '';
});
</script>
