# broccoli-debug

Collection of debugging helpers for Broccoli.

## Installation

```
npm install broccoli-debug
```

Without `--save-dev`, this will install broccoli-debug but not store it in
package.json. You will oftentimes use broccoli-debug as a transient debugging
aid, and not check it in.

## Usage

```js
var instrument = require('broccoli-debug').instrument;
```

### instrument.print

```js
var tree = instrument.print(tree);
```

This will print to stderr the location of the `tree` files on the file system
whenever `tree` is rebuilt, so that you can inspect it with `ls`. It will
print the error object if building `tree` fails. If you do not get any output,
it means that your `tree` object isn't being used at all.
