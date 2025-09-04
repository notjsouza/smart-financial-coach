import { defineBackend } from '@aws-amplify/backend';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { auth } from './auth/resource';
import { oauthHandler } from './functions/oauth-handler/resource';
import { plaidHandler } from './functions/plaid-handler/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
  auth,
  oauthHandler,
  plaidHandler,
});

const oauthFunction = backend.oauthHandler.resources.lambda;
const plaidFunction = backend.plaidHandler.resources.lambda;

oauthFunction.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
});

plaidFunction.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
});
