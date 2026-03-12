import { mountVueComponent } from './vue/bridge';
import ScaleBar from './vue/ScaleBar.vue';


export function uiScale(context) {
  return mountVueComponent(ScaleBar, context);
}
