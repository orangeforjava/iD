import { mountVueComponent } from './vue/bridge';
import StatusBar from './vue/StatusBar.vue';


export function uiStatus(context) {
  return mountVueComponent(StatusBar, context);
}
