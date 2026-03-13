import { reactive } from 'vue';

import { t } from '../core/localizer';
import { isVueAppInitialized, registerComponent, unregisterComponent } from './vue/app';
import ConfirmDialog from './vue/ConfirmDialog.vue';
import { uiModal } from './modal';


export function uiConfirm(selection) {
  var modalSelection = uiModal(selection);

  modalSelection.select('.modal')
    .classed('modal-alert', true);

  var section = modalSelection.select('.content');
  var registrationId = null;
  var state = reactive({
    showOk: false,
    close: function() {
      modalSelection.remove();
    }
  });

  if (isVueAppInitialized()) {
    registrationId = registerComponent(ConfirmDialog, section.node(), { state: state });
  } else {
    section.append('div').attr('class', 'modal-section header');
    section.append('div').attr('class', 'modal-section message-text');
    section.append('div').attr('class', 'modal-section buttons cf');
  }

  modalSelection.okButton = function() {
    if (isVueAppInitialized()) {
      state.showOk = true;
    } else {
      section.select('.buttons')
        .append('button')
        .attr('class', 'button ok-button action')
        .on('click.confirm', function() {
          modalSelection.remove();
        })
        .call(t.append('confirm.okay'))
        .node()
        .focus();
    }

    return modalSelection;
  };

  var remove = modalSelection.remove;
  modalSelection.remove = function() {
    if (registrationId) {
      unregisterComponent(registrationId);
      registrationId = null;
    }
    return remove.call(modalSelection);
  };

  return modalSelection;
}
