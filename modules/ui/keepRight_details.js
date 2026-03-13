import { mountVueComponent } from './vue/bridge';
import KeepRightDetails from './vue/KeepRightDetails.vue';


export function uiKeepRightDetails(context) {
  const state = { issue: null };
  const render = mountVueComponent(KeepRightDetails, context, { state: state });

  render.issue = function(val) {
    if (!arguments.length) return state.issue;
    state.issue = val;
    return render;
  };

  return render;
}
