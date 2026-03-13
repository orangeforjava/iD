import { mountVueComponent } from './vue/bridge';
import KeepRightHeader from './vue/KeepRightHeader.vue';


export function uiKeepRightHeader() {
  const state = { issue: null };
  const render = mountVueComponent(KeepRightHeader, {}, { state: state });

  render.issue = function(val) {
    if (!arguments.length) return state.issue;
    state.issue = val;
    return render;
  };

  return render;
}
