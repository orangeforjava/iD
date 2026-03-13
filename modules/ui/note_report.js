import { mountVueComponent } from './vue/bridge';
import NoteReportLink from './vue/NoteReportLink.vue';


export function uiNoteReport() {
  const state = { note: null };
  const render = mountVueComponent(NoteReportLink, {}, { state: state });

  render.note = function(val) {
    if (!arguments.length) return state.note;
    state.note = val;
    return render;
  };

  return render;
}
