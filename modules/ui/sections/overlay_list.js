import _debounce from 'lodash-es/debounce';
import { descending as d3_descending, ascending as d3_ascending } from 'd3-array';
import { select as d3_select } from 'd3-selection';
import { reactive } from 'vue';

import { t } from '../../core/localizer';
import { uiSection } from '../section';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import OverlayListSection from '../vue/OverlayListSection.vue';

export function uiSectionOverlayList(context) {
    var _registrationId;
    var state = reactive({
        items: [],
        toggle: function(id) {
            var source = context.background().findSource(id);
            if (!source) return;
            context.background().toggleOverlayLayer(source);
            buildItems();
            document.activeElement.blur();
        }
    });

    var section = uiSection('overlay-list', context)
        .label(() => t.append('background.overlays'))
        .disclosureContent(renderDisclosureContent);

    function sortSources(a, b) {
        return a.best() && !b.best() ? -1
            : b.best() && !a.best() ? 1
            : d3_descending(a.area(), b.area()) || d3_ascending(a.name(), b.name()) || 0;
    }

    function buildItems() {
        var sources = context.background()
            .sources(context.map().extent(), context.map().zoom(), true)
            .filter(function(d) { return !d.isHidden() && d.overlay; })
            .sort(sortSources);

        state.items = sources.map(function(d) {
            var div = document.createElement('div');
            d.label()(d3_select(div));
            return {
                id: d.id,
                active: context.background().showsLayer(d),
                labelHtml: div.innerHTML || d.name(),
                tooltip: d.description() || d.name()
            };
        });
    }

    function renderDisclosureContent(selection) {
        buildItems();
        if (!isVueAppInitialized()) return;
        if (_registrationId) unregisterComponent(_registrationId);
        _registrationId = registerComponent(OverlayListSection, selection.node(), { state: state });
    }

    context.map().on('move.overlay_list', _debounce(function() {
        window.requestIdleCallback(section.reRender);
    }, 1000));

    return section;
}
