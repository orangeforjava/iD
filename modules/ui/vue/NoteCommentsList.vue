<template>
  <div v-if="!state.note?.isNew()" class="comments-container">
    <div v-for="comment in state.comments" :key="comment.uid + '-' + comment.date + '-' + comment.action" class="comment">
      <div :class="'comment-avatar user-' + (comment.uid || 'anon')">
        <img v-if="comment.imageUrl" class="icon comment-avatar-icon" :src="comment.imageUrl" :alt="comment.user || ''">
        <svg v-else class="icon comment-avatar-icon"><use href="#iD-icon-avatar" /></svg>
      </div>
      <div class="comment-main">
        <div class="comment-metadata">
          <div class="comment-author">
            <a v-if="comment.user && comment.userUrl" class="comment-author-link" :href="comment.userUrl" target="_blank">{{ comment.user }}</a>
            <template v-else-if="comment.user">{{ comment.user }}</template>
            <template v-else>{{ t('note.anonymous') }}</template>
          </div>
          <div class="comment-date" v-html="comment.dateHtml"></div>
        </div>
        <div class="comment-text" v-html="comment.html"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from '../../core/localizer';

defineProps({
  state: { type: Object, required: true }
});
</script>
