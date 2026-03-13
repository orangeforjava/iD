<template>
  <div :class="'form-fields-container ' + (state.klass || '')">
    <div
      v-for="item in state.shownKeys"
      :key="item"
      :class="'wrap-form-field wrap-form-field-' + item"
      :ref="(el) => state.setFieldRef(item, el)"
    ></div>
  </div>

  <div v-if="state.showMore" class="more-fields">
    <label>
      <span>{{ t('inspector.add_fields') }}</span>
      <input
        ref="moreInputRef"
        class="value"
        type="text"
        :placeholder="state.placeholder"
      >
    </label>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import { t } from '../../core/localizer';

const props = defineProps({ state: { type: Object, required: true } });
const moreInputRef = ref(null);

async function wireRefs() {
  await nextTick();
  props.state.setMoreInput(moreInputRef.value);
}

onMounted(wireRefs);
watch(() => [props.state.shownKeys, props.state.showMore], wireRefs, { deep: true });
</script>
