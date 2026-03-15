<template>
  <div class="form-field-input-wrap form-field-input-radio" ref="wrapRef">
    <span class="placeholder">{{ state.placeholderText }}</span>

    <label
      v-for="option in state.options"
      :key="option.key"
      :class="{ active: option.active, mixed: option.mixed }"
      :title="option.title || null"
    >
      <input
        :ref="el => state.setInputRef(option.key, el)"
        type="radio"
        :name="state.fieldId"
        :value="option.value"
        :checked="option.checked"
      >
      <span>{{ option.label }}</span>
    </label>

    <div v-if="state.showExtras" class="structure-extras-wrap">
      <ul class="rows">
        <li v-if="state.showType" class="labeled-input structure-type-item">
          <div class="label structure-label-type" :for="`preset-input-${state.selectedKey || ''}`">{{ state.typeLabel }}</div>
          <div class="structure-input-type-wrap" :ref="state.setTypeRef"></div>
        </li>

        <li v-if="state.showLayer" class="labeled-input structure-layer-item">
          <div class="label structure-label-layer" for="preset-input-layer">{{ state.layerLabel }}</div>
          <div class="structure-input-layer-wrap" :ref="state.setLayerRef"></div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const wrapRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({ wrap: wrapRef.value });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
