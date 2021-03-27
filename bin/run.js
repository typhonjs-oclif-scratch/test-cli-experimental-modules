#!/usr/bin/env sh
// 2>/dev/null; exec /usr/bin/env node --experimental-modules "$0" "$@"
import url   from 'url';
import flush from '@oclif/core/flush.js';
import oclif from '@oclif/core';

oclif.run(void 0, url.fileURLToPath(import.meta.url))
.then(flush)
.catch(oclif.Errors.handle);
