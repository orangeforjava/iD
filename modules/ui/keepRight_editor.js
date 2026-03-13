import { dispatch as d3_dispatch } from 'd3-dispatch';
import { reactive } from 'vue';

import { utilRebind } from '../util';
import { mountVueComponent } from './vue/bridge';
import KeepRightEditorPanel from './vue/KeepRightEditorPanel.vue';


export function uiKeepRightEditor(context) {
  const dispatch = d3_dispatch('change');
  const state = reactive({
    qaItem: null,
    onChange: function(err, item) {
      dispatch.call('change', item);
    }
  });

  const render = mountVueComponent(KeepRightEditorPanel, context, { state: state });

  render.error = function(val) {
    if (!arguments.length) return state.qaItem;
    state.qaItem = val;
    return render;
  };

  return utilRebind(render, dispatch, 'on');
}
