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

### Pipeline Authors

To allow consumers to debug the internals of various stages in your build pipeline,
you create a new instance of `BroccoliConditionalDebug` and return it instead.

Something like this:

```js
var BroccoliConditionalDebug = require('broccoli-conditional-debug');

let tree = new BroccoliConditionalDebug(input, `ember-engines:${this.name}:addon-input`);
```

Obviously, this would get quite verbose to do many times, so we have created a shortcut
to easily create a number of debug trees with a shared prefix:

```js
let debugTree = BroccoliConditionalDebug.buildDebugCallback(`ember-engines:${this.name}`);

let tree1 = debugTree(input1, 'addon-input');
// tree1.debugLabel => 'ember-engines:<some-name>:addon-input'

let tree2 = debugTree(input2, 'addon-output');
// tree2.debugLabel => 'ember-engines:<some-name>:addon-output
```

### Consumers

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
