import { mountVueComponent } from './vue/bridge';
import SpinnerIndicator from './vue/SpinnerIndicator.vue';


export function uiSpinner(context) {
  return mountVueComponent(SpinnerIndicator, context);
}
