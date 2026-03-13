import { timeout as d3_timeout } from 'd3-timer';
import { reactive } from 'vue';

import { isVueAppInitialized, registerComponent, unregisterComponent } from './vue/app';
import FlashMessage from './vue/FlashMessage.vue';


export function uiFlash(context) {
  var _flashTimer;
  var _duration = 2000;
  var _iconName = '#iD-icon-no';
  var _iconClass = 'disabled';
  var _label = s => s.text('');
  var _registrationId = null;
  var _state = reactive({
    iconName: _iconName,
    iconClass: _iconClass,
    label: _label
  });

  function showFooterClasses() {
    context.container().select('.main-footer-wrap')
      .classed('footer-hide', true)
      .classed('footer-show', false);
    context.container().select('.flash-wrap')
      .classed('footer-hide', false)
      .classed('footer-show', true);
  }

  function hideFooterClasses() {
    context.container().select('.main-footer-wrap')
      .classed('footer-hide', false)
      .classed('footer-show', true);
    context.container().select('.flash-wrap')
      .classed('footer-hide', true)
      .classed('footer-show', false);
  }

  function legacyRender() {
    var content = context.container().select('.flash-wrap').selectAll('.flash-content')
      .data([0]);

    var contentEnter = content.enter()
      .append('div')
      .attr('class', 'flash-content');

    var iconEnter = contentEnter
      .append('svg')
      .attr('class', 'flash-icon icon')
      .append('g')
      .attr('transform', 'translate(10,10)');

    iconEnter.append('circle').attr('r', 9);
    iconEnter.append('use')
      .attr('transform', 'translate(-7,-7)')
      .attr('width', '14')
      .attr('height', '14');

    contentEnter.append('div').attr('class', 'flash-text');

    content = content.merge(contentEnter);
    content.selectAll('.flash-icon').attr('class', 'icon flash-icon ' + (_iconClass || ''));
    content.selectAll('.flash-icon use').attr('xlink:href', _iconName);
    content.selectAll('.flash-text').attr('class', 'flash-text').call(_label);
    return content;
  }

  function flash() {
    if (_flashTimer) _flashTimer.stop();

    showFooterClasses();

    if (isVueAppInitialized()) {
      _state.iconName = _iconName;
      _state.iconClass = _iconClass;
      _state.label = _label;

      if (!_registrationId) {
        _registrationId = registerComponent(
          FlashMessage,
          context.container().select('.flash-wrap').node(),
          { state: _state }
        );
      }
    } else {
      legacyRender();
    }

    _flashTimer = d3_timeout(function() {
      _flashTimer = null;
      hideFooterClasses();
      if (_registrationId) {
        unregisterComponent(_registrationId);
        _registrationId = null;
      }
    }, _duration);
  }

  flash.duration = function(_) {
    if (!arguments.length) return _duration;
    _duration = _;
    return flash;
  };

  flash.label = function(_) {
    if (!arguments.length) return _label;
    _label = (typeof _ !== 'function') ? (selection => selection.text(_)) : (selection => selection.text('').call(_));
    return flash;
  };

  flash.iconName = function(_) {
    if (!arguments.length) return _iconName;
    _iconName = _;
    return flash;
  };

  flash.iconClass = function(_) {
    if (!arguments.length) return _iconClass;
    _iconClass = _;
    return flash;
  };

  return flash;
}
