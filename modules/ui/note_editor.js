import { dispatch as d3_dispatch } from 'd3-dispatch';
import { reactive } from 'vue';

import { utilRebind } from '../util';
import { mountVueComponent } from './vue/bridge';
import NoteEditorPanel from './vue/NoteEditorPanel.vue';


export function uiNoteEditor(context) {
  var dispatch = d3_dispatch('change');
  var state = reactive({
    note: null,
    newNote: null,
    onChange: function(err, item) {
      dispatch.call('change', item);
    }
  });

  var render = mountVueComponent(NoteEditorPanel, context, { state: state });

  render.note = function(val) {
    if (!arguments.length) return state.note;
    state.note = val;
    return render;
  };

  render.newNote = function(val) {
    if (!arguments.length) return state.newNote;
    state.newNote = val;
    return render;
  };

  return utilRebind(render, dispatch, 'on');
}
