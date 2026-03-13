<template>
  <div class="header fillL">
    <button class="close" :title="t('icons.close')" @click="closeEditor">
      <svg class="icon"><use href="#iD-icon-close" /></svg>
    </button>
    <h2>{{ t('note.title') }}</h2>
  </div>

  <div class="body">
    <div ref="editorRef" class="modal-section note-editor"></div>
  </div>

  <div class="footer" ref="footerRef"></div>
</template>

<script setup>
import { select as d3_select } from 'd3-selection';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { t } from '../../core/localizer';
import { services } from '../../services';
import { modeBrowse } from '../../modes/browse';
import { osmNote } from '../../osm';
import { utilNoAuto } from '../../util';
import { uiNoteComments } from '../note_comments';
import { uiNoteHeader } from '../note_header';
import { uiNoteReport } from '../note_report';
import { uiViewOnOSM } from '../view_on_osm';
import { useContext } from './useContext';

const props = defineProps({ state: { type: Object, required: true } });
const { context } = useContext();
const editorRef = ref(null);
const footerRef = ref(null);

const noteComments = uiNoteComments(context);
const noteHeader = uiNoteHeader();
const viewOnOSM = uiViewOnOSM(context);
const noteReport = uiNoteReport();

function closeEditor() {
  context.enter(modeBrowse(context));
}

function rerenderAuth() {
  renderContent();
}

function clickCancel(note) {
  const osm = services.osm;
  if (osm) osm.removeNote(note);
  context.enter(modeBrowse(context));
  props.state.onChange(null, note);
}

function clickSave(note) {
  const osm = services.osm;
  if (osm) osm.postNoteCreate(note, (err, d) => props.state.onChange(err, d));
}

function postCommentAndStatus(note, newStatus) {
  const osm = services.osm;
  if (!osm) return;
  osm.postNoteUpdate(note, newStatus || note.status, function(err, d) {
    if (!err) {
      props.state.onChange(err, d);
    } else if (err.status === 409) {
      osm.loadEntityNote(note.id, (err2, dd) => {
        props.state.onChange(err2, osmNote({ ...dd.data[0], newComment: note.newComment }));
      });
    } else if (err.status === 410) {
      osm.removeNote(note);
      props.state.onChange(err, osmNote({ id: note.id, status: 'hidden', comments: [...note.comments, { action: 'hidden' }] }));
    }
  });
}

async function renderContent() {
  await nextTick();
  const note = props.state.note;
  if (editorRef.value) {
    const selection = d3_select(editorRef.value).html('');
    selection.call(noteHeader.note(note));
    selection.call(noteComments.note(note));

    const isSelected = note && note.id === context.selectedNoteID();
    const shown = isSelected ? [note].filter(d => d.status !== 'hidden') : [];
    if (shown.length) {
      const noteSave = selection.append('div').attr('class', 'note-save save-section cf');
      noteSave.append('h4').text(note.isNew() ? t('note.newDescription') : t('note.newComment'));

      const textarea = noteSave.append('textarea')
        .attr('class', 'new-comment-input')
        .attr('placeholder', t('note.inputPlaceholder'))
        .attr('maxlength', 1000)
        .property('value', note.newComment)
        .call(utilNoAuto)
        .on('keydown.note-input', keydown)
        .on('input.note-input', changeInput)
        .on('blur.note-input', changeInput);

      if (props.state.newNote) {
        textarea.node().focus();
      }

      renderUserDetails(noteSave, note);
      renderButtons(noteSave, note);
    }
  }

  if (footerRef.value) {
    d3_select(footerRef.value).html('')
      .call(viewOnOSM.what(note))
      .call(noteReport.note(note));
  }

  function keydown(e) {
    if (!(e.keyCode === 13 && e.metaKey)) return;
    const osm = services.osm;
    if (!osm || !osm.authenticated() || !props.state.note.newComment) return;
    e.preventDefault();
    window.setTimeout(function() {
      if (props.state.note.isNew()) {
        clickSave(props.state.note);
      } else {
        postCommentAndStatus(props.state.note);
      }
    }, 10);
  }

  function changeInput() {
    const input = d3_select(this);
    const val = input.property('value').trim() || undefined;
    props.state.note = props.state.note.update({ newComment: val });
    const osm = services.osm;
    if (osm) osm.replaceNote(props.state.note);
    renderContent();
  }
}

function renderUserDetails(selection, note) {
  const detailSection = selection.append('div').attr('class', 'detail-section');
  const osm = services.osm;
  if (!osm) return;
  const hasAuth = osm.authenticated();

  if (!hasAuth) {
    const authWarning = detailSection.append('div').attr('class', 'field-warning auth-warning');
    authWarning.append('svg').attr('class', 'icon inline').append('use').attr('href', '#iD-icon-alert');
    authWarning.append('span').text(t('note.login'));
    authWarning.append('a').attr('target', '_blank').attr('href', '#').on('click', function(e) {
      e.preventDefault();
      osm.authenticate();
    }).text(t('login'));
    return;
  }

  const prose = detailSection.append('p').attr('class', 'note-save-prose').text(t('note.upload_explanation'));
  osm.userDetails(function(err, user) {
    if (err) return;
    let userHtml = '';
    if (user.image_url) {
      userHtml += `<img src="${user.image_url}" class="icon pre-text user-icon">`;
    }
    userHtml += `<a class="user-info" href="${osm.userURL(user.display_name)}" target="_blank">${user.display_name}</a>`;
    prose.html(t.html('note.upload_explanation_with_user', { user: { html: userHtml } }));
  });
}

function renderButtons(selection, note) {
  const osm = services.osm;
  const hasAuth = osm && osm.authenticated();
  const buttons = selection.append('div').attr('class', 'buttons');

  if (note.isNew()) {
    buttons.append('button')
      .attr('class', 'button cancel-button secondary-action')
      .text(t('confirm.cancel'))
      .on('click', function() { this.blur(); clickCancel(note); });
    buttons.append('button')
      .attr('class', 'button save-button action')
      .text(t('note.save'))
      .attr('disabled', hasAuth && note.status === 'open' && note.newComment ? null : true)
      .on('click', function() { this.blur(); clickSave(note); });
  } else {
    const action = note.status === 'open' ? 'close' : 'open';
    const andComment = note.newComment ? '_comment' : '';
    buttons.append('button')
      .attr('class', 'button status-button action')
      .attr('disabled', hasAuth ? null : true)
      .html(t.html('note.' + action + andComment))
      .on('click', function() { this.blur(); postCommentAndStatus(note, note.status === 'open' ? 'closed' : 'open'); });
    buttons.append('button')
      .attr('class', 'button comment-button action')
      .text(t('note.comment'))
      .attr('disabled', hasAuth && note.status === 'open' && note.newComment ? null : true)
      .on('click', function() { this.blur(); postCommentAndStatus(note); });
  }
}

onMounted(renderContent);
onMounted(() => {
  const osm = services.osm;
  if (osm) osm.on('change.note-save', rerenderAuth);
});
onUnmounted(() => {
  const osm = services.osm;
  if (osm) osm.on('change.note-save', null);
});
watch(() => [props.state.note, props.state.newNote, context.selectedNoteID()], renderContent, { deep: true });
</script>
