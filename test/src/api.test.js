import fancy               from 'fancy-test';
import { assert, expect }  from 'chai';

import testcli             from '../../src/index.js';


/**
 * Note these tests do not work w/ the `esm` module on Node 12.0.0, but work in the Node 12.17+ GH action.
 *
 * These tests will run when Node version isn't 12.0.0.
 */
if (process.env.NODE_VERSION !== 'v12.0.0')
{
   /**
    * This tests utilize the main / programmatic export of the module.
    */
   describe('Programmatic (API):', () =>
   {
      it('bad command (shows how to use chai-as-promised)', async () =>
      {
         await expect(testcli('bad')).to.be.rejectedWith(Error, 'command bad not found');
      });

      fancy.fancy
         .stdout()
         .do(async () => await testcli('test'))
         .it('run command test', (output) =>
         {
            assert.strictEqual(output.stdout, 'ran init hook\nran test command\n')
         });
   });
}
