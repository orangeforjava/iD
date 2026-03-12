<template>
  <div :class="statusClass">
    <template v-if="messageKey === 'rateLimitUnauthed'">
      <span>{{ t('osm_api_status.message.rateLimit') }}</span>
      <a href="#" class="api-status-login" target="_blank" @click.prevent="handleLogin">
        <svg class="icon inline">
          <use href="#iD-icon-out-link" />
        </svg>
        <span>{{ t('login') }}</span>
      </a>
    </template>

    <template v-else-if="messageKey === 'rateLimited'">
      <span>{{ t('osm_api_status.message.rateLimited') }}</span>
    </template>

    <template v-else-if="messageKey === 'error'">
      <span>{{ t('osm_api_status.message.error', { suffix: ' ' }) }}</span>
      <a href="#" @click.prevent="handleRetry">{{ t('osm_api_status.retry') }}</a>
    </template>

    <template v-else-if="messageKey === 'readonly'">
      <span>{{ t('osm_api_status.message.readonly') }}</span>
    </template>

    <template v-else-if="messageKey === 'offline'">
      <span>{{ t('osm_api_status.message.offline') }}</span>
    </template>

    <span v-if="storageError" class="local-storage-full">
      {{ t('osm_api_status.message.local_storage_full') }}
    </span>
  </div>
</template>

<script setup>
import _throttle from 'lodash-es/throttle';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { t } from '../../core/localizer';
import { useContext } from './useContext';

const { context, history, connection } = useContext();
const osm = connection();

const messageKey = ref('');
const statusMode = ref('');
const storageError = ref(false);
let intervalID;

const throttledRetry = _throttle(function() {
  context.loadTiles(context.projection);
  if (osm) osm.reloadApiStatus();
}, 2000);

const statusClass = computed(() => {
  const mode = storageError.value ? 'error' : statusMode.value;
  return mode ? 'api-status ' + mode : 'api-status';
});

function handleLogin() {
  if (osm) osm.authenticate();
}

function handleRetry() {
  throttledRetry();
}

function update(err, apiStatus) {
  if (apiStatus === 'connectionSwitched') {
    return;
  }

  messageKey.value = '';
  statusMode.value = err ? 'error' : apiStatus || '';

  if (err) {
    if (apiStatus === 'rateLimited') {
      messageKey.value = osm && !osm.authenticated() ? 'rateLimitUnauthed' : 'rateLimited';
    } else {
      messageKey.value = 'error';
    }
  } else if (apiStatus === 'readonly') {
    messageKey.value = 'readonly';
  } else if (apiStatus === 'offline') {
    messageKey.value = 'offline';
  }
}

function handleStorageError() {
  storageError.value = true;
  statusMode.value = 'error';
}

onMounted(() => {
  if (!osm) return;

  osm.on('apiStatusChange.uiStatus', update);
  history().on('storage_error', handleStorageError);
  intervalID = window.setInterval(function() {
    osm.reloadApiStatus();
  }, 90000);
  osm.reloadApiStatus();
});

onUnmounted(() => {
  if (osm) {
    osm.on('apiStatusChange.uiStatus', null);
  }
  history().on('storage_error', null);
  if (intervalID) {
    window.clearInterval(intervalID);
    intervalID = null;
  }
  throttledRetry.cancel();
});
</script>
