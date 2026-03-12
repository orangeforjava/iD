# Testing Guide for Agents

This document provides guidance for AI coding agents working on iD's test suite.

## Test Infrastructure

| Component | Technology |
|-----------|------------|
| Test runner | **Vitest** 4.x with globals enabled |
| Assertions | **Chai** (expect/should style) with **sinon-chai** plugin |
| Mocking | **Sinon** (spies, stubs, fakes) |
| HTTP mocking | **fetch-mock** for fetch API, **nise** for XMLHttpRequest |
| DOM | **jsdom** environment |
| DOM events | **happen** library for triggering real DOM events |
| IndexedDB | **fake-indexeddb** |

## Running Tests

```bash
# Run tests in watch mode (re-runs on file changes)
npm run test:spec

# Run tests once (CI mode)
npm run test:once

# Full CI check: lint → build → typecheck → tests
npm test
```

**Important:** Tests use `--no-isolate` flag (all tests share one process). This is required because tests rely on shared global state initialized in `test/spec_helpers.ts`.

## Test File Structure

Tests mirror the source directory structure:

```
test/spec/
├── actions/       — Tests for modules/actions/
├── behavior/      — Tests for modules/behavior/
├── core/          — Tests for modules/core/
├── geo/           — Tests for modules/geo/
├── modes/         — Tests for modules/modes/
├── operations/    — Tests for modules/operations/
├── osm/           — Tests for modules/osm/
├── presets/       — Tests for modules/presets/
├── renderer/      — Tests for modules/renderer/
├── services/      — Tests for modules/services/
├── svg/           — Tests for modules/svg/
├── ui/            — Tests for modules/ui/ (including fields/, sections/)
├── util/          — Tests for modules/util/
└── validations/   — Tests for modules/validations/
```

## Writing Tests

### Basic Test Structure

```js
describe('iD.actionAddEntity', function() {
  it('adds an entity to the graph', function() {
    var entity = iD.osmNode();
    var graph = iD.actionAddEntity(entity)(iD.coreGraph());
    expect(graph.entity(entity.id)).to.equal(entity);
  });
});
```

### Tests with Setup/Teardown

```js
describe('iD.coreContext', function() {
  var context;

  beforeEach(function() {
    context = iD.coreContext();
  });

  afterEach(function() {
    // cleanup
  });

  it('sets and gets assetPath', function() {
    expect(context.assetPath()).to.eql('');
    context.assetPath('iD/');
    expect(context.assetPath()).to.eql('iD/');
  });
});
```

### Testing Graph Transformations (Actions)

The most common test pattern: create a graph, apply an action, verify the result.

```js
describe('iD.actionDeleteNode', function() {
  it('removes the node from the graph', function() {
    var node = iD.osmNode({ id: 'n1' });
    var graph = iD.coreGraph([node]);
    graph = iD.actionDeleteNode('n1')(graph);
    expect(graph.hasEntity('n1')).to.be.undefined;
  });

  it('removes the node from parent ways', function() {
    var node = iD.osmNode({ id: 'n1' });
    var way = iD.osmWay({ id: 'w1', nodes: ['n1', 'n2', 'n3'] });
    var graph = iD.coreGraph([node, iD.osmNode({id: 'n2'}), iD.osmNode({id: 'n3'}), way]);
    graph = iD.actionDeleteNode('n1')(graph);
    expect(graph.entity('w1').nodes).not.to.contain('n1');
  });
});
```

### Testing with Sinon Spies/Stubs

```js
it('dispatches a change event', function() {
  var spy = sinon.spy();
  history.on('change', spy);
  history.perform(someAction);
  expect(spy).to.have.been.called;
  expect(spy).to.have.been.calledWith(/* expected args */);
});
```

### Testing with DOM (d3 Selections)

```js
describe('iD.behaviorHover', function() {
  var container;

  beforeEach(function() {
    container = d3.select('body').append('div');
  });

  afterEach(function() {
    container.remove();
  });

  it('adds hover class on mouseover', function() {
    container.append('span').attr('class', 'target');
    // ... install behavior, trigger event, check class
  });
});
```

