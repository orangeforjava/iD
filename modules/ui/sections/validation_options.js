import { prefs } from '../../core/preferences';
import { t } from '../../core/localizer';
import { uiSection } from '../section';
import { reactive } from 'vue';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import ValidationOptionsSection from '../vue/ValidationOptionsSection.vue';

export function uiSectionValidationOptions(context) {
    var _registrationId;
    var state = reactive({
        options: [],
        updateOption: updateOptionValue
    });

    var section = uiSection('issues-options', context)
        .content(renderContent);

    function renderContent(selection) {
        var data = [
            { key: 'what', values: ['edited', 'all'] },
            { key: 'where', values: ['visible', 'all'] }
        ];

        var opts = getOptions();
        state.options = data.map(function(d) {
            return {
                key: d.key,
                title: t.html('issues.options.' + d.key + '.title'),
                values: d.values.map(function(val) {
                    return {
                        value: val,
                        checked: opts[d.key] === val,
                        label: t.html('issues.options.' + d.key + '.' + val)
                    };
                })
            };
        });

        if (!isVueAppInitialized()) return;
        if (_registrationId) unregisterComponent(_registrationId);
        _registrationId = registerComponent(ValidationOptionsSection, selection.node(), { state: state });
    }

    function getOptions() {
        return {
            what: prefs('validate-what') || 'edited',  // 'all', 'edited'
            where: prefs('validate-where') || 'all'    // 'all', 'visible'
        };
    }

    function updateOptionValue(d3_event, d, val) {
        if (!val && d3_event && d3_event.target) {
            val = d3_event.target.value;
        }

        prefs('validate-' + d, val);
        context.validator().validate();
    }

    return section;
}
