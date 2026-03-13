import { mountVueComponent } from './vue/bridge';
import ViewOnKeepRightLink from './vue/ViewOnKeepRightLink.vue';


export function uiViewOnKeepRight() {
  const state = { what: null };
  const render = mountVueComponent(ViewOnKeepRightLink, {}, { state: state });

  render.what = function(val) {
    if (!arguments.length) return state.what;
    state.what = val;
    return render;
  };

  return render;
}
