<template>
  <a v-if="url" class="note-report" target="_blank" :href="url">
    <svg class="icon inline">
      <use href="#iD-icon-out-link" />
    </svg>
    <span>{{ t('note.report') }}</span>
  </a>
</template>

<script setup>
import { computed } from 'vue';
import { t } from '../../core/localizer';
import { osmNote } from '../../osm';
import { services } from '../../services';

const props = defineProps({
  state: { type: Object, required: true }
});

const url = computed(() => {
  const note = props.state.note;
  if (services.osm && note instanceof osmNote && !note.isNew()) {
    return services.osm.noteReportURL(note);
  }
  return '';
});
</script>
