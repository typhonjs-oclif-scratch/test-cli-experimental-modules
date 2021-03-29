# test-cli-experimental-modules
Provides a test CLI for ES Module (ESM) changes to @oclif v2 against the widest coverage of Node 12.0.0 - 15.x using 
`--experimental-modules` & CommonJS (CJS) interop for named exports.

There are three test suites for ESM support for Oclif v2:
- [test-cli-modern](https://github.com/typhonjs-oclif/test-cli-modern) / everything works as expected
- [test-cli-cjs-interop](https://github.com/typhonjs-oclif/test-cli-cjs-interop) / workaround for CJS named exports
- test-cli-experimental-modules (this one) / usage of --experimental-modules + workaround for CJS named exports

This test CLI and Github Action CI / CD test suite covers the largest swath of Node versions starting at `12.0.0`. 

A [discussion issue](https://github.com/oclif/core/issues/130) about ESM support is open on the `@oclif/core` repo.

Click here to view the [latest Action CI / CD run](https://github.com/typhonjs-oclif/test-cli-experimental-modules/actions) 
(requires a valid Github login). The test suite is run in a matrix support `macos-latest`, `ubuntu-latest`, `windows-latest`
on Node versions `12.0.0`, `12.17.0`, `12.x`, `13.x`, `14.0.0`, `14.x`, `15.0.0` and `15.x`.

All the test suites use a fork of [@oclif/core](https://github.com/oclif/core) that can be [found here](https://github.com/typhonjs-oclif-scratch/core-esm)
and subsequently a compiled version with the lib directory committed to Github is [found here](https://github.com/typhonjs-oclif/core-esm).
The latter Github repo is linked in `package.json` as `"@oclif/core": "git+https://github.com/typhonjs-oclif/core-esm.git"`.

For testing the CLI is invoked locally, via NPM script (installed as a developer dependency), and installed as a global 
dependency in the Github Action. 

It should be noted that everything is ESM from the test CLI to the test suite itself. Most of the complications w/ ESM 
revolves around support in Mocha for Node versions that require `--experimental-modules`. This is due to not being
able to invoke Mocha with `--experimental-modules`. To get the test suite to function on Node versions prior to 
`12.17.0` the [esm](https://www.npmjs.com/package/esm) module is loaded in the Github Action [after dependencies are 
installed](https://github.com/typhonjs-oclif/test-cli-experimental-modules/blob/main/.github/workflows/ci.yml#L36) and 
Mocha is invoked [requiring esm](https://github.com/typhonjs-oclif/test-cli-experimental-modules/blob/main/.github/workflows/ci.yml#L56).
In the Github Action there are two build jobs [build-exp](https://github.com/typhonjs-oclif/test-cli-experimental-modules/blob/main/.github/workflows/ci.yml#L11) 
for Node prior to `12.17.0` and [build-node](https://github.com/typhonjs-oclif/test-cli-experimental-modules/blob/main/.github/workflows/ci.yml#L59) 
for Node versions `12.17.0` and higher. 

This test suite demonstrates that it is possible to launch an Oclif ESM CLI with very wide support for the Node 
ecosystem version `12.0.0+`, however for practical purposes the `modern` version for Node `12.20.0+` & `14.13.0+` is 
the recommended solution for Oclif v2. It is not likely that the Oclif CLI / project generator should support this 
--experimental-modules version, but is made available as a proof of concept and guide for anyone who manually wishes
to work with such a configuration. 

----
### Bin / Bootstrap

Take note that in `package.json` `"type": "module"` is set. As things go this requires the bin bootstrap file 
`./bin/run` to be renamed to `./bin/run.js` to support ESM. There is a complication with the bootstrap file insofar that 
Node must be invoked with `--experimental-modules`, however shebangs do not support multiple arguments. 
`#!/usr/bin/env node --experimental-modules` does not work, so a [non-obvious workaround](https://github.com/typhonjs-oclif/test-cli-experimental-modules/blob/main/bin/run.js) 
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
updated for v2 or available to the ESM `@oclif/core` fork, and the test source is ESM itself the tests must be conducted 
by using spawn and invoking the bootstrap code. To accomplish this cross platform with Windows [cross-spawn](https://www.npmjs.com/package/cross-spawn)
is utilized. The local bootstrap code, `./bin/run.js` is invoked along with the NPM script `run-npm-cli` that invokes 
the CLI that has been installed via a Github link developer dependency and finally in the Github Action where the test 
CLI is installed globally it is invoked as well. These tests cover all execution possibilities for the CLI across
MacOS, Ubuntu, and Windows and a wide range of Node versions proving it is possible to create an ESM Oclif CLI that 
can run on Node `12.0.0+`.
