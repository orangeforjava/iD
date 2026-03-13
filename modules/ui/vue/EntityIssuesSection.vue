<template>
  <div class="grouped-items-area">
    <div v-for="issue in state.issuesView" :key="issue.key" class="issue-container" :class="{ active: issue.id === state.activeIssueID }">
      <div :class="'issue severity-' + issue.severity" @mouseover="state.onIssueHover(issue, true)" @mouseout="state.onIssueHover(issue, false)">
        <div class="issue-label">
          <button class="issue-text" @click="state.onIssueClick(issue)">
            <svg class="icon issue-icon"><use :href="issue.icon" /></svg>
            <span class="issue-message">{{ issue.message }}</span>
          </button>
          <button class="issue-info-button" :title="t('icons.information')" @click="state.toggleInfo(issue.id)">
            <svg class="icon"><use href="#iD-icon-inspect" /></svg>
          </button>
        </div>
        <ul class="issue-fix-list">
          <li v-for="fix in issue.fixes" :key="fix.id" class="issue-fix-item">
            <button
              :class="{ actionable: !!fix.onClick }"
              :disabled="!fix.onClick"
              :title="fix.disabledReason || null"
              @click="state.onFixClick(issue, fix)"
              @mouseover="state.onFixHover(fix, true)"
              @mouseout="state.onFixHover(fix, false)"
            >
              <svg class="icon fix-icon"><use :href="fix.icon" /></svg>
              <span class="fix-message">{{ fix.title }}</span>
            </button>
          </li>
        </ul>
      </div>
      <div class="issue-info" :class="{ expanded: issue.expanded }" :style="{ maxHeight: issue.expanded ? null : '0', opacity: issue.expanded ? '1' : '0' }" v-html="issue.referenceHtml"></div>
    </div>
  </div>
</template>

<script setup>
import { t } from '../../core/localizer';

defineProps({
  state: { type: Object, required: true }
});
</script>
