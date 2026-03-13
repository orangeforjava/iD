<template>
  <div
    v-if="state.visible"
    class="edit-menu"
    :class="{ 'touch-menu': state.isTouchMenu }"
    :style="state.menuStyle"
  >
    <el-tooltip
      v-for="op in state.operations"
      :key="op.id"
      :content="state.tooltipText(op)"
      :placement="state.tooltipPlacement"
      :disabled="state.showLabels"
      :show-after="200"
    >
      <button
        :class="['edit-menu-item', 'edit-menu-item-' + op.id, { disabled: state.isDisabled(op) }]"
        :style="{ height: state.buttonHeight + 'px' }"
        @click="(e) => state.handleClick(e, op)"
        @pointerup="state.handlePointerUp"
        @pointerdown.stop
        @mousedown.stop
        @mouseenter="state.handleMouseEnter(op, $event)"
        @mouseleave="state.handleMouseLeave(op, $event)"
      >
        <div class="icon-wrap">
          <svg class="icon operation">
            <use :href="state.iconHref(op)" />
          </svg>
        </div>
        <span
          v-if="state.showLabels"
          class="label"
          :ref="(el) => setLabelRef(op.id, el)"
        ></span>
      </button>
    </el-tooltip>
  </div>
</template>

<script setup>
import { select as d3_select } from 'd3-selection';
import { ElTooltip } from 'element-plus';
import { nextTick, watch } from 'vue';

const props = defineProps({
  state: { type: Object, required: true }
});

const labelRefs = new Map();

function setLabelRef(id, el) {
  if (el) {
    labelRefs.set(id, el);
  } else {
    labelRefs.delete(id);
  }
}

async function renderLabels() {
  if (!props.state.showLabels) return;
  await nextTick();
  props.state.operations.forEach(op => {
    const el = labelRefs.get(op.id);
    if (!el) return;
    d3_select(el).html('');
    if (typeof op.title === 'function') {
      d3_select(el).call(op.title);
    }
  });
}

watch(() => [props.state.operations, props.state.showLabels, props.state.labelVersion], renderLabels, { deep: true, immediate: true });
</script>
