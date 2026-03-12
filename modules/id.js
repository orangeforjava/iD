// Import CSS (Vite handles this via PostCSS pipeline)
import '../css/index.css';

// Element Plus component CSS (imported per-component to minimize bundle size)
// These go through Vite's CSS pipeline but node_modules CSS is excluded from
// the PostCSS .ideditor prefix transform (see postcss.config.js)
import 'element-plus/theme-chalk/el-tooltip.css';
import 'element-plus/theme-chalk/el-popper.css';

// polyfill window.fetch and AbortController (not included in core-js)
import 'whatwg-fetch';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';

// polyfill idle callback functions (not included in core-js)
window.requestIdleCallback = window.requestIdleCallback ||
    function(cb) {
        var start = Date.now();
        return window.requestAnimationFrame(function() {
            cb({
                didTimeout: false,
                timeRemaining: function() {
                    return Math.max(0, 50 - (Date.now() - start));
                }
            });
        });
    };
window.cancelIdleCallback = window.cancelIdleCallback ||
    function(id) {
        window.cancelAnimationFrame(id);
    };


import * as iD from './index';
import { initVueApp } from './ui/vue/app';
window.iD = iD;

// Bootstrap the application
var container = document.getElementById('id-container');

// Apply document-level styles for standalone iD
// (these must not go through the PostCSS .ideditor prefix pipeline)
var docStyle = document.createElement('style');
docStyle.textContent = 'html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }';
document.head.appendChild(docStyle);
if (typeof iD === 'undefined' || !iD.utilDetect().support) {
  container.innerHTML = 'Sorry, your browser is not currently supported. Please use another <a href="https://github.com/openstreetmap/iD#basics">browser</a> or <a href="https://wiki.openstreetmap.org/wiki/Editors">editor</a> to contribute to the map.';
  container.style.padding = '20px';

} else {
  // In dev mode, Vite serves from project root; in build mode, assets are in dist/
  var assetPrefix = import.meta.env.DEV ? 'dist/' : '';
  var context = iD.coreContext()
    .assetPath(assetPrefix)
    .containerNode(container);
  window.context = context;  // for debugging
  window.id = context;

  // Initialize the singleton Vue app before UI rendering.
  // Vue components registered via mountVueComponent() will be teleported
  // into d3-created DOM nodes by the VueRoot component.
  if (container) {
    initVueApp(context, container);
  }

  context.init();

  // disable boundaries (unless we have an explicit disable_features list)
  var q = iD.utilStringQs(window.location.hash);
  if (!q.hasOwnProperty('disable_features')) {
    context.features().disable('boundaries');
  }
}
