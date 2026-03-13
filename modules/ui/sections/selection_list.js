import { dispatch as d3_dispatch } from 'd3-dispatch';
import { reactive } from 'vue';

import { presetManager } from '../../presets';
import { modeSelect } from '../../modes/select';
import { t } from '../../core/localizer';
import { utilDisplayName, utilHighlightEntities, utilRebind } from '../../util';
import { uiSection } from '../section';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import SelectionListSection from '../vue/SelectionListSection.vue';

export function uiSectionSelectionList(context) {
    var _selectedIDs = [];
    var _registrationId;
    var _state = reactive({
        items: [],
        onHover: function(id, val) { utilHighlightEntities([id], val, context); },
        onSelect: function(id) { context.enter(modeSelect(context, [id])); },
        onDeselect: function(id) {
            var selectedIDs = _selectedIDs.slice();
            var index = selectedIDs.indexOf(id);
            if (index > -1) {
                selectedIDs.splice(index, 1);
                context.enter(modeSelect(context, selectedIDs));
            }
        }
    });

    var section = uiSection('selected-features', context)
        .shouldDisplay(function() {
            return _selectedIDs.length > 1;
        })
        .label(function() {
            return t.append('inspector.title_count', { title: t('inspector.features'), count: _selectedIDs.length });
        })
        .disclosureContent(renderDisclosureContent);

    context.history()
        .on('change.selectionList', function(difference) {
            if (difference) {
                section.reRender();
            }
        });

    section.entityIDs = function(val) {
        if (!arguments.length) return _selectedIDs;
        _selectedIDs = val;
        return section;
    };

    function renderDisclosureContent(selection) {
        var entities = _selectedIDs
            .map(function(id) { return context.hasEntity(id); })
            .filter(Boolean);

        _state.items = entities.map(function(entity) {
            return {
                id: entity.id,
                geometry: entity.geometry(context.graph()),
                type: presetManager.match(entity, context.graph()).name(),
                name: utilDisplayName(context.entity(entity.id))
            };
        });

        if (!isVueAppInitialized()) return;
        if (_registrationId) unregisterComponent(_registrationId);
        _registrationId = registerComponent(SelectionListSection, selection.node(), { state: _state });
    }

    section.unmount = function() {
        if (_registrationId) {
            unregisterComponent(_registrationId);
            _registrationId = null;
        }
    };

    return utilRebind(section, d3_dispatch(), 'on');
}
