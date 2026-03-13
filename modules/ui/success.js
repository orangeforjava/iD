import { dispatch as d3_dispatch } from 'd3-dispatch';
import { reactive } from 'vue';

import { mountVueComponent } from './vue/bridge';
import SuccessPanel from './vue/SuccessPanel.vue';
import { utilRebind } from '../util/rebind';


export function uiSuccess(context) {
  const dispatch = d3_dispatch('cancel');
  const state = reactive({
    changeset: null,
    location: null,
    cancel: function() {
      dispatch.call('cancel');
    }
  });

  const render = mountVueComponent(SuccessPanel, context, { state: state });

  render.changeset = function(val) {
    if (!arguments.length) return state.changeset;
    state.changeset = val;
    return render;
  };

  render.location = function(val) {
    if (!arguments.length) return state.location;
    state.location = val;
    return render;
  };

  return utilRebind(render, dispatch, 'on');
}
