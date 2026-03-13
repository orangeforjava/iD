<template>
  <div v-if="visible" class="shaded">
    <div class="modal fillL">
      <div class="content">
        <div class="modal-section">
          <h3>{{ t('restore.heading') }}</h3>
        </div>
        <div class="modal-section">
          <p>{{ t('restore.description') }}</p>
        </div>
        <div class="modal-actions">
          <button ref="restoreButton" class="restore" @click="restoreHistory">
            <svg class="logo logo-restore"><use href="#iD-logo-restore" /></svg>
            <div>{{ t('restore.restore') }}</div>
          </button>
          <button class="reset" @click="resetHistory">
            <svg class="logo logo-reset"><use href="#iD-logo-reset" /></svg>
            <div>{{ t('restore.reset') }}</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { t } from '../../core/localizer';
import { useContext } from './useContext';

const { history } = useContext();
const visible = ref(false);
const restoreButton = ref(null);

function restoreHistory() {
  history().restore();
  visible.value = false;
}

function resetHistory() {
  history().clearSaved();
  visible.value = false;
}

onMounted(async () => {
  visible.value = history().hasRestorableChanges();
  if (visible.value) {
    await nextTick();
    restoreButton.value?.focus();
  }
});
</script>
