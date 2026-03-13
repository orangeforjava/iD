import { reactive } from 'vue';

import { mountVueComponent } from './vue/bridge';
import LengthIndicator from './vue/LengthIndicator.vue';
import { utilUnicodeCharsCount, utilCleanOsmString } from '../util';


export function uiLengthIndicator(maxChars) {
  const state = reactive({
    maxChars: maxChars,
    strLen: 0,
    silent: false
  });
  const render = mountVueComponent(LengthIndicator, {}, { state: state });

  function lengthIndicator(selection) {
    render(selection);
  }

  lengthIndicator.update = function(val) {
    state.strLen = utilUnicodeCharsCount(utilCleanOsmString(val, Number.POSITIVE_INFINITY));
  };

  lengthIndicator.silent = function(val) {
    if (!arguments.length) return state.silent;
    state.silent = val;
    return lengthIndicator;
  };

  lengthIndicator.unmount = render.unmount;

  return lengthIndicator;
}
