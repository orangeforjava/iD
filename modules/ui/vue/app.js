/**
 * Singleton Vue App Manager
 *
 * Creates and manages a single Vue 3 application instance for the entire
 * iD editor UI. Individual components are rendered at their d3-created
 * DOM locations via Vue's <Teleport>.
 *
 * Architecture:
 *
 *   ┌─ Vue App (single instance, mounted on hidden root) ────────┐
 *   │  VueRoot.vue                                                │
 *   │    ├─ <Teleport to=".zoombuttons">                          │
 *   │    │    └─ <ZoomControls />                                 │
 *   │    ├─ <Teleport to=".version-li">                           │
 *   │    │    └─ <VersionDisplay />                               │
 *   │    └─ ... (more teleported components)                      │
 *   └────────────────────────────────────────────────────────────┘
 *
 * Benefits over per-component createApp():
 * - Single Vue runtime instance (shared plugins, directives, provide/inject)
 * - Components can communicate via Vue's native mechanisms
 * - One shared provide(contextKey, context) for all components
 * - Proper cleanup on ui.restart() — one app.unmount() clears everything
 */

import { createApp, reactive, markRaw } from 'vue';
import VueRoot from './VueRoot.vue';
import { contextKey } from './bridge';

let _app = null;
let _state = null;
let _mountEl = null;
let _counter = 0;


/**
 * Initialize the singleton Vue app.
 * Call this once after iD context is created, before UI components render.
 *
 * @param {object} context - iD context object
 * @param {HTMLElement} container - iD container element (e.g. #id-container)
 */
export function initVueApp(context, container) {
  // Teardown previous instance if ui.restart() is called
  if (_app) {
    destroyVueApp();
  }

  _state = reactive({
    components: []   // { id, component, target, props }
  });

  _app = createApp(VueRoot, { state: _state });

  // Provide iD context to ALL Vue components via single inject point
  _app.provide(contextKey, context);

  // Mount on a hidden element inside the iD container.
  // The root itself renders nothing visible — all output goes through Teleport.
  _mountEl = document.createElement('div');
  _mountEl.id = 'vue-root';
  _mountEl.setAttribute('style', 'display:none');
  container.appendChild(_mountEl);

  _app.mount(_mountEl);
}


/**
 * Destroy the singleton Vue app and clean up all components.
 * Called on ui.restart() before re-initialization.
 */
export function destroyVueApp() {
  if (_app) {
    _app.unmount();
    _app = null;
  }
  if (_mountEl && _mountEl.parentNode) {
    _mountEl.parentNode.removeChild(_mountEl);
    _mountEl = null;
  }
  if (_state) {
    _state.components = [];
    _state = null;
  }
  _counter = 0;
}


/**
 * Register a Vue component to be teleported to a target DOM element.
 *
 * @param {import('vue').Component} component - Vue SFC component (raw, not reactive)
 * @param {HTMLElement} target - DOM element to teleport into
 * @param {object} [props] - Props to pass to the component
 * @returns {string} Component registration ID (for later removal)
 */
export function registerComponent(component, target, props) {
  if (!_state) {
    // Vue app not initialized (e.g. in test environment).
    // Return a dummy ID — the component simply won't render.
    return 'vue-noop';
  }

  var id = 'vue-c-' + (++_counter);

  _state.components.push({
    id: id,
    component: markRaw(component),
    target: target,
    props: props || {}
  });

  return id;
}


/**
 * Unregister a component by its registration ID.
 * The component will be unmounted and its teleport removed.
 *
 * @param {string} id - Registration ID returned by registerComponent()
 */
export function unregisterComponent(id) {
  if (!_state) return;

  var idx = _state.components.findIndex(function(c) { return c.id === id; });
  if (idx !== -1) {
    _state.components.splice(idx, 1);
  }
}
