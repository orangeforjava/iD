import { reactive } from 'vue';

import { mountVueComponent } from './vue/bridge';
import DataEditorPanel from './vue/DataEditorPanel.vue';


export function uiDataEditor(context) {
  var state = reactive({ datum: null });
  var render = mountVueComponent(DataEditorPanel, context, { state: state });

  render.datum = function(val) {
    if (!arguments.length) return state.datum;
    state.datum = val;
    return render;
  };

  return render;
}
