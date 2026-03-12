/**
 * Vue composable for accessing the iD editor context.
 *
 * Provides a clean, typed interface for Vue components to interact
 * with iD's core systems (map, history, services, etc.).
 *
 * Usage:
 *   import { useContext } from './useContext';
 *   const { context, map } = useContext();
 */

import { inject } from 'vue';
import { contextKey } from './bridge';


/**
 * Inject the iD context provided by the Vue/d3 bridge.
 *
 * @returns {{ context: object, map: function, history: function, connection: function }}
 */
export function useContext() {
  const context = inject(contextKey);
  if (!context) {
    throw new Error(
      '[useContext] iD context not found. ' +
      'Ensure this component is mounted via mountVueComponent().'
    );
  }

  return {
    /** The full iD context object */
    context,
    /** Shorthand for context.map() */
    map: () => context.map(),
    /** Shorthand for context.history() */
    history: () => context.history(),
    /** Shorthand for context.connection() */
    connection: () => context.connection(),
    /** Shorthand for context.keybinding() */
    keybinding: () => context.keybinding(),
    /** Shorthand for context.ui() */
    ui: () => context.ui(),
  };
}
