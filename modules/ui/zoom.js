import { mountVueComponent } from './vue/bridge';
import ZoomControls from './vue/ZoomControls.vue';


export function uiZoom(context) {
  return mountVueComponent(ZoomControls, context);
}
