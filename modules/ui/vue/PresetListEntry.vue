<template>
  <div class="preset-list-button-wrap">
    <button ref="buttonRef" class="preset-list-button" :class="{ disabled: state.disabled }" :title="state.tooltip || null" @click="state.onChoose" @keydown="state.onKeydown">
      <div ref="iconRef" class="preset-icon-host"></div>
      <div class="label">
        <div class="label-inner">
          <div v-for="(part, idx) in state.nameparts" :key="idx" class="namepart" v-html="part"></div>
        </div>
      </div>
    </button>
    <div ref="accessoryRef" class="preset-accessory"></div>
  </div>
  <div ref="bodyRef"></div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({ state: { type: Object, required: true } });
const buttonRef = ref(null);
const iconRef = ref(null);
const accessoryRef = ref(null);
const bodyRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({ button: buttonRef.value, icon: iconRef.value, accessory: accessoryRef.value, body: bodyRef.value });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
