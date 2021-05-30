import spawn      from 'cross-spawn';

import { assert } from 'chai';

/**
 * This test spawns the local CLI
 */
describe('Test CLI', () =>
{
   it('run local CLI - command test', async () =>
   {
      let data = '';
      const cli = spawn('./bin/run.js', ['test']);
      cli.stdout.on('data', (chunk) => { data += chunk; });

      await onExit(cli);

      assert(data, 'ran init hook\nran test command');
   });
});

/**
 * Taken from @rauschma/stringio which doesn't have a default export / doesn't work in Mocha w/ esm without
 * --experimental-modules
 *
 * @param childProcess
 *
 * @returns {Promise<void|Error>}
 */
function onExit(childProcess)
{
   return new Promise((resolve, reject) =>
   {
      childProcess.once('exit', (code) =>
      {
         if (code === 0)
         {
            resolve(void 0);
         }
         else {
            reject(new Error('Exit with error code: ' + code));
         }
      });

      childProcess.once('error', (err) =>
      {
         reject(err);
      });
   });
}
