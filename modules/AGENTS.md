# Modules Guide for Agents

This document provides detailed guidance for AI coding agents working on iD's module code.

## Module Directory Map

| Directory | Pattern | Signature | Description |
|-----------|---------|-----------|-------------|
| `actions/` | Higher-order function | `(config) => (graph) => newGraph` | Pure graph transformations |
| `behavior/` | d3 behavior | `(context) => { install, uninstall }` | Reusable interaction handlers |
| `core/` | Factory function | `(context) => { methods... }` | Data structures and managers |
| `geo/` | Pure utility | `(args) => result` | Geographic calculations |
| `modes/` | State machine | `{ enter(), exit(), id }` | Editor interaction states |
| `operations/` | Action wrapper | `(context, selectedIDs) => { operation(), available(), disabled() }` | UI-wrapped actions |
| `osm/` | Class (with instanceof trick) | `osmNode({id, loc, tags})` | OSM data model entities |
| `presets/` | Manager singleton | `presetManager.match(entity, graph)` | Tag-based feature classification |
| `renderer/` | d3 component | `rendererMap(context)` | Map rendering and projection |
| `services/` | Singleton module | `{ init(), reset(), loadTiles() }` | External API integrations |
| `svg/` | d3 render function | `svgPoints(projection, context)` | SVG element rendering |
| `ui/` | d3 reusable component | `(selection) => { /* d3 DOM ops */ }` | Non-map UI components |
| `util/` | Pure utility | `(args) => result` | General helper functions |
| `validations/` | Validator function | `(entity, graph) => issues[]` | Data quality rules |

## How to Add New Code

### Adding a New Action (`actions/`)

1. Create `modules/actions/my_action.js`:
```js
export function actionMyAction(entityId, options) {
  var action = function(graph) {
    var entity = graph.entity(entityId);
    // Transform graph immutably
    return graph.replace(entity.update({ /* new props */ }));
  };

  // Optional: disable check returns a reason string or false
  action.disabled = function(graph) {
    if (/* invalid state */) return 'reason_string';
    return false;
  };

  return action;
}
```

2. Export from `modules/actions/index.js`
3. Add tests in `test/spec/actions/my_action.js`

### Adding a New Validation (`validations/`)

1. Create `modules/validations/my_check.js`:
```js
export function validationMyCheck(context) {
  var type = 'my_check';

  var validation = function checkMyRule(entity, graph) {
    var issues = [];
    // Check entity for problems, push validationIssue objects
    if (problem) {
      issues.push(new validationIssue({
        type: type,
        subtype: 'specific_subtype',
        severity: 'warning',  // or 'error'
        message: function(context) { return t.append('issues.my_check.message'); },
        reference: showReference,
        entityIds: [entity.id],
        fixes: [
          new validationIssueFix({
            title: t.append('issues.fix.do_something.title'),
            onClick: function(context) { /* apply fix */ }
          })
        ]
      }));
    }
    return issues;
  };

  validation.type = type;
  return validation;
}
```

2. Export from `modules/validations/index.js`
3. Register in `modules/core/validator.js` (in the validations list)
4. Add localized strings to `data/core.yaml` under `issues.my_check`
5. Add tests in `test/spec/validations/my_check.js`

### Adding a New Operation (`operations/`)

1. Create `modules/operations/my_operation.js`:
```js
export function operationMyOperation(context, selectedIDs) {
  var operation = function() {
    // Execute the action
    context.perform(actionMyAction(selectedIDs[0]), operation.annotation());
    // Optionally change mode
    context.enter(modeSelect(context, selectedIDs));
  };

  operation.available = function() {
    // Return true if this operation should appear in menu
    return selectedIDs.length === 1;
  };

  operation.disabled = function() {
    // Return a reason string or false
    var action = actionMyAction(selectedIDs[0]);
    return action.disabled(context.graph());
  };

  operation.tooltip = function() {
    var disable = operation.disabled();
    return disable ? t('operations.my_operation.' + disable) :
      t('operations.my_operation.description');
  };

  operation.annotation = function() {
    return t('operations.my_operation.annotation');
  };

  operation.id = 'my_operation';
  operation.keys = [t('operations.my_operation.key')];
  operation.title = t('operations.my_operation.title');
  operation.behavior = behaviorOperation(context).which(operation);

  return operation;
}
```

