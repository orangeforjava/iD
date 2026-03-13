import { mountVueComponent } from './vue/bridge';
import OsmoseDetails from './vue/OsmoseDetails.vue';


export function uiOsmoseDetails(context) {
  const state = { issue: null };
  const render = mountVueComponent(OsmoseDetails, context, { state: state });

  render.issue = function(val) {
    if (!arguments.length) return state.issue;
    state.issue = val;
    return render;
  };

  return render;
}
