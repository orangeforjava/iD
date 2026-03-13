import { dispatch as d3_dispatch } from 'd3-dispatch';
import { select as d3_select } from 'd3-selection';

import { t, localizer } from '../core/localizer';
import { locationManager } from '../core/LocationManager';
import { svgIcon } from '../svg/icon';
import { uiTooltip } from './tooltip';
import { geoExtent } from '../geo/extent';
import { uiFieldHelp } from './field_help';
import { uiFields } from './fields';
import { LANGUAGE_SUFFIX_REGEX } from './fields/localized';
import { uiTagReference } from './tag_reference';
import { utilRebind, utilUniqueDomId } from '../util';
import { mountVueComponent } from './vue/bridge';
import FieldShell from './vue/FieldShell.vue';


export function uiField(context, presetField, entityIDs, options) {
    options = Object.assign({
        show: true,
        wrap: true,
        remove: true,
        revert: true,
        info: true
    }, options);

    var dispatch = d3_dispatch('change', 'revert');
    var field = Object.assign({}, presetField);   // shallow copy
    field.domId = utilUniqueDomId('form-field-' + field.safeid);
    var _show = options.show;
    var _state = '';
    var _tags = {};

    var _entityExtent;
    if (entityIDs && entityIDs.length) {
        _entityExtent = entityIDs.reduce(function(extent, entityID) {
            var entity = context.graph().entity(entityID);
            return extent.extend(entity.extent(context.graph()));
        }, geoExtent());
    }

    var _locked = false;
    var _refs = null;
    var _renderVersion = 0;
    var _lockedTip = uiTooltip()
        .title(() => t.append('inspector.lock.suggestion', { label: field.title }))
        .placement('bottom');

    var shellState = {
        safeid: field.safeid,
        domId: field.domId,
        wrap: options.wrap,
        showRemove: options.wrap && options.remove,
        showRevert: options.wrap && options.revert,
        revertIcon: (localizer.textDirection() === 'rtl') ? '#iD-icon-redo' : '#iD-icon-undo',
        locked: false,
        modified: false,
        present: false,
        renderVersion: 0,
        renderLabel: function(selection) { field.label()(selection); },
        onRemove: remove,
        onRevert: revert,
        setRefs: function(refs) { _refs = refs; }
    };
    var renderShell = mountVueComponent(FieldShell, context, { state: shellState });

    // only create the fields that are actually being shown
    if (_show && !field.impl) {
        createField();
    }

    // Creates the field.. This is done lazily,
    // once we know that the field will be shown.
    function createField() {
        field.impl = uiFields[field.type](field, context)
            .on('change', function(t, onInput) {
                dispatch.call('change', field, t, onInput);
            });

        if (entityIDs) {
            field.entityIDs = entityIDs;
            // if this field cares about the entities, pass them along
            if (field.impl.entityIDs) {
                field.impl.entityIDs(entityIDs);
            }
        }
    }


    function allKeys() {
        let keys = field.keys || [field.key];
        if (field.type === 'directionalCombo' && field.key) {
            // directionalCombo fields can have an additional key describing the for
            // cases where both directions share a "common" value.
            // The field also support *:both. The preset decides which field to write to.
            const baseKey = field.key.replace(/:both$/, '');
            keys = keys.concat(baseKey, `${baseKey}:both`);
        }
        return keys;
    }


    function isModified() {
        if (!entityIDs || !entityIDs.length) return false;
        return entityIDs.some(function(entityID) {
            var original = context.graph().base().entities[entityID];
            var latest = context.graph().entity(entityID);
            return allKeys().some(function(key) {
                return original ? latest.tags[key] !== original.tags[key] : latest.tags[key];
            });
        });
    }


    function tagsContainFieldKey() {
        return allKeys().some(function(key) {
            if (field.type === 'multiCombo') {
                for (var tagKey in _tags) {
                    if (tagKey.indexOf(key) === 0) {
                        return true;
                    }
                }
                return false;
            }
            if (field.type === 'localized') {
                for (let tagKey in _tags) {
                    // matches for field:<code>, where <code> is a BCP 47 locale code
                    let match = tagKey.match(LANGUAGE_SUFFIX_REGEX);
                    if (match && match[1] === field.key && match[2]) {
                        return true;
                    }
                }
            }
            return _tags[key] !== undefined;
        });
    }


    function revert(d3_event, d) {
        d3_event.stopPropagation();
        d3_event.preventDefault();
        if (!entityIDs || _locked) return;

        dispatch.call('revert', d, allKeys());
    }


    function remove(d3_event, d) {
        d3_event.stopPropagation();
        d3_event.preventDefault();
        if (_locked) return;

        var t = {};
        allKeys().forEach(function(key) {
            t[key] = undefined;
        });

        dispatch.call('change', d, t);
    }


    field.render = function(selection) {
        shellState.locked = _locked;
        shellState.modified = isModified();
        shellState.present = tagsContainFieldKey();
        shellState.renderVersion = ++_renderVersion;
        renderShell(selection);

        if (!field.impl) {
            createField();
        }

        var reference, help;

        if (options.wrap && field.type === 'restrictions') {
            help = uiFieldHelp(context, 'restrictions');
        }

        if (options.wrap && options.info) {
            var referenceKey = field.key || '';
            if (field.type === 'multiCombo') {
                referenceKey = referenceKey.replace(/:$/, ':*');
            }

            var referenceOptions = field.reference || {
                key: referenceKey,
                value: _tags[referenceKey]
            };
            reference = uiTagReference(referenceOptions, context);
            if (_state === 'hover') {
                reference.showing(false);
            }
        }

        var implSelection = _refs ? d3_select(_refs.impl) : selection;
        implSelection.call(field.impl);

        if (help && _refs) {
            d3_select(selection.node())
                .call(help.body)
                .select('.field-label')
                .call(help.button);
        }

        if (reference && _refs) {
            d3_select(selection.node())
                .call(reference.body)
                .select('.field-label')
                .call(reference.button);
        }

        field.impl.tags(_tags);

        if (_refs && _refs.lockIcon) {
            var wrap = d3_select(selection.node());
            wrap.call(_locked ? _lockedTip : _lockedTip.destroy);
        }
    };


    field.state = function(val) {
        if (!arguments.length) return _state;
        _state = val;
        return field;
    };


    field.tags = function(val) {
        if (!arguments.length) return _tags;
        _tags = val;

        if (tagsContainFieldKey() && !_show) {
            // always show a field if it has a value to display
            _show = true;
            if (!field.impl) {
                createField();
            }
        }

        return field;
    };


    field.locked = function(val) {
        if (!arguments.length) return _locked;
        _locked = val;
        return field;
    };


    field.show = function() {
        _show = true;
        if (!field.impl) {
            createField();
        }
        if (field.default && field.key && _tags[field.key] !== field.default) {
            var t = {};
            t[field.key] = field.default;
            dispatch.call('change', this, t);
        }
    };

    // A shown field has a visible UI, a non-shown field is in the 'Add field' dropdown
    field.isShown = function() {
        return _show;
    };


    // An allowed field can appear in the UI or in the 'Add field' dropdown.
    // A non-allowed field is hidden from the user altogether
    field.isAllowed = function() {

        if (entityIDs &&
            entityIDs.length > 1 &&
            uiFields[field.type].supportsMultiselection === false) return false;

        if (field.geometry && !entityIDs.every(function(entityID) {
            return field.matchGeometry(context.graph().geometry(entityID));
        })) return false;

        if (entityIDs && _entityExtent && field.locationSetID) {   // is field allowed in this location?
            var validHere = locationManager.locationSetsAt(_entityExtent.center());
            if (!validHere[field.locationSetID]) return false;
        }

        var prerequisiteTag = field.prerequisiteTag;

        if (entityIDs &&
            !tagsContainFieldKey() && // ignore tagging prerequisites if a value is already present
            prerequisiteTag) {

            if (!entityIDs.every(function(entityID) {
                var entity = context.graph().entity(entityID);
                if (prerequisiteTag.key) {
                    var value = entity.tags[prerequisiteTag.key] || '';

                    if (prerequisiteTag.valuesNot) {
                        return !prerequisiteTag.valuesNot.includes(value);
                    }
                    if (prerequisiteTag.valueNot) {
                        return prerequisiteTag.valueNot !== value;
                    }
                    if (prerequisiteTag.values) {
                        return prerequisiteTag.values.includes(value);
                    }
                    if (prerequisiteTag.value) {
                        return prerequisiteTag.value === value;
                    }
                    if (!value) return false;
                } else if (prerequisiteTag.keyNot) {
                    if (entity.tags[prerequisiteTag.keyNot]) return false;
                }
                return true;
            })) return false;
        }

        return true;
    };


    field.focus = function() {
        if (field.impl) {
            field.impl.focus();
        }
    };


    return utilRebind(field, dispatch, 'on');
}
