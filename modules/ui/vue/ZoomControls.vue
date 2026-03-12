<template>
  <el-tooltip
    v-for="btn in buttons"
    :key="btn.id"
    :placement="tooltipPlacement"
    :content="btn.tooltipText"
    :show-after="500"
  >
    <button
      :class="[btn.id, { disabled: btn.isDisabled }]"
      @pointerup="onPointerUp"
      @click="(e) => onButtonClick(e, btn.id, btn.isDisabled)"
    >
      <svg class="icon light">
        <use :href="'#' + btn.icon" />
      </svg>
    </button>
  </el-tooltip>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElTooltip } from 'element-plus';
import { t, localizer } from '../../core/localizer';
import { uiCmd } from '../cmd';
import { utilKeybinding } from '../../util/keybinding';
import { useContext } from './useContext';

const { map, keybinding, ui } = useContext();

// ---------- Reactive state ----------

const canZoomIn = ref(true);
const canZoomOut = ref(true);
let lastPointerUpType = null;

const tooltipPlacement = computed(() => {
  return localizer.textDirection() === 'rtl' ? 'right' : 'left';
});

const buttons = computed(() => [
  {
    id: 'zoom-in',
    icon: 'iD-icon-plus',
    isDisabled: !canZoomIn.value,
    tooltipText: !canZoomIn.value
      ? t('zoom.disabled.in')
      : `${t('zoom.in')} [+]`,
  },
  {
    id: 'zoom-out',
    icon: 'iD-icon-minus',
    isDisabled: !canZoomOut.value,
    tooltipText: !canZoomOut.value
      ? t('zoom.disabled.out')
      : `${t('zoom.out')} [-]`,
  },
]);

// ---------- Zoom actions ----------

function zoomIn(e) {
  if (e.shiftKey) return;
  e.preventDefault();
  map().zoomIn();
}

function zoomOut(e) {
  if (e.shiftKey) return;
  e.preventDefault();
  map().zoomOut();
}

function zoomInFurther(e) {
  if (e.shiftKey) return;
  e.preventDefault();
  map().zoomInFurther();
}

function zoomOutFurther(e) {
  if (e.shiftKey) return;
  e.preventDefault();
  map().zoomOutFurther();
}

// ---------- Event handlers ----------

function onPointerUp(e) {
  lastPointerUpType = e.pointerType;
}

function onButtonClick(e, id, isDisabled) {
  if (!isDisabled) {
    if (id === 'zoom-in') {
      zoomIn(e);
    } else {
      zoomOut(e);
    }
  } else if (lastPointerUpType === 'touch' || lastPointerUpType === 'pen') {
    var icon = id === 'zoom-in' ? 'iD-icon-plus' : 'iD-icon-minus';
    var disabledKey = id === 'zoom-in' ? 'zoom.disabled.in' : 'zoom.disabled.out';
    ui().flash
      .duration(2000)
      .iconName('#' + icon)
      .iconClass('disabled')
      .label(t.append(disabledKey))();
  }
  lastPointerUpType = null;
}

function updateButtonStates() {
  canZoomIn.value = map().canZoomIn();
  canZoomOut.value = map().canZoomOut();
}

// ---------- Lifecycle ----------

onMounted(() => {
  updateButtonStates();

  map().on('move.uiZoom', updateButtonStates);

  utilKeybinding.plusKeys.forEach((key) => {
    keybinding().on([key], zoomIn);
    keybinding().on([uiCmd('⌥' + key)], zoomInFurther);
  });

  utilKeybinding.minusKeys.forEach((key) => {
    keybinding().on([key], zoomOut);
    keybinding().on([uiCmd('⌥' + key)], zoomOutFurther);
  });
});

onUnmounted(() => {
  map().on('move.uiZoom', null);

  utilKeybinding.plusKeys.forEach((key) => {
    keybinding().on([key], null);
    keybinding().on([uiCmd('⌥' + key)], null);
  });

  utilKeybinding.minusKeys.forEach((key) => {
    keybinding().on([key], null);
    keybinding().on([uiCmd('⌥' + key)], null);
  });
});
</script>
