<template>
  <div v-if="issue" class="qa-header">
    <div class="qa-header-icon" :class="{ new: issue.id < 0 }">
      <div :class="iconClass">
        <svg class="icon qaItem-fill">
          <use href="#iD-icon-bolt" />
        </svg>
      </div>
    </div>
    <div class="qa-header-label" v-html="titleHtml"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { t, localizer } from '../../core/localizer';

const props = defineProps({
  state: { type: Object, required: true }
});

const issue = computed(() => props.state.issue);

const iconClass = computed(() => {
  return issue.value ? `preset-icon-28 qaItem ${issue.value.service} itemId-${issue.value.id} itemType-${issue.value.parentIssueType}` : '';
});

const titleHtml = computed(() => {
  const d = issue.value;
  const unknown = t('inspector.unknown');
  if (!d) return unknown;
  let replacements = d.replacements || {};
  replacements.default = { html: unknown };
  if (localizer.hasTextForStringId(`QA.keepRight.errorTypes.${d.itemType}.title`)) {
    return t.html(`QA.keepRight.errorTypes.${d.itemType}.title`, replacements);
  }
  return t.html(`QA.keepRight.errorTypes.${d.parentIssueType}.title`, replacements);
});
</script>
