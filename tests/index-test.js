'use strict';
const BroccoliTestHelper = require('broccoli-test-helper');
const buildOutput = BroccoliTestHelper.buildOutput;
const createTempDir = BroccoliTestHelper.createTempDir;
const co = require('co');
const broccoliSource = require('broccoli-source');
const UnwatchedDir = broccoliSource.UnwatchedDir;
const WatchedDir = broccoliSource.WatchedDir;

const BroccoliDebug = require('../src');
const match = require('../src/match');

const describe = QUnit.module;
const it = QUnit.test;

describe('BroccoliDebug', function(hooks) {
  let fixture, input, debug;

  hooks.beforeEach(co.wrap(function* () {
    input = yield createTempDir();
    debug = yield createTempDir();

    process.env.BROCCOLI_DEBUG_PATH = debug.path();

    fixture = {
      'foo.txt': 'baas',
      'derp': {
        'lol': {
          'ha!': 'hehe'
        }
      }
    };
  }));

  hooks.afterEach(co.wrap(function* () {
    yield input.dispose();
    yield debug.dispose();

    delete process.env.BROCCOLI_DEBUG_PATH;
    delete process.env.BROCCOLI_DEBUG;
  }));

  describe('BroccoliDebug.buildDebugCallback', function() {
    it('returns a callback that builds debug trees with a consistent prefix', function(assert) {
      process.env.BROCCOLI_DEBUG = '*';

      let debugTree = BroccoliDebug.buildDebugCallback('foo-addon');

      let tree1 = debugTree(input.path(), 'addon-tree');
      assert.equal(tree1.debugLabel, 'foo-addon:addon-tree');

      let tree2 = debugTree(input.path(), 'vendor-tree');
      assert.equal(tree2.debugLabel, 'foo-addon:vendor-tree');

      let tree3 = debugTree(input.path(), { label: 'derp-tree'});
      assert.equal(tree3.debugLabel, 'foo-addon:derp-tree');
    });

    it('returns the input tree if debug flag does not match label', co.wrap(function* (assert) {
      input.write(fixture);
      let inputPath = input.path();

      let debugTree = BroccoliDebug.buildDebugCallback('foo-bar');
      let subject = debugTree(inputPath, 'derp');

      assert.equal(subject, inputPath, 'is equal to the input because the label does not match the BROCCOLI_DEBUG flag');

      let output = yield buildOutput(subject);

      assert.deepEqual(output.read(), fixture, 'final output matches input');
      assert.deepEqual(debug.read(), { }, 'debug tree output is empty');
    }));

    it('returns a BroccoliDebug tree when the BROCCOLI_DEBUG flag matches the label', co.wrap(function* (assert) {
      input.write(fixture);
      let inputPath = input.path();

      process.env.BROCCOLI_DEBUG = 'foo-bar:herp';

      let debugTree = BroccoliDebug.buildDebugCallback('foo-bar');
      let subject = debugTree(inputPath, 'herp');

      assert.notEqual(subject, inputPath, 'tree2 does not match input because the label matches the BROCCOLI_DEBUG flag');
      assert.ok(subject instanceof BroccoliDebug, 'tree2 is a BroccoliDebug instance');

      let output = yield buildOutput(subject);

      assert.deepEqual(output.read(), fixture, 'final ouptut matches input');
      assert.deepEqual(debug.read(), { 'foo-bar': { 'herp': fixture } }, 'debug tree output matches input');
    }));

    it('does not error when provided a null tree when the BROCCOLI_DEBUG flag matches the label', function(assert) {
      process.env.BROCCOLI_DEBUG = 'foo-bar:herp';

      let debugTree = BroccoliDebug.buildDebugCallback('foo-bar');
      let subject = debugTree(null, 'herp');

      assert.equal(subject, null, 'passes `null` forward');
    });

    it('does not error when provided a null tree when the BROCCOLI_DEBUG flag does not matche', function(assert) {
      let debugTree = BroccoliDebug.buildDebugCallback('foo-bar');
      let subject = debugTree(null, 'herp');

      assert.equal(subject, null, 'passes `null` forward');
    });

    it('returns a BroccoliDebug tree when `force: true` option is passed', co.wrap(function* (assert) {
      input.write(fixture);
      let inputPath = input.path();

      // ensure no env flag is set
      delete process.env.BROCCOLI_DEBUG;

      let debugTree = BroccoliDebug.buildDebugCallback('foo-bar');
      let subject = debugTree(inputPath, { label: 'herp', force: true });

      assert.notEqual(subject, inputPath, 'does not match input because the label matches the BROCCOLI_DEBUG flag');
      assert.ok(subject instanceof BroccoliDebug, 'is a BroccoliDebug instance');

      let output = yield buildOutput(subject);

      assert.deepEqual(output.read(), fixture, 'final ouptut matches input');
      assert.deepEqual(debug.read(), { 'foo-bar': { 'herp': fixture }}, 'debug tree output matches input');
    }));
  });

  it('should allow string directories as input', co.wrap(function* (assert) {
    input.write(fixture);

    let node = new BroccoliDebug(input.path(), 'test-1');

    let output = yield buildOutput(node);

    assert.deepEqual(output.read(), fixture);
    assert.deepEqual(debug.read(), {});
  }));

  it('should pass through', co.wrap(function* (assert) {
    input.write(fixture);

    let inputTree = new UnwatchedDir(input.path());
    let node = new BroccoliDebug(inputTree, 'test-1');

    let output = yield buildOutput(node);

    assert.deepEqual(output.read(), fixture);
    assert.deepEqual(debug.read(), {});
  }));

  it('returns the input tree if debug flag does not match label', co.wrap(function* (assert) {
    input.write(fixture);

    let inputTree = new UnwatchedDir(input.path());
    let subject = new BroccoliDebug(inputTree, 'foo-bar');

    assert.equal(subject, inputTree, 'is equal to the input because the label does not match the BROCCOLI_DEBUG flag');

    let output = yield buildOutput(subject);

    assert.deepEqual(output.read(), fixture, 'final output matches input');
    assert.deepEqual(debug.read(), { }, 'debug tree output is empty');
  }));

  it('returns the string input as a tree if debug flag does not match label', co.wrap(function* (assert) {
    input.write(fixture);

    let inputTree = input.path();
    let subject = new BroccoliDebug(inputTree, 'foo-bar');

    assert.ok(subject instanceof WatchedDir, 'returns watched source because the label does not match the BROCCOLI_DEBUG flag');

    let output = yield buildOutput(subject);

    assert.deepEqual(output.read(), fixture, 'final output matches input');
    assert.deepEqual(debug.read(), { }, 'debug tree output is empty');
  }));

  it('should emit a copy of the input into BROCCOLI_DEBUG_PATH', co.wrap(function* (assert) {
    let label = 'test-1';
    input.write(fixture);

    process.env.BROCCOLI_DEBUG = '*';
    let node = new BroccoliDebug(input.path(), label);

    let output = yield buildOutput(node);

    assert.deepEqual(output.read(), fixture);
    assert.deepEqual(debug.read(), { [label]: fixture });
  }));

  it('can specify the debugBaseDir in options', co.wrap(function* (assert) {
    let label = 'test-1';
    input.write(fixture);

    delete process.env.BROCCOLI_DEBUG_PATH;
    process.env.BROCCOLI_DEBUG = '*';
    let node = new BroccoliDebug(input.path(), { label, baseDir: debug.path() });

    let output = yield buildOutput(node);

    assert.deepEqual(output.read(), fixture);
    assert.deepEqual(debug.read(), { [label]: fixture });
  }));

  it('removes special characters in label', co.wrap(function* (assert) {
    let label = 'test-1*bar\\baz';
    input.write(fixture);

    process.env.BROCCOLI_DEBUG = '*';
    let node = new BroccoliDebug(input.path(), label);

    let output = yield buildOutput(node);

    assert.deepEqual(output.read(), fixture);
    assert.deepEqual(debug.read(), { 'test-1-bar': { baz: fixture } });
  }));

  it('can be forced to debug mode (supports stew.debug)', co.wrap(function* (assert) {
    let label = 'test-1';
    input.write(fixture);

    delete process.env.BROCCOLI_DEBUG;
    let node = new BroccoliDebug(input.path(), {
      label,
      force: true
    });

    let output = yield buildOutput(node);

    assert.deepEqual(output.read(), fixture);
    assert.deepEqual(debug.read(), { [label]: fixture });
  }));

  it('clears stale content from debug path', co.wrap(function* (assert) {
    let label = 'test-1';
    input.write(fixture);

    debug.write({
      [label]: {
        'stuff': 'was here'
      }
    });

    process.env.BROCCOLI_DEBUG = '*';
    let node = new BroccoliDebug(input.path(), label);

    let output = yield buildOutput(node);

    assert.deepEqual(output.read(), fixture);
    assert.deepEqual(debug.read(), { [label]: fixture });
  }));

  describe('shouldSyncDebugDir', function(hooks) {
    hooks.afterEach(function() {
      delete process.env.BROCCOLI_DEBUG;
    });

    function testMatch(options) {
      it(`${options.label} ${options.matches ? 'matches' : 'does not match'} ${options.env}`, function(assert) {
        process.env.BROCCOLI_DEBUG = options.env;
        let result = match(options.label);
        assert.equal(result, options.matches);
      });
    }

    testMatch({ label: 'ember-engines:foo-bar/input', matches: true, env: '*'});

    testMatch({ label: 'ember-engines:foo-bar:addon-input', matches: true, env: '*'});
    testMatch({ label: 'ember-engines:foo-bar:addon-input', matches: true, env: 'ember-engines:*'});
    testMatch({ label: 'ember-engines:foo-bar:addon-input', matches: true, env: 'ember-engines:foo-bar:*'});
    testMatch({ label: 'ember-engines:foo-bar:addon-input', matches: true, env: 'ember-engines:foo-bar:addon-input'});

    testMatch({ label: 'ember-engines:foo-bar/input', matches: true, env: 'ember-engines:*'});

    testMatch({ label: 'ember-engines:foo-bar:addon-input', matches: false, env: 'ember-cli:*'});
    testMatch({ label: 'ember-engines:foo-bar:addon-input', matches: false, env: 'ember:*'});
    testMatch({ label: 'ember-engines:foo-bar:addon-input', matches: false, env: 'ember-engines:baz-bar:*'});
    testMatch({ label: 'ember-engines:foo-bar:addon-input', matches: false, env: 'ember-engines:foo-bar:addon-output'});
  });
});
