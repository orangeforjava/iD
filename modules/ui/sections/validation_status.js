import _debounce from 'lodash-es/debounce';

import { prefs } from '../../core/preferences';
import { t } from '../../core/localizer';
import { uiSection } from '../section';
import { reactive } from 'vue';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import ValidationStatusSection from '../vue/ValidationStatusSection.vue';

export function uiSectionValidationStatus(context) {
    var _registrationId;
    var state = reactive({
        message: '',
        details: '',
        ignoredCount: 0,
        resetIgnoredLabel: '',
        resetIgnored: function() { context.validator().resetIgnoredIssues(); }
    });

    var section = uiSection('issues-status', context)
        .content(renderContent)
        .shouldDisplay(function() {
            var issues = context.validator().getIssues(getOptions());
            return issues.length === 0;
        });

    function getOptions() {
        return {
            what: prefs('validate-what') || 'edited',
            where: prefs('validate-where') || 'all'
        };
    }

    function renderContent(selection) {
        renderIgnoredIssuesReset(selection);
        setNoIssuesText(selection);
        if (!isVueAppInitialized()) return;
        if (_registrationId) unregisterComponent(_registrationId);
        _registrationId = registerComponent(ValidationStatusSection, selection.node(), { state: state });
    }

    function renderIgnoredIssuesReset(selection) {

        var ignoredIssues = context.validator()
            .getIssues({ what: 'all', where: 'all', includeDisabledRules: true, includeIgnored: 'only' });

        state.ignoredCount = ignoredIssues.length;
        state.resetIgnoredLabel = t('issues.reset_ignored') + ' (' + ignoredIssues.length + ')';
    }

    function setNoIssuesText(selection) {

        var opts = getOptions();

        function checkForHiddenIssues(cases) {
            for (var type in cases) {
                var hiddenOpts = cases[type];
                var hiddenIssues = context.validator().getIssues(hiddenOpts);
                if (hiddenIssues.length) {
                    state.details = t('issues.no_issues.hidden_issues.' + type, { count: hiddenIssues.length.toString() });
                    return;
                }
            }
            state.details = t('issues.no_issues.hidden_issues.none');
        }

        var messageType;

        if (opts.what === 'edited' && opts.where === 'visible') {

            messageType = 'edits_in_view';

            checkForHiddenIssues({
                elsewhere: { what: 'edited', where: 'all' },
                everything_else: { what: 'all', where: 'visible' },
                disabled_rules: { what: 'edited', where: 'visible', includeDisabledRules: 'only' },
                everything_else_elsewhere: { what: 'all', where: 'all' },
                disabled_rules_elsewhere: { what: 'edited', where: 'all', includeDisabledRules: 'only' },
                ignored_issues: { what: 'edited', where: 'visible', includeIgnored: 'only' },
                ignored_issues_elsewhere: { what: 'edited', where: 'all', includeIgnored: 'only' }
            });

        } else if (opts.what === 'edited' && opts.where === 'all') {

            messageType = 'edits';

            checkForHiddenIssues({
                everything_else: { what: 'all', where: 'all' },
                disabled_rules: { what: 'edited', where: 'all', includeDisabledRules: 'only' },
                ignored_issues: { what: 'edited', where: 'all', includeIgnored: 'only' }
            });

        } else if (opts.what === 'all' && opts.where === 'visible') {

            messageType = 'everything_in_view';

            checkForHiddenIssues({
                elsewhere: { what: 'all', where: 'all' },
                disabled_rules: { what: 'all', where: 'visible', includeDisabledRules: 'only' },
                disabled_rules_elsewhere: { what: 'all', where: 'all', includeDisabledRules: 'only' },
                ignored_issues: { what: 'all', where: 'visible', includeIgnored: 'only' },
                ignored_issues_elsewhere: { what: 'all', where: 'all', includeIgnored: 'only' }
            });
        } else if (opts.what === 'all' && opts.where === 'all') {

            messageType = 'everything';

            checkForHiddenIssues({
                disabled_rules: { what: 'all', where: 'all', includeDisabledRules: 'only' },
                ignored_issues: { what: 'all', where: 'all', includeIgnored: 'only' }
            });
        }

        if (opts.what === 'edited' && context.history().difference().summary().length === 0) {
            messageType = 'no_edits';
        }

        state.message = t('issues.no_issues.message.' + messageType);

    }

    context.validator().on('validated.uiSectionValidationStatus', function() {
        window.requestIdleCallback(section.reRender);
    });

    context.map().on('move.uiSectionValidationStatus',
        _debounce(function() {
            window.requestIdleCallback(section.reRender);
        }, 1000)
    );

    return section;
}
