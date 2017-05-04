'use strict';

const BroccoliTestHelper = require('broccoli-test-helper');
const buildOutput = BroccoliTestHelper.buildOutput;
const createTempDir = BroccoliTestHelper.createTempDir;
const co = require('co');

const BroccoliConditionalDebug = require('../src');

const describe = QUnit.module;
const it = QUnit.test;

describe('BroccoliConditionalDebug', function(hooks) {
  let input;

  hooks.beforeEach(function() {
    return createTempDir().then(tempDir => (input = tempDir));
  });

  hooks.afterEach(function() {
    return input.dispose();
  });

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

    output = yield output.rebuild();

    assert.deepEqual(output.changes(), {});
  }));
});
