import { dispatch as d3_dispatch } from 'd3-dispatch';
import { select as d3_select } from 'd3-selection';

import { presetManager } from '../../presets';
import { utilArrayIdentical } from '../../util/array';
import { t } from '../../core/localizer';
import { uiTooltip } from '../tooltip';
import { utilRebind } from '../../util';
import { uiPresetIcon } from '../preset_icon';
import { uiSection } from '../section';
import { uiTagReference } from '../tag_reference';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import FeatureTypeSection from '../vue/FeatureTypeSection.vue';


export function uiSectionFeatureType(context) {

    var dispatch = d3_dispatch('choose');

    var _entityIDs = [];
    var _presets = [];

    var _tagReference;
    var _registrationId;
    var _refs;

    var section = uiSection('feature-type', context)
        .label(() => t.append('inspector.feature_type'))
        .disclosureContent(renderDisclosureContent);

    function renderDisclosureContent(selection) {

        selection.classed('preset-list-item', true);
        selection.classed('mixed-types', _presets.length > 1);

        if (isVueAppInitialized()) {
            if (_registrationId) unregisterComponent(_registrationId);
            _refs = null;
            var state = {
                showReference: _presets.length === 1,
                onChoose: function() { dispatch.call('choose', null, _presets); },
                setRefs: function(refs) { _refs = refs; }
            };
            _registrationId = registerComponent(FeatureTypeSection, selection.node(), { state: state });
        }

        if (!_refs) {
            var fallbackWrap = selection.selectAll('.preset-list-button-wrap')
                .data([0])
                .enter()
                .append('div')
                .attr('class', 'preset-list-button-wrap')
                .merge(selection.selectAll('.preset-list-button-wrap'));

            var fallbackButton = fallbackWrap.selectAll('.preset-list-button.preset-reset')
                .data([0])
                .enter()
                .append('button')
                .attr('class', 'preset-list-button preset-reset')
                .merge(fallbackWrap.selectAll('.preset-list-button.preset-reset'));

            fallbackButton.selectAll('.preset-icon-container')
                .data([0])
                .enter()
                .append('div')
                .attr('class', 'preset-icon-container');

            fallbackButton.selectAll('.label')
                .data([0])
                .enter()
                .append('div')
                .attr('class', 'label')
                .append('div')
                .attr('class', 'label-inner');

            fallbackWrap.selectAll('.accessory-buttons')
                .data([0])
                .enter()
                .append('div')
                .attr('class', 'accessory-buttons');

            selection.selectAll('.tag-reference-body-wrap')
                .data([0])
                .enter()
                .append('div')
                .attr('class', 'tag-reference-body-wrap');
        }

        var presetButtonWrap = selection.selectAll('.preset-list-button-wrap');
        var presetButton = selection.selectAll('.preset-list-button.preset-reset');
        var tagReferenceBodyWrap = selection.selectAll('.tag-reference-body-wrap');

        if (_refs) {
            presetButtonWrap = d3_select(_refs.icon.parentNode.parentNode.parentNode);
            presetButton = selection.selectAll('.preset-list-button.preset-reset');
            tagReferenceBodyWrap = d3_select(_refs.bodyWrap);
        }

        presetButton.call(uiTooltip().title(() => t.append('inspector.back_tooltip')).placement('bottom'));

        // update header
        if (_tagReference) {
            (_refs ? d3_select(_refs.accessory) : selection.selectAll('.preset-list-button-wrap .accessory-buttons'))
                .style('display', _presets.length === 1 ? null : 'none')
                .call(_tagReference.button);

            tagReferenceBodyWrap
                .style('display', _presets.length === 1 ? null : 'none')
                .call(_tagReference.body);
        }

        selection.selectAll('.preset-reset')
            .on('click', function() {
                 dispatch.call('choose', this, _presets);
            })
            .on('pointerdown pointerup mousedown mouseup', function(d3_event) {
                d3_event.preventDefault();
                d3_event.stopPropagation();
            });

        var geometries = entityGeometries();
        (_refs ? d3_select(_refs.icon.parentNode.parentNode) : selection.select('.preset-list-item button'))
            .call(uiPresetIcon()
                .geometry(_presets.length === 1 ? (geometries.length === 1 && geometries[0]) : null)
                .preset(_presets.length === 1 ? _presets[0] : presetManager.item('point'))
            );

        var names = _presets.length === 1 ? [
            _presets[0].nameLabel(),
            _presets[0].subtitleLabel()
        ].filter(Boolean) : [ t.append('inspector.multiple_types') ];

        var label = _refs ? d3_select(_refs.label) : selection.select('.label-inner');
        var nameparts = label.selectAll('.namepart')
            .data(names, d => d.stringId);

        nameparts.exit()
            .remove();

        nameparts
            .enter()
            .append('div')
            .attr('class', 'namepart')
            .text('')
            .each(function(d) { d(d3_select(this)); });
    }

    section.entityIDs = function(val) {
        if (!arguments.length) return _entityIDs;
        _entityIDs = val;
        return section;
    };

    section.presets = function(val) {
        if (!arguments.length) return _presets;

        // don't reload the same preset
        if (!utilArrayIdentical(val, _presets)) {
            _presets = val;

            if (_presets.length === 1) {
                _tagReference = uiTagReference(_presets[0].reference(), context)
                    .showing(false);
            }
        }

        return section;
    };

    function entityGeometries() {

        var counts = {};

        for (var i in _entityIDs) {
            var geometry = context.graph().geometry(_entityIDs[i]);
            if (!counts[geometry]) counts[geometry] = 0;
            counts[geometry] += 1;
        }

        return Object.keys(counts).sort(function(geom1, geom2) {
            return counts[geom2] - counts[geom1];
        });
    }

    return utilRebind(section, dispatch, 'on');
}
