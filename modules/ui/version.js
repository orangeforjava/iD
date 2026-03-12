import { mountVueComponent } from './vue/bridge';
import VersionBadge from './vue/VersionBadge.vue';


export function uiVersion(context) {
  return mountVueComponent(VersionBadge, context);
}
