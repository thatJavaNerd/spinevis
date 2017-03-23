# Organization

The following is a brief overview of spinevis' directory structure.

 - `app/` contains all core project files. Contains directories for the website and the server code.
 - `docs/` contains project documentation

## Website

 - `app/client/_assets` contains all non-JS assets, e.g. CSS files
 - `app/client/_assets/style` contains CSS files. All files in here will be minified.
 - `app/client/_assets/raw` contains any static files that should be served directly
 - `app/client/src` contains all AngularJS code
 - `app/client/test` contains all website tests

## Server

 - `app/server` contains all server-related code
 - `app/server/benchmarks` contains all server benchmarks. These can be run with `grunt run:bench`.
 - `app/server/src` contains all server-side code
 - `app/server/tests` contains all server tests

## Build and temporary directories

 - `app/client/build` is a temporary website asset build location
 - `app/server/public` is the directory Express serves from. `grunt build` assembles all website assets and copies them to this directory.
 - `build/` contains build files relevant to both the server and the client (i.e. code coverage). Code coverage can be generated with `grunt testCoverage`. Server and client coverage can be merged with `grunt lcovMerge` and uploaded to Coveralls with `grunt coveralls`.

## Special files

 - `app/client/jspm_packages` contain all website (i.e. JSPM) dependencies, similar to the `node_modules` folder
 - `app/client/config.js` is the JSPM configuration file
 - `.travis.yml` contains metadata for the Travis Continuous Integration website
 - `.karma.conf.js` contains configuration for the Karma task runner used for website unit tests
 - `nodemon.json` specifies some configuration for [nodemon](https://github.com/remy/nodemon)