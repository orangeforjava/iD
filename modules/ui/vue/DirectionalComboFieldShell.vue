<template>
  <div :class="`form-field-input-wrap form-field-input-${state.fieldType}`" ref="wrapRef">
    <ul class="rows rows-table">
      <li
        v-for="row in state.rows"
        :key="row.key"
        :class="`labeled-input preset-directionalcombo-${row.safeKey}`"
      >
        <div
          class="label preset-label-directionalcombo"
          :for="`preset-input-directionalcombo-${row.safeKey}`"
          v-html="row.labelHtml"
        ></div>
        <div
          class="preset-input-directionalcombo-wrap form-field-input-wrap"
          :ref="el => state.setComboRef(row.key, el)"
        ></div>
      </li>
    </ul>
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
