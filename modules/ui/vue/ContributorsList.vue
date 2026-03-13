<template>
  <div :style="{ opacity: users.length ? 1 : 0 }">
    <svg class="icon pre-text light">
      <use href="#iD-icon-nearby" />
    </svg>
    <span v-if="users.length <= limit" v-html="listHtml" />
    <span v-else v-html="truncatedHtml" />
  </div>
</template>

<script setup>
import _debounce from 'lodash-es/debounce';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { t } from '../../core/localizer';
import { useContext } from './useContext';

const { context, map, history, connection } = useContext();
const osm = connection();
const limit = 4;
const users = ref([]);

function userLink(name) {
  return `<a class="user-link" href="${osm.userURL(name)}" target="_blank">${name}</a>`;
}

const listHtml = computed(() => {
  const html = users.value.slice(0, limit).map(userLink).join(', ');
  return t.html('contributors.list', { users: { html } });
});

const truncatedHtml = computed(() => {
  const subset = users.value.slice(0, limit - 1);
  const html = subset.map(userLink).join(', ');
  const othersNum = users.value.length - limit + 1;
  const countHtml = `<a target="_blank" href="${osm.changesetsURL(map().center(), map().zoom())}">${othersNum}</a>`;
  return t.html('contributors.truncated_list', {
    n: othersNum,
    users: { html },
    count: { html: countHtml }
  });
});

function update() {
  if (!osm) return;

  const userMap = {};
  const entities = history().intersects(map().extent());
  entities.forEach(function(entity) {
    if (entity && entity.user) userMap[entity.user] = true;
  });
  users.value = Object.keys(userMap);
}

const debouncedUpdate = _debounce(update, 1000);

onMounted(() => {
  if (!osm) return;
  update();
  osm.on('loaded.contributors', debouncedUpdate);
  map().on('move.contributors', debouncedUpdate);
});

onUnmounted(() => {
  if (!osm) return;
  osm.on('loaded.contributors', null);
  map().on('move.contributors', null);
  debouncedUpdate.cancel();
});
</script>
