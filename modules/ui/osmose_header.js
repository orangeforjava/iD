import { mountVueComponent } from './vue/bridge';
import OsmoseHeader from './vue/OsmoseHeader.vue';


export function uiOsmoseHeader() {
  const state = { issue: null };
  const render = mountVueComponent(OsmoseHeader, {}, { state: state });

  render.issue = function(val) {
    if (!arguments.length) return state.issue;
    state.issue = val;
    return render;
  };

  return render;
}
