<template>
  <div class="version-container">
    <a
      class="version-link"
      :href="projectUrl"
      target="_blank"
    >{{ version }}</a>
    <a
      v-if="showBadge"
      class="badge"
      :href="releaseUrl"
      target="_blank"
      :title="tooltipText"
    >
      <svg class="icon">
        <use href="#maki-gift" />
      </svg>
    </a>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { t } from '../../core/localizer';
import { prefs } from '../../core/preferences';
import { useContext } from './useContext';

const { context } = useContext();

// Module-level state persistence handled via prefs
let sawVersion = null;
let isNewVersion = false;
let isNewUser = false;

const version = context.version;
const matchedVersion = version.match(/\d+\.\d+\.\d+.*/);

if (sawVersion === null && matchedVersion !== null) {
  const savedVersion = prefs('sawVersion');
  if (savedVersion) {
    isNewUser = false;
    isNewVersion = savedVersion !== version && version.indexOf('-') === -1;
  } else {
    isNewUser = true;
    isNewVersion = true;
  }
  prefs('sawVersion', version);
  sawVersion = version;
}

const projectUrl = 'https://github.com/openstreetmap/iD';
const releaseUrl = computed(() => `https://github.com/openstreetmap/iD/releases/tag/v${version}`);

const showBadge = computed(() => isNewVersion && !isNewUser);

const tooltipText = computed(() => t('version.whats_new', { version }));
</script>

<style scoped>
.version-container {
  display: inline;
}
.version-link {
  color: #ccc;
  text-decoration: none;
}
.version-link:hover {
  text-decoration: underline;
}
.badge {
  margin-left: 4px;
}
.badge .icon {
  width: 14px;
  height: 14px;
  vertical-align: middle;
}
</style>
