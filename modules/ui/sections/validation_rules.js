import {
    select as d3_select
} from 'd3-selection';
import { reactive } from 'vue';

import { prefs } from '../../core/preferences';
import { t } from '../../core/localizer';
import { utilGetSetValue, utilNoAuto } from '../../util';
import { uiSection } from '../section';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import ValidationRulesSection from '../vue/ValidationRulesSection.vue';

export function uiSectionValidationRules(context) {
    var _registrationId;

    var MINSQUARE = 0;
    var MAXSQUARE = 20;
    var DEFAULTSQUARE = 5;  // see also unsquare_way.js

    var section = uiSection('issues-rules', context)
        .disclosureContent(renderDisclosureContent)
        .label(() => t.append('issues.rules.title'));

    var _ruleKeys = context.validator().getRuleKeys()
        .filter(function(key) { return key !== 'maprules'; })
        .sort(function(key1, key2) {
            // alphabetize by localized title
            return t('issues.' + key1 + '.title') < t('issues.' + key2 + '.title') ? -1 : 1;
        });

    var state = reactive({
        rules: [],
        squareDegrees: prefs('validate-square-degrees') === null ? DEFAULTSQUARE.toString() : prefs('validate-square-degrees'),
        disableAllText: t('issues.disable_all'),
        enableAllText: t('issues.enable_all'),
        toggleRule: function(key) { context.validator().toggleRule(key); },
        disableAll: function() { context.validator().disableRules(_ruleKeys); },
        enableAll: function() { context.validator().disableRules([]); },
        onSquareClick: function(e) { e.preventDefault(); e.stopPropagation(); e.target.select(); },
        onSquareEnter: function(e) { e.target.blur(); e.target.select(); },
        changeSquare: changeSquare
    });

    function renderDisclosureContent(selection) {
        state.squareDegrees = prefs('validate-square-degrees') === null ? DEFAULTSQUARE.toString() : prefs('validate-square-degrees');
        state.rules = _ruleKeys.map(function(key) {
            var params = {};
            if (key === 'unsquare_way') {
                params.val = { html: '' };
            }
            return {
                key: key,
                title: t.html('issues.' + key + '.title', params),
                tooltip: t('issues.' + key + '.tip'),
                enabled: context.validator().isRuleEnabled(key)
            };
        });

        if (!isVueAppInitialized()) return;
        if (_registrationId) unregisterComponent(_registrationId);
        _registrationId = registerComponent(ValidationRulesSection, selection.node(), { state: state });
    }

    function changeSquare() {
        var input = d3_select(this);
        var degStr = utilGetSetValue(input).trim();
        var degNum = Number(degStr);

        if (!isFinite(degNum)) {
            degNum = DEFAULTSQUARE;
        } else if (degNum > MAXSQUARE) {
            degNum = MAXSQUARE;
        } else if (degNum < MINSQUARE) {
            degNum = MINSQUARE;
        }

        degNum = Math.round(degNum * 10 ) / 10;   // round to 1 decimal
        degStr = degNum.toString();

        input
            .property('value', degStr);

        prefs('validate-square-degrees', degStr);
        context.validator().revalidateUnsquare();
    }

    context.validator().on('validated.uiSectionValidationRules', function() {
        window.requestIdleCallback(section.reRender);
    });

    section.unmount = function() {
        if (_registrationId) {
            unregisterComponent(_registrationId);
            _registrationId = null;
        }
    };

    return section;
}
