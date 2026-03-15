import { dispatch as d3_dispatch } from 'd3-dispatch';
import { select as d3_select } from 'd3-selection';

import { fileFetcher } from '../../core/file_fetcher';
import { t, localizer } from '../../core/localizer';
import { actionChangeTags } from '../../actions/change_tags';
import { services } from '../../services/index';
import { uiCombobox } from '../combobox';
import { mountVueComponent } from '../vue/bridge';
import WikipediaFieldShell from '../vue/WikipediaFieldShell.vue';
import { utilGetSetValue, utilNoAuto, utilRebind } from '../../util';


export function uiFieldWikipedia(field, context) {
  const scheme = 'https://';
  const domain = 'wikipedia.org';
  const dispatch = d3_dispatch('change');
  const wikipedia = services.wikipedia;
  const wikidata = services.wikidata;
  let _langInput = d3_select(null);
  let _titleInput = d3_select(null);
  let _wikiURL = '';
  let _entityIDs;
  let _tags;
  let _refs = null;
  let _renderVersion = 0;

  let _dataWikipedia = [];
  fileFetcher.get('wmf_sitematrix')
    .then(d => {
      _dataWikipedia = d;
      if (_tags) updateForTags(_tags);
    })
    .catch(() => { /* ignore */ });


  const langCombo = uiCombobox(context, 'wikipedia-lang')
    .fetcher((value, callback) => {
      const v = value.toLowerCase();
      callback(_dataWikipedia
        .filter(d => {
          return d[0].toLowerCase().indexOf(v) >= 0 ||
            d[1].toLowerCase().indexOf(v) >= 0 ||
            d[2].toLowerCase().indexOf(v) >= 0;
        })
        .map(d => ({ value: d[1] }))
      );
    });

  const titleCombo = uiCombobox(context, 'wikipedia-title')
    .fetcher((value, callback) => {
      if (!value) {
        value = '';
        for (let i in _entityIDs) {
          let entity = context.hasEntity(_entityIDs[i]);
          if (entity.tags.name) {
            value = entity.tags.name;
            break;
          }
        }
      }
      const searchfn = value.length > 7 ? wikipedia.search : wikipedia.suggestions;
      searchfn(language()[2], value, (query, data) => {
        callback( data.map(d => ({ value: d })) );
      });
      });


  const shellState = {
    domId: field.domId,
    languagePlaceholder: t('translate.localized_translation_language'),
    linkTitle: t('icons.view_on', { domain }),
    renderVersion: 0,
    setRefs: function(refs) {
      _refs = refs;
      _langInput = refs.langInput ? d3_select(refs.langInput) : d3_select(null);
      _titleInput = refs.titleInput ? d3_select(refs.titleInput) : d3_select(null);
    }
  };
  const renderShell = mountVueComponent(WikipediaFieldShell, context, { state: shellState });


  function wiki(selection) {
    shellState.renderVersion = ++_renderVersion;
    renderShell(selection);

    if (!_refs) {
      let wrap = selection.selectAll('.form-field-input-wrap')
        .data([0]);

      wrap = wrap.enter()
        .append('div')
        .attr('class', `form-field-input-wrap form-field-input-${field.type}`)
        .merge(wrap);

      let langContainer = wrap.selectAll('.wiki-lang-container')
        .data([0]);

      langContainer = langContainer.enter()
        .append('div')
        .attr('class', 'wiki-lang-container')
        .merge(langContainer);

      _langInput = langContainer.selectAll('input.wiki-lang')
        .data([0]);

      _langInput = _langInput.enter()
        .append('input')
        .attr('type', 'text')
        .attr('class', 'wiki-lang')
        .attr('placeholder', t('translate.localized_translation_language'))
        .merge(_langInput);

      let titleContainer = wrap.selectAll('.wiki-title-container')
        .data([0]);

      titleContainer = titleContainer.enter()
        .append('div')
        .attr('class', 'wiki-title-container')
        .merge(titleContainer);

      _titleInput = titleContainer.selectAll('input.wiki-title')
        .data([0]);

      _titleInput = _titleInput.enter()
        .append('input')
        .attr('type', 'text')
        .attr('dir', 'auto')
        .attr('class', 'wiki-title')
        .attr('id', field.domId)
        .merge(_titleInput);

      titleContainer.selectAll('.wiki-link')
        .data([0])
        .enter()
        .append('button')
        .attr('class', 'form-field-button wiki-link')
        .attr('title', t('icons.view_on', { domain }))
        .call(function(button) {
          button.append('svg').attr('class', 'icon').append('use').attr('href', '#iD-icon-out-link');
        });
    }

    _langInput
      .call(utilNoAuto)
      .call(langCombo)
      .attr('placeholder', t('translate.localized_translation_language'));

    _langInput
      .on('blur', changeLang)
      .on('change', changeLang);

    _titleInput
      .call(utilNoAuto)
      .call(titleCombo)
      .attr('id', field.domId);

    _titleInput
      .on('blur', function() {
        change(true);
      })
      .on('change', function() {
        change(false);
      });

    let link = _refs ? d3_select(_refs.linkButton) : selection.select('.wiki-link');

    link
      .on('click', (d3_event) => {
        d3_event.preventDefault();
        if (_wikiURL) window.open(_wikiURL, '_blank');
      });
  }


  function defaultLanguageInfo(skipEnglishFallback) {
    const langCode = localizer.languageCode().toLowerCase();

    for (let i in _dataWikipedia) {
      let d = _dataWikipedia[i];
      // default to the language of iD's current locale
      if (d[2] === langCode) return d;
    }

    // fallback to English
    return skipEnglishFallback ? ['', '', ''] : ['English', 'English', 'en'];
  }


  function language(skipEnglishFallback) {
    const value = utilGetSetValue(_langInput).toLowerCase();

    for (let i in _dataWikipedia) {
      let d = _dataWikipedia[i];
      // return the language already set in the UI, if supported
      if (d[0].toLowerCase() === value ||
        d[1].toLowerCase() === value ||
        d[2] === value) return d;
    }

    // fallback to English
    return defaultLanguageInfo(skipEnglishFallback);
  }


  function changeLang() {
    utilGetSetValue(_langInput, language()[1]);
    change(true);
  }


  function change(skipWikidata) {
    let value = utilGetSetValue(_titleInput);
    const m = value.match(/https?:\/\/([-a-z]+)\.wikipedia\.org\/(?:wiki|\1-[-a-z]+)\/([^#]+)(?:#(.+))?/);
    const langInfo = m && _dataWikipedia.find(d => m[1] === d[2]);
    let syncTags = {};

    if (langInfo) {
      const nativeLangName = langInfo[1];
      value = decodeURIComponent(m[2]).replace(/_/g, ' ');
      if (m[3]) {
        let anchor;
        anchor = decodeURIComponent(m[3]);
        value += '#' + anchor.replace(/_/g, ' ');
      }
      value = value.slice(0, 1).toUpperCase() + value.slice(1);
      utilGetSetValue(_langInput, nativeLangName)
        .attr('lang', langInfo[2]);
      utilGetSetValue(_titleInput, value);
    }

    if (value) {
      syncTags.wikipedia = context.cleanTagValue(language()[2] + ':' + value);
    } else {
      syncTags.wikipedia = undefined;
    }

    dispatch.call('change', this, syncTags);

    if (skipWikidata || !value || !language()[2]) return;

    const initGraph = context.graph();
    const initEntityIDs = _entityIDs;

    wikidata.itemsByTitle(language()[2], value, (err, data) => {
      if (err || !data || !Object.keys(data).length) return;
      if (context.graph() !== initGraph) return;

      const qids = Object.keys(data);
      const value = qids && qids.find(id => id.match(/^Q\d+$/));

      let actions = initEntityIDs.map((entityID) => {
        let entity = context.entity(entityID).tags;
        let currTags = Object.assign({}, entity);
        if (currTags.wikidata !== value) {
            currTags.wikidata = value;
            return actionChangeTags(entityID, currTags);
        }
        return null;
      }).filter(Boolean);

      if (!actions.length) return;

      context.replace(
        function actionUpdateWikidataTags(graph) {
          actions.forEach(function(action) {
            graph = action(graph);
          });
          return graph;
        },
        context.history().undoAnnotation()
      );
    });
  }


  wiki.tags = (tags) => {
    _tags = tags;
    updateForTags(tags);
  };

  function updateForTags(tags) {
    const value = typeof tags[field.key] === 'string' ? tags[field.key] : '';
    const m = value.match(/([^:]+):([^#]+)(?:#(.+))?/);
    const tagLang = m && m[1];
    const tagArticleTitle = m && m[2];
    let anchor = m && m[3];
    const tagLangInfo = tagLang && _dataWikipedia.find(d => tagLang === d[2]);

    if (tagLangInfo) {
      const nativeLangName = tagLangInfo[1];
      utilGetSetValue(_langInput, nativeLangName);
      _titleInput.attr('lang', tagLangInfo[2]);
      utilGetSetValue(_titleInput, tagArticleTitle + (anchor ? ('#' + anchor) : ''));
      _wikiURL = `${scheme}${tagLang}.${domain}/wiki/${wiki.encodePath(tagArticleTitle, anchor)}`;
    } else {
      utilGetSetValue(_titleInput, value);
      if (value && value !== '') {
        utilGetSetValue(_langInput, '');
        const defaultLangInfo = defaultLanguageInfo();
        _wikiURL = `${scheme}${defaultLangInfo[2]}.${domain}/w/index.php?fulltext=1&search=${value}`;
      } else {
        const shownOrDefaultLangInfo = language(true);
        utilGetSetValue(_langInput, shownOrDefaultLangInfo[1]);
        _wikiURL = '';
      }
    }
  }

  wiki.encodePath = (tagArticleTitle, anchor) => {
    const underscoredTitle = tagArticleTitle.replace(/ /g, '_');
    const uriEncodedUnderscoredTitle = encodeURIComponent(underscoredTitle);
    const uriEncodedAnchorFragment = wiki.encodeURIAnchorFragment(anchor);
    return `${uriEncodedUnderscoredTitle}${uriEncodedAnchorFragment}`;
  };

  wiki.encodeURIAnchorFragment = (anchor) => {
    if (!anchor) return '';
    const underscoredAnchor = anchor.replace(/ /g, '_');
    return '#' + encodeURIComponent(underscoredAnchor);
  };

  wiki.entityIDs = (val) => {
    if (!arguments.length) return _entityIDs;
    _entityIDs = val;
    return wiki;
  };


  wiki.focus = () => {
    _titleInput.node().focus();
  };


  wiki.unmount = renderShell.unmount;


  return utilRebind(wiki, dispatch, 'on');
}

uiFieldWikipedia.supportsMultiselection = false;
