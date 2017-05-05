'use strict';

const BroccoliTestHelper = require('broccoli-test-helper');
const buildOutput = BroccoliTestHelper.buildOutput;
const createTempDir = BroccoliTestHelper.createTempDir;
const co = require('co');

const BroccoliConditionalDebug = require('../src');

const describe = QUnit.module;
const it = QUnit.test;

describe('BroccoliConditionalDebug', function(hooks) {
  let input, debug;

  hooks.beforeEach(co.wrap(function* () {
    input = yield createTempDir();
    debug = yield createTempDir();

    process.env.BROCCOLI_DEBUG_PATH = debug.path();
  }));

  hooks.afterEach(co.wrap(function* () {
    yield input.dispose();
    yield debug.dispose();

    delete process.env.BROCCOLI_DEBUG_PATH;
    delete process.env.BROCCOLI_DEBUG;
  }));

  it('should pass through', co.wrap(function* (assert) {
    let fixture = {
      'foo.txt': 'baas',
      'derp': {
        'lol': {
          'ha!': 'hehe'
        }
      }
    };

    input.write(fixture);

    let node = new BroccoliConditionalDebug(input.path(), 'test-1');

    let output = yield buildOutput(node);

    assert.deepEqual(output.read(), fixture);
    assert.deepEqual(debug.read(), {});
  }));

  it('should emit a copy of the input into BROCCOLI_DEBUG_PATH', co.wrap(function* (assert) {
    let label = 'test-1';
    let fixture = {
      'foo.txt': 'baas',
      'derp': {
        'lol': {
          'ha!': 'hehe'
        }
      }
    };
    input.write(fixture);

    process.env.BROCCOLI_DEBUG = '*';
    let node = new BroccoliConditionalDebug(input.path(), label);

    let output = yield buildOutput(node);

    assert.deepEqual(output.read(), fixture);
    assert.deepEqual(debug.read(), { [label]: fixture });
  }));

  it('clears stale content from debug path', co.wrap(function* (assert) {
    let label = 'test-1';
    let fixture = {
      'foo.txt': 'baas',
      'derp': {
        'lol': {
          'ha!': 'hehe'
        }
      }
    };
    input.write(fixture);

    debug.write({
      [label]: {
        'stuff': 'was here'
      }
    });

    process.env.BROCCOLI_DEBUG = '*';
    let node = new BroccoliConditionalDebug(input.path(), label);

    let output = yield buildOutput(node);

    assert.deepEqual(output.read(), fixture);
    assert.deepEqual(debug.read(), { [label]: fixture });
  }));

  describe('shouldSyncDebugDir', function(hooks) {
    hooks.afterEach(function() {
      delete process.env.BROCCOLI_DEBUG;
    });

    function match(options) {
      it(`${options.label} ${options.matches ? 'matches' : 'does not match'} ${options.env}`, function(assert) {
        process.env.BROCCOLI_DEBUG = options.env;
        let result = BroccoliConditionalDebug._shouldSyncDebugDir(options.label);

        assert.equal(result, options.matches);
      });
    }

    match({ label: 'ember-engines:foo-bar:addon-input', matches: true, env: '*'});
    match({ label: 'ember-engines:foo-bar:addon-input', matches: true, env: 'ember-engines:*'});
    match({ label: 'ember-engines:foo-bar:addon-input', matches: true, env: 'ember-engines:foo-bar:*'});
    match({ label: 'ember-engines:foo-bar:addon-input', matches: true, env: 'ember-engines:foo-bar:addon-input'});

    match({ label: 'ember-engines:foo-bar:addon-input', matches: false, env: 'ember-cli:*'});
    match({ label: 'ember-engines:foo-bar:addon-input', matches: false, env: 'ember:*'});
    match({ label: 'ember-engines:foo-bar:addon-input', matches: false, env: 'ember-engines:baz-bar:*'});
    match({ label: 'ember-engines:foo-bar:addon-input', matches: false, env: 'ember-engines:foo-bar:addon-output'});
  });
});
