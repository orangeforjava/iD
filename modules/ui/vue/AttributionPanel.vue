<template>
  <div class="base-layer-attribution">
    <span
      v-for="item in baseAttributions"
      :key="item.id"
      class="attribution"
    >
      <template v-if="item.termsHtml">
        <span v-html="item.termsHtml" />
      </template>
      <template v-else-if="item.termsUrl">
        <a :href="item.termsUrl" target="_blank">
          <img v-if="item.icon && !item.overlay" class="source-image" :src="item.icon">
          <span class="attribution-text">{{ item.termsText }}</span>
        </a>
      </template>
      <template v-else>
        <img v-if="item.icon && !item.overlay" class="source-image" :src="item.icon">
        <span class="attribution-text">{{ item.termsText }}</span>
      </template>
      <span v-if="item.copyrightNotice" class="copyright-notice">{{ item.copyrightNotice }}</span>
    </span>
  </div>

  <div class="overlay-layer-attribution">
    <span
      v-for="item in overlayAttributions"
      :key="item.id"
      class="attribution"
    >
      <template v-if="item.termsHtml">
        <span v-html="item.termsHtml" />
      </template>
      <template v-else-if="item.termsUrl">
        <a :href="item.termsUrl" target="_blank">
          <img v-if="item.icon && !item.overlay" class="source-image" :src="item.icon">
          <span class="attribution-text">{{ item.termsText }}</span>
        </a>
      </template>
      <template v-else>
        <img v-if="item.icon && !item.overlay" class="source-image" :src="item.icon">
        <span class="attribution-text">{{ item.termsText }}</span>
      </template>
      <span v-if="item.copyrightNotice" class="copyright-notice">{{ item.copyrightNotice }}</span>
    </span>
  </div>
</template>

<script setup>
import _throttle from 'lodash-es/throttle';
import { onMounted, onUnmounted, ref } from 'vue';
import { t } from '../../core/localizer';
import { useContext } from './useContext';

const { context, map } = useContext();

const baseAttributions = ref([]);
const overlayAttributions = ref([]);

function toViewModel(source) {
  const sourceID = source.id.replace(/\./g, '<TX_DOT>');
  const termsText = t(`imagery.${sourceID}.attribution.text`, {
    default: source.terms_text || source.id || source.name()
  });
  const copyrightNotice = source.copyrightNotices(map().zoom(), map().extent());

  return {
    id: source.id,
    overlay: source.overlay,
    icon: source.icon,
    termsHtml: source.terms_html,
    termsUrl: source.terms_url,
    termsText: termsText,
    copyrightNotice: copyrightNotice || ''
  };
}

function update() {
  const baselayer = context.background().baseLayerSource();
  baseAttributions.value = baselayer ? [toViewModel(baselayer)] : [];

  const z = map().zoom();
  const overlays = context.background().overlayLayerSources() || [];
  overlayAttributions.value = overlays
    .filter(source => source.validZoom(z))
    .map(toViewModel);
}

const throttledUpdate = _throttle(update, 400, { leading: false });

onMounted(() => {
  context.background().on('change.attribution', update);
  map().on('move.attribution', throttledUpdate);
  update();
});

onUnmounted(() => {
  context.background().on('change.attribution', null);
  map().on('move.attribution', null);
  throttledUpdate.cancel();
});
</script>
