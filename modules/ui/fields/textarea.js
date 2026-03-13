import { dispatch as d3_dispatch } from 'd3-dispatch';

import { select as d3_select } from 'd3-selection';

import { t } from '../../core/localizer';
import { utilGetSetValue, utilNoAuto, utilRebind } from '../../util';
import { uiLengthIndicator } from '..';
import { mountVueComponent } from '../vue/bridge';
import TextareaFieldInput from '../vue/TextareaFieldInput.vue';

export function uiFieldTextarea(field, context) {
    var dispatch = d3_dispatch('change');
    var _lengthIndicator = uiLengthIndicator(context.maxCharsForTagValue())
        .silent(field.usage === 'changeset' && field.key === 'comment');
    var _tags;
    var _refs = null;
    var _renderVersion = 0;

    function fireChange(onInput) {
        if (!_refs || !_refs.textarea) return;
        var val = _refs.textarea.value;
        if (!onInput) val = context.cleanTagValue(val);
        if (!val && Array.isArray(_tags[field.key])) return;
        var t2 = {};
        t2[field.key] = val || undefined;
        dispatch.call('change', _refs.textarea, t2, onInput);
    }

    var shellState = {
        type: field.type,
        domId: field.domId,
        placeholder: '',
        title: undefined,
        isMixed: false,
        renderVersion: 0,
        setRefs: function(refs) {
            _refs = refs;
            if (_refs && _refs.textarea) {
                utilNoAuto(d3_select(_refs.textarea));
            }
            if (_refs && _refs.length) {
                d3_select(_refs.length.parentNode).call(_lengthIndicator);
            }
        },
        onInput: function() { fireChange(true); },
        onBlur: function() { fireChange(false); },
        onChange: function() { fireChange(false); }
    };
    var renderShell = mountVueComponent(TextareaFieldInput, context, { state: shellState });

    function textarea(selection) {
        shellState.renderVersion = ++_renderVersion;
        renderShell(selection);
    }

    textarea.tags = function(tags) {
        _tags = tags;

        var isMixed = Array.isArray(tags[field.key]);
        shellState.isMixed = isMixed;
        shellState.title = isMixed ? tags[field.key].filter(Boolean).join('\n') : undefined;
        shellState.placeholder = isMixed ? t('inspector.multiple_values') : (field.placeholder() || t('inspector.unknown'));
        shellState.renderVersion = ++_renderVersion;

        if (_refs && _refs.textarea) {
            _refs.textarea.value = !isMixed && tags[field.key] ? tags[field.key] : '';
        }

        if (!isMixed) {
            _lengthIndicator.update(tags[field.key]);
        }
    };

    textarea.focus = function() {
        if (_refs && _refs.textarea) _refs.textarea.focus();
    };

    textarea.unmount = renderShell.unmount;

    return utilRebind(textarea, dispatch, 'on');
}
