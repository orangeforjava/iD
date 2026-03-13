import { dispatch as d3_dispatch } from 'd3-dispatch';
import { select as d3_select } from 'd3-selection';
import { reactive } from 'vue';

import { geoVecAdd } from '../geo';
import { localizer } from '../core/localizer';
import { utilRebind } from '../util/rebind';
import { utilHighlightEntities } from '../util/util';
import { utilGetDimensions } from '../util/dimensions';
import { registerComponent, unregisterComponent } from './vue/app';
import EditMenuShell from './vue/EditMenuShell.vue';


export function uiEditMenu(context) {
  var dispatch = d3_dispatch('toggled');

  var _registrationId = null;
  var _selection = null;
  var _operations = [];
  var _anchorLoc = [0, 0];
  var _anchorLocLonLat = [0, 0];
  var _triggerType = '';

  var _vpTopMargin = 85;
  var _vpBottomMargin = 45;
  var _vpSideMargin = 35;
  var _verticalPadding = 4;
  var _tooltipWidth = 210;
  var _menuSideMargin = 10;

  var state = reactive({
    visible: false,
    operations: [],
    isTouchMenu: false,
    showLabels: false,
    buttonHeight: 34,
    menuStyle: { padding: _verticalPadding + 'px 0' },
    tooltipPlacement: 'right',
    lastPointerUpType: null,
    labelVersion: 0,
    iconHref: function(op) {
      return op.icon && op.icon() || '#iD-operation-' + op.id;
    },
    isDisabled: function(op) {
      return op.disabled();
    },
    tooltipText: function(op) {
      return op.tooltip ? op.tooltip() : '';
    },
    handlePointerUp: function(d3_event) {
      state.lastPointerUpType = d3_event.pointerType;
    },
    handleMouseEnter: function(op) {
      if (state.isDisabled(op)) return;
      if (op.relatedEntityIds) {
        utilHighlightEntities(op.relatedEntityIds(), true, context);
      }
      if (op.getAuxiliaryGeometry) {
        drawAuxiliaryGeometry(context, op.getAuxiliaryGeometry());
      }
    },
    handleMouseLeave: function(op) {
      if (op.relatedEntityIds) {
        utilHighlightEntities(op.relatedEntityIds(), false, context);
      }
      if (op.getAuxiliaryGeometry) {
        drawAuxiliaryGeometry(context, []);
      }
    },
    handleClick: function(d3_event, operation) {
      d3_event.stopPropagation();

      if (operation.relatedEntityIds) {
        utilHighlightEntities(operation.relatedEntityIds(), false, context);
      }

      if (operation.disabled()) {
        if (state.lastPointerUpType === 'touch' || state.lastPointerUpType === 'pen') {
          context.ui().flash
            .duration(4000)
            .iconName('#iD-operation-' + operation.id)
            .iconClass('operation disabled')
            .label(operation.tooltip())();
        }
      } else {
        if (state.lastPointerUpType === 'touch' || state.lastPointerUpType === 'pen') {
          context.ui().flash
            .duration(2000)
            .iconName('#iD-operation-' + operation.id)
            .iconClass('operation')
            .label(operation.annotation() || operation.title)();
        }

        operation();
        editMenu.close();
      }

      state.lastPointerUpType = null;
    }
  });


  function editMenu(selection) {
    var isTouchMenu = _triggerType.includes('touch') || _triggerType.includes('pen');
    var ops = _operations.filter(function(op) {
      return !isTouchMenu || !op.mouseOnly;
    });
    if (!ops.length) return;

    _selection = selection;
    state.isTouchMenu = isTouchMenu;
    state.showLabels = isTouchMenu;
    state.buttonHeight = isTouchMenu ? 32 : 34;
    state.operations = ops;
    state.labelVersion++;

    if (_registrationId) {
      unregisterComponent(_registrationId);
    }
    _registrationId = registerComponent(EditMenuShell, selection.node(), { state: state });
    state.visible = true;

    updatePosition();

    var initialScale = context.projection.scale();
    context.map()
      .on('move.edit-menu', function() {
        if (initialScale !== context.projection.scale()) {
          editMenu.close();
        }
      })
      .on('drawn.edit-menu', function(info) {
        if (info.full) updatePosition();
      });

    dispatch.call('toggled', this, true);
  }


  function updatePosition() {
    if (!state.visible) return;

    var menuWidth;
    if (state.showLabels) {
      menuWidth = 52 + Math.min(120, 6 * Math.max.apply(Math, state.operations.map(function(op) {
        return op.id.length;
      })));
    } else {
      menuWidth = 44;
    }

    var menuHeight = _verticalPadding * 2 + state.operations.length * state.buttonHeight;
    var menuTop = state.isTouchMenu;
    var anchorLoc = context.projection(_anchorLocLonLat);
    var viewport = context.surfaceRect();

    if (anchorLoc[0] < 0 || anchorLoc[0] > viewport.width || anchorLoc[1] < 0 || anchorLoc[1] > viewport.height) {
      editMenu.close();
      return;
    }

    var menuLeft = displayOnLeft(viewport, anchorLoc, menuWidth);
    var offset = [0, 0];
    offset[0] = menuLeft ? -1 * (_menuSideMargin + menuWidth) : _menuSideMargin;

    if (menuTop) {
      offset[1] = (anchorLoc[1] - menuHeight < _vpTopMargin) ? -anchorLoc[1] + _vpTopMargin : -menuHeight;
    } else {
      offset[1] = (anchorLoc[1] + menuHeight > (viewport.height - _vpBottomMargin)) ?
        -anchorLoc[1] - menuHeight + viewport.height - _vpBottomMargin : 0;
    }

    var origin = geoVecAdd(anchorLoc, offset);
    var verticalOffset = parseFloat(utilGetDimensions(d3_select('.top-toolbar-wrap'))[1]);
    origin[1] -= verticalOffset;

    state.menuStyle = {
      padding: _verticalPadding + 'px 0',
      left: origin[0] + 'px',
      top: origin[1] + 'px'
    };
    state.tooltipPlacement = tooltipPosition(viewport, anchorLoc, menuLeft, menuWidth);
  }


  function displayOnLeft(viewport, anchorLoc, menuWidth) {
    if (localizer.textDirection() === 'ltr') {
      return (anchorLoc[0] + _menuSideMargin + menuWidth) > (viewport.width - _vpSideMargin);
    }
    return !((anchorLoc[0] - _menuSideMargin - menuWidth) < _vpSideMargin);
  }


  function tooltipPosition(viewport, anchorLoc, menuLeft, menuWidth) {
    if (localizer.textDirection() === 'ltr') {
      if (menuLeft) return 'left';
      if ((anchorLoc[0] + _menuSideMargin + menuWidth + _tooltipWidth) > (viewport.width - _vpSideMargin)) return 'left';
      return 'right';
    }
    if (!menuLeft) return 'right';
    if ((anchorLoc[0] - _menuSideMargin - menuWidth - _tooltipWidth) < _vpSideMargin) return 'right';
    return 'left';
  }


  editMenu.close = function() {
    context.map().on('move.edit-menu', null).on('drawn.edit-menu', null);
    if (_registrationId) {
      unregisterComponent(_registrationId);
      _registrationId = null;
    }
    state.visible = false;
    drawAuxiliaryGeometry(context, []);
    dispatch.call('toggled', this, false);
  };

  editMenu.anchorLoc = function(val) {
    if (!arguments.length) return _anchorLoc;
    _anchorLoc = val;
    _anchorLocLonLat = context.projection.invert(_anchorLoc);
    return editMenu;
  };

  editMenu.triggerType = function(val) {
    if (!arguments.length) return _triggerType;
    _triggerType = val;
    return editMenu;
  };

  editMenu.operations = function(val) {
    if (!arguments.length) return _operations;
    _operations = val;
    return editMenu;
  };

  return utilRebind(editMenu, dispatch, 'on');
}


function drawAuxiliaryGeometry(context, d) {
  const surface = context.surface();
  const container = surface.selectAll('.data-layer.osm .auxiliary');
  const paths = container.selectAll('path').data(d, d => d.id);

  paths.exit().remove();
  const enter = paths.enter().append('path');

  enter.merge(paths)
    .attr('class', d => d.klass)
    .attr('d', d => d.path);
}
