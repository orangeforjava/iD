<template>
  <div v-if="note" class="note-header">
    <div class="note-header-icon" :class="[note.status, { new: note.id < 0 }]">
      <div class="preset-icon-28">
        <svg class="icon note-fill">
          <use href="#iD-icon-note" />
        </svg>
      </div>
      <div class="note-icon-annotation" :title="t('icons.close')">
        <svg class="icon icon-annotation">
          <use :href="statusIcon" />
        </svg>
      </div>
    </div>
    <div class="note-header-label" v-html="labelHtml"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { t } from '../../core/localizer';

const props = defineProps({
  state: { type: Object, required: true }
});

const note = computed(() => props.state.note);

const statusIcon = computed(() => {
  if (!note.value) return '';
  if (note.value.id < 0) return '#iD-icon-plus';
  if (note.value.status === 'open') return '#iD-icon-close';
  return '#iD-icon-apply';
});

const labelHtml = computed(() => {
  if (!note.value) return '';
  if (note.value.isNew()) return t.html('note.new');
  return t.html('note.note') + ' ' + note.value.id + ' ' +
    (note.value.status === 'closed' ? t.html('note.closed') : '');
});
</script>
