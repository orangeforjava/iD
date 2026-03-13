<template>
  <div :class="'form-field-input-wrap form-field-input-' + state.type" ref="wrapRef">
    <input
      ref="inputRef"
      :type="state.htmlType"
      dir="auto"
      :id="state.domId"
      :class="state.type"
      :readonly="state.readonly || null"
      :placeholder="state.placeholder"
      :title="state.title"
      :disabled="state.disabled || null"
      @input="state.onInput"
      @blur="state.onBlur"
      @change="state.onChange"
    >

    <template v-for="item in state.accessories" :key="item.key">
      <input
        v-if="item.kind === 'hidden-input'"
        :ref="(el) => state.setAccessoryRef(item.key, el)"
        :type="item.inputType"
        :class="item.className"
        :value="item.value || ''"
        @input="item.onInput"
      >

      <button
        v-else
        :ref="(el) => state.setAccessoryRef(item.key, el)"
        :class="item.className"
        :title="item.title || null"
        :disabled="item.disabled || null"
        @click.prevent="item.onClick"
      >
        <div v-if="item.kind === 'color-preview'" class="colour-box" :style="{ backgroundColor: item.color }">
          <svg v-if="!item.color" class="icon"><use href="#iD-icon-edit" /></svg>
        </div>
        <svg v-else class="icon"><use :href="item.icon" /></svg>
      </button>
    </template>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const wrapRef = ref(null);
const inputRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({
    wrap: wrapRef.value,
    input: inputRef.value
  });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
