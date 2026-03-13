<template>
  <div>
    <el-tooltip v-for="item in shownItems" :key="item.id" placement="top" :content="t(item.descriptionID)">
      <a :class="'chip ' + item.id + '-count'" href="#" @click.prevent="openIssuesPane">
        <svg class="icon">
          <use :href="'#' + item.iconID" />
        </svg>
        <span class="count">{{ item.count }}</span>
      </a>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ElTooltip } from 'element-plus';
import { onMounted, onUnmounted, ref } from 'vue';
import { prefs } from '../../core/preferences';
import { t } from '../../core/localizer';
import { useContext } from './useContext';

const { context, ui } = useContext();
const shownItems = ref([]);

function update() {
  const items = [];
  const liveIssues = context.validator().getIssues({
    what: prefs('validate-what') || 'edited',
    where: prefs('validate-where') || 'all'
  }).filter(issue => issue.severity !== 'suggestion');

  if (liveIssues.length) {
    items.push({
      id: 'warnings',
      count: liveIssues.length,
      iconID: 'iD-icon-alert',
      descriptionID: 'issues.warnings_and_errors'
    });
  }

  if (prefs('validate-what') === 'all') {
    const resolvedIssues = context.validator().getResolvedIssues();
    if (resolvedIssues.length) {
      items.push({
        id: 'resolved',
        count: resolvedIssues.length,
        iconID: 'iD-icon-apply',
        descriptionID: 'issues.user_resolved_issues'
      });
    }
  }

  shownItems.value = items;
}

function openIssuesPane() {
  ui().togglePanes(context.container().select('.map-panes .issues-pane'));
}

onMounted(() => {
  update();
  context.validator().on('validated.infobox', update);
});

onUnmounted(() => {
  context.validator().on('validated.infobox', null);
});
</script>
