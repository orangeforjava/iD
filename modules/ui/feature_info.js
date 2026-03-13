import { mountVueComponent } from './vue/bridge';
import FeatureInfoChip from './vue/FeatureInfoChip.vue';


export function uiFeatureInfo(context) {
  return mountVueComponent(FeatureInfoChip, context);
}
