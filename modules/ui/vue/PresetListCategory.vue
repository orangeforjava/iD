<template>
  <div class="preset-list-button-wrap category">
    <button ref="buttonRef" class="preset-list-button" :class="{ expanded: state.expanded }" :title="state.buttonTitle" @click="state.onToggle" @keydown="state.onKeydown">
      <div ref="iconRef" class="preset-icon-host"></div>
      <div class="label">
        <div class="label-inner">
          <div class="namepart">
            <svg class="icon inline"><use :href="state.arrowIcon" /></svg>
            <span v-html="state.nameHtml"></span><span>...</span>
          </div>
        </div>
      </div>
    </button>
  </div>
  <div ref="subgridRef" class="subgrid" :style="{ maxHeight: state.expanded ? state.maxHeight : '0px', opacity: state.expanded ? '1' : '0', paddingBottom: state.expanded ? '10px' : '0px' }">
    <div class="arrow"></div>
    <div ref="sublistRef" class="preset-list fillL3"></div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({ state: { type: Object, required: true } });
const buttonRef = ref(null);
const iconRef = ref(null);
const subgridRef = ref(null);
const sublistRef = ref(null);

async function syncRefs() {
  await nextTick();
  props.state.setRefs({ button: buttonRef.value, icon: iconRef.value, subgrid: subgridRef.value, sublist: sublistRef.value });
}

onMounted(syncRefs);
watch(() => props.state.renderVersion, syncRefs);
</script>
