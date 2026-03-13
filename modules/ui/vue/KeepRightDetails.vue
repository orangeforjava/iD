<template>
  <div v-if="issue" class="error-details qa-details-container">
    <div class="qa-details-subsection">
      <h4>{{ t('QA.keepRight.detail_description') }}</h4>
      <div ref="descriptionRef" class="qa-details-description-text" v-html="descriptionHtml"></div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, computed, onMounted, ref, watch } from 'vue';
import { presetManager } from '../../presets';
import { modeSelect } from '../../modes/select';
import { t, localizer } from '../../core/localizer';
import { utilDisplayName, utilHighlightEntities, utilEntityRoot } from '../../util';
import { useContext } from './useContext';

const props = defineProps({ state: { type: Object, required: true } });
const { context, map } = useContext();
const descriptionRef = ref(null);
const issue = computed(() => props.state.issue);

const descriptionHtml = computed(() => {
  const d = issue.value;
  if (!d) return '';
  const unknown = { html: t.html('inspector.unknown') };
  let replacements = d.replacements || {};
  replacements.default = unknown;
  if (localizer.hasTextForStringId(`QA.keepRight.errorTypes.${d.itemType}.title`)) {
    return t.html(`QA.keepRight.errorTypes.${d.itemType}.description`, replacements);
  }
  return t.html(`QA.keepRight.errorTypes.${d.parentIssueType}.description`, replacements);
});

async function wireLinks() {
  await nextTick();
  const container = descriptionRef.value;
  if (!container || !issue.value) return;

  let relatedEntities = [];
  container.querySelectorAll('.error_entity_link, .error_object_link').forEach(linkEl => {
    const isObjectLink = linkEl.classList.contains('error_object_link');
    const entityID = isObjectLink ? (utilEntityRoot(issue.value.objectType) + issue.value.objectId) : linkEl.textContent;
    const entity = context.hasEntity(entityID);
    relatedEntities.push(entityID);

    linkEl.setAttribute('href', '#');
    linkEl.onmouseenter = () => utilHighlightEntities([entityID], true, context);
    linkEl.onmouseleave = () => utilHighlightEntities([entityID], false, context);
    linkEl.onclick = (e) => {
      e.preventDefault();
      utilHighlightEntities([entityID], false, context);

      const osmlayer = context.layers().layer('osm');
      if (!osmlayer.enabled()) osmlayer.enabled(true);

      context.map().centerZoomEase(issue.value.loc, 20);
      if (entity) {
        context.enter(modeSelect(context, [entityID]));
      } else {
        context.loadEntity(entityID, (err, result) => {
          if (err) return;
          const loaded = result.data.find(e2 => e2.id === entityID);
          if (loaded) context.enter(modeSelect(context, [entityID]));
        });
      }
    };

    if (entity) {
      let name = utilDisplayName(entity);
      if (!name && !isObjectLink) {
        const preset = presetManager.match(entity, context.graph());
        name = preset && !preset.isFallback() && preset.name();
      }
      if (name) {
        linkEl.innerText = name;
      }
    }
  });

  context.features().forceVisible(relatedEntities);
  map().pan([0, 0]);
}

onMounted(wireLinks);
watch(issue, wireLinks);
</script>
