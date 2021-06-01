# test-cli-experimental-modules
[![Build Status](https://github.com/typhonjs-oclif-scratch/test-cli-experimental-modules/workflows/CI/CD/badge.svg)](#)
[![Coverage](https://img.shields.io/codecov/c/github/typhonjs-oclif-scratch/test-cli-experimental-modules.svg)](https://codecov.io/github/typhonjs-oclif-scratch/test-cli-experimental-modules)

Provides a test CLI for ES Module (ESM) changes to @oclif v2 against the widest coverage of Node 12.0.0 - 15.x using 
`--experimental-modules` & CommonJS (CJS) interop for named exports.

There are three test suites for ESM support for Oclif v2:
- [test-cli-modern](https://github.com/typhonjs-oclif-scratch/test-cli-modern) / everything works as expected
- [test-cli-cjs-interop](https://github.com/typhonjs-oclif-scratch/test-cli-cjs-interop) / workaround for CJS named exports
- test-cli-experimental-modules (this one) / usage of --experimental-modules + workaround for CJS named exports

This test CLI and Github Action CI / CD test suite covers the largest swath of Node versions starting at `12.0.0`. 

A [discussion issue](https://github.com/oclif/core/issues/130) about ESM support has concluded with a merge of ESM 
support on the `@oclif/core` repo. Please see this [comment](https://github.com/oclif/core/issues/130#issuecomment-852454758) 
on updated details on how to publish an ESM Oclif v2 CLI before the full launch of Oclif v2.

Click here to view the [latest Action CI / CD run](https://github.com/typhonjs-oclif-scratch/test-cli-experimental-modules/actions) 
(requires a valid Github login). The test suite is run in a matrix support `macos-latest`, `ubuntu-latest`, `windows-latest`
on Node versions `12.0.0`, `12.17.0`, `12.x`, `14.0.0`, `14.x`, `16.0.0` and `16.x`.

All the test suites use [@oclif/core](https://github.com/oclif/core) `0.5.10+`.

For testing the CLI is invoked locally via cross-spawn only. This is a limitation due to ESM tests via the `esm` module 
on Node `12.0.0`. Please see `test-cli-modern` and `test-cli-cjs-interop` for examples on API / programmatic tests that
run on Node `12.17.0+`.

It should be noted that everything is ESM from the test CLI to the test suite itself. Most of the complications w/ ESM 
revolves around support in Mocha for Node versions that require `--experimental-modules` (`12.0 - 12.16`). This is due 
to not being able to invoke Mocha with `--experimental-modules`. To get the test suite to function on Node versions 
prior to `12.17.0` the [esm](https://www.npmjs.com/package/esm) module is loaded in the Github Action [after dependencies are 
installed](https://github.com/typhonjs-oclif-scratch/test-cli-experimental-modules/blob/main/.github/workflows/ci.yml#L32) and 
Mocha is invoked [requiring esm](https://github.com/typhonjs-oclif-scratch/test-cli-experimental-modules/blob/main/.github/workflows/ci.yml#L36).
In the Github Action there are two build jobs [build-exp](https://github.com/typhonjs-oclif-scratch/test-cli-experimental-modules/blob/main/.github/workflows/ci.yml#L11) 
for Node prior to `12.17.0` and [build-node](https://github.com/typhonjs-oclif-scratch/test-cli-experimental-modules/blob/main/.github/workflows/ci.yml#L41) 
for Node versions `12.17.0` and higher. 

This test suite demonstrates that it is possible to launch an Oclif ESM CLI with very wide support for the Node 
ecosystem version `12.0.0+`, however for practical purposes the `test-cli-cjs-interop` for Node 12.17+ or 
`test-cli-modern` version for Node `12.20.0+` & `14.13.0+` is the recommended solution for Oclif v2. It is not likely 
that the Oclif CLI / project generator should support this --experimental-modules version, but is made available as a 
proof of concept and guide for anyone who manually wishes to work with such a configuration and absolutely support 
Node `12.0.0+`.

----
### Bin / Bootstrap

Take note that in `package.json` `"type": "module"` is set. As things go this requires the bin bootstrap file 
`./bin/run` to be renamed to `./bin/run.js` to support ESM. There is a complication with the bootstrap file insofar that 
Node must be invoked with `--experimental-modules`, however shebangs do not support multiple arguments. 
`#!/usr/bin/env node --experimental-modules` does not work, so a [non-obvious workaround](https://github.com/typhonjs-oclif-scratch/test-cli-experimental-modules/blob/main/bin/run.js) 
is required. 

```shell
#!/usr/bin/env sh
// 2>/dev/null; exec /usr/bin/env node --experimental-modules "$0" "$@"
```

There are a couple of articles one might find when researching how to invoke Node with multiple arguments. 
The [first](http://sambal.org/2014/02/passing-options-node-shebang-line/) lays out the general idea, but is incomplete 
insofar that in the second line `//#` in bash is interpreted as an invalid path thus it needs to be further modified to
the solution presented above. The suggestion to use `2>/dev/null` was found in a [similar discussion](https://unix.stackexchange.com/questions/65235/universal-node-js-shebang/65295#comment161856_65295) 
about shebang arguments. Please refer to both of these sources for a more thorough explanation. Do note that the Windows
`run.cmd` simply adds `--experimental-modules`. 

----
### CJS named exports

The next area of note regarding a workaround is that until Node version `12.20.0+` and `14.13.0+` that one can not 
import via standard ESM mechanisms named exports from CJS modules. Since Oclif is a CJS module one must import Oclif 
as the entire package as a default export. 

Instead of `import { Command } from '@oclif/core'` one must do the following `import oclif from '@oclif/core'` then 
subsequently reference Command as `oclif.Command`.

For more information on CJS named exports please see this [Node / Modules issue](https://github.com/nodejs/modules/issues/81).

----
### Mocha Tests

Since Mocha can not be invoked with `--experimental-modules` and the public `@oclif/test` testing tools for Oclif is not 
updated for v2 with the ESM additions to `@oclif/core`, and the test source is ESM itself the tests must be conducted 
by using spawn and invoking the bootstrap code. To accomplish this cross-platform with Windows [cross-spawn](https://www.npmjs.com/package/cross-spawn)
is utilized. The local bootstrap code, `./bin/run.js` is invoked. 

----
### Code Coverage

[nyc](https://www.npmjs.com/package/nyc) does not support code coverage for ESM based tests in Mocha presently. The 
solution is to use [c8](https://www.npmjs.com/package/c8) which does work with ESM tests and is a drop in replacement 
for `nyc`. This repo uses Codecov to publish a [coverage report](https://codecov.io/github/typhonjs-oclif-scratch/test-cli-experimental-modules) 
in the GH Action. When running tests locally a `./coverage` directory is created that contains the coverage report. As 
can be seen in the report full coverage of both the CLI command / init files and bin bootstrap occurs. 

----
### Deploying an ESM CLI 

While there is newly added ESM support to `@oclif/core v0.5.10+` the rest of the Oclif v2 infrastructure and plugins are
not updated to use `@oclif/core` yet. This is somewhat problematic in using `@oclif/dev-cli v1.26.0` and in particular the 
`oclif-dev manifest` CLI command in the `prepack` or `prepublishOnly` NPM scripts. There is a workaround though to 
publish ESM Oclif v2 CLIs using the `oclif-dev manifest` command. It requires installing all dependencies from Oclif
then manually updating `@oclif/config` which is the v1 version depended on by `@oclif/dev-cli`. ESM support has been 
back-ported with a hard fork of `@oclif/config v1` in this [repository](https://github.com/typhonjs-oclif-scratch/configv1).

The contents of the lib directory from the above repository needs to be copied into `node_modules/@oclif/config/lib` as 
it adds ESM config loading support to `@oclif/config v1`

Note: This workaround only works with `oclif-dev manifest` command and not the README command.

A comment tracking the current best practice or procedure to publish an ESM Oclif v2 CLI is posted [here](https://github.com/oclif/core/issues/130#issuecomment-852454758). 
When Oclif v2 fully launches no workarounds will be necessary.
