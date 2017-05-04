# broccoli-conditional-debug

Utility for build pipeline authors to allow trivial debugging of the Broccoli
pipelines they author.

Heavily inspired by [@stefanpenner](https://github.com/stefanpenner)'s
[broccoli-stew](https://github.com/stefanpenner/broccoli-stew)'s `debug` helper,
but improved in a few ways:

* Supports leaving debug trees in the build with minimal cost when not being used.
* Supports binary files (e.g. does not write `.png`'s as `utf8` text).
* Adds [debug](https://github.com/visionmedia/debug) style debug matching.

## Usage

```js
var BroccoliConditionalDebug = require('broccoli-conditional-debug');

let tree = new BroccoliConditionalDebug(input, `ember-engines:${this.name}:addon-input`);
```

Folks wanting to inspect the state of the build pipeline at that stage, would do the following:

```js
BROCCOLI_DEBUG=ember-engines:* ember b
```

Now you can take a look at the state of that input tree by:

```js
ls DEBUG/ember-engines:*
```

## Development

### Installation

* `git clone git@github.com:rwjblue/broccoli-conditional-debug.git`
* `cd broccoli-conditional-debug`
* `yarn`

### Testing

* `yarn test`
