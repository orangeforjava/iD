import { mountVueComponent } from './vue/bridge';
import NoticeBanner from './vue/NoticeBanner.vue';


export function uiNotice(context) {
  return mountVueComponent(NoticeBanner, context);
}
