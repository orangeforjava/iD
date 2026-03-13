import { dispatch as d3_dispatch } from 'd3-dispatch';
import { select as d3_select } from 'd3-selection';
import _debounce from 'lodash-es/debounce';
import * as countryCoder from '@rapideditor/country-coder';
import { reactive } from 'vue';

import { presetManager } from '../../presets';
import { fileFetcher } from '../../core/file_fetcher';
import { t, localizer } from '../../core/localizer';
import { utilDetect, utilGetSetValue, utilNoAuto, utilRebind, utilTotalExtent } from '../../util';
import { svgIcon } from '../../svg/icon';
import { cardinal } from '../../osm/node';
import { isColorValid } from '../../osm/tags';
import { uiLengthIndicator } from '..';
import { uiTooltip } from '../tooltip';
import { isEqual } from 'lodash-es';
import { mountVueComponent } from '../vue/bridge';
import InputFieldShell from '../vue/InputFieldShell.vue';

export {
    uiFieldText as uiFieldColour,
    uiFieldText as uiFieldEmail,
    uiFieldText as uiFieldIdentifier,
    uiFieldText as uiFieldNumber,
    uiFieldText as uiFieldSchedule,
    uiFieldText as uiFieldTel,
    uiFieldText as uiFieldUrl,
    likelyRawNumberFormat
};

const likelyRawNumberFormat = /^-?(0\.\d*|\d*\.\d{0,2}(\d{4,})?|\d{4,}\.\d{3})$/;
const yoHoursURLFormat = 'https://projets.pavie.info/yohours/?oh={value}';

