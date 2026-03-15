import { dispatch as d3_dispatch } from 'd3-dispatch';
import { select as d3_select } from 'd3-selection';

import { utilRebind } from '../../util/rebind';
import { utilGetDimensions } from '../../util/dimensions';
import { mountVueComponent } from '../vue/bridge';
import LanesFieldShell from '../vue/LanesFieldShell.vue';


export function uiFieldLanes(field, context) {
    var dispatch = d3_dispatch('change');
    var LANE_WIDTH = 40;
    var LANE_HEIGHT = 200;
    var _entityIDs = [];
    var _wrap = d3_select(null);
    var _surface = d3_select(null);
    var _refs = null;
    var _renderVersion = 0;

    var shellState = {
        renderVersion: 0,
        setRefs: function(refs) {
            _refs = refs;
            _wrap = refs.wrap ? d3_select(refs.wrap) : d3_select(null);
            _surface = refs.surface ? d3_select(refs.surface) : d3_select(null);
        }
    };
    var renderShell = mountVueComponent(LanesFieldShell, context, { state: shellState });

    function lanes(selection) {
        var lanesData = context.entity(_entityIDs[0]).lanes();

        if (!context.container().select('.inspector-wrap.inspector-hidden').empty() || !selection.node().parentNode) {
            selection.call(lanes.off);
            return;
        }

        shellState.renderVersion = ++_renderVersion;
        renderShell(selection);

        if (!_refs) {
            _wrap = selection.selectAll('.form-field-input-wrap')
                .data([0]);

            _wrap = _wrap.enter()
                .append('div')
                .attr('class', 'form-field-input-wrap form-field-input-' + field.type)
                .merge(_wrap);

            _surface = _wrap.selectAll('.surface')
                .data([0]);
        }

        var d = utilGetDimensions(_wrap);
        var freeSpace = d[0] - lanesData.lanes.length * LANE_WIDTH * 1.5 + LANE_WIDTH * 0.5;

        _surface = _surface.enter()
            .append('svg')
            .attr('width', d[0])
            .attr('height', 300)
            .attr('class', 'surface')
            .merge(_surface);

        _surface
            .attr('width', d[0])
            .attr('height', 300)
            .attr('class', 'surface');


        var lanesSelection = _surface.selectAll('.lanes')
            .data([0]);

        lanesSelection = lanesSelection.enter()
            .append('g')
            .attr('class', 'lanes')
            .merge(lanesSelection);

        lanesSelection
            .attr('transform', function () {
                return 'translate(' + (freeSpace / 2) + ', 0)';
            });


        var lane = lanesSelection.selectAll('.lane')
           .data(lanesData.lanes);

        lane.exit()
            .remove();

        var enter = lane.enter()
            .append('g')
            .attr('class', 'lane');

        enter
            .append('g')
            .append('rect')
            .attr('y', 50)
            .attr('width', LANE_WIDTH)
            .attr('height', LANE_HEIGHT);

        enter
            .append('g')
            .attr('class', 'forward')
            .append('text')
            .attr('y', 40)
            .attr('x', 14)
            .text('▲');

        enter
            .append('g')
            .attr('class', 'bothways')
            .append('text')
            .attr('y', 40)
            .attr('x', 14)
            .text('▲▼');

        enter
            .append('g')
            .attr('class', 'backward')
            .append('text')
            .attr('y', 40)
            .attr('x', 14)
            .text('▼');


        lane = lane
            .merge(enter);

        lane
            .attr('transform', function(d) {
                return 'translate(' + (LANE_WIDTH * d.index * 1.5) + ', 0)';
            });

        lane.select('.forward')
            .style('visibility', function(d) {
                return d.direction === 'forward' ? 'visible' : 'hidden';
            });

        lane.select('.bothways')
            .style('visibility', function(d) {
                return d.direction === 'bothways' ? 'visible' : 'hidden';
            });

        lane.select('.backward')
            .style('visibility', function(d) {
                return d.direction === 'backward' ? 'visible' : 'hidden';
            });
    }


    lanes.entityIDs = function(val) {
        _entityIDs = val;
    };

    lanes.tags = function() {};
    lanes.focus = function() {};
    lanes.off = function() {};
    lanes.unmount = renderShell.unmount;

    return utilRebind(lanes, dispatch, 'on');
}

uiFieldLanes.supportsMultiselection = false;
