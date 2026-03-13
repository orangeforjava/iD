import { createApp } from 'vue';
import { select as d3_select } from 'd3-selection';

import { t } from './../core/localizer';
import { utilKeybinding } from '../util';
import ModalFrame from './vue/ModalFrame.vue';


export function uiModal(selection, blocking) {
  let keybinding = utilKeybinding('modal');
  let previous = selection.select('div.shaded');
  let animate = previous.empty();

  previous.transition()
    .duration(200)
    .style('opacity', 0)
    .remove();

  let shaded = selection
    .append('div')
    .attr('class', 'shaded')
    .style('opacity', 0);

  let app = null;
  let modal = null;

  function moveFocusToFirst() {
    let node = modal
      .select('a, button, input:not(.keytrap), select, textarea')
      .node();

    if (node) {
      node.focus();
    } else {
      d3_select(this).node().blur();
    }
  }

  function moveFocusToLast() {
    let nodes = modal
      .selectAll('a, button, input:not(.keytrap), select, textarea')
      .nodes();

    if (nodes.length) {
      nodes[nodes.length - 1].focus();
    } else {
      d3_select(this).node().blur();
    }
  }

  function cleanupBindings() {
    d3_select(document).call(keybinding.unbind);
    if (app) {
      app.unmount();
      app = null;
    }
  }

  shaded.close = () => {
    shaded
      .transition()
      .duration(200)
      .style('opacity', 0)
      .on('end', function() {
        cleanupBindings();
        d3_select(this).remove();
      });

    if (modal) {
      modal
        .transition()
        .duration(200)
        .style('top', '0px');
    }
  };

  app = createApp(ModalFrame, {
    state: {
      close: shaded.close,
      moveFocusToFirst: moveFocusToFirst,
      moveFocusToLast: moveFocusToLast
    },
    blocking: !!blocking,
    closeTitle: t('icons.close')
  });
  app.mount(shaded.node());

  modal = shaded.select('div.modal');

  if (!blocking) {
    shaded.on('click.remove-modal', function(d3_event) {
      if (d3_event.target === this) {
        shaded.close();
      }
    });

    keybinding
      .on('⌫', shaded.close)
      .on('⎋', shaded.close);

    d3_select(document)
      .call(keybinding);
  }

  if (animate) {
    shaded.transition().style('opacity', 1);
  } else {
    shaded.style('opacity', 1);
  }

  let remove = shaded.remove;
  shaded.remove = function() {
    cleanupBindings();
    return remove.call(shaded);
  };

  return shaded;
}
