import _debounce from 'lodash-es/debounce';
import { descending as d3_descending, ascending as d3_ascending } from 'd3-array';
import { select as d3_select } from 'd3-selection';
import { reactive } from 'vue';

import { prefs } from '../../core/preferences';
import { t } from '../../core/localizer';
import { uiSettingsCustomBackground } from '../settings/custom_background';
import { uiMapInMap } from '../map_in_map';
import { uiSection } from '../section';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import BackgroundListSection from '../vue/BackgroundListSection.vue';

export function uiSectionBackgroundList(context) {
    var _registrationId;
    var _settingsCustomBackground = uiSettingsCustomBackground(context).on('change', customChanged);
    var state = reactive({
        items: [],
        bestTitle: t('background.best_imagery'),
        minimapTitle: t('background.minimap.tooltip'),
        minimapText: t('background.minimap.description'),
        bgPanelTitle: t('background.panel.tooltip'),
        bgPanelText: t('background.panel.description'),
        locationPanelTitle: t('background.location_panel.tooltip'),
        locationPanelText: t('background.location_panel.description'),
        imageryFaqText: t('background.imagery_problem_faq'),
        minimapActive: false,
        bgPanelActive: false,
        locationPanelActive: false,
        choose: function(id) {
            var d = context.background().findSource(id);
            if (d) chooseBackground(d);
        },
        editCustom: editCustom,
        toggleMinimap: function() { uiMapInMap.toggle(); },
        toggleInfo: function(which) { context.ui().info.toggle(which); }
    });

    var section = uiSection('background-list', context)
        .label(() => t.append('background.backgrounds'))
        .disclosureContent(renderDisclosureContent);

    function previousBackgroundID() {
        return prefs('background-last-used-toggle');
    }

    function renderLabelHTML(source) {
        var div = document.createElement('div');
        source.label()(d3_select(div));
        return div.innerHTML || source.name();
    }

    function buildItems() {
        var sources = context.background()
            .sources(context.map().extent(), context.map().zoom(), true)
            .filter(function(d) { return !d.isHidden() && !d.overlay; })
            .sort(function(a, b) {
                return a.best() && !b.best() ? -1
                    : b.best() && !a.best() ? 1
                    : d3_descending(a.area(), b.area()) || d3_ascending(a.name(), b.name()) || 0;
            });

        state.items = sources.map(function(d, i) {
            return {
                key: d.id + '---' + i,
                id: d.id,
                active: context.background().showsLayer(d),
                switch: d.id === previousBackgroundID(),
                best: d.best(),
                custom: d.id === 'custom',
                labelHtml: renderLabelHTML(d),
                tooltip: d.id === previousBackgroundID() ? t('background.switch') : (d.hasDescription() ? d.description() : d.name())
            };
        });

        state.minimapActive = !context.container().select('.minimap-toggle-item').select('input').empty() && !!context.container().select('.minimap-toggle-item').select('input').property('checked');
        state.bgPanelActive = !context.container().select('.background-panel-toggle-item').select('input').empty() && !!context.container().select('.background-panel-toggle-item').select('input').property('checked');
        state.locationPanelActive = !context.container().select('.location-panel-toggle-item').select('input').empty() && !!context.container().select('.location-panel-toggle-item').select('input').property('checked');
    }

    function renderDisclosureContent(selection) {
        buildItems();
        if (!isVueAppInitialized()) {
            var container = selection.selectAll('.layer-background-list').data([0]);
            container = container.enter()
                .append('ul')
                .attr('class', 'layer-list layer-background-list')
                .attr('dir', 'auto')
                .merge(container);

            var items = container.selectAll('li').data(state.items, function(d) { return d.key; });
            items.exit().remove();

            var enter = items.enter()
                .append('li')
                .classed('layer-custom', function(d) { return d.custom; })
                .classed('best', function(d) { return d.best; });

            var label = enter.append('label');
            label.append('input')
                .attr('type', 'radio')
                .attr('name', 'background-layer')
                .on('change', function(d3_event, d) { state.choose(d.id); });
            label.append('span').html(function(d) { return d.labelHtml; });

            enter.filter(function(d) { return d.custom; })
                .append('button')
                .attr('class', 'layer-browse')
                .on('click', function(d3_event) {
                    d3_event.preventDefault();
                    editCustom();
                });

            items = items.merge(enter);
            items.classed('active', function(d) { return d.active; });
            items.selectAll('input').property('checked', function(d) { return d.active; });
            return;
        }
        if (_registrationId) unregisterComponent(_registrationId);
        _registrationId = registerComponent(BackgroundListSection, selection.node(), { state: state });
    }

    function chooseBackground(d) {
        if (d.id === 'custom' && !d.template()) {
            return editCustom();
        }
        var previousBackground = context.background().baseLayerSource();
        prefs('background-last-used-toggle', previousBackground.id);
        prefs('background-last-used', d.id);
        context.background().baseLayerSource(d);
        buildItems();
    }

    function customChanged(d) {
        var background = context.background();
        var customSource = background.findSource('custom');
        if (!customSource) return;
        if (d && d.template) {
            customSource.template(d.template);
            chooseBackground(customSource);
        } else {
            customSource.template('');
            var noneSource = background.findSource('none');
            if (noneSource) chooseBackground(noneSource);
        }
    }

    function editCustom() {
        context.container().call(_settingsCustomBackground);
    }

    context.background().on('change.background_list', function() {
        buildItems();
    });

    context.map().on('move.background_list', _debounce(function() {
        window.requestIdleCallback(section.reRender);
    }, 1000));

    return section;
}
