import {
    select as d3_select
} from 'd3-selection';
import { reactive } from 'vue';

import { t, localizer } from '../../core/localizer';
import { geoMetersToOffset, geoOffsetToMeters } from '../../geo';
import { uiSection } from '../section';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import BackgroundOffsetSection from '../vue/BackgroundOffsetSection.vue';


export function uiSectionBackgroundOffset(context) {
    var _registrationId;

    var section = uiSection('background-offset', context)
        .label(() => t.append('background.fix_misalignment'))
        .disclosureContent(renderDisclosureContent)
        .expandedByDefault(false);

    var _pointerPrefix = 'PointerEvent' in window ? 'pointer' : 'mouse';

    var _directions = [
        ['top', [0, -0.5]],
        ['left', [-0.5, 0]],
        ['right', [0.5, 0]],
        ['bottom', [0, 0.5]]
    ];

    var state = reactive({
        valueText: '0, 0',
        error: false,
        isResetDisabled: true,
        directions: _directions,
        resetIcon: '#iD-icon-' + (localizer.textDirection() === 'rtl' ? 'redo' : 'undo'),
        onReset: resetOffset,
        onNudge: nudge,
        onInput: function(e) { inputOffset.call(e.target); },
        onDragStart: dragOffset
    });


    function updateValue() {
        var meters = geoOffsetToMeters(context.background().offset());
        var x = +meters[0].toFixed(2);
        var y = +meters[1].toFixed(2);
        state.error = false;
        state.valueText = x + ', ' + y;
        state.isResetDisabled = (x === 0 && y === 0);
    }


    function resetOffset() {
        context.background().offset([0, 0]);
        updateValue();
    }


    function nudge(d) {
        context.background().nudge(d, context.map().zoom());
        updateValue();
    }


    function inputOffset() {
        var input = d3_select(this);
        var d = input.node().value;

        if (d === '') return resetOffset();

        d = d.replace(/;/g, ',').split(',').map(function(n) {
            // if n is NaN, it will always get mapped to false.
            return !isNaN(n) && n;
        });

        if (d.length !== 2 || !d[0] || !d[1]) {
            input.classed('error', true);
            state.error = true;
            return;
        }

        context.background().offset(geoMetersToOffset(d));
        updateValue();
    }


    function dragOffset(d3_event) {
        if (d3_event.button !== 0) return;

        var origin = [d3_event.clientX, d3_event.clientY];

        var pointerId = d3_event.pointerId || 'mouse';

        context.container()
            .append('div')
            .attr('class', 'nudge-surface');

        d3_select(window)
            .on(_pointerPrefix + 'move.drag-bg-offset', pointermove)
            .on(_pointerPrefix + 'up.drag-bg-offset', pointerup);

        if (_pointerPrefix === 'pointer') {
            d3_select(window)
                .on('pointercancel.drag-bg-offset', pointerup);
        }

        function pointermove(d3_event) {
            if (pointerId !== (d3_event.pointerId || 'mouse')) return;

            var latest = [d3_event.clientX, d3_event.clientY];
            var d = [
                -(origin[0] - latest[0]) / 4,
                -(origin[1] - latest[1]) / 4
            ];

            origin = latest;
            nudge(d);
        }

        function pointerup(d3_event) {
            if (pointerId !== (d3_event.pointerId || 'mouse')) return;
            if (d3_event.button !== 0) return;

            context.container().selectAll('.nudge-surface')
                .remove();

            d3_select(window)
                .on('.drag-bg-offset', null);
        }
    }


    function renderDisclosureContent(selection) {
        if (!isVueAppInitialized()) return;
        if (_registrationId) unregisterComponent(_registrationId);
        _registrationId = registerComponent(BackgroundOffsetSection, selection.node(), { state: state });
        updateValue();
    }

    context.background()
        .on('change.backgroundOffset-update', updateValue);

    return section;
}
