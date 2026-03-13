import { dispatch as d3_dispatch } from 'd3-dispatch';
import { select as d3_select } from 'd3-selection';
import { reactive } from 'vue';

import { prefs } from '../../core/preferences';
import { svgIcon } from '../../svg/icon';
import { utilArrayIdentical } from '../../util/array';
import { t } from '../../core/localizer';
import { utilHighlightEntities, utilRebind } from '../../util';
import { uiSection } from '../section';
import { validationIssue } from '../../core/validation';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import EntityIssuesSection from '../vue/EntityIssuesSection.vue';

export function uiSectionEntityIssues(context) {
    var preference = prefs('entity-issues.reference.expanded');
    var _expanded = preference === null ? true : (preference === 'true');
    var _entityIDs = [];
    var _issues = [];
    var _activeIssueID;
    var _registrationId;

    const state = reactive({
        issuesView: [],
        activeIssueID: null,
        onIssueHover: function(issue, val) {
            var ids = issue.entityIds.filter(function(e) { return _entityIDs.indexOf(e) === -1; });
            utilHighlightEntities(ids, val, context);
        },
        onIssueClick: function(issue) {
            makeActiveIssue(issue.id);
            const found = _issues.find(d => d.id === issue.id);
            const extent = found && found.extent(context.graph());
            if (extent) context.map().zoomToEase(extent);
        },
        toggleInfo: function(issueID) {
            const issue = state.issuesView.find(d => d.id === issueID);
            if (!issue) return;
            issue.expanded = !issue.expanded;
            _expanded = issue.expanded;
            prefs('entity-issues.reference.expanded', _expanded);
        },
        onFixHover: function(fix, val) {
            utilHighlightEntities(fix.entityIds || [], val, context);
        },
        onFixClick: function(issueView, fixView) {
            if (!fixView.onClick) return;
            if (fixView.issue.dateLastRanFix && new Date() - fixView.issue.dateLastRanFix < 1000) return;
            fixView.issue.dateLastRanFix = new Date();
            utilHighlightEntities(fixView.issue.entityIds.concat(fixView.entityIds || []), false, context);
            new Promise(function(resolve, reject) {
                fixView.onClick(context, resolve, reject);
                if (fixView.onClick.length <= 1) resolve();
            }).then(function() {
                context.validator().validate();
            });
        }
    });

    var section = uiSection('entity-issues', context)
        .shouldDisplay(function() {
            return _issues.length > 0;
        })
        .label(function() {
            return t.append('inspector.title_count', { title: t('issues.list_title'), count: _issues.length });
        })
        .disclosureContent(renderDisclosureContent);

    context.validator()
        .on('validated.entity_issues', function() {
            reloadIssues();
            section.reRender();
        })
        .on('focusedIssue.entity_issues', function(issue) {
             makeActiveIssue(issue.id);
        });

    function renderSelectionToText(fn) {
        if (typeof fn !== 'function') return '';
        var div = document.createElement('div');
        fn(d3_select(div));
        return div.textContent || '';
    }

    function renderSelectionToHTML(fn) {
        if (typeof fn !== 'function') return t('inspector.no_documentation_key');
        var div = document.createElement('div');
        fn(d3_select(div));
        return div.innerHTML;
    }

    function reloadIssues() {
        _issues = context.validator().getSharedEntityIssues(_entityIDs, { includeDisabledRules: true });
    }

    function makeActiveIssue(issueID) {
        _activeIssueID = issueID;
        state.activeIssueID = issueID;
    }

    function renderDisclosureContent(selection) {
        selection.classed('grouped-items-area', true);
        _activeIssueID = _issues.length > 0 ? _issues[0].id : null;
        state.activeIssueID = _activeIssueID;

        state.issuesView = _issues.map(function(issue) {
            return {
                id: issue.id,
                key: issue.key,
                severity: issue.severity,
                icon: validationIssue.ICONS[issue.severity],
                message: renderSelectionToText(issue.message(context)),
                entityIds: issue.entityIds,
                expanded: _expanded,
                referenceHtml: renderSelectionToHTML(issue.reference),
                fixes: (issue.fixes ? issue.fixes(context) : []).map(function(fix) {
                    var iconName = fix.icon || 'iD-icon-wrench';
                    if (iconName.startsWith('maki')) iconName += '-15';
                    return {
                        id: fix.id,
                        icon: '#' + iconName,
                        title: renderSelectionToText(fix.title),
                        disabledReason: fix.disabledReason,
                        onClick: fix.onClick,
                        entityIds: fix.entityIds,
                        issue: issue
                    };
                })
            };
        });

        if (!isVueAppInitialized()) return;
        if (_registrationId) unregisterComponent(_registrationId);
        _registrationId = registerComponent(EntityIssuesSection, selection.node(), { state: state });
    }

    section.entityIDs = function(val) {
        if (!arguments.length) return _entityIDs;
        if (!_entityIDs || !val || !utilArrayIdentical(_entityIDs, val)) {
            _entityIDs = val;
            _activeIssueID = null;
            reloadIssues();
        }
        return section;
    };

    section.unmount = function() {
        if (_registrationId) {
            unregisterComponent(_registrationId);
            _registrationId = null;
        }
    };

    return utilRebind(section, d3_dispatch(), 'on');
}
