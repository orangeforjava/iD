import { mountVueComponent } from './vue/bridge';
import ViewOnOsmoseLink from './vue/ViewOnOsmoseLink.vue';


export function uiViewOnOsmose() {
  const state = { what: null };
  const render = mountVueComponent(ViewOnOsmoseLink, {}, { state: state });

  render.what = function(val) {
    if (!arguments.length) return state.what;
    state.what = val;
    return render;
  };

  return render;
}
