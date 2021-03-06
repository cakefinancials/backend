import { expect } from 'chai';
import simple from 'simple-mock';
import Promise from 'bluebird';

import { handler, CONSTANTS } from '../../../server/functions/get_brokerage_credentials_exists';
import { getDefaultEvent, getDefaultContext } from '../../helpers/defaults';

import { BOTTLE_NAMES, testBottleBuilderFactory } from '../../../server/libs/bottle';

describe('get_brokerage_credentials_exists', () => {
  const handlerPromise = Promise.promisify(handler);
  const defaultEvent = getDefaultEvent();
  const defaultContext = getDefaultContext();

  let bottle;
  const buildTestBottle = testBottleBuilderFactory();

  describe('when HEAD call returns', () => {
    let success;

    before(() => {
      ({ bottle, success } = buildTestBottle({
        [BOTTLE_NAMES.CLIENT_AWS]: {
          s3HeadObject: simple.stub().resolveWith('does not matter'),
        },
      }));
    });

    it('should succeed with exists true', async () => {
      const response = await handlerPromise(defaultEvent, defaultContext, bottle.container);
      expect(response).to.deep.equal(success({ exists: true }));
    });
  });

  describe("when HEAD call fails with code 'NotFound'", () => {
    let success;

    before(() => {
      ({ bottle, success } = buildTestBottle({
        [BOTTLE_NAMES.CLIENT_AWS]: {
          s3HeadObject: simple.stub().rejectWith({ code: 'NotFound' }),
        },
      }));
    });

    it('should succeed with exists false', async () => {
      const response = await handlerPromise(defaultEvent, defaultContext, bottle.container);
      expect(response).to.deep.equal(success({ exists: false }));
    });
  });

  describe('when HEAD call fails with unknown code', () => {
    let failure;

    before(() => {
      ({ bottle, failure } = buildTestBottle({
        [BOTTLE_NAMES.CLIENT_AWS]: {
          s3HeadObject: simple.stub().rejectWith({ code: 'Some Random Code' }),
        },
      }));
    });

    it('should fail with the expected message', async () => {
      const response = await handlerPromise(defaultEvent, defaultContext, bottle.container);
      expect(response).to.deep.equal(failure({ error: CONSTANTS.FAILURE_MESSAGE }));
    });
  });
});
