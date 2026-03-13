<template>
  <div class="notice" :style="{ display: canEdit ? 'none' : 'block' }">
    <button class="zoom-to notice fillD" @click="zoomToEditable" @wheel="passWheel">
      <svg class="icon pre-text">
        <use href="#iD-icon-plus" />
      </svg>
      <span class="label">{{ t('zoom_in_edit') }}</span>
    </button>
  </div>
</template>

<script setup>
import _debounce from 'lodash-es/debounce';
import { onMounted, onUnmounted, ref } from 'vue';
import { t } from '../../core/localizer';
import { useContext } from './useContext';

const { context, map } = useContext();
const canEdit = ref(true);

function updateVisibility() {
  canEdit.value = map().zoom() >= context.minEditableZoom();
}

const debouncedUpdate = _debounce(updateVisibility, 500);

function zoomToEditable() {
  map().zoomEase(context.minEditableZoom());
}

function passWheel(e) {
  const event = new WheelEvent(e.type, e);
  context.surface().node().dispatchEvent(event);
}

onMounted(() => {
  map().on('move.notice', debouncedUpdate);
  updateVisibility();
});

onUnmounted(() => {
  map().on('move.notice', null);
  debouncedUpdate.cancel();
});
</script>
