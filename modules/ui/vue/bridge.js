/**
 * Vue/d3 Bridge Utility
 *
 * Provides the glue between iD's d3-managed DOM tree and Vue 3 components.
 * All Vue components share a single app instance (managed by app.js).
 * This module provides:
 *
 * 1. `contextKey` — Symbol for provide/inject of iD context
 * 2. `mountVueComponent()` — Returns a d3 `.call()`-compatible function
 *    that registers a Vue component to be teleported into the d3 selection.
 *
 * Usage:
 *   import { mountVueComponent } from './vue/bridge';
 *   import ZoomControls from './vue/ZoomControls.vue';
 *
 *   export function uiZoom(context) {
 *     return mountVueComponent(ZoomControls, context);
 *   }
 */

import { registerComponent, unregisterComponent } from './app';

/** Symbol key for injecting iD context into Vue components */
export const contextKey = Symbol('iD-context');


/**
 * Create a d3 `.call()`-compatible function that renders a Vue component
 * into the d3 selection via the singleton Vue app's Teleport mechanism.
 *
 * @param {import('vue').Component} Component - Vue SFC component
 * @param {object} context - iD context (unused here, kept for API compat)
 * @param {object} [props] - Props to pass to the component
 * @returns {function} d3 call-compatible render function
 */
export function mountVueComponent(Component, context, props) {
  var _registrationId = null;

  function render(selection) {
    // Unregister previous if re-called
    if (_registrationId) {
      unregisterComponent(_registrationId);
      _registrationId = null;
    }

    // Register this component to be teleported to the selection's DOM node
    _registrationId = registerComponent(Component, selection.node(), props);
  }

  /**
   * Unregister the component (e.g. on ui.restart()).
   */
  render.unmount = function() {
    if (_registrationId) {
      unregisterComponent(_registrationId);
      _registrationId = null;
    }
  };

  return render;
}
