<template>
  <el-tooltip
    v-if="supported"
    :placement="tooltipPlacement"
    :content="tooltipText"
    :show-after="500"
  >
    <button
      :class="{ active: isActive }"
      :aria-pressed="isActive"
      @click="handleClick"
    >
      <svg class="icon light">
        <use href="#iD-icon-geolocate" />
      </svg>
    </button>
  </el-tooltip>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue';
import { ElTooltip } from 'element-plus';
import { t, localizer } from '../../core/localizer';
import { geoExtent } from '../../geo';
import { modeBrowse } from '../../modes/browse';
import { uiLoading } from '../loading';
import { useContext } from './useContext';

const { context, map, ui } = useContext();

const geolocationOptions = {
  enableHighAccuracy: false,
  timeout: 6000
};

const locating = uiLoading(context)
  .message(t.html('geolocate.locating'))
  .blocking(true);

const layer = context.layers().layer('geolocate');
const supported = !!(navigator.geolocation && navigator.geolocation.getCurrentPosition);
const isActive = ref(layer.enabled());

let position;
let extent;
let timeoutID;

const tooltipPlacement = computed(() => {
  return localizer.textDirection() === 'rtl' ? 'right' : 'left';
});

const tooltipText = computed(() => t('geolocate.title'));

function updateButtonState() {
  isActive.value = layer.enabled();
}

function finish() {
  locating.close();
  if (timeoutID) {
    clearTimeout(timeoutID);
  }
  timeoutID = undefined;
}

function zoomTo() {
  context.enter(modeBrowse(context));
  const mapSystem = map();
  layer.enabled(position, true);
  updateButtonState();
  mapSystem.centerZoomEase(extent.center(), Math.min(20, mapSystem.extentZoom(extent)));
}

function handleSuccess(geolocation) {
  position = geolocation;
  const coords = position.coords;
  extent = geoExtent([coords.longitude, coords.latitude]).padByMeters(coords.accuracy);
  zoomTo();
  finish();
}

function handleError() {
  if (position) {
    zoomTo();
  } else {
    ui().flash
      .label(t.append('geolocate.location_unavailable'))
      .iconName('#iD-icon-geolocate')();
  }

  finish();
}

function handleClick() {
  if (context.inIntro()) return;

  if (!layer.enabled() && !locating.isShown()) {
    timeoutID = setTimeout(handleError, 10000);
    context.container().call(locating);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geolocationOptions);
  } else {
    locating.close();
    layer.enabled(null, false);
    updateButtonState();
  }
}

onUnmounted(() => {
  finish();
});
</script>
