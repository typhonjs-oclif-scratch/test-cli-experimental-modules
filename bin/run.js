#!/usr/bin/env sh
// 2>/dev/null; exec /usr/bin/env node --experimental-modules "$0" "$@"
import oclif from '@oclif/core';

oclif.run(void 0, import.meta.url)
.then(oclif.flush)
.catch(oclif.Errors.handle);
