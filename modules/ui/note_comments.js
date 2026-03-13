import { reactive } from 'vue';

import { prefs } from '../core/preferences';
import { t } from '../core/localizer';
import { services } from '../services';
import { localeDateString } from '../util/date';
import { mountVueComponent } from './vue/bridge';
import NoteCommentsList from './vue/NoteCommentsList.vue';


export function uiNoteComments() {
    var state = reactive({
        note: null,
        comments: []
    });

    var render = mountVueComponent(NoteCommentsList, {}, { state: state });

    function noteComments(selection) {
        if (!state.note || state.note.isNew()) return;
        loadComments();
        render(selection);
    }

    function loadComments() {
        var osm = services.osm;
        state.comments = (state.note.comments || []).map(function(d) {
            return {
                uid: d.uid,
                user: d.user,
                userUrl: (osm && d.user) ? osm.userURL(d.user) : '',
                dateHtml: t.html('note.status.' + d.action, {
                    when: localeDateString(d.date.replace(' UTC', 'Z').replace(' ', 'T'))
                }),
                html: (d.html || '').replace(/<a /g, '<a rel="noopener nofollow" target="_blank" '),
                imageUrl: ''
            };
        });

        var showThirdPartyIcons = prefs('preferences.privacy.thirdpartyicons') || 'true';
        if (showThirdPartyIcons !== 'true' || !osm) return;

        var uids = {};
        state.note.comments.forEach(function(d) {
            if (d.uid) uids[d.uid] = true;
        });

        Object.keys(uids).forEach(function(uid) {
            osm.loadUser(uid, function(err, user) {
                if (!user || !user.image_url) return;
                state.comments = state.comments.map(function(comment) {
                    if (String(comment.uid) === String(uid)) {
                        return Object.assign({}, comment, {
                            imageUrl: user.image_url,
                            user: user.display_name || comment.user
                        });
                    }
                    return comment;
                });
            });
        });
    }

    noteComments.note = function(val) {
        if (!arguments.length) return state.note;
        state.note = val;
        return noteComments;
    };

    noteComments.unmount = render.unmount;

    return noteComments;
}
