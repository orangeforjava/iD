<template>
  <div>
    <p v-if="!state.docs || !state.docs.title" class="tag-reference-description">
      {{ t('inspector.no_documentation_key') }}
    </p>

    <template v-else>
      <img
        v-if="state.docs.imageURL"
        class="tag-reference-wiki-image"
        :alt="state.docs.title"
        :src="state.docs.imageURL"
      >

      <p class="tag-reference-description">
        <span class="localized-text" :lang="state.docs.descriptionLocaleCode || 'und'">{{ descriptionText }}</span>
        <a class="tag-reference-edit" target="_blank" :title="t('inspector.edit_reference')" :href="state.docs.editURL">
          <svg class="icon inline"><use href="#iD-icon-edit" /></svg>
        </a>
      </p>

      <a v-if="state.docs.wiki" class="tag-reference-link" target="_blank" :href="state.docs.wiki.url">
        <svg class="icon inline"><use href="#iD-icon-out-link" /></svg>
        <span>{{ t(state.docs.wiki.text) }}</span>
      </a>

      <a v-if="state.showCommentLink" class="tag-reference-comment-link" target="_blank" :href="t('commit.about_changeset_comments_link')">
        <svg class="icon inline"><use href="#iD-icon-out-link" /></svg>
        <span>{{ t('commit.about_changeset_comments') }}</span>
      </a>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { t } from '../../core/localizer';

const props = defineProps({ state: { type: Object, required: true } });

const descriptionText = computed(() => props.state.descriptionText || t('inspector.no_documentation_key'));
</script>
