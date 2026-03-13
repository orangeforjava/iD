import { mountVueComponent } from './vue/bridge';
import SourceSwitchChip from './vue/SourceSwitchChip.vue';


export function uiSourceSwitch(context) {
  var state = { keys: null };
  var render = mountVueComponent(SourceSwitchChip, context, { state: state });

  var sourceSwitch = function(selection) {
    return render(selection);
  };

  sourceSwitch.keys = function(_) {
    if (!arguments.length) return state.keys;
    state.keys = _;
    return sourceSwitch;
  };

  sourceSwitch.unmount = render.unmount;

  return sourceSwitch;
}
