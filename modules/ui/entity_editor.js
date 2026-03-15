import { dispatch as d3_dispatch } from 'd3-dispatch';
import deepEqual from 'fast-deep-equal';
import { reactive } from 'vue';

import { presetManager } from '../presets';
import { t, localizer } from '../core/localizer';
import { actionChangeTags } from '../actions/change_tags';
import { modeBrowse } from '../modes/browse';
import { utilArrayIdentical } from '../util/array';
import { utilCleanTags, utilCombinedTags, utilRebind } from '../util';
import { uiSectionEntityIssues } from './sections/entity_issues';
import { uiSectionFeatureType } from './sections/feature_type';
import { uiSectionPresetFields } from './sections/preset_fields';
import { uiSectionRawMemberEditor } from './sections/raw_member_editor';
import { uiSectionRawMembershipEditor } from './sections/raw_membership_editor';
import { uiSectionRawTagEditor } from './sections/raw_tag_editor';
import { uiSectionSelectionList } from './sections/selection_list';
import { mountVueComponent } from './vue/bridge';
import EntityEditorShell from './vue/EntityEditorShell.vue';

export function uiEntityEditor(context) {
  var dispatch = d3_dispatch('choose');
  var _state = 'select';
  var _coalesceChanges = false;
  var _modified = false;
  var _base;
  var _entityIDs;
  var _activePresets = [];
  var _newFeature;
  var _sections;

  const shellState = reactive({
    backIcon: (localizer.textDirection() === 'rtl') ? '#iD-icon-forward' : '#iD-icon-backward',
    closeIcon: '#iD-icon-close',
    headerText: '',
    renderVersion: 0,
    onChoose: function() {
      dispatch.call('choose', null, _activePresets);
    },
    onClose: function() {
      context.enter(modeBrowse(context));
    },
    renderSections: function(body) {
      if (!_sections) {
        _sections = [
          uiSectionSelectionList(context),
          uiSectionFeatureType(context).on('choose', function(presets) {
            dispatch.call('choose', this, presets);
          }),
          uiSectionEntityIssues(context),
          uiSectionPresetFields(context).on('change', changeTags).on('revert', revertTags),
          uiSectionRawTagEditor('raw-tag-editor', context).on('change', changeTags),
          uiSectionRawMemberEditor(context),
          uiSectionRawMembershipEditor(context)
        ];
      }

      var combinedTags = utilCombinedTags(_entityIDs, context.graph());
      _sections.forEach(function(section) {
        if (section.entityIDs) section.entityIDs(_entityIDs);
        if (section.presets) section.presets(_activePresets);
        if (section.tags) section.tags(combinedTags);
        if (section.state) section.state(_state);
        body.call(section.render);
      });
    }
  });

  const render = mountVueComponent(EntityEditorShell, context, { state: shellState });

  function entityEditor(selection) {
    shellState.headerText = _entityIDs.length === 1 ? t('inspector.edit') : t('inspector.edit_features');
    shellState.closeIcon = _modified ? '#iD-icon-apply' : '#iD-icon-close';
    shellState.renderVersion++;
    render(selection);

    context.history().on('change.entity-editor', historyChanged);

    function historyChanged(difference) {
      if (selection.selectAll('.entity-editor').empty()) return;
      if (_state === 'hide') return;
      var significant = !difference || difference.didChange.properties || difference.didChange.addition || difference.didChange.deletion;
      if (!significant) return;

      _entityIDs = _entityIDs.filter(context.hasEntity);
      if (!_entityIDs.length) return;

      var priorActivePreset = _activePresets.length === 1 && _activePresets[0];
      loadActivePresets();

      var graph = context.graph();
      entityEditor.modified(_base !== graph);
      entityEditor(selection);

      if (priorActivePreset && _activePresets.length === 1 && priorActivePreset !== _activePresets[0]) {
        context.container().selectAll('.entity-editor button.preset-reset .label')
          .classed('flash-bg', true)
          .on('animationend', function() {
            this.classList.remove('flash-bg');
          });
      }
    }
  }

  function changeTags(entityIDs, changed, onInput) {
    var actions = [];
    for (var i in entityIDs) {
      var entityID = entityIDs[i];
      var entity = context.entity(entityID);
      var tags = Object.assign({}, entity.tags);

      if (typeof changed === 'function') {
        tags = changed(tags);
      } else {
        for (var k in changed) {
          if (!k) continue;
          var v = changed[k];
          if (typeof v === 'object') {
            tags[k] = tags[v.oldKey];
          } else if (v !== undefined || tags.hasOwnProperty(k)) {
            tags[k] = v;
          }
        }
      }

      if (!onInput) {
        tags = utilCleanTags(tags);
      }

      if (!deepEqual(entity.tags, tags)) {
        actions.push(actionChangeTags(entityID, tags));
      }
    }

    if (actions.length) {
      var combinedAction = function(graph) {
        actions.forEach(function(action) { graph = action(graph); });
        return graph;
      };
      var annotation = t('operations.change_tags.annotation');
      if (_coalesceChanges) {
        context.replace(combinedAction, annotation);
      } else {
        context.perform(combinedAction, annotation);
      }
      _coalesceChanges = !!onInput;
    }

    if (!onInput) {
      context.validator().validate();
    }
  }

  function revertTags(keys) {
    var actions = [];
    for (var i in _entityIDs) {
      var entityID = _entityIDs[i];
      var original = context.graph().base().entities[entityID];
      var changed = {};
      for (var j in keys) {
        var key = keys[j];
        changed[key] = original ? original.tags[key] : undefined;
      }
      var entity = context.entity(entityID);
      var tags = Object.assign({}, entity.tags);
      for (var k in changed) {
        if (!k) continue;
        var v = changed[k];
        if (v !== undefined || tags.hasOwnProperty(k)) {
          tags[k] = v;
        }
      }
      tags = utilCleanTags(tags);
      if (!deepEqual(entity.tags, tags)) {
        actions.push(actionChangeTags(entityID, tags));
      }
    }

    if (actions.length) {
      var combinedAction = function(graph) {
        actions.forEach(function(action) { graph = action(graph); });
        return graph;
      };
      var annotation = t('operations.change_tags.annotation');
      if (_coalesceChanges) {
        context.replace(combinedAction, annotation);
      } else {
        context.perform(combinedAction, annotation);
      }
    }
    context.validator().validate();
  }

  entityEditor.modified = function(val) {
    if (!arguments.length) return _modified;
    _modified = val;
    return entityEditor;
  };

  entityEditor.state = function(val) {
    if (!arguments.length) return _state;
    _state = val;
    return entityEditor;
  };

  entityEditor.entityIDs = function(val) {
    if (!arguments.length) return _entityIDs;
    _base = context.graph();
    _coalesceChanges = false;
    if (val && _entityIDs && utilArrayIdentical(_entityIDs, val)) return entityEditor;
    _entityIDs = val;
    loadActivePresets(true);
    return entityEditor.modified(false);
  };

  entityEditor.newFeature = function(val) {
    if (!arguments.length) return _newFeature;
    _newFeature = val;
    return entityEditor;
  };

  function loadActivePresets(isForNewSelection) {
    var graph = context.graph();
    var counts = {};
    for (var i in _entityIDs) {
      var entity = graph.hasEntity(_entityIDs[i]);
      if (!entity) return;
      var match = presetManager.match(entity, graph);
      if (!counts[match.id]) counts[match.id] = 0;
      counts[match.id] += 1;
    }
    var matches = Object.keys(counts).sort(function(p1, p2) {
      return counts[p2] - counts[p1];
    }).map(function(pID) {
      return presetManager.item(pID);
    });

    if (!isForNewSelection) {
      var weakPreset = _activePresets.length === 1 && !_activePresets[0].isFallback() && Object.keys(_activePresets[0].addTags || {}).length === 0;
      if (weakPreset && matches.length === 1 && matches[0].isFallback()) return;
    }

    entityEditor.presets(matches);
  }

  entityEditor.presets = function(val) {
    if (!arguments.length) return _activePresets;
    if (!utilArrayIdentical(val, _activePresets)) {
      _activePresets = val;
    }
    return entityEditor;
  };

  entityEditor.unmount = function() {
    if (_sections) {
      _sections.forEach(function(section) {
        if (section && section.unmount) {
          section.unmount();
        }
      });
    }
    render.unmount();
  };

  return utilRebind(entityEditor, dispatch, 'on');
}
