'use strict';

const fs = require('fs');
const path = require('path');
const symlinkOrCopy = require('symlink-or-copy');
const Plugin = require('broccoli-plugin');
const TreeSync = require('tree-sync');
const minimatch = require("minimatch");

module.exports = class BroccoliDebug extends Plugin {
  static buildDebugCallback(baseLabel) {
    return (input, labelOrOptions) => {
      let options = processOptions(labelOrOptions);
      options.label = `${baseLabel}:${options.label}`;

      if (options.force || shouldSyncDebugDir(options.label)) {
        return new this(input, options);
      }

      return input;
    };
  }

  constructor(node, labelOrOptions) {
    let options = processOptions(labelOrOptions);

    super([node], {
      name: 'BroccoliDebug',
      annotation: `DEBUG: ${options.label}`,
      persistentOutput: true
    });

    this.debugLabel = options.label;
    this._sync = undefined;
    this._haveLinked = false;
    this._shouldSync = options.force || shouldSyncDebugDir(options.label);
  }

  build() {
    if (this._shouldSync) {
      let treeSync = this._sync;
      if (!treeSync) {
        let debugOutputPath = buildDebugOutputPath(this.debugLabel);
        treeSync = this._sync = new TreeSync(this.inputPaths[0], debugOutputPath);
      }

      treeSync.sync();
    }

    if (!this._haveLinked) {
      fs.rmdirSync(this.outputPath);
      symlinkOrCopy.sync(this.inputPaths[0], this.outputPath);
      this._haveLinked = true;
    }
  }
};

function processOptions(labelOrOptions) {
  let options = {};
  if (typeof labelOrOptions === 'string') {
    options.label = labelOrOptions;
  } else {
    Object.assign(options, labelOrOptions);
  }

  return options;
}

function buildDebugOutputPath(label) {
  let basePath = process.env.BROCCOLI_DEBUG_PATH || path.join(process.cwd(), 'DEBUG');
  let debugOutputPath = path.join(basePath, label);

  return debugOutputPath;
}

function shouldSyncDebugDir(label) {
  if (!process.env.BROCCOLI_DEBUG) { return false; }

  return minimatch(label, process.env.BROCCOLI_DEBUG);
}

module.exports._shouldSyncDebugDir = shouldSyncDebugDir;
module.exports._buildDebugOutputPath = buildDebugOutputPath;
module.exports._shouldSyncDebugDir = shouldSyncDebugDir;
