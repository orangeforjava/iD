import { reactive } from 'vue';

import { presetManager } from '../../presets';
import { fileFetcher } from '../../core/file_fetcher';
import { t } from '../../core/localizer';
import { JXON } from '../../util/jxon';
import { actionDiscardTags } from '../../actions/discard_tags';
import { osmChangeset } from '../../osm';
import { uiSection } from '../section';
import { registerComponent, unregisterComponent, isVueAppInitialized } from '../vue/app';
import ChangesSection from '../vue/ChangesSection.vue';

import {
    utilDisplayName,
    utilDisplayType,
    utilEntityOrMemberSelector
} from '../../util';


export function uiSectionChanges(context) {
    var _discardTags = {};
    var _registrationId;
    var state = reactive({
        summary: [],
        downloadHref: '',
        downloadLabel: t('commit.download_changes'),
        onHover: function(change) {
            if (change.entity) {
                context.surface().selectAll(utilEntityOrMemberSelector([change.entity.id], context.graph())).classed('hover', true);
            }
        },
        onOut: function() {
            context.surface().selectAll('.hover').classed('hover', false);
        },
        onClick: function(change) {
            if (change.changeType !== 'deleted') {
                var entity = change.entity;
                context.map().zoomToEase(entity);
                context.surface().selectAll(utilEntityOrMemberSelector([entity.id], context.graph())).classed('hover', true);
            }
        }
    });
    fileFetcher.get('discarded')
        .then(function(d) { _discardTags = d; })
        .catch(function() { /* ignore */ });

    var section = uiSection('changes-list', context)
        .label(function() {
            var history = context.history();
            var summary = history.difference().summary();
            return t.append('inspector.title_count', { title: t('commit.changes'), count: summary.length });
        })
        .disclosureContent(renderDisclosureContent);

    function renderDisclosureContent(selection) {
        var history = context.history();
        var summary = history.difference().summary();

        var changeset = new osmChangeset().update({ id: undefined });
        var changes = history.changes(actionDiscardTags(history.difference(), _discardTags));

        delete changeset.id;  // Export without chnageset_id

        var data = JXON.stringify(changeset.osmChangeJXON(changes));
        var blob = new Blob([data], {type: 'text/xml;charset=utf-8;'});
        var fileName = 'changes.osc';

        state.downloadHref = window.URL.createObjectURL(blob);
        state.summary = summary.map(function(d) {
            var matched = presetManager.match(d.entity, d.graph);
            var name = utilDisplayName(d.entity) || '';
            return {
                id: d.entity.id,
                entity: d.entity,
                changeType: d.changeType,
                changeTypeHtml: t.html('commit.' + d.changeType),
                icon: '#iD-icon-' + d.entity.geometry(d.graph),
                entityType: (matched && matched.name()) || utilDisplayType(d.entity.id),
                entityName: (name !== '' ? ': ' : ' ') + name
            };
        });
        if (!isVueAppInitialized()) return;
        if (_registrationId) unregisterComponent(_registrationId);
        _registrationId = registerComponent(ChangesSection, selection.node(), { state: state });
    }

    section.unmount = function() {
        if (_registrationId) {
            unregisterComponent(_registrationId);
            _registrationId = null;
        }
    };

    return section;
}
