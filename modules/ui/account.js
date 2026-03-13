import { reactive } from 'vue';
import { t } from '../core/localizer';
import { svgIcon } from '../svg/icon';
import { isVueAppInitialized } from './vue/app';
import { mountVueComponent } from './vue/bridge';
import AccountLinks from './vue/AccountLinks.vue';


export function uiAccount(context) {
  const osm = context.connection();
  const state = reactive({ user: null });

  function updateUserDetails(selection) {
    if (!osm) return;

    if (!osm.authenticated()) {
      state.user = null;
      if (!isVueAppInitialized()) {
        renderLegacy(selection, null);
      }
    } else {
      osm.userDetails((err, user) => {
        if (err && err.status === 401) {
          osm.logout();
          state.user = null;
          if (!isVueAppInitialized()) {
            renderLegacy(selection, null);
          }
          return;
        }
        state.user = user;
        if (!isVueAppInitialized()) {
          renderLegacy(selection, user);
        }
      });
    }
  }

  function renderLegacy(selection, user) {
    let userInfo = selection.select('.userInfo');
    let loginLogout = selection.select('.loginLogout');

    if (user) {
      userInfo.html('').classed('hide', false);

      let userLink = userInfo
        .append('a')
        .attr('href', osm.userURL(user.display_name))
        .attr('target', '_blank');

      if (user.image_url) {
        userLink.append('img')
          .attr('class', 'icon pre-text user-icon')
          .attr('src', user.image_url);
      } else {
        userLink.call(svgIcon('#iD-icon-avatar', 'pre-text light'));
      }

      userLink.append('span')
        .attr('class', 'label')
        .text(user.display_name);

      loginLogout
        .classed('hide', false)
        .select('a')
        .text(t('logout'))
        .on('click', e => {
          e.preventDefault();
          osm.logout();
          osm.authenticate(undefined, { switchUser: true });
        });
    } else {
      userInfo.html('').classed('hide', true);

      loginLogout
        .classed('hide', false)
        .select('a')
        .text(t('login'))
        .on('click', e => {
          e.preventDefault();
          osm.authenticate();
        });
    }
  }

  const render = mountVueComponent(AccountLinks, context, { state: state });

  function account(selection) {
    if (!osm) return;

    if (!isVueAppInitialized()) {
      selection.append('li').attr('class', 'userInfo').classed('hide', true);
      selection.append('li').attr('class', 'loginLogout').classed('hide', true).append('a').attr('href', '#');
    }

    osm.on('change.account', () => updateUserDetails(selection));
    updateUserDetails(selection);

    if (isVueAppInitialized()) {
      render(selection);
    }
  }

  account.unmount = function() {
    if (osm) osm.on('change.account', null);
    render.unmount?.();
  };

  return account;
}
