import { t } from '../../core/localizer';
import { uiSection } from '../section';
import { reactive } from 'vue';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import MapFeaturesSection from '../vue/MapFeaturesSection.vue';

export function uiSectionMapFeatures(context) {

    var _features = context.features().keys();
    var _registrationId;
    var state = reactive({
        features: [],
        toggle: function(id) { context.features().toggle(id); },
        disableAll: function() { context.features().disableAll(); },
        enableAll: function() { context.features().enableAll(); }
    });

    var section = uiSection('map-features', context)
        .label(() => t.append('map_data.map_features'))
        .disclosureContent(renderDisclosureContent)
        .expandedByDefault(false);

    function renderDisclosureContent(selection) {
        state.features = _features.map(function(id) {
            var autoHidden = context.features().autoHidden(id);
            var tooltip = autoHidden
              ? (showsLayer('osm') ? t('map_data.autohidden') : t('map_data.osmhidden'))
              : t('feature.' + id + '.tooltip');
            return {
                id: id,
                active: context.features().enabled(id),
                autoHidden: autoHidden,
                description: t.html('feature.' + id + '.description'),
                tooltip: tooltip
            };
        });
        if (!isVueAppInitialized()) return;
        if (_registrationId) unregisterComponent(_registrationId);
        _registrationId = registerComponent(MapFeaturesSection, selection.node(), { state: state });
    }

    function autoHiddenFeature(d) {
        return context.features().autoHidden(d);
    }

    function showsFeature(d) {
        return context.features().enabled(d);
    }

    function showsLayer(id) {
        var layer = context.layers().layer(id);
        return layer && layer.enabled();
    }

    // add listeners
    context.features()
        .on('change.map_features', section.reRender);

    return section;
}
