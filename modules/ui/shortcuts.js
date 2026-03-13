import { select as d3_select } from 'd3-selection';
import { reactive } from 'vue';

import { t } from '../core/localizer';
import { isVueAppInitialized, registerComponent, unregisterComponent } from './vue/app';
import ShortcutsDialog from './vue/ShortcutsDialog.vue';
import { uiModal } from './modal';


export function uiShortcuts(context) {
  var _activeTab = 0;
  var _modalSelection;
  var _selection = d3_select(null);
  var _registrationId = null;

  function shortcutsModal(modalSelection) {
    modalSelection.select('.modal')
      .classed('modal-shortcuts', true);

    var content = modalSelection.select('.content');

    if (isVueAppInitialized()) {
      var state = reactive({
        activeTab: _activeTab,
        dataShortcuts: null
      });

      _registrationId = registerComponent(ShortcutsDialog, content.node(), { state: state });
    }
  }

  return function(selection, show) {
    _selection = selection;

    function open() {
      _modalSelection = uiModal(_selection);
      _modalSelection.call(shortcutsModal);
    }

    function close() {
      if (_registrationId) {
        unregisterComponent(_registrationId);
        _registrationId = null;
      }
      if (_modalSelection) {
        _modalSelection.close();
        _modalSelection = null;
      }
    }

    if (show) {
      open();
    } else {
      context.keybinding().on([t('shortcuts.toggle.key'), '?'], function() {
        if (context.container().selectAll('.modal-shortcuts').size()) {
          close();
        } else {
          open();
        }
      });
    }
  };
}
