<template>
  <div v-if="issue" class="qa-header">
    <div class="qa-header-icon" :class="{ new: issue.id < 0 }">
      <svg
        width="20px"
        height="30px"
        viewBox="0 0 20 30"
        :class="`preset-icon-28 qaItem ${issue.service} itemId-${issue.id} itemType-${issue.itemType}`"
      >
        <polygon
          class="qaItem-fill"
          :fill="fillColor"
          points="16,3 4,3 1,6 1,17 4,20 7,20 10,27 13,20 16,20 19,17.033 19,6"
        />
        <use
          class="icon-annotation"
          width="12px"
          height="12px"
          transform="translate(4, 5.5)"
          :href="issue.icon ? '#' + issue.icon : ''"
        />
      </svg>
    </div>
    <div class="qa-header-label">{{ title }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { services } from '../../services';
import { t } from '../../core/localizer';

const props = defineProps({
  state: { type: Object, required: true }
});

const issue = computed(() => props.state.issue);
const fillColor = computed(() => issue.value ? services.osmose.getColor(issue.value.item) : '');
const title = computed(() => {
  const unknown = t('inspector.unknown');
  if (!issue.value) return unknown;
  const s = services.osmose.getStrings(issue.value.itemType);
  return ('title' in s) ? s.title : unknown;
});
</script>
