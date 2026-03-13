import { mountVueComponent } from './vue/bridge';
import ContributorsList from './vue/ContributorsList.vue';


export function uiContributors(context) {
  return mountVueComponent(ContributorsList, context);
}