### Testing with Happen (DOM Events)

```js
// Trigger keyboard events
happen.keydown(window, { keyCode: 18 });  // Alt key
happen.keyup(window, { keyCode: 18 });

// For pointer/mouse events on d3 selections
iD.utilTriggerEvent(selection, 'mouseover');
```

### Testing Services with Fetch Mocking

```js
describe('iD.serviceOsm', function() {
  beforeEach(function() {
    fetchMock.reset();
  });

  it('loads data from the API', function() {
    fetchMock.mock('https://api.openstreetmap.org/...', { /* response */ });
    // ... call service method, verify results
  });
});
```

## Global Test Helpers

The `test/spec_helpers.ts` file sets up:

- **`iD`** — The full iD module is available as a global
- **`sinon`** — Sinon is available as `global.sinon`
- **`fetchMock`** — fetch-mock is available as `global.fetchMock`
- **`happen`** — Available for DOM event simulation
- **`d3`** — Available via `iD.d3` (re-exported subset: select, selectAll, dispatch, etc.)

All network services are disabled in tests:
```js
for (var k in iD.services) { delete iD.services[k]; }
```

Debug mode is enabled (`iD.setDebug(true)`), which freezes entities with `Object.freeze`.

## Creating Test Data

### Entities

```js
// Nodes (points)
iD.osmNode()                                    // auto-generated ID
iD.osmNode({ id: 'n1' })                       // specific ID
iD.osmNode({ id: 'n1', loc: [0, 0] })          // with location
iD.osmNode({ id: 'n1', tags: { name: 'Foo' }}) // with tags

// Ways (lines/areas)
iD.osmWay({ id: 'w1', nodes: ['n1', 'n2', 'n3'] })

// Relations
iD.osmRelation({ id: 'r1', members: [
  { id: 'w1', type: 'way', role: 'outer' },
  { id: 'w2', type: 'way', role: 'inner' }
]})
```

### Graphs

```js
// Empty graph
iD.coreGraph()

// Graph with entities
iD.coreGraph([
  iD.osmNode({ id: 'n1', loc: [0, 0] }),
  iD.osmNode({ id: 'n2', loc: [1, 1] }),
  iD.osmWay({ id: 'w1', nodes: ['n1', 'n2'] })
])
```

## Assertion Cheat Sheet

```js
// Equality
expect(a).to.equal(b);        // Strict equality (===)
expect(a).to.eql(b);          // Deep equality

// Truthiness
expect(a).to.be.true;
expect(a).to.be.false;
expect(a).to.be.ok;           // Truthy
expect(a).to.be.undefined;
expect(a).to.be.null;

// Type checks
expect(a).to.be.an.instanceOf(iD.osmNode);
expect(a).to.be.a('string');

// Collections
expect(arr).to.have.length(3);
expect(arr).to.contain('item');
expect(arr).to.include('item');
expect(arr).to.be.empty;
expect(arr).to.deep.include({ id: 'n1' });

// Numbers
expect(n).to.be.above(5);
expect(n).to.be.below(10);
expect(n).to.be.closeTo(3.14, 0.01);

// Sinon-chai
expect(spy).to.have.been.called;
expect(spy).to.have.been.calledOnce;
expect(spy).to.have.been.calledWith(arg1, arg2);
expect(spy).to.have.callCount(3);
```

## Tips

1. **Test naming:** Use `describe('iD.moduleName')` at the top level to match the module's exported name.
2. **Nested describes:** Group by method or behavior: `describe('#methodName', ...)` or `describe('when condition', ...)`.
3. **Graph-first testing:** Most tests create a graph, apply a transformation, and verify the resulting graph.
4. **Cleanup:** Always remove DOM elements in `afterEach` to avoid test pollution.
5. **No isolation mode:** Tests share global state. Always reset services and caches between tests if needed.
6. **Debug mode:** Entities are frozen in tests. If a test accidentally mutates an entity, it will throw, which is intentional.
