<template>
  <ul class="layer-list layer-background-list" dir="auto">
    <li v-for="item in state.items" :key="item.key" :class="[{ active: item.active, switch: item.switch, best: item.best, 'layer-custom': item.custom }]" :title="item.tooltip || null">
      <label>
        <input type="radio" name="background-layer" :checked="item.active" @change.prevent="state.choose(item.id)">
        <span v-html="item.labelHtml"></span>
      </label>
      <button v-if="item.custom" class="layer-browse" @click.prevent="state.editCustom">
        <svg class="icon"><use href="#iD-icon-more" /></svg>
      </button>
      <div v-if="item.best" class="best" :title="state.bestTitle">★</div>
    </li>
  </ul>

  <ul class="layer-list bg-extras-list">
    <li class="minimap-toggle-item" :title="state.minimapTitle">
      <label>
        <input type="checkbox" :checked="state.minimapActive" @change.prevent="state.toggleMinimap">
        <span>{{ state.minimapText }}</span>
      </label>
    </li>
    <li class="background-panel-toggle-item" :title="state.bgPanelTitle">
      <label>
        <input type="checkbox" :checked="state.bgPanelActive" @change.prevent="state.toggleInfo('background')">
        <span>{{ state.bgPanelText }}</span>
      </label>
    </li>
    <li class="location-panel-toggle-item" :title="state.locationPanelTitle">
      <label>
        <input type="checkbox" :checked="state.locationPanelActive" @change.prevent="state.toggleInfo('location')">
        <span>{{ state.locationPanelText }}</span>
      </label>
    </li>
  </ul>

  <div class="imagery-faq">
    <a target="_blank" href="https://github.com/openstreetmap/iD/blob/develop/FAQ.md#how-can-i-report-an-issue-with-background-imagery">
      <svg class="icon inline"><use href="#iD-icon-out-link" /></svg>
      <span>{{ state.imageryFaqText }}</span>
    </a>
  </div>
</template>

<script setup>
defineProps({ state: { type: Object, required: true } });
</script>
