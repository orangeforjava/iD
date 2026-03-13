import { reactive } from 'vue';

import { uiEntityEditor } from './entity_editor';
import { uiPresetList } from './preset_list';
import { uiViewOnOSM } from './view_on_osm';
import { mountVueComponent } from './vue/bridge';
import InspectorShell from './vue/InspectorShell.vue';


export function uiInspector(context) {
  var presetList = uiPresetList(context);
  var entityEditor = uiEntityEditor(context);
  var _state = 'select';
  var _entityIDs;
  var _newFeature = false;

  var viewOnOSM = uiViewOnOSM(context);
  var state = reactive({
    showPreset: false,
    presetList: presetList,
    entityEditor: entityEditor,
    viewOnOSM: viewOnOSM,
    footerEntity: null,
    renderVersion: 0
  });

  var render = mountVueComponent(InspectorShell, context, { state: state });

  function inspector(selection) {
    presetList
      .entityIDs(_entityIDs)
      .autofocus(_newFeature)
      .on('choose', inspector.setPreset)
      .on('cancel', function() {
        inspector.setPreset();
      });

    entityEditor
      .state(_state)
      .entityIDs(_entityIDs)
      .on('choose', inspector.showList);

    state.showPreset = shouldDefaultToPresetList();
    state.footerEntity = context.hasEntity(_entityIDs.length === 1 && _entityIDs[0]);
    state.renderVersion++;
    render(selection);
  }

  function shouldDefaultToPresetList() {
    if (_state !== 'select') return false;
    if (_entityIDs.length !== 1) return false;

    var entityID = _entityIDs[0];
    var entity = context.hasEntity(entityID);
    if (!entity) return false;
    if (entity.hasNonGeometryTags()) return false;
    if (_newFeature) return true;
    if (entity.geometry(context.graph()) !== 'vertex') return false;
    if (context.graph().parentRelations(entity).length) return false;
    if (context.validator().getEntityIssues(entityID).length) return false;
    if (entity.type === 'node' && entity.isHighwayIntersection(context.graph())) return false;
    return true;
  }

  inspector.showList = function(presets) {
    if (presets) {
      presetList.presets(presets);
    }
    presetList.autofocus(true);
    state.showPreset = true;
    state.renderVersion++;
  };

  inspector.setPreset = function(preset) {
    if (preset && preset.id === 'type/multipolygon') {
      presetList.autofocus(true);
      state.showPreset = true;
    } else {
      if (preset) {
        entityEditor.presets([preset]);
      }
      state.showPreset = false;
    }
    state.renderVersion++;
  };

  inspector.state = function(val) {
    if (!arguments.length) return _state;
    _state = val;
    entityEditor.state(_state);
    context.container().selectAll('.field-help-body').remove();
    return inspector;
  };

  inspector.entityIDs = function(val) {
    if (!arguments.length) return _entityIDs;
    _entityIDs = val;
    return inspector;
  };

  inspector.newFeature = function(val) {
    if (!arguments.length) return _newFeature;
    _newFeature = val;
    return inspector;
  };

  inspector.unmount = render.unmount;

  return inspector;
}
