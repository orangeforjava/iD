<template>
  <span class="length-indicator-wrap">
    <el-tooltip placement="bottom" :visible="showTooltip" :persistent="false">
      <template #content>
        <span>
          <svg class="icon inline">
            <use href="#iD-icon-alert" />
          </svg>
          {{ t('inspector.max_length_reached', { maxChars: state.maxChars }) }}
        </span>
      </template>
      <span
        class="length-indicator"
        :class="{ 'limit-reached': state.strLen > state.maxChars }"
        :style="indicatorStyle"
      ></span>
    </el-tooltip>
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { ElTooltip } from 'element-plus';
import { t } from '../../core/localizer';

const props = defineProps({
  state: { type: Object, required: true }
});

const showTooltip = computed(() => !props.state.silent && props.state.strLen > props.state.maxChars);

const indicatorStyle = computed(() => ({
  borderRightWidth: `${Math.abs(props.state.maxChars - props.state.strLen) * 2}px`,
  marginRight: props.state.strLen > props.state.maxChars ? `${(props.state.maxChars - props.state.strLen) * 2}px` : 0,
  opacity: props.state.strLen > props.state.maxChars * 0.8 ? Math.min(1, (props.state.strLen / props.state.maxChars - 0.8) / 0.2) : 0,
  pointerEvents: props.state.strLen > props.state.maxChars * 0.8 ? null : 'none'
}));
</script>
