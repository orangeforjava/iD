import { mountVueComponent } from './vue/bridge';
import AttributionPanel from './vue/AttributionPanel.vue';


export function uiAttribution(context) {
  return mountVueComponent(AttributionPanel, context);
}
