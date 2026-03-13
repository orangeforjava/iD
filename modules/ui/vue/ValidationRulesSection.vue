<template>
  <div class="issues-rulelist-container">
    <ul class="layer-list issue-rules-list">
      <li v-for="rule in state.rules" :key="rule.key" :class="{ active: rule.enabled }" :title="rule.tooltip || null">
        <label>
          <input type="checkbox" name="rule" :checked="rule.enabled" @change="state.toggleRule(rule.key)">
          <span>
            <span v-html="rule.title"></span>
            <span v-if="rule.key === 'unsquare_way'" class="square-degrees">
              <input
                class="square-degrees-input"
                type="number"
                min="0"
                max="20"
                step="0.5"
                :value="state.squareDegrees"
                @click.stop="state.onSquareClick"
                @keyup.enter="state.onSquareEnter"
                @blur="state.changeSquare"
              >
            </span>
          </span>
        </label>
      </li>
    </ul>
    <div class="issue-rules-links section-footer">
      <a class="issue-rules-link" role="button" href="#" @click.prevent="state.disableAll">{{ state.disableAllText }}</a>
      <a class="issue-rules-link" role="button" href="#" @click.prevent="state.enableAll">{{ state.enableAllText }}</a>
    </div>
  </div>
</template>

<script setup>
defineProps({ state: { type: Object, required: true } });
</script>
