import { select as d3_select } from 'd3-selection';
import { reactive } from 'vue';

import { t } from '../core/localizer';
import { uiCombobox } from './combobox';
import { utilGetSetValue, utilNoAuto } from '../util';
import { isVueAppInitialized } from './vue/app';
import { mountVueComponent } from './vue/bridge';
import FormFieldsShell from './vue/FormFieldsShell.vue';


export function uiFormFields(context) {
    var moreCombo = uiCombobox(context, 'more-fields').minItems(1);
    var _fieldsArr = [];
    var _state = '';
    var _klass = '';
    var _fieldRefs = new Map();
    var _moreInput = null;
    var _selection = d3_select(null);

    var shellState = reactive({
        shownKeys: [],
        placeholder: '',
        showMore: false,
        klass: _klass,
        setFieldRef: function(key, el) {
            if (el) _fieldRefs.set(key, el);
            else _fieldRefs.delete(key);
        },
        setMoreInput: function(el) {
            _moreInput = el;
        },
        onRendered: function() {
            renderIntoRefs();
        }
    });
    var render = mountVueComponent(FormFieldsShell, context, { state: shellState });


    function renderIntoRefs() {
        if (_selection.empty()) return;

        var allowedFields = _fieldsArr.filter(function(field) { return field.isAllowed(); });
        var shown = allowedFields.filter(function(field) { return field.isShown(); });
        var notShown = allowedFields.filter(function(field) { return !field.isShown(); })
            .sort(function(a, b) { return (a.universal === b.universal ? 0 : a.universal ? 1 : -1); });

        var moreFields = notShown.map(function(field) {
            var terms = field.terms();
            if (field.key) terms.push(field.key);
            if (field.keys) terms = terms.concat(field.keys);
            return {
                display: field.label(),
                value: field.title(),
                title: field.title(),
                field: field,
                terms: terms
            };
        });

        shown.forEach(function(field) {
            var el = _fieldRefs.get(field.safeid);
            if (el) d3_select(el).call(field.render);
        });

        if (_moreInput) {
            d3_select(_moreInput)
                .call(utilGetSetValue, '')
                .call(utilNoAuto)
                .call(moreCombo
                    .data(moreFields)
                    .on('accept', function (d) {
                        if (!d) return;
                        var field = d.field;
                        field.show();
                        _selection.call(formFields);
                        field.focus();
                    })
                );
        }
    }

    function formFields(selection) {
        _selection = selection;

        var allowedFields = _fieldsArr.filter(function(field) { return field.isAllowed(); });
        var shown = allowedFields.filter(function(field) { return field.isShown(); });
        var notShown = allowedFields.filter(function(field) { return !field.isShown(); })
            .sort(function(a, b) { return (a.universal === b.universal ? 0 : a.universal ? 1 : -1); });

        var titles = [];
        var moreFields = notShown.map(function(field) {
            var title = field.title();
            titles.push(title);
            var terms = field.terms();
            if (field.key) terms.push(field.key);
            if (field.keys) terms = terms.concat(field.keys);
            return {
                display: field.label(),
                value: title,
                title: title,
                field: field,
                terms: terms
            };
        });

        shellState.shownKeys = shown.map(function(d) { return d.safeid; });
        shellState.placeholder = titles.slice(0,3).join(', ') + ((titles.length > 3) ? '…' : '');
        shellState.showMore = !(_state === 'hover' || moreFields.length === 0);
        shellState.klass = _klass;
        render(selection);

        if (isVueAppInitialized()) {
            if (!_fieldRefs.size && !(_moreInput && shellState.showMore)) return;
        }

        renderIntoRefs();
    }

    formFields.fieldsArr = function(val) {
        if (!arguments.length) return _fieldsArr;
        _fieldsArr = val || [];
        return formFields;
    };

    formFields.state = function(val) {
        if (!arguments.length) return _state;
        _state = val;
        return formFields;
    };

    formFields.klass = function(val) {
        if (!arguments.length) return _klass;
        _klass = val;
        return formFields;
    };

    formFields.unmount = function() {
        _fieldsArr.forEach(function(field) {
            if (field && field.unmount) {
                field.unmount();
            }
        });
        _fieldRefs.clear();
        _moreInput = null;
        _selection = d3_select(null);
        render.unmount();
    };

    return formFields;
}
