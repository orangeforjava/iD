import {
    select as d3_select
} from 'd3-selection';
import { clamp } from 'lodash-es';
import { reactive } from 'vue';

import { prefs } from '../../core/preferences';
import { t, localizer } from '../../core/localizer';
import { uiSection } from '../section';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import BackgroundDisplayOptionsSection from '../vue/BackgroundDisplayOptionsSection.vue';


export function uiSectionBackgroundDisplayOptions(context) {
    var _registrationId;

    var section = uiSection('background-display-options', context)
        .label(() => t.append('background.display_options'))
        .disclosureContent(renderDisclosureContent);

    var _storedOpacity = prefs('background-opacity');
    var _minVal = 0;
    var _maxVal = 3;

    var _sliders = ['brightness', 'contrast', 'saturation', 'sharpness'];

    var _options = {
        brightness: (_storedOpacity !== null ? (+_storedOpacity) : 1),
        contrast: 1,
        saturation: 1,
        sharpness: 1
    };

    var state = reactive({
        minVal: _minVal,
        maxVal: _maxVal,
        sliders: [],
        resetIcon: '#iD-icon-' + (localizer.textDirection() === 'rtl' ? 'redo' : 'undo'),
        resetAllText: t('background.reset_all'),
        onInput: function(id, val) { updateValue(id, val); },
        onReset: function(id) { updateValue(id, 1); },
        onResetAll: function() {
            for (var i = 0; i < _sliders.length; i++) updateValue(_sliders[i], 1);
        }
    });

    function updateValue(d, val) {
        val = clamp(val, _minVal, _maxVal);

        _options[d] = val;
        context.background()[d](val);

        if (d === 'brightness') {
            prefs('background-opacity', val);
        }

        section.reRender();
    }

    function renderDisclosureContent(selection) {
        state.sliders = _sliders.map(function(id) {
            return {
                id: id,
                label: t.html('background.' + id),
                value: _options[id],
                valueText: Math.floor(_options[id] * 100) + '%',
                resetTitle: t('background.reset') + ' ' + t('background.' + id)
            };
        });
        if (isVueAppInitialized()) {
            if (_registrationId) unregisterComponent(_registrationId);
            _registrationId = registerComponent(BackgroundDisplayOptionsSection, selection.node(), { state: state });
        }

        // first time only, set brightness if needed
        if (_options.brightness !== 1) {
            context.background().brightness(_options.brightness);
        }
    }

    return section;
}
