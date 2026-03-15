import { prefs } from '../../core/preferences';
import { t } from '../../core/localizer';
import { uiSection } from '../section';
import { reactive } from 'vue';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import PrivacySection from '../vue/PrivacySection.vue';

export function uiSectionPrivacy(context) {
    let _registrationId;
    let state = reactive({
      enabled: (prefs('preferences.privacy.thirdpartyicons') || 'true') === 'true',
      toggle: function() {
        prefs('preferences.privacy.thirdpartyicons', state.enabled ? 'false' : 'true');
      }
    });

    let section = uiSection('preferences-third-party', context)
      .label(() => t.append('preferences.privacy.title'))
      .disclosureContent(renderDisclosureContent);

    function renderDisclosureContent(selection) {
      state.enabled = (prefs('preferences.privacy.thirdpartyicons') || 'true') === 'true';
      if (!isVueAppInitialized()) return;
      if (_registrationId) unregisterComponent(_registrationId);
      _registrationId = registerComponent(PrivacySection, selection.node(), { state: state });

    }

    prefs.onChange('preferences.privacy.thirdpartyicons', section.reRender);

    section.unmount = function() {
      if (_registrationId) {
        unregisterComponent(_registrationId);
        _registrationId = null;
      }
    };

    return section;
}
