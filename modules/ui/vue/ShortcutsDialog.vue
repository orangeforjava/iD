<template>
  <div class="modal-section header">
    <h2>{{ t('shortcuts.title') }}</h2>
  </div>
  <div v-if="tabs.length" class="wrapper modal-section">
    <div class="tabs-bar">
      <a
        v-for="(tab, i) in tabs"
        :key="tab.tab"
        href="#"
        class="tab"
        :class="{ active: i === state.activeTab }"
        @click.prevent="state.activeTab = i"
      >
        <span v-html="t.html(tab.text)"></span>
      </a>
    </div>
    <div class="shortcuts-list">
      <div
        v-for="(tab, i) in tabs"
        :key="tab.tab"
        :class="'shortcut-tab shortcut-tab-' + tab.tab"
        :style="{ display: i === state.activeTab ? 'flex' : 'none' }"
      >
        <table v-for="(column, cidx) in tab.columns" :key="cidx" class="shortcut-column">
          <tr v-for="(row, ridx) in column.rows" :key="ridx" class="shortcut-row">
            <template v-if="!row.shortcuts">
              <td></td>
              <td class="shortcut-section"><h3 v-html="t.html(row.text)"></h3></td>
            </template>
            <template v-else>
              <td class="shortcut-keys">
                <template v-for="(mod, midx) in getModifiers(row)" :key="'m' + midx">
                  <kbd class="modifier">{{ uiCmd.display(mod) }}</kbd>
                  <span>+</span>
                </template>

                <template v-for="(item, sidx) in getShortcuts(row)" :key="'s' + sidx">
                  <svg v-if="item.icon" :class="['icon', item.iconClass || 'operation']">
                    <use :href="item.icon"></use>
                  </svg>
                  <kbd v-else class="shortcut">{{ item.shortcut }}</kbd>
                  <span v-if="sidx < getShortcuts(row).length - 1" v-html="item.separator || ('&nbsp;' + t.html('shortcuts.or') + '&nbsp;')"></span>
                  <span v-else-if="item.suffix">{{ item.suffix }}</span>
                </template>

                <template v-if="row.gesture">
                  <span>+</span>
                  <span class="gesture" v-html="t.html(row.gesture)"></span>
                </template>
              </td>
              <td class="shortcut-desc" v-html="row.text ? t.html(row.text) : '&nbsp;'"></td>
            </template>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { fileFetcher } from '../../core/file_fetcher';
import { t } from '../../core/localizer';
import { uiCmd } from '../cmd';
import { utilArrayUniq } from '../../util';
import { utilDetect } from '../../util/detect';

const props = defineProps({
  state: { type: Object, required: true }
});

const detected = utilDetect();
const tabs = computed(() => props.state.dataShortcuts || []);

function getModifiers(row) {
  if (!row.modifiers) return [];
  if (detected.os === 'win' && row.text === 'shortcuts.editing.commands.redo') {
    return ['⌘'];
  } else if (detected.os !== 'mac' && row.text === 'shortcuts.browsing.display_options.fullscreen') {
    return [];
  }
  return row.modifiers;
}

function getShortcuts(row) {
  let arr = row.shortcuts || [];
  if (detected.os === 'win' && row.text === 'shortcuts.editing.commands.redo') {
    arr = ['Y'];
  } else if (detected.os !== 'mac' && row.text === 'shortcuts.browsing.display_options.fullscreen') {
    arr = ['F11'];
  }

  arr = arr.map(s => uiCmd.display(s.indexOf('.') !== -1 ? t(s) : s));
  return utilArrayUniq(arr).map(s => {
    const click = s.toLowerCase().match(/(.*).click/);
    if (click && click[1]) {
      return { icon: '#iD-walkthrough-mouse-' + click[1], iconClass: 'operation' };
    } else if (s.toLowerCase() === 'long-press') {
      return { icon: '#iD-walkthrough-longpress', iconClass: 'longpress operation' };
    } else if (s.toLowerCase() === 'tap') {
      return { icon: '#iD-walkthrough-tap', iconClass: 'tap operation' };
    }
    return { shortcut: s, separator: row.separator, suffix: row.suffix };
  });
}

onMounted(() => {
  fileFetcher.get('shortcuts')
    .then(data => {
      props.state.dataShortcuts = data;
    })
    .catch(() => {});
});
</script>
