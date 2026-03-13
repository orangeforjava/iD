<template>
  <div class="header fillL">
    <h2>{{ t('inspector.feature_list') }}</h2>
  </div>

  <div class="search-header">
    <svg class="icon pre-text"><use href="#iD-icon-search" /></svg>
    <input
      ref="searchRef"
      v-model="state.query"
      :placeholder="t('inspector.search')"
      type="search"
      @keydown="state.onKeydown"
      @keypress="state.onKeypress"
      @input="state.onInput"
    >
  </div>

  <div class="inspector-body">
    <div class="feature-list" :class="{ filtered: !!state.query.length }">
      <button v-if="state.query.length && !state.results.length" class="no-results-item" disabled>
        <svg class="icon pre-text"><use href="#iD-icon-alert" /></svg>
        <span class="entity-name">{{ t('geocoder.no_results_worldwide') }}</span>
      </button>

      <button v-if="state.showGeocodeButton" class="geocode-item secondary-action" @click="state.onGeocodeSearch">
        <div class="label"><span class="entity-name">{{ t('geocoder.search') }}</span></div>
      </button>

      <button
        v-for="item in state.results"
        :key="item.id"
        class="feature-list-item"
        @pointerenter="state.onMouseover(item)"
        @pointerleave="state.onMouseout(item)"
        @focus="state.onMouseover(item)"
        @blur="state.onMouseout(item)"
        @click="state.onClick($event, item)"
      >
        <div class="label" :title="item.name">
          <svg class="icon pre-text"><use :href="'#iD-icon-' + item.geometry" /></svg>
          <span class="entity-type">{{ item.type }}</span>
          <template v-if="item.relationRefs && item.relationRefs.length">
            <span
              v-for="ref in item.relationRefs"
              :key="ref.text"
              class="member-entity-ref-color"
              :style="{ borderColor: ref.color, backgroundColor: ref.color, color: ref.textColor }"
            >{{ ref.text }}</span>
          </template>
          <span class="entity-name">{{ item.name }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { t } from '../../core/localizer';

const props = defineProps({ state: { type: Object, required: true } });
const searchRef = ref(null);

onMounted(async () => {
  await nextTick();
  props.state.setSearchRef(searchRef.value);
});
</script>
