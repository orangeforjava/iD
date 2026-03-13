import { mountVueComponent } from './vue/bridge';
import IssuesInfoChips from './vue/IssuesInfoChips.vue';


export function uiIssuesInfo(context) {
  return mountVueComponent(IssuesInfoChips, context);
}
