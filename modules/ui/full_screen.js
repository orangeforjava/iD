import { mountVueComponent } from './vue/bridge';
import FullScreenBinding from './vue/FullScreenBinding.vue';


export function uiFullScreen(context) {
  return mountVueComponent(FullScreenBinding, context);
}
