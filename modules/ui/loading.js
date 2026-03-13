import { select as d3_select } from 'd3-selection';
import { reactive } from 'vue';

import { isVueAppInitialized, registerComponent, unregisterComponent } from './vue/app';
import LoadingModal from './vue/LoadingModal.vue';
import { uiModal } from './modal';


export function uiLoading(context) {
  let _modalSelection = d3_select(null);
  let _message = '';
  let _blocking = false;
  let _registrationId = null;
  let _state = reactive({ visible: false, message: '', imageSrc: context.imagePath('loader-white.gif') });

  let loading = (selection) => {
    if (isVueAppInitialized()) {
      _state.message = _message;
      _state.visible = true;
      _registrationId = registerComponent(LoadingModal, selection.node(), { state: _state });
      return loading;
    }

    _modalSelection = uiModal(selection, _blocking);

    let loadertext = _modalSelection.select('.content')
      .classed('loading-modal', true)
      .append('div')
      .attr('class', 'modal-section fillL');

    loadertext.append('img').attr('class', 'loader').attr('src', context.imagePath('loader-white.gif'));
    loadertext.append('h3').html(_message);
    _modalSelection.select('button.close').attr('class', 'hide');
    return loading;
  };

  loading.message = function(val) {
    if (!arguments.length) return _message;
    _message = val;
    return loading;
  };

  loading.blocking = function(val) {
    if (!arguments.length) return _blocking;
    _blocking = val;
    return loading;
  };

  loading.close = () => {
    if (_registrationId) {
      _state.visible = false;
      unregisterComponent(_registrationId);
      _registrationId = null;
    }
    _modalSelection.remove();
  };

  loading.isShown = () => {
    if (_registrationId) return true;
    return _modalSelection && !_modalSelection.empty() && _modalSelection.node().parentNode;
  };

  return loading;
}
