<template>
  <ul :class="'layer-list issues-list ' + state.severity + 's-list'">
    <li v-for="issue in state.issues" :key="issue.key" :class="'issue severity-' + issue.severity">
      <button class="issue-label" @click="state.focusIssue(issue.raw)" @mouseover="state.hover(issue.raw, true)" @mouseout="state.hover(issue.raw, false)">
        <span class="issue-text">
          <span class="issue-icon">
            <svg class="icon"><use :href="issue.icon"></use></svg>
          </span>
          <span class="issue-message">{{ issue.message }}</span>
        </span>
      </button>
    </li>
  </ul>
</template>

<script setup>
defineProps({ state: { type: Object, required: true } });
</script>
