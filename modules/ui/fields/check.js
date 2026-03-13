import { dispatch as d3_dispatch } from 'd3-dispatch';
import { select as d3_select } from 'd3-selection';
import { omit } from 'lodash-es';

import { utilRebind } from '../../util/rebind';
import { t } from '../../core/localizer';
import { actionReverse } from '../../actions/reverse';
import { svgIcon } from '../../svg/icon';
import { utilCheckTagDictionary } from '../../util';
import { osmOneWayTags } from '../../osm/tags';
import { mountVueComponent } from '../vue/bridge';
import CheckFieldInput from '../vue/CheckFieldInput.vue';

export { uiFieldCheck as uiFieldDefaultCheck };
export { uiFieldCheck as uiFieldOnewayCheck };

export function uiFieldCheck(field, context) {
    var dispatch = d3_dispatch('change');
    var options = field.options;
    var values = [];
    var texts = [];
    var _tags;
    var _impliedYes;
    var _entityIDs = [];
    var _value;
    var _refs = null;
    var _renderVersion = 0;

    var stringsField = field.resolveReference('stringsCrossReference');
    if (!options && stringsField.options) {
        options = stringsField.options;
    }

    if (options) {
        for (var i in options) {
            var v = options[i];
            values.push(v === 'undefined' ? undefined : v);
            texts.push(stringsField.t.html('options.' + v, { 'default': v }));
        }
    } else {
        values = [undefined, 'yes'];
        texts = [t.html('inspector.unknown'), t.html('inspector.check.yes')];
        if (field.type !== 'defaultCheck') {
            values.push('no');
            texts.push(t.html('inspector.check.no'));
        }
    }

    function checkImpliedYes() {
        _impliedYes = (field.id === 'oneway_yes');
        if (field.id === 'oneway') {
            var entity = context.entity(_entityIDs[0]);
            if (entity.type === 'way' && !!utilCheckTagDictionary(entity.tags, omit(osmOneWayTags, 'oneway'))) {
                _impliedYes = true;
                texts[0] = t.html('_tagging.presets.fields.oneway_yes.options.undefined');
            }
        }
    }

    function reverserHidden() {
        if (!context.container().select('div.inspector-hover').empty()) return true;
        return !(_value === 'yes' || (_impliedYes && !_value));
    }

    function reverserSetText(selection) {
        var entity = _entityIDs.length && context.hasEntity(_entityIDs[0]);
        if (reverserHidden() || !entity) return selection;

        var first = entity.first();
        var last = entity.isClosed() ? entity.nodes[entity.nodes.length - 2] : entity.last();
        var pseudoDirection = first < last;
        var icon = pseudoDirection ? '#iD-icon-forward' : '#iD-icon-backward';

        selection.selectAll('.reverser-span')
            .html('')
            .call(t.append('inspector.check.reverser'))
            .call(svgIcon(icon, 'inline'));

        return selection;
    }

    var shellState = {
        domId: field.domId,
        checked: false,
        isMixed: false,
        textHtml: '',
        showReverser: field.type === 'onewayCheck',
        reverserHidden: true,
        value: null,
        renderVersion: 0,
        setRefs: function(refs) {
            _refs = refs;
            if (_refs && _refs.input) {
                _refs.input.indeterminate = shellState.isMixed || (field.type !== 'defaultCheck' && !_value);
            }
            if (_refs && _refs.reverser) {
                reverserSetText(d3_select(_refs.reverser.parentNode));
            }
        },
        onToggle: function(d3_event) {
            d3_event.stopPropagation();
            var t = {};
            if (Array.isArray(_tags[field.key])) {
                if (values.indexOf('yes') !== -1) {
                    t[field.key] = 'yes';
                } else {
                    t[field.key] = values[0];
                }
            } else {
                t[field.key] = values[(values.indexOf(_value) + 1) % values.length];
            }
            if (t[field.key] === 'reversible' || t[field.key] === 'alternating') {
                t[field.key] = values[0];
            }
            dispatch.call('change', this, t);
        },
        onReverse: function() {
            context.perform(
                function(graph) {
                    for (var i in _entityIDs) {
                        graph = actionReverse(_entityIDs[i])(graph);
                    }
                    return graph;
                },
                t('operations.reverse.annotation.line', { n: 1 })
            );
            context.validator().validate();
            if (_refs && _refs.reverser) {
                reverserSetText(d3_select(_refs.reverser.parentNode));
            }
        }
    };
    var renderShell = mountVueComponent(CheckFieldInput, context, { state: shellState });

    var check = function(selection) {
        checkImpliedYes();
        shellState.renderVersion = ++_renderVersion;
        renderShell(selection);
    };

    check.entityIDs = function(val) {
        if (!arguments.length) return _entityIDs;
        _entityIDs = val;
        return check;
    };

    check.tags = function(tags) {
        _tags = tags;

        function isChecked(val) {
            return val !== 'no' && val !== '' && val !== undefined && val !== null;
        }

        function textFor(val) {
            if (val === '') val = undefined;
            var index = values.indexOf(val);
            return (index !== -1 ? texts[index] : ('"' + val + '"'));
        }

        checkImpliedYes();

        var isMixed = Array.isArray(tags[field.key]);
        _value = !isMixed && tags[field.key] && tags[field.key].toLowerCase();
        if (field.type === 'onewayCheck' && (_value === '1' || _value === '-1')) {
            _value = 'yes';
        }

        shellState.isMixed = isMixed;
        shellState.checked = isChecked(_value);
        shellState.textHtml = isMixed ? t.html('inspector.multiple_values') : textFor(_value);
        shellState.value = _value;
        shellState.reverserHidden = reverserHidden();
        shellState.renderVersion = ++_renderVersion;
    };

    check.focus = function() {
        if (_refs && _refs.input) _refs.input.focus();
    };

    check.unmount = renderShell.unmount;

    return utilRebind(check, dispatch, 'on');
}
