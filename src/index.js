'use strict';

const fs = require('fs');
const path = require('path');
const symlinkOrCopy = require('symlink-or-copy');
const Plugin = require('broccoli-plugin');
const TreeSync = require('tree-sync');
const minimatch = require("minimatch");

module.exports = class BroccoliConditionalDebug extends Plugin {
  constructor(node, label) {
    super([node], {
      name: 'BroccoliDebug',
      annotation: `DEBUG: ${label}`,
      persistentOutput: true
    });

    this.debugLabel = label;
    this._sync = undefined;
    this._haveLinked = false;
  }

  build() {
    let shouldSync = shouldSyncDebugDir(this.debugLabel);
    if (shouldSync) {
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
