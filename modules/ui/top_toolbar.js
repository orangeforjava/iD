import _debounce from 'lodash-es/debounce';
import { reactive } from 'vue';

import { uiToolDrawModes, uiToolNotes, uiToolSave, uiToolSidebarToggle, uiToolUndoRedo } from './tools';
import { mountVueComponent } from './vue/bridge';
import TopToolbarShell from './vue/TopToolbarShell.vue';


export function uiTopToolbar(context) {
  var sidebarToggle = uiToolSidebarToggle(context);
  var modes = uiToolDrawModes(context);
  var notes = uiToolNotes(context);
  var undoRedo = uiToolUndoRedo(context);
  var save = uiToolSave(context);

  var state = reactive({
    tools: [],
    barSelection: null
  });
  var render = mountVueComponent(TopToolbarShell, context, { state: state });

  function notesEnabled() {
    var noteLayer = context.layers().layer('notes');
    return noteLayer && noteLayer.enabled();
  }

  function buildTools() {
    var tools = [sidebarToggle, 'spacer', modes];
    tools.push('spacer');
    if (notesEnabled()) {
      tools = tools.concat([notes, 'spacer']);
    }
    tools = tools.concat([undoRedo, save]);

    return tools.map(function(d, i) {
      if (d === 'spacer') {
        return {
          key: 'spacer-' + i,
          type: 'spacer',
          classes: 'toolbar-item spacer'
        };
      }

      var classes = 'toolbar-item ' + (d.id || '').replaceAll('_', '-');
      if (d.klass) classes += ' ' + d.klass;
      return {
        key: d.id,
        type: 'tool',
        classes: classes,
        tool: d
      };
    });
  }

  function topToolbar(bar) {
    bar.on('wheel.topToolbar', function(d3_event) {
      if (!d3_event.deltaX) {
        bar.node().scrollLeft += d3_event.deltaY;
      }
    });

    state.barSelection = bar;

    var debouncedUpdate = _debounce(update, 500, { leading: true, trailing: true });
    context.layers().on('change.topToolbar', debouncedUpdate);

    update();
    render(bar);

    function update() {
      state.tools = buildTools();
    }
  }

  topToolbar.unmount = render.unmount;

  return topToolbar;
}
