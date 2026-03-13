<template>
  <div v-if="issue" class="error-details qa-details-container">
    <div v-if="baseDetail" class="qa-details-subsection">
      <h4>{{ t('QA.keepRight.detail_description') }}</h4>
      <p ref="baseDetailRef" class="qa-details-description-text" v-html="baseDetail"></p>
    </div>

    <div v-if="loadedDetail" class="qa-details-subsection">
      <h4>{{ t('QA.osmose.detail_title') }}</h4>
      <p ref="loadedDetailRef" v-html="loadedDetail"></p>
    </div>

    <div v-if="elems.length" class="qa-details-subsection">
      <h4>{{ t('QA.osmose.elems_title') }}</h4>
      <ul>
        <li v-for="elem in elems" :key="elem">
          <a href="#" class="error_entity_link" @mouseenter="highlight(elem, true)" @mouseleave="highlight(elem, false)" @click.prevent="jumpTo(elem)">{{ displayEntity(elem) }}</a>
        </li>
      </ul>
    </div>

    <div v-if="fixHtml" class="qa-details-subsection">
      <h4>{{ t('QA.osmose.fix_title') }}</h4>
      <p ref="fixRef" v-html="fixHtml"></p>
    </div>

    <div v-if="trapHtml" class="qa-details-subsection">
      <h4>{{ t('QA.osmose.trap_title') }}</h4>
      <p ref="trapRef" v-html="trapHtml"></p>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { presetManager } from '../../presets';
import { modeSelect } from '../../modes/select';
import { t } from '../../core/localizer';
import { services } from '../../services';
import { utilDisplayName, utilHighlightEntities } from '../../util';
import { useContext } from './useContext';

const props = defineProps({ state: { type: Object, required: true } });
const { context } = useContext();
const issue = computed(() => props.state.issue);
const loadedDetail = ref('');
const elems = ref([]);

function issueString(d, type) {
  if (!d) return '';
  const s = services.osmose.getStrings(d.itemType);
  return (type in s) ? s[type] : '';
}

const baseDetail = computed(() => issueString(issue.value, 'detail'));
const fixHtml = computed(() => issueString(issue.value, 'fix'));
const trapHtml = computed(() => issueString(issue.value, 'trap'));

function displayEntity(entityID) {
  const entity = context.hasEntity(entityID);
  if (!entity) return entityID;
  let name = utilDisplayName(entity);
  if (!name) {
    const preset = presetManager.match(entity, context.graph());
    name = preset && !preset.isFallback() && preset.name();
  }
  return name || entityID;
}

function highlight(entityID, val) {
  utilHighlightEntities([entityID], val, context);
}

function jumpTo(entityID) {
  const entity = context.hasEntity(entityID);
  utilHighlightEntities([entityID], false, context);
  const osmlayer = context.layers().layer('osm');
  if (!osmlayer.enabled()) osmlayer.enabled(true);
  context.map().centerZoom(issue.value.loc, 20);
  if (entity) {
    context.enter(modeSelect(context, [entityID]));
  } else {
    context.loadEntity(entityID, (err, result) => {
      if (err) return;
      const loaded = result.data.find(e => e.id === entityID);
      if (loaded) context.enter(modeSelect(context, [entityID]));
    });
  }
}

async function loadDetail() {
  loadedDetail.value = '';
  elems.value = [];
  const current = issue.value;
  if (!current) return;
  try {
    const d = await services.osmose.loadIssueDetail(current);
    if (!d || !issue.value || issue.value.id !== current.id) return;
    if (d.detail) loadedDetail.value = d.detail;
    elems.value = d.elems || [];
    if (elems.value.length) {
      context.features().forceVisible(elems.value);
      context.map().pan([0, 0]);
    }
  } catch (err) {
    console.log(err); // eslint-disable-line no-console
  }
}

onMounted(loadDetail);
watch(issue, loadDetail);
</script>
