import { t } from '../../core/localizer';
import { uiSection } from '../section';
import { reactive } from 'vue';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import MapStyleOptionsSection from '../vue/MapStyleOptionsSection.vue';

export function uiSectionMapStyleOptions(context) {
    var _registrationId;
    var state = reactive({
        fillItems: [],
        diffItems: [],
        setFill: function(id) { context.map().activeAreaFill(id); },
        toggleHighlight: function(d3_event) {
            d3_event.preventDefault();
            context.map().toggleHighlightEdited();
        }
    });

    var section = uiSection('fill-area', context)
        .label(() => t.append('map_data.style_options'))
        .disclosureContent(renderDisclosureContent)
        .expandedByDefault(false);

    function renderDisclosureContent(selection) {
        state.fillItems = context.map().areaFillOptions.map(function(id) {
            return {
                id: id,
                active: context.map().activeAreaFill() === id,
                description: t.html('area_fill.' + id + '.description'),
                tooltip: t('area_fill.' + id + '.tooltip')
            };
        });
        state.diffItems = [{
            id: 'highlight_edits',
            active: context.surface().classed('highlight-edited'),
            description: t.html('visual_diff.highlight_edits.description'),
            tooltip: t('visual_diff.highlight_edits.tooltip')
        }];
        if (!isVueAppInitialized()) return;
        if (_registrationId) unregisterComponent(_registrationId);
        _registrationId = registerComponent(MapStyleOptionsSection, selection.node(), { state: state });
    }

    context.map()
        .on('changeHighlighting.ui_style, changeAreaFill.ui_style', section.reRender);

    return section;
}
