<template>
  <a v-if="show" class="view-on-osm" target="_blank" :href="url" :title="titleText">
    <svg class="icon inline">
      <use href="#iD-icon-out-link" />
    </svg>
    <template v-if="showLastTouched">{{ lastTouchedText }}</template>
    <template v-else><span>{{ t('inspector.view_on_osm') }}</span></template>
  </a>
</template>

<script setup>
import { computed } from 'vue';
import { t } from '../../core/localizer';
import { osmEntity, osmNote, osmRelation, osmWay } from '../../osm';
import { getRelativeDate } from '../../util/date';
import { useContext } from './useContext';

const props = defineProps({
  state: {
    type: Object,
    required: true
  }
});

const { context, connection, history } = useContext();

const what = computed(() => props.state.what);
const show = computed(() => !!(what.value && !what.value.isNew()));
const showLastTouched = computed(() => what.value && !(what.value instanceof osmNote));

const url = computed(() => {
  if (!what.value) return '#';
  if (what.value instanceof osmEntity) return connection().historyURL(what.value);
  if (what.value instanceof osmNote) return connection().noteURL(what.value);
  return '#';
});

const latest = computed(() => {
  if (!showLastTouched.value) return null;
  return findLastModifiedChild(history().base(), what.value);
});

const lastTouchedText = computed(() => {
  if (!latest.value) return '';
  return t('inspector.last_touched', {
    timeago: getRelativeDate(new Date(latest.value.timestamp)),
    user: latest.value.user
  });
});

const titleText = computed(() => showLastTouched.value ? t('inspector.view_on_osm') : '');

function findLastModifiedChild(graph, feature) {
  let latestEntity = feature;
  function recurse(obj) {
    if (obj.timestamp > latestEntity.timestamp) latestEntity = obj;
    if (obj instanceof osmWay) {
      obj.nodes.map(id => graph.hasEntity(id)).filter(Boolean).forEach(recurse);
    } else if (obj instanceof osmRelation) {
      obj.members.map(m => graph.hasEntity(m.id)).filter(e => e instanceof osmWay || e instanceof osmRelation).forEach(recurse);
    }
  }
  recurse(feature);
  return latestEntity;
}
</script>
