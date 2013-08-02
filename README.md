conrad.js
=========

***conrad* is a tiny JavaScript scheduler, developped by [Alexis Jacomy](http://github.com/jacomyal) at the [médialab](http://github.com/medialab). It is released under the [MIT License](https://raw.github.com/jacomyal/conrad.js/master/LICENSE.txt).**

The full API documentation is available [here](http://jacomyal.github.io/conrad.js/).

## Build

To use it, clone the repository:

```
git clone git@github.com:jacomyal/conrad.js.git
```

The latest minified version is available here:

[https://raw.github.com/jacomyal/conrad.js/master/build/conrad.min.js](https://raw.github.com/jacomyal/conrad.js/master/build/conrad.min.js)

You can also minify your own version with [Grunt](http://gruntjs.com/):

 - Install [Node.js](http://nodejs.org/), [NPM](https://npmjs.org/) and [Grunt](http://gruntjs.com/installing-grunt).
 - Use `npm install` to install *conrad* development dependencies.
 - Use `grunt` to check sources linting, launch unit tests, and minify the code with [Uglify](https://github.com/mishoo/UglifyJS).

## Contribute

**Contributions are welcome!** You can contribute by submitting [issues](http://github.com/jacomyal/conrad.js/issues) and proposing [pull requests](http://github.com/jacomyal/conrad.js/pulls). Be sure to successfully run `grunt` **before submitting any pull request**, to check unit tests and sources lint.

The whole source code is validated by the [Google Closure Linter](https://developers.google.com/closure/utilities/), and the comments are written in [JSDoc](http://en.wikipedia.org/wiki/JSDoc) (tags description is available [here](https://developers.google.com/closure/compiler/docs/js-for-compiler)).
