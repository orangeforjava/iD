<template>
  <div class="form-field-input-wrap form-field-input-access" ref="wrapRef">
    <ul class="rows">
      <li
        v-for="row in state.rows"
        :key="row.key"
        :class="`labeled-input preset-access-${row.key}`"
      >
        <div class="label preset-label-access" :for="`preset-input-access-${row.key}`" v-html="row.labelHtml"></div>
        <div class="preset-input-access-wrap">
          <input
            :id="`preset-input-access-${row.key}`"
            :ref="el => state.setInputRef(row.key, el)"
            type="text"
            class="preset-input-access"
            :class="`preset-input-access-${row.key}`"
            :data-access-key="row.key"
          >
        </div>
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