export function uiFieldText(field, context) {
    var dispatch = d3_dispatch('change');
    var input = d3_select(null);
    var outlinkButton = d3_select(null);
    var wrap = d3_select(null);
    var _lengthIndicator = uiLengthIndicator(context.maxCharsForTagValue());
    var _entityIDs = [];
    var _tags;
    var _phoneFormats = {};
    var _refs = null;
    var _renderVersion = 0;
    const isDirectionField = field.key.split(':').some(keyPart => keyPart === 'direction');
    const formatFloat = localizer.floatFormatter(localizer.languageCode());
    const parseLocaleFloat = localizer.floatParser(localizer.languageCode());
    const countDecimalPlaces = localizer.decimalPlaceCounter(localizer.languageCode());

    if (field.type === 'tel') {
        fileFetcher.get('phone_formats')
            .then(function(d) {
                _phoneFormats = d;
                updatePhonePlaceholder();
            })
            .catch(function() { /* ignore */ });
    }

    var shellState = reactive({
        type: field.type,
        htmlType: field.type === 'identifier' ? 'text' : field.type,
        domId: field.domId,
        readonly: false,
        disabled: false,
        placeholder: '',
        title: undefined,
        accessories: [],
        renderVersion: 0,
        setRefs: function(refs) {
            _refs = refs;
            if (_refs && _refs.input) {
                utilNoAuto(d3_select(_refs.input));
            }
        },
        setAccessoryRef: function(key, el) {
            if (!_refs) _refs = {};
            _refs[key] = el;
        },
        onInput: change(true),
        onBlur: change(),
        onChange: change()
    });
    var renderShell = mountVueComponent(InputFieldShell, context, { state: shellState });


    function calcLocked() {
        // Protect certain fields that have a companion `*:wikidata` value
        var isLocked = (field.id === 'brand' || field.id === 'network' || field.id === 'operator' || field.id === 'flag') &&
            _entityIDs.length &&
            _entityIDs.some(function(entityID) {
                var entity = context.graph().hasEntity(entityID);
                if (!entity) return false;

                // Features linked to Wikidata are likely important and should be protected
                if (entity.tags.wikidata) return true;

                var preset = presetManager.match(entity, context.graph());
                var isSuggestion = preset && preset.suggestion;

                // Lock the field if there is a value and a companion `*:wikidata` value
                var which = field.id;   // 'brand', 'network', 'operator', 'flag'
                return isSuggestion && !!entity.tags[which] && !!entity.tags[which + ':wikidata'];
            });

        field.locked(isLocked);
    }


    function i(selection) {
        calcLocked();
        var isLocked = field.locked();

        shellState.htmlType = field.type === 'identifier' ? 'text' : field.type;
        shellState.readonly = !!isLocked;
        shellState.disabled = !!isLocked;
        shellState.accessories = [];
        shellState.renderVersion = ++_renderVersion;
        renderShell(selection);

        if (!_refs) {
            wrap = selection.selectAll('.form-field-input-wrap')
                .data([0]);

            wrap = wrap.enter()
                .append('div')
                .attr('class', 'form-field-input-wrap form-field-input-' + field.type)
                .merge(wrap);

            input = wrap.selectAll('input')
                .data([0]);

            input = input.enter()
                .append('input')
                .attr('type', field.type === 'identifier' ? 'text' : field.type)
                .attr('dir', 'auto')
                .attr('id', field.domId)
                .classed(field.type, true)
                .call(utilNoAuto)
                .merge(input);
        } else {
            wrap = d3_select(_refs.wrap);
            input = d3_select(_refs.input);
        }

        input
            .classed('disabled', !!isLocked)
            .attr('readonly', isLocked || null);

        wrap.call(_lengthIndicator);

        if (field.type === 'tel') {
            updatePhonePlaceholder();

        } else if (field.type === 'number' || field.type === 'integer') {
            var rtl = (localizer.textDirection() === 'rtl');

            input.attr('type', 'text');

            var inc = field.increment;
            shellState.accessories = (rtl ? [inc, -inc] : [-inc, inc]).map(function(d) {
                var which = (d > 0 ? 'increment' : 'decrement');
                return {
                    key: which,
                    kind: 'button',
                    className: 'form-field-button ' + which,
                    title: t(`inspector.${which}`),
                    icon: null,
                    onClick: function() {

                    // do nothing if this is a multi-selection with mixed values
                    if (Array.isArray(_tags[field.key])) return;

                    var raw_vals = input.node().value || '0';
                    var vals = raw_vals.split(';');
                    vals = vals.map(function(v) {
                        v = v.trim();
                        const isRawNumber = likelyRawNumberFormat.test(v);
                        var num = isRawNumber ? parseFloat(v) : parseLocaleFloat(v);
                        if (isDirectionField) {
                            const compassDir = cardinal[v.toLowerCase()];
                            if (compassDir !== undefined) {
                                num = compassDir;
                            }
                        }

                        // do nothing if the value is neither a number, nor a cardinal direction
                        if (!isFinite(num)) return v;
                        num = parseFloat(num);
                        if (!isFinite(num)) return v;

                        num += d;
                        // clamp to 0..359 degree range if it's a direction field
                        // https://github.com/openstreetmap/iD/issues/9386
                        if (isDirectionField) {
                            num = ((num % 360) + 360) % 360;
                        }
                        // make sure no extra decimals are introduced
                        return formatFloat(clamped(num), isRawNumber
                            ? (v.includes('.') ? v.split('.')[1].length : 0)
                            : countDecimalPlaces(v));
                    });
                    input.node().value = vals.join(';');
                    change()();
                    },
                    disabled: false
                };
            });
        } else if (field.type === 'identifier' && field.urlFormat && field.pattern) {

            input.attr('type', 'text');
            shellState.accessories = [{
                key: 'outlink',
                kind: 'button',
                className: 'form-field-button foreign-id-permalink',
                icon: '#iD-icon-out-link',
                title: (function() {
                    var domainResults = /^https?:\/\/(.{1,}?)\//.exec(field.urlFormat);
                    if (domainResults.length >= 2 && domainResults[1]) {
                        var domain = domainResults[1];
                        return t('icons.view_on', { domain: domain });
                    }
                    return '';
                })(),
                onClick: function() {
                    var value = validIdentifierValueForLink();
                    if (value) {
                        var url = field.urlFormat.replace(/{value}/, encodeURIComponent(value));
                        window.open(url, '_blank');
                    }
                },
                disabled: !validIdentifierValueForLink()
            }];
        } else if (field.type === 'schedule') {

            input.attr('type', 'text');
            shellState.accessories = [{
                key: 'outlink',
                kind: 'button',
                className: 'form-field-button foreign-id-permalink',
                icon: '#iD-icon-out-link',
                title: t('icons.edit_in', { tool: 'YoHours' }),
                onClick: function() {
                    var value = validIdentifierValueForLink();
                    var url = yoHoursURLFormat.replace(/{value}/, encodeURIComponent(value || ''));
                    window.open(url, '_blank');
                }
            }];
        } else if (field.type === 'url') {
            input.attr('type', 'text');
            shellState.accessories = [{
                key: 'outlink',
                kind: 'button',
                className: 'form-field-button foreign-id-permalink',
                icon: '#iD-icon-out-link',
                title: t('icons.visit_website'),
                onClick: function() {
                    const value = validIdentifierValueForLink();
                    if (value) window.open(value, '_blank');
                },
                disabled: !validIdentifierValueForLink()
            }];
        } else if (field.type === 'colour') {
            input.attr('type', 'text');

            updateColourPreview();
        } else if (field.type === 'date') {
            input.attr('type', 'text');

            updateDateField();
        }
    }


    function updateColourPreview() {
        wrap.selectAll('.colour-preview')
            .remove();

        const colour = utilGetSetValue(input);

        if (!isColorValid(colour) && colour !== '') {
            shellState.accessories = [];
            return;
        }

        shellState.accessories = [{
            key: 'colour-selector',
            kind: 'hidden-input',
            inputType: 'color',
            className: 'colour-selector',
            value: colour,
            onInput: _debounce(function(d3_event) {
                d3_event.preventDefault();
                var colour = this.value;
                if (!isColorValid(colour)) return;
                utilGetSetValue(input, this.value);
                change()();
                updateColourPreview();
            }, 100)
        }, {
            key: 'colour-preview',
            kind: 'color-preview',
            className: 'form-field-button colour-preview',
            color: colour,
            onClick: function() {
                if (_refs && _refs['colour-selector']) _refs['colour-selector'].showPicker();
            }
        }];
    }


    function updateDateField() {
        function isDateValid(date) {
            return date.match(/^[0-9]{4}(-[0-9]{2}(-[0-9]{2})?)?$/);
        }

        const date = utilGetSetValue(input);

        const now = new Date();
        const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        if ((field.key === 'check_date' || field.key === 'survey:date') && date !== today) {
            shellState.accessories = shellState.accessories.filter(a => a.key !== 'date-set-today');
            shellState.accessories.push({
                key: 'date-set-today',
                kind: 'button',
                className: 'form-field-button date-set-today',
                icon: '#fas-rotate',
                title: t('inspector.set_today'),
                onClick: function() {
                    utilGetSetValue(input, today);
                    change()();
                    updateDateField();
                }
            });
        } else {
            shellState.accessories = shellState.accessories.filter(a => a.key !== 'date-set-today');
        }

        if (!isDateValid(date) && date !== '') {
            shellState.accessories = shellState.accessories.filter(a => !['date-selector', 'date-calendar'].includes(a.key));
            return;
        }

        if (utilDetect().browser !== 'Safari') {
            // opening of the calendar pick is not yet supported in safari <= 16
            // https://caniuse.com/mdn-api_htmlinputelement_showpicker_date_input

            shellState.accessories = shellState.accessories.filter(a => !['date-selector', 'date-calendar'].includes(a.key));
            shellState.accessories.push({
                key: 'date-selector',
                kind: 'hidden-input',
                inputType: 'date',
                className: 'date-selector',
                value: date,
                onInput: _debounce(function(d3_event) {
                    d3_event.preventDefault();
                    var date = this.value;
                    if (!isDateValid(date)) return;
                    utilGetSetValue(input, this.value);
                    change()();
                    updateDateField();
                }, 100)
            }, {
                key: 'date-calendar',
                kind: 'button',
                className: 'form-field-button date-calendar',
                icon: '#fas-calendar-days',
                onClick: function() {
                    if (_refs && _refs['date-selector']) _refs['date-selector'].showPicker();
                }
            });
        }
    }


    function updatePhonePlaceholder() {
        if (input.empty() || !Object.keys(_phoneFormats).length) return;

        const extent = combinedEntityExtent();
        // some territories have their own phone format (e.g. Hong Kong); use them first
        // if such territory-level format is unknown, then fall back to use the usual country-level format
        const countryCode = extent && countryCoder.iso1A2Code(extent.center(), { level: 'territory' });
        if (!countryCode) {
            // can assume the geometry input has bad data
            return;
        }
        let format = _phoneFormats[countryCode.toLowerCase()];
        if (!format) {
            // detect whether countryCode is actually territory-level
            const countryCodeSovereign = countryCoder.iso1A2Code(extent.center());
            if (countryCodeSovereign !== countryCode) {
                format = _phoneFormats[countryCodeSovereign.toLowerCase()];
            }
        }
        if (format) {
            input.attr('placeholder', format);
        }
    }


    function validIdentifierValueForLink() {
        const value = utilGetSetValue(input).trim();

        if (field.type === 'url' && value) {
            try {
                return (new URL(value)).href;
            } catch {
                return null;
            }
        }
        if (field.type === 'identifier' && field.pattern) {
            return value && value.match(new RegExp(field.pattern))?.[0];
        }
        if (field.type === 'schedule') {
            return value;
        }
        return null;
    }


    // clamp number to min/max
    function clamped(num) {
        if (field.minValue !== undefined) {
            num = Math.max(num, field.minValue);
        }
        if (field.maxValue !== undefined) {
            num = Math.min(num, field.maxValue);
        }
        return num;
    }


    // returns all values of a (potential) multiselection and/or multi-key field
    function getVals(tags) {
        if (field.keys) {
            const multiSelection = context.selectedIDs();
            tags = multiSelection.length > 1
                ? context.selectedIDs()
                    .map(id => context.graph().entity(id))
                    .map(entity => entity.tags)
                : [tags];
            return tags.map(tags => new Set(field.keys
                    .reduce((acc, key) => acc.concat(tags[key]), [])
                    .filter(Boolean)))
                .map(vals => vals.size === 0 ? new Set([undefined]) : vals)
                .reduce((a, b) => new Set([...a, ...b]));
        } else {
            return new Set([].concat(tags[field.key]));
        }
    }


    function change(onInput) {
        return function() {
            var t = {};
            var val = utilGetSetValue(input);
            if (!onInput) val = context.cleanTagValue(val);

            // don't override multiple values with blank string
            if (!val && getVals(_tags).size > 1) return;

            let displayVal = val;
            if ((field.type === 'number' || field.type === 'integer') && val) {
                const numbers = val.split(';').map(v => {
                    if (likelyRawNumberFormat.test(v)) {
                        // input number likely in "raw" format
                        return {
                            v,
                            num: parseFloat(v),
                            fractionDigits: v.includes('.') ? v.split('.')[1].length : 0
                        };
                    } else {
                        // try to parse in localized number format
                        return {
                            v,
                            num: parseLocaleFloat(v),
                            fractionDigits: countDecimalPlaces(v)
                        };
                    }
                });
                val = numbers.map(({num, v, fractionDigits}) => {
                    if (!isFinite(num)) return v;
                    return clamped(num).toFixed(fractionDigits);
                }).join(';');
                displayVal = numbers.map(({num, v, fractionDigits}) => {
                    if (!isFinite(num)) return v;
                    return formatFloat(clamped(num), fractionDigits);
                }).join(';');
            }
            if (!onInput) utilGetSetValue(input, displayVal);
            t[field.key] = val || undefined;
            if (field.keys) {
                // for multi-key fields with: handle alternative tag keys gracefully
                // https://github.com/openstreetmap/id-tagging-schema/issues/905
                dispatch.call('change', this, tags => {
                    if (field.keys.some(key => tags[key])) {
                        // use exiting key(s)
                        field.keys.filter(key => tags[key]).forEach(key => {
                            tags[key] = val || undefined;
                        });
                    } else {
                        // fall back to default key if none of the `keys` is preset
                        tags[field.key] = val || undefined;
                    }
                    return tags;
                }, onInput);
            } else {
                dispatch.call('change', this, t, onInput);
            }
        };
    }


    i.entityIDs = function(val) {
        if (!arguments.length) return _entityIDs;
        _entityIDs = val;
        return i;
    };

    i.tags = function(tags) {
        _tags = tags;

        const vals = getVals(tags);
        const isMixed = vals.size > 1;
        let val = vals.size === 1 ? [...vals][0] ?? '' : '';
        let shouldUpdate;

        if ((field.type === 'number' || field.type === 'integer') && val) {
            const numbers = val.split(';').map(function(v) {
                v = v.trim();
                const num = Number(v);
                if (!isFinite(num) || v === '') return v;
                const fractionDigits = v.includes('.') ? v.split('.')[1].length : 0;
                return formatFloat(num, fractionDigits);
            });
            val = numbers.join(';');
            // for number fields, we don't want to override the content of the
            // input element with the same number using a different formatting
            // (e.g. when entering "1234.5", this should not be reformatted to
            // "1.234,5" which could otherwise cause the cursor to be in the
            // wrong location after the change)
            // but if the actual numeric value of the field has changed (e.g.
            // by pressing the +/- buttons or using the raw tag editor), we
            // can and should update the content of the input element.
            shouldUpdate = (inputValue, setValue) => {
                const inputNums = inputValue.split(';').map(val => {
                    const parsedNum = likelyRawNumberFormat.test(val)
                        ? parseFloat(val)
                        : parseLocaleFloat(val);
                    if (!isFinite(parsedNum)) return val; // keep unparsable values as-is
                    return parsedNum;
                });
                const setNums = setValue.split(';').map(val => {
                    const parsedNum = parseLocaleFloat(val);
                    if (!isFinite(parsedNum)) return val; // keep unparsable values as-is
                    return parsedNum;
                });
                return !isEqual(inputNums, setNums);
            };
        }

        utilGetSetValue(input, val, shouldUpdate)
            .attr('title', isMixed ? [...vals].join('\n') : undefined)
            .attr('placeholder', isMixed ? t('inspector.multiple_values') : (field.placeholder() || t('inspector.unknown')))
            .classed('mixed', isMixed);

        if (field.type === 'number' || field.type === 'integer') {
            shellState.accessories = shellState.accessories.map(function(accessory) {
                if (accessory.key !== 'increment' && accessory.key !== 'decrement') return accessory;
                if (isMixed) {
                    accessory.disabled = true;
                } else {
                    var raw_vals = tags[field.key] || '0';
                    const canIncDec = raw_vals.split(';').some((val) =>
                        isFinite(Number(val)) || (isDirectionField && (val.trim().toLowerCase() in cardinal))
                    );
                    accessory.disabled = !canIncDec;
                }
                return accessory;
            });
        }

        if (field.type === 'tel') updatePhonePlaceholder();

        if (field.type === 'colour') updateColourPreview();

        if (field.type === 'date') updateDateField();

        shellState.accessories = shellState.accessories.map(function(accessory) {
            if (accessory.key === 'outlink') {
                accessory.disabled = !validIdentifierValueForLink() && field.type !== 'schedule';
            }
            return accessory;
        });

        if (!isMixed) {
            _lengthIndicator.update(tags[field.key]);
        }
    };


    i.focus = function() {
        var node = input.node();
        if (node) node.focus();
    };

    i.unmount = renderShell.unmount;

    function combinedEntityExtent() {
        return _entityIDs && _entityIDs.length && utilTotalExtent(_entityIDs, context.graph());
    }

    return utilRebind(i, dispatch, 'on');
}
