<template>
  <div class="field-help-title cf">
    <h2 :class="titleClass">{{ titleText }}</h2>
    <button class="fr close" :title="t('icons.close')" @click.prevent.stop="state.hide()">
      <svg class="icon">
        <use href="#iD-icon-close" />
      </svg>
    </button>
  </div>

  <div class="field-help-nav cf">
    <div
      v-for="(doc, i) in state.docs"
      :key="doc.key"
      class="field-help-nav-item"
      :class="{ active: i === state.activeIndex }"
      v-html="doc.title"
      @click.prevent.stop="state.activeIndex = i"
    ></div>
  </div>

  <div ref="contentRef" class="field-help-content" v-html="currentHtml"></div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { t } from '../../core/localizer';

const props = defineProps({
  state: { type: Object, required: true }
});

const contentRef = ref(null);

const titleClass = computed(() => props.state.titleClass);
const titleText = computed(() => props.state.titleText);
const currentDoc = computed(() => props.state.docs[props.state.activeIndex]);
const currentHtml = computed(() => currentDoc.value ? currentDoc.value.html : '');

async function decorateContent() {
  await nextTick();
  const content = contentRef.value;
  const doc = currentDoc.value;
  if (!content || !doc) return;

  const keys = doc.partKeys || [];
  content.querySelectorAll('p').forEach((p, i) => {
    if (keys[i]) p.className = keys[i];
  });

  content.querySelectorAll('.field-help-image').forEach(node => node.remove());

  if (doc.key === 'help.field.restrictions.inspecting') {
    const target = content.querySelector('p.from_shadow');
    if (target) {
      const img = document.createElement('img');
      img.className = 'field-help-image cf';
      img.src = props.state.inspectImg;
      content.insertBefore(img, target);
    }
  } else if (doc.key === 'help.field.restrictions.modifying') {
    const target = content.querySelector('p.allow_turn');
    if (target) {
      const img = document.createElement('img');
      img.className = 'field-help-image cf';
      img.src = props.state.modifyImg;
      content.insertBefore(img, target);
    }
  }
}

onMounted(decorateContent);
watch(() => props.state.activeIndex, decorateContent);
</script>
