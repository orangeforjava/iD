import { select as d3_select } from 'd3-selection';
import { marked } from 'marked';
import { reactive } from 'vue';

import { t, localizer } from '../core/localizer';
import { svgIcon } from '../svg/icon';
import { icon } from './intro/helper';
import { isVueAppInitialized, registerComponent, unregisterComponent } from './vue/app';
import FieldHelpPanel from './vue/FieldHelpPanel.vue';


// This currently only works with the 'restrictions' field
export function uiFieldHelp(context, fieldName) {
  var fieldHelp = {};
  var _inspector = d3_select(null);
  var _wrap = d3_select(null);
  var _body = d3_select(null);
  var _registrationId = null;

  var fieldHelpKeys = {
    restrictions: [
      ['about', ['about', 'from_via_to', 'maxdist', 'maxvia']],
      ['inspecting', ['about', 'from_shadow', 'allow_shadow', 'restrict_shadow', 'only_shadow', 'restricted', 'only']],
      ['modifying', ['about', 'indicators', 'allow_turn', 'restrict_turn', 'only_turn']],
      ['tips', ['simple', 'simple_example', 'indirect', 'indirect_example', 'indirect_noedit']]
    ]
  };

  var replacements = {
    distField: { html: t.html('restriction.controls.distance') },
    viaField: { html: t.html('restriction.controls.via') },
    fromShadow: { html: icon('#iD-turn-shadow', 'inline shadow from') },
    allowShadow: { html: icon('#iD-turn-shadow', 'inline shadow allow') },
    restrictShadow: { html: icon('#iD-turn-shadow', 'inline shadow restrict') },
    onlyShadow: { html: icon('#iD-turn-shadow', 'inline shadow only') },
    allowTurn: { html: icon('#iD-turn-yes', 'inline turn') },
    restrictTurn: { html: icon('#iD-turn-no', 'inline turn') },
    onlyTurn: { html: icon('#iD-turn-only', 'inline turn') }
  };

  var docs = fieldHelpKeys[fieldName].map(function(key) {
    var helpkey = 'help.field.' + fieldName + '.' + key[0];
    var text = key[1].reduce(function(all, part) {
      return all + t.html(helpkey + '.' + part, replacements) + '\n\n';
    }, '');

    return {
      key: helpkey,
      title: t.html(helpkey + '.title'),
      html: marked(text.trim()),
      partKeys: key[1]
    };
  });

  var state = reactive({
    docs: docs,
    activeIndex: 0,
    titleClass: localizer.textDirection() === 'rtl' ? 'fr' : 'fl',
    titleText: t('help.field.' + fieldName + '.title'),
    inspectImg: context.imagePath('tr_inspect.gif'),
    modifyImg: context.imagePath('tr_modify.gif'),
    hide: hide
  });

  function show() {
    updatePosition();
    _body
      .classed('hide', false)
      .style('opacity', '0')
      .transition()
      .duration(200)
      .style('opacity', '1');
  }

  function hide() {
    _body
      .classed('hide', true)
      .transition()
      .duration(200)
      .style('opacity', '0')
      .on('end', function() {
        _body.classed('hide', true);
      });
  }

  fieldHelp.button = function(selection) {
    if (_body.empty()) return;

    var button = selection.selectAll('.field-help-button').data([0]);

    button.enter()
      .append('button')
      .attr('class', 'field-help-button')
      .call(svgIcon('#iD-icon-help'))
      .merge(button)
      .on('click', function(d3_event) {
        d3_event.stopPropagation();
        d3_event.preventDefault();
        if (_body.classed('hide')) {
          show();
        } else {
          hide();
        }
      });
  };

  function updatePosition() {
    var wrap = _wrap.node();
    var inspector = _inspector.node();
    if (!wrap || !inspector) return;
    var wRect = wrap.getBoundingClientRect();
    var iRect = inspector.getBoundingClientRect();

    _body.style('top', wRect.top + inspector.scrollTop - iRect.top + 'px');
  }

  fieldHelp.body = function(selection) {
    _wrap = selection.selectAll('.form-field-input-wrap');
    if (_wrap.empty()) return;

    _inspector = context.container().select('.sidebar .entity-editor-pane .inspector-body');
    if (_inspector.empty()) return;

    _body = _inspector.selectAll('.field-help-body').data([0]);

    var enter = _body.enter()
      .append('div')
      .attr('class', 'field-help-body hide');

    _body = _body.merge(enter);

    if (!isVueAppInitialized()) return;

    if (_registrationId) {
      unregisterComponent(_registrationId);
      _registrationId = null;
    }

    _registrationId = registerComponent(FieldHelpPanel, _body.node(), { state: state });
    state.activeIndex = 0;
  };

  fieldHelp.unmount = function() {
    if (_registrationId) {
      unregisterComponent(_registrationId);
      _registrationId = null;
    }
  };

  return fieldHelp;
}
