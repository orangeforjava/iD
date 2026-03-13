<template>
  <div class="commit-section">
    <ul class="changeset-list">
      <li v-for="change in state.summary" :key="change.id + '-' + change.changeType" class="change-item">
        <button @mouseover="state.onHover(change)" @mouseout="state.onOut" @click="state.onClick(change)">
          <svg :class="'icon pre-text ' + change.changeType"><use :href="change.icon" /></svg>
          <span class="change-type" v-html="change.changeTypeHtml + ' '"></span>
          <strong class="entity-type">{{ change.entityType }}</strong>
          <span class="entity-name">{{ change.entityName }}</span>
        </button>
      </li>
    </ul>
    <a class="download-changes" :href="state.downloadHref" download="changes.osc">
      <svg class="icon inline"><use href="#iD-icon-load" /></svg>
      <span>{{ state.downloadLabel }}</span>
    </a>
  </div>
</template>

<script setup>
defineProps({ state: { type: Object, required: true } });
</script>
