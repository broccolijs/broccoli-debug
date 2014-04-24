var Type = require('type-of-is')

var instrument = {}
exports.instrument = instrument

instrument.print = instrumentPrint
function instrumentPrint (tree) {
  var prefix = '[broccoli-debug] ' + treeToString(tree) + ' '
  return {
    read: function (readTree) {
      return readTree(tree)
        .then(function (dir) {
          console.error(prefix + dir)
          return dir
        })
        .catch(function (err) {
          console.error(prefix + err)
          throw err
        })
    },

    cleanup: function () {
      return tree.cleanup()
    }
  }
}

// Return '[CoffeeScriptFilter tree]' or similar. Should perhaps be extracted
// into a helper library.
function treeToString (tree) {
  return '[' + Type.string(tree) + ' tree]'
}
