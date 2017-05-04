const Plugin = require('broccoli-plugin');
const TreeSync = require('tree-sync');

module.exports = class BroccoliConditionalDebug extends Plugin {
  constructor(node, label) {
    super([node], {
      annotation: `DEBUG: ${label}`,
      persistentOutput: true
    });

    this.debugLabel = label;
    // Save references to options you may need later
  }

  build() {
    if (!this._sync) {
      this._sync = new TreeSync(this.inputPaths[0], `DEBUG-${this.debugLabel}`);
    }
  }
};
