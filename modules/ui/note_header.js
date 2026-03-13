import { mountVueComponent } from './vue/bridge';
import NoteHeader from './vue/NoteHeader.vue';


export function uiNoteHeader() {
  const state = { note: null };
  const render = mountVueComponent(NoteHeader, {}, { state: state });

  render.note = function(val) {
    if (!arguments.length) return state.note;
    state.note = val;
    return render;
  };

  return render;
}
