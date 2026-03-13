<template>
  <div :class="{ hide: !items.length }">
    <el-tooltip v-if="items.length" placement="top">
      <template #content>
        <div v-for="item in items" :key="item.key">{{ item.text }}</div>
      </template>
      <a class="chip" href="#" @click.prevent="openPane">
        {{ t('feature_info.hidden_warning', { count }) }}
      </a>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ElTooltip } from 'element-plus';
import { onMounted, onUnmounted, ref } from 'vue';
import { t } from '../../core/localizer';
import { useContext } from './useContext';

const { context, ui } = useContext();
const items = ref([]);
const count = ref(0);

function update() {
  const features = context.features();
  const stats = features.stats();
  let total = 0;

  items.value = features.hidden().map(function(key) {
    if (!stats[key]) return null;
    total += stats[key];
    return {
      key: key,
      text: t('inspector.title_count', {
        title: t('feature.' + key + '.description'),
        count: stats[key]
      })
    };
  }).filter(Boolean);

  count.value = total;
}

function openPane() {
  ui().togglePanes(context.container().select('.map-panes .map-data-pane'));
}

onMounted(() => {
  update();
  context.features().on('change.feature_info', update);
});

onUnmounted(() => {
  context.features().on('change.feature_info', null);
});
</script>
