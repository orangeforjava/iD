import _debounce from 'lodash-es/debounce';
import { select as d3_select } from 'd3-selection';
import { reactive } from 'vue';

//import { actionNoop } from '../actions/noop';
import { geoSphericalDistance } from '../../geo';
import { svgIcon } from '../../svg/icon';
import { prefs } from '../../core/preferences';
import { t } from '../../core/localizer';
import { utilHighlightEntities } from '../../util';
import { uiSection } from '../section';
import { validationIssue } from '../../core/validation';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import ValidationIssuesSection from '../vue/ValidationIssuesSection.vue';

export function uiSectionValidationIssues(id, severity, context) {

    var _issues = [];
    var _registrationId;
    var state = reactive({
        severity: severity,
        issues: [],
        focusIssue: function(issue) { context.validator().focusIssue(issue); },
        hover: function(issue, val) { utilHighlightEntities(issue.entityIds, val, context); }
    });

    var section = uiSection(id, context)
        .label(function() {
            if (!_issues) return '';
            var issueCountText = _issues.length > 1000 ? '1000+' : String(_issues.length);
            return t.append('inspector.title_count', { title: t('issues.' + severity + 's.list_title'), count: issueCountText });
        })
        .disclosureContent(renderDisclosureContent)
        .shouldDisplay(function() {
            return _issues && _issues.length;
        });

    function getOptions() {
        return {
            what: prefs('validate-what') || 'edited',
            where: prefs('validate-where') || 'all'
        };
    }

    // get and cache the issues to display, unordered
    function reloadIssues() {
        _issues = context.validator().getIssuesBySeverity(getOptions())[severity];
    }

    function renderDisclosureContent(selection) {

        var center = context.map().center();
        var graph = context.graph();

        // sort issues by distance away from the center of the map
        var issues = _issues.map(function withDistance(issue) {
                var extent = issue.extent(graph);
                var dist = extent ? geoSphericalDistance(center, extent.center()) : 0;
                return Object.assign(issue, { dist: dist });
            })
            .sort(function byDistance(a, b) {
                return a.dist - b.dist;
            });

        // cut off at 1000
        issues = issues.slice(0, 1000);

        //renderIgnoredIssuesReset(_warningsSelection);

        state.issues = issues.map(function(issue) {
            var div = document.createElement('div');
            issue.message(context)(d3_select(div));
            return {
                key: issue.key,
                severity: issue.severity,
                icon: validationIssue.ICONS[issue.severity],
                message: div.textContent || '',
                raw: issue
            };
        });

        if (!isVueAppInitialized()) return;
        if (_registrationId) unregisterComponent(_registrationId);
        _registrationId = registerComponent(ValidationIssuesSection, selection.node(), { state: state });
    }

    context.validator().on('validated.uiSectionValidationIssues' + id, function() {
        window.requestIdleCallback(function() {
            reloadIssues();
            section.reRender();
        });
    });

    context.map().on('move.uiSectionValidationIssues' + id,
        _debounce(function() {
            window.requestIdleCallback(function() {
                if (getOptions().where === 'visible') {
                    // must refetch issues if they are viewport-dependent
                    reloadIssues();
                }
                // always reload list to re-sort-by-distance
                section.reRender();
            });
        }, 1000)
    );

    return section;
}
