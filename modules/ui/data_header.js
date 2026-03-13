import { mountVueComponent } from './vue/bridge';
import DataHeader from './vue/DataHeader.vue';


export function uiDataHeader() {
  const state = { datum: null };
  const render = mountVueComponent(DataHeader, {}, { state: state });

  render.datum = function(val) {
    if (!arguments.length) return state.datum;
    state.datum = val;
    return render;
  };

  return render;
}
