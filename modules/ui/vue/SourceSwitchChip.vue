<template>
  <a href="#" :class="{ live: isLive, chip: isLive }" @click.prevent="handleClick">
    {{ isLive ? t('source_switch.live') : t('source_switch.dev') }}
  </a>
</template>

<script setup>
import { ref } from 'vue';
import { t } from '../../core/localizer';
import { modeBrowse } from '../../modes/browse';
import { useContext } from './useContext';

const props = defineProps({
  state: {
    type: Object,
    required: true
  }
});

const { context, connection, history } = useContext();
const isLive = ref(true);

function handleClick() {
  const osm = connection();
  if (!osm) return;
  if (context.inIntro()) return;
  if (history().hasChanges() && !window.confirm(t('source_switch.lose_changes'))) return;

  isLive.value = !isLive.value;
  context.enter(modeBrowse(context));
  history().clearSaved();
  context.flush();
  osm.switch(isLive.value ? props.state.keys[0] : props.state.keys[1]);
}
</script>
