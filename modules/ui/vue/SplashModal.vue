<template>
  <div v-if="state.visible" class="shaded" :style="{ opacity: 1 }">
    <div class="modal-splash modal">
      <div class="content">
        <div class="fillL">
          <div class="modal-section">
            <h3>{{ t('splash.welcome') }}</h3>
          </div>
          <div class="modal-section">
            <p v-html="introHtml"></p>
            <p v-html="privacyHtml"></p>
            <div ref="privacyRef"></div>
          </div>
          <div class="modal-actions">
            <button class="walkthrough" @click="startWalkthrough">
              <svg class="logo logo-walkthrough"><use href="#iD-logo-walkthrough" /></svg>
              <div>{{ t('splash.walkthrough') }}</div>
            </button>
            <button class="start-editing" @click="close">
              <svg class="logo logo-features"><use href="#iD-logo-features" /></svg>
              <div>{{ t('splash.start') }}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { select as d3_select } from 'd3-selection';
import { computed, nextTick, onMounted, ref } from 'vue';
import { t } from '../../core/localizer';
import { uiIntro } from '../intro';
import { uiSectionPrivacy } from '../sections/privacy';
import { useContext } from './useContext';

const props = defineProps({
  state: { type: Object, required: true }
});

const { context } = useContext();
const privacyRef = ref(null);

const introHtml = computed(() => t.html('splash.text', {
  version: context.version,
  website: { html: '<a target="_blank" href="https://github.com/openstreetmap/iD/blob/develop/CHANGELOG.md#whats-new">' + t.html('splash.changelog') + '</a>' },
  github: { html: '<a target="_blank" href="https://github.com/openstreetmap/iD/issues">github.com</a>' }
}));

const privacyHtml = computed(() => t.html('splash.privacy', {
  updateMessage: props.state.updateMessage,
  privacyLink: { html: '<a target="_blank" href="https://github.com/openstreetmap/iD/blob/release/PRIVACY.md">' + t('splash.privacy_policy') + '</a>' }
}));

async function renderPrivacy() {
  await nextTick();
  if (!privacyRef.value) return;
  d3_select(privacyRef.value).call(
    uiSectionPrivacy(context)
      .label(() => t.append('splash.privacy_settings'))
      .render
  );
}

function close() {
  props.state.visible = false;
}

function startWalkthrough() {
  context.container().call(uiIntro(context));
  close();
}

onMounted(renderPrivacy);
</script>
