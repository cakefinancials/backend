export function BOTTLE_FACTORY(container) {
  const BOTTLE_NAMES = container.BOTTLE_NAMES;
  const logger = container[BOTTLE_NAMES.LIB_LOGGER].getContextualLogger('save_user_state_bag.handler');

  const lambdaEnvironmentHelper = container[BOTTLE_NAMES.SERVICE_LAMBDA_ENVIRONMENT_HELPER];
  const responseLib = container[BOTTLE_NAMES.LIB_RESPONSE];
  const userStateBagService = container[BOTTLE_NAMES.SERVICE_USER_STATE_BAG];

  const CONSTANTS = {
    FAILURE_MESSAGE: 'Failed to save the state bag for the user',
    SAVE_USER_STATE_BAG_ERROR: 'SaveUserStateBagError',
  };

  const SERVICE = {
    CONSTANTS,
    handler: async (event, context, callback) => {
      try {
        const userId = lambdaEnvironmentHelper.getCognitoIdentityId(event);
        // need to check for previous and next here
        const httpBody = lambdaEnvironmentHelper.getHTTPBody(event);
        const { previousState, nextState } = httpBody;

        const currentState = await userStateBagService.readUserState(userId);

        userStateBagService.verifyPreviousStateEqualsCurrentState(previousState, currentState);

        const writeResponse = await userStateBagService.writeUserState(userId, nextState);
        callback(null, responseLib.success(writeResponse));
      } catch (e) {
        logger.createAndLogWrappedError(CONSTANTS.SAVE_USER_STATE_BAG_ERROR, CONSTANTS.FAILURE_MESSAGE, e, {
          event,
          context,
        });
        callback(null, responseLib.failure({ error: CONSTANTS.FAILURE_MESSAGE }));
      }
    },
  };

  return SERVICE;
}
