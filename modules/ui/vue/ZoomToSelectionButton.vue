<template>
  <el-tooltip
    :placement="tooltipPlacement"
    :content="tooltipText"
    :show-after="500"
  >
    <button
      :class="{ disabled: disabled }"
      :aria-pressed="false"
      @pointerup="onPointerUp"
      @click="onClick"
    >
      <svg class="icon light">
        <use href="#iD-icon-framed-dot" />
      </svg>
    </button>
  </el-tooltip>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ElTooltip } from 'element-plus';
import { t, localizer } from '../../core/localizer';
import { useContext } from './useContext';

const { context, ui } = useContext();

const disabled = ref(true);
let lastPointerUpType = null;

const tooltipPlacement = computed(() => {
  return localizer.textDirection() === 'rtl' ? 'right' : 'left';
});

const tooltipText = computed(() => {
  if (disabled.value) {
    return t('inspector.zoom_to.no_selection');
  }
  return t('inspector.zoom_to.title') + ' [' + t('inspector.zoom_to.key') + ']';
});

function isDisabled() {
  const mode = context.mode();
  return !mode || !mode.zoomToSelected;
}

function setEnabledState() {
  disabled.value = isDisabled();
}

function onPointerUp(e) {
  lastPointerUpType = e.pointerType;
}

function onClick(e) {
  e.preventDefault();

  if (disabled.value) {
    if (lastPointerUpType === 'touch' || lastPointerUpType === 'pen') {
      ui().flash
        .duration(2000)
        .iconName('#iD-icon-framed-dot')
        .iconClass('disabled')
        .label(t.append('inspector.zoom_to.no_selection'))();
    }
  } else {
    const mode = context.mode();
    if (mode && mode.zoomToSelected) {
      mode.zoomToSelected();
    }
  }

  lastPointerUpType = null;
}

onMounted(() => {
  context.on('enter.uiZoomToSelection', setEnabledState);
  setEnabledState();
});

onUnmounted(() => {
  context.on('enter.uiZoomToSelection', null);
});
</script>
