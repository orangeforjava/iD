<template>
  <div class="scale" @click="switchUnits">
    <svg class="scale-svg" :width="svgWidth" height="22">
      <g :transform="`translate(10, 11)`">
        <path class="scale-path" :d="pathD" />
      </g>
    </svg>
    <div
      class="scale-text"
      :style="textStyle"
    >{{ scaleText }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { displayLength } from '../../util/units';
import { geoLonToMeters, geoMetersToLon } from '../../geo';
import { localizer } from '../../core/localizer';
import { useContext } from './useContext';

const { context, map } = useContext();

const maxLength = 180;
const tickHeight = 8;

const isImperial = ref(!localizer.usesMetric());
const scaleData = ref({ px: 0, text: '' });

const svgWidth = computed(() => maxLength + 30);

const pathD = computed(() => {
  return `M0.5,0.5v${tickHeight}h${scaleData.value.px}v-${tickHeight}`;
});

const textStyle = computed(() => {
  const dir = localizer.textDirection();
  return {
    [dir === 'ltr' ? 'left' : 'right']: (scaleData.value.px + 16) + 'px'
  };
});

const scaleText = computed(() => scaleData.value.text);

function calculateScale() {
  const dims = map().dimensions();
  const proj = context.projection;
  const loc1 = proj.invert([0, dims[1]]);
  const loc2 = proj.invert([maxLength, dims[1]]);

  const lat = (loc2[1] + loc1[1]) / 2;
  const conversion = isImperial.value ? 3.28084 : 1;
  const dist = geoLonToMeters(loc2[0] - loc1[0], lat) * conversion;

  let scaleDist;
  const buckets = isImperial.value
    ? [5280000, 528000, 52800, 5280, 500, 50, 5, 1]
    : [5000000, 500000, 50000, 5000, 500, 50, 5, 1];

  for (let i = 0; i < buckets.length; i++) {
    const val = buckets[i];
    if (dist >= val) {
      scaleDist = Math.floor(dist / val) * val;
      break;
    } else {
      scaleDist = +dist.toFixed(2);
    }
  }

  const dLon = geoMetersToLon(scaleDist / conversion, lat);
  const px = Math.round(proj([loc1[0] + dLon, loc1[1]])[0]);
  const text = displayLength(scaleDist / conversion, isImperial.value);

  scaleData.value = { px, text };
}

function switchUnits() {
  isImperial.value = !isImperial.value;
  calculateScale();
}

function handleMapMove() {
  calculateScale();
}

onMounted(() => {
  calculateScale();
  map().on('move.scale', handleMapMove);
});

onUnmounted(() => {
  map().on('move.scale', null);
});
</script>

<style scoped>
.scale {
  height: 100%;
  width: 100%;
  cursor: pointer;
  display: block;
}
.scale-svg {
  height: 100%;
  width: 100%;
}
.scale-path {
  fill: none;
  stroke: #ccc;
  stroke-width: 1;
  shape-rendering: crispEdges;
}
.scale-text {
  display: inline-block;
  position: absolute;
  color: #ccc;
  top: 0.45em;
}
:global([dir='rtl']) .scale {
  transform: scaleX(-1);
}
</style>