2. Export from `modules/operations/index.js`
3. Register in the appropriate mode's `operations()` list (e.g., `modes/select.js`)
4. Add localized strings to `data/core.yaml`
5. Add tests in `test/spec/operations/my_operation.js`

### Adding a New Mode (`modes/`)

1. Create `modules/modes/my_mode.js`:
```js
export function modeMyMode(context) {
  var mode = {
    id: 'my_mode',
    button: 'my_mode'
  };

  var _behaviors = [];

  mode.enter = function() {
    _behaviors = [
      behaviorHover(context),
      // ... other behaviors
    ];
    _behaviors.forEach(context.install);
  };

  mode.exit = function() {
    _behaviors.forEach(context.uninstall);
  };

  return mode;
}
```

2. Export from `modules/modes/index.js`
3. Trigger via `context.enter(modeMyMode(context))`

### Adding a New Service (`services/`)

1. Create `modules/services/my_service.js`:
```js
import { dispatch as d3_dispatch } from 'd3-dispatch';
import RBush from 'rbush';

var dispatch = d3_dispatch('loaded', 'change');
var _cache = {};

function _resetCache() {
  _cache = { loaded: {}, inflight: {}, rtree: new RBush() };
}

export default {
  init: function() { _resetCache(); },
  reset: function() { _resetCache(); },
  // API methods...
};
```

2. Register in `modules/services/index.js`
3. Access via `context.services.my_service`

## Key Patterns to Follow

### Immutability

**Always** create new objects instead of mutating:
```js
// CORRECT
var newNode = node.update({ tags: Object.assign({}, node.tags, { name: 'New' }) });
graph = graph.replace(newNode);

// WRONG - never do this
node.tags.name = 'New';  // Mutation!
```

### d3-dispatch Events

Use d3-dispatch for loosely-coupled communication:
```js
var dispatch = d3_dispatch('change', 'reset');

// Emit
dispatch.call('change', this, data);

// Listen (often via utilRebind)
utilRebind(myModule, dispatch, 'on');
myModule.on('change', handler);
```

### Context Threading

Most functions receive `context` as their first parameter:
```js
export function myFunction(context) {
  var history = context.history();
  var graph = history.graph();
  var map = context.map();
  var presets = context.presets();
}
```

### Localization

All user-facing strings go through the `t()` function:
```js
import { t } from '../core/localizer';

// Returns translated string
var label = t('modes.browse.title');

// Returns function that appends translated content to selection
var appendLabel = t.append('modes.browse.title');
```

String keys are defined in `data/core.yaml`.

## Common Imports

```js
// Core
import { coreGraph } from '../core/graph';
import { coreHistory } from '../core/history';
import { t } from '../core/localizer';

// OSM entities
import { osmNode } from '../osm/node';
import { osmWay } from '../osm/way';
import { osmRelation } from '../osm/relation';

// d3
import { dispatch as d3_dispatch } from 'd3-dispatch';
import { select as d3_select } from 'd3-selection';
import { json as d3_json } from 'd3-fetch';

// Utilities
import { utilRebind } from '../util/rebind';
import { utilKeybinding } from '../util/keybinding';

// Geospatial
import { geoExtent } from '../geo/extent';
```

## File Naming Conventions

- Filenames use **snake_case**: `delete_node.js`, `close_nodes.js`
- Export names use **camelCase** with module prefix: `actionDeleteNode`, `validationCloseNodes`
- Module prefix matches directory name: `action*`, `behavior*`, `core*`, `mode*`, `operation*`, `osm*`, `svg*`, `ui*`, `validation*`
- Each file typically exports one main function
- Each directory has an `index.js` barrel file re-exporting all public APIs
