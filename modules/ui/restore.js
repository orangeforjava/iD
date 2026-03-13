import { mountVueComponent } from './vue/bridge';
import RestoreModal from './vue/RestoreModal.vue';


export function uiRestore(context) {
  return mountVueComponent(RestoreModal, context);
}
