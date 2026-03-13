import { reactive } from 'vue';

import { t } from '../core/localizer';
import { uiCmd } from './cmd';
import { uiInfoPanels } from './panels';
import { mountVueComponent } from './vue/bridge';
import InfoPanels from './vue/InfoPanels.vue';


export function uiInfo(context) {
  var ids = Object.keys(uiInfoPanels);
  var state = reactive({
    ids: ids,
    wasActive: ['measurement'],
    panels: {},
    active: {}
  });

  ids.forEach(function(k) {
    state.panels[k] = uiInfoPanels[k](context);
    state.active[k] = false;
  });

  var render = mountVueComponent(InfoPanels, context, { state: state });

  function info(selection) {
    render(selection);

    context.keybinding().on(uiCmd('⌘' + t('info_panels.key')), function(d3_event) {
      if (d3_event.shiftKey) return;
      d3_event.stopImmediatePropagation();
      d3_event.preventDefault();
      info.toggle();
    });

    ids.forEach(function(k) {
      var key = t('info_panels.' + k + '.key', { default: null });
      if (!key) return;
      context.keybinding().on(uiCmd('⌘⇧' + key), function(d3_event) {
        d3_event.stopImmediatePropagation();
        d3_event.preventDefault();
        info.toggle(k);
      });
    });
  }

  info.toggle = function(which) {
    var activeids = ids.filter(function(k) { return state.active[k]; });

    if (which) {
      state.active[which] = !state.active[which];
      if (activeids.length === 1 && activeids[0] === which) {
        state.wasActive = [which];
      }

      context.container().select('.' + which + '-panel-toggle-item')
        .classed('active', state.active[which])
        .select('input')
        .property('checked', state.active[which]);
    } else {
      if (activeids.length) {
        state.wasActive = activeids;
        activeids.forEach(function(k) { state.active[k] = false; });
      } else {
        state.wasActive.forEach(function(k) { state.active[k] = true; });
      }
    }
  };

  info.unmount = function() {
    render.unmount?.();
  };

  return info;
}
