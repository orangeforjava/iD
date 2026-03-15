import { dispatch as d3_dispatch } from 'd3-dispatch';
import { select as d3_select } from 'd3-selection';
import { reactive } from 'vue';

import { presetManager } from '../../presets';
import { t } from '../../core/localizer';
import { uiField } from '../field';
import { utilArrayUnion, utilRebind } from '../../util';
import { isVueAppInitialized } from '../vue/app';
import { mountVueComponent } from '../vue/bridge';
import RadioFieldShell from '../vue/RadioFieldShell.vue';


export { uiFieldRadio as uiFieldStructureRadio };


export function uiFieldRadio(field, context) {
    var dispatch = d3_dispatch('change');
    var placeholder = d3_select(null);
    var wrap = d3_select(null);
    var labels = d3_select(null);
    var radios = d3_select(null);
    var strings = field.resolveReference('stringsCrossReference');
    var radioData = (field.options || strings.options || field.keys).slice();
    var typeField;
    var layerField;
    let _tags = {};
    var _oldType = {};
    var _entityIDs = [];
    var _inputRefs = new Map();
    var _refs = null;
    var _typeRef = null;
    var _layerRef = null;
    var _renderVersion = 0;

    var shellState = reactive({
        fieldId: field.id,
        placeholderText: '',
        options: radioData.map(function(d) {
            const value = strings.t('options.' + d, { 'default': d });
            return {
                key: d,
                value: value,
                label: value,
                checked: false,
                active: false,
                mixed: false,
                title: null
            };
        }),
        showExtras: false,
        showType: false,
        showLayer: false,
        selectedKey: null,
        typeLabel: t('inspector.radio.structure.type'),
        layerLabel: t('inspector.radio.structure.layer'),
        renderVersion: 0,
        setRefs: function(refs) {
            _refs = refs;
            wrap = refs.wrap ? d3_select(refs.wrap) : d3_select(null);
            placeholder = wrap.selectAll('.placeholder');
            labels = wrap.selectAll('label');
            radios = d3_selectAllInputs();
            bindRadioEvents();
            renderStructureFields();
            updatePlaceholder();
        },
        setInputRef: function(key, el) {
            if (el) _inputRefs.set(key, el);
            else _inputRefs.delete(key);
        },
        setTypeRef: function(el) {
            _typeRef = el;
            if (el) renderStructureFields();
        },
        setLayerRef: function(el) {
            _layerRef = el;
            if (el) renderStructureFields();
        }
    });
    var renderShell = mountVueComponent(RadioFieldShell, context, { state: shellState });


    function d3_selectAllInputs() {
        const refs = Array.from(_inputRefs.values()).filter(Boolean);
        if (!refs.length) return d3_select(null);
        return wrap.selectAll(function() {
            return refs;
        });
    }


    function selectedKey() {
        if (isVueAppInitialized()) {
            const activeOption = shellState.options.find(option => option.checked);
            return activeOption && activeOption.key;
        }

        var node = wrap.selectAll('.form-field-input-radio label.active input');
        return !node.empty() && node.datum();
    }


    function bindRadioEvents() {
        if (radios.empty()) return;
        radios.on('change', changeRadio);
    }


    function updatePlaceholder() {
        const activeOption = shellState.options.find(option => option.checked);
        if (activeOption) {
            shellState.placeholderText = activeOption.value;
            _oldType[activeOption.key] = _tags[activeOption.key];
        } else {
            shellState.placeholderText = t('inspector.none');
        }

        if (!placeholder.empty()) {
            placeholder.text(shellState.placeholderText);
        }
    }


    function syncOptionState(isOptionChecked, isMixed) {
        shellState.options.forEach(function(option) {
            option.checked = isOptionChecked(option.key) &&
                (field.key || radioData.filter(isOptionChecked).length === 1);
            option.active = field.key
                ? ((Array.isArray(_tags[field.key]) && _tags[field.key].includes(option.key)) || _tags[field.key] === option.key)
                : ((Array.isArray(_tags[option.key]) && _tags[option.key].some(v => typeof v === 'string' && v.toLowerCase() !== 'no')) ||
                    !!(typeof _tags[option.key] === 'string' && _tags[option.key].toLowerCase() !== 'no'));
            option.mixed = isMixed(option.key);
            option.title = option.mixed ? t('inspector.unshared_value_tooltip') : null;

            var ref = _inputRefs.get(option.key);
            if (ref) ref.checked = option.checked;
        });

        if (!isVueAppInitialized()) {
            radios.property('checked', function(d) {
                return isOptionChecked(d) &&
                    (field.key || field.options.filter(isOptionChecked).length === 1);
            });

            labels
                .classed('active', function(d) {
                    if (field.key) {
                        return (Array.isArray(_tags[field.key]) && _tags[field.key].includes(d)) || _tags[field.key] === d;
                    }
                    return (Array.isArray(_tags[d]) && _tags[d].some(v => typeof v === 'string' && v.toLowerCase() !== 'no')) ||
                        !!(typeof _tags[d] === 'string' && _tags[d].toLowerCase() !== 'no');
                })
                .classed('mixed', isMixed)
                .attr('title', function(d) {
                    return isMixed(d) ? t('inspector.unshared_value_tooltip') : null;
                });
        }
    }


    function renderStructureFields() {
        if (!isVueAppInitialized() || field.type !== 'structureRadio') return;

        if (typeField && _typeRef) {
            d3_select(_typeRef).call(typeField.render);
        }
        if (layerField && _layerRef) {
            d3_select(_layerRef).call(layerField.render);
        }
    }


    function renderLegacy(selection) {
        selection.classed('preset-radio', true);

        wrap = selection.selectAll('.form-field-input-wrap')
            .data([0]);

        var enter = wrap.enter()
            .append('div')
            .attr('class', 'form-field-input-wrap form-field-input-radio');

        enter
            .append('span')
            .attr('class', 'placeholder');

        wrap = wrap.merge(enter);
        placeholder = wrap.selectAll('.placeholder');

        labels = wrap.selectAll('label')
            .data(radioData);

        enter = labels.enter()
            .append('label');

        enter
            .append('input')
            .attr('type', 'radio')
            .attr('name', field.id)
            .attr('value', function(d) { return strings.t('options.' + d, { 'default': d }); })
            .attr('checked', false);

        enter
            .append('span')
            .each(function(d) { strings.t.append('options.' + d, { 'default': d })(d3_select(this)); });

        labels = labels.merge(enter);
        radios = labels.selectAll('input');
        bindRadioEvents();
    }


    function radio(selection) {
        if (isVueAppInitialized()) {
            selection.classed('preset-radio', true);
            shellState.renderVersion = ++_renderVersion;
            renderShell(selection);
            if (_refs) {
                placeholder = wrap.selectAll('.placeholder');
                labels = wrap.selectAll('label');
                radios = d3_selectAllInputs();
                bindRadioEvents();
                renderStructureFields();
                updatePlaceholder();
            }
            return;
        }

        renderLegacy(selection);
    }


    function structureExtras(selection, tags) {
        var selected = selectedKey() || tags.layer !== undefined;
        var type = presetManager.field(selected);
        var layer = presetManager.field('layer');
        var showLayer = (selected === 'bridge' || selected === 'tunnel' || tags.layer !== undefined);

        shellState.showExtras = !!selected;
        shellState.showType = !!type;
        shellState.showLayer = !!(layer && showLayer);
        shellState.selectedKey = selected || null;

        var extrasWrap = selection.selectAll('.structure-extras-wrap')
            .data(selected ? [0] : []);

        extrasWrap.exit().remove();

        extrasWrap = extrasWrap.enter()
            .append('div')
            .attr('class', 'structure-extras-wrap')
            .merge(extrasWrap);

        var list = extrasWrap.selectAll('ul')
            .data([0]);

        list = list.enter()
            .append('ul')
            .attr('class', 'rows')
            .merge(list);

        if (type) {
            if (!typeField || typeField.id !== selected) {
                typeField = uiField(context, type, _entityIDs, { wrap: false })
                    .on('change', changeType);
            }
            typeField.tags(tags);
        } else {
            typeField = null;
        }

        var typeItem = list.selectAll('.structure-type-item')
            .data(typeField ? [typeField] : [], function(d) { return d.id; });

        typeItem.exit().remove();

        var typeEnter = typeItem.enter()
            .insert('li', ':first-child')
            .attr('class', 'labeled-input structure-type-item');

        typeEnter
            .append('div')
            .attr('class', 'label structure-label-type')
            .attr('for', 'preset-input-' + selected)
            .call(t.append('inspector.radio.structure.type'));

        typeEnter
            .append('div')
            .attr('class', 'structure-input-type-wrap');

        typeItem = typeItem.merge(typeEnter);

        if (typeField) {
            if (isVueAppInitialized()) {
                renderStructureFields();
            } else {
                typeItem.selectAll('.structure-input-type-wrap')
                    .call(typeField.render);
            }
        }

        if (layer && showLayer) {
            if (!layerField) {
                layerField = uiField(context, layer, _entityIDs, { wrap: false })
                    .on('change', changeLayer);
            }
            layerField.tags(tags);
            field.keys = utilArrayUnion(field.keys, ['layer']);
        } else {
            layerField = null;
            field.keys = field.keys.filter(function(k) { return k !== 'layer'; });
        }

        var layerItem = list.selectAll('.structure-layer-item')
            .data(layerField ? [layerField] : []);

        layerItem.exit().remove();

        var layerEnter = layerItem.enter()
            .append('li')
            .attr('class', 'labeled-input structure-layer-item');

        layerEnter
            .append('div')
            .attr('class', 'label structure-label-layer')
            .attr('for', 'preset-input-layer')
            .call(t.append('inspector.radio.structure.layer'));

        layerEnter
            .append('div')
            .attr('class', 'structure-input-layer-wrap');

        layerItem = layerItem.merge(layerEnter);

        if (layerField) {
            if (isVueAppInitialized()) {
                renderStructureFields();
            } else {
                layerItem.selectAll('.structure-input-layer-wrap')
                    .call(layerField.render);
            }
        }
    }


    function changeType(t, onInput) {
        var key = selectedKey();
        if (!key) return;

        var val = t[key];
        if (val !== 'no') {
            _oldType[key] = val;
        }

        if (field.type === 'structureRadio') {
            if (val === 'no' ||
                (key !== 'bridge' && key !== 'tunnel') ||
                (key === 'tunnel' && val === 'building_passage')) {
                t.layer = undefined;
            }
            if (t.layer === undefined) {
                if (key === 'bridge' && val !== 'no') {
                    t.layer = '1';
                }
                if (key === 'tunnel' && val !== 'no' && val !== 'building_passage') {
                    t.layer = '-1';
                }
            }
         }

        dispatch.call('change', this, t, onInput);
    }


    function changeLayer(t, onInput) {
        dispatch.call('change', this, t, onInput);
    }


    function changeRadio() {
        var t = {};
        var activeKey;

        if (field.key) {
            t[field.key] = undefined;
        }

        radios.each(function(d) {
            var active = d3_select(this).property('checked');
            if (active) activeKey = d;

            if (field.key) {
                if (active) t[field.key] = d;
            } else {
                var val = _oldType[activeKey] || 'yes';
                t[d] = active ? val : undefined;
            }
        });

        if (field.type === 'structureRadio') {
            if (activeKey === 'bridge') {
                const hasExistingLayer = !Number.isNaN(+_tags.layer) && +_tags.layer > 0;
                t.layer = hasExistingLayer ? _tags.layer : '1';
            } else if (activeKey === 'tunnel' && t.tunnel !== 'building_passage') {
                const hasExistingLayer = !Number.isNaN(+_tags.layer) && +_tags.layer < 0;
                t.layer = hasExistingLayer ? _tags.layer : '-1';
            } else {
                t.layer = undefined;
            }
        }

        dispatch.call('change', this, t);
    }


    radio.tags = function(tags) {
        _tags = tags;

        function isOptionChecked(d) {
            if (field.key) {
                return tags[field.key] === d;
            }
            return !!(typeof tags[d] === 'string' && tags[d].toLowerCase() !== 'no');
        }

        function isMixed(d) {
            if (field.key) {
                return Array.isArray(tags[field.key]) && tags[field.key].includes(d);
            }
            return Array.isArray(tags[d]);
        }

        syncOptionState(isOptionChecked, isMixed);
        updatePlaceholder();

        if (field.type === 'structureRadio') {
            if (!!tags.waterway && !_oldType.tunnel) {
                _oldType.tunnel = 'culvert';
            }
            if (!!tags.waterway && !_oldType.bridge) {
                _oldType.bridge = 'aqueduct';
            }

            wrap.call(structureExtras, tags);
        }
    };


    radio.focus = function() {
        var node = radios.node();
        if (node) node.focus();
    };


    radio.entityIDs = function(val) {
        if (!arguments.length) return _entityIDs;
        _entityIDs = val;
        _oldType = {};
        return radio;
    };


    radio.isAllowed = function() {
        return _entityIDs.length === 1;
    };


    radio.unmount = function() {
        if (typeField && typeField.impl && typeField.impl.unmount) {
            typeField.impl.unmount();
        }
        if (layerField && layerField.impl && layerField.impl.unmount) {
            layerField.impl.unmount();
        }
        renderShell.unmount();
    };


    return utilRebind(radio, dispatch, 'on');
}
