import { defineBackend } from '@aws-amplify/backend';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { auth } from './auth/resource';
import { oauthHandler } from './functions/oauth-handler/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
  auth,
  oauthHandler,
});

const oauthFunction = backend.oauthHandler.resources.lambda;

oauthFunction.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
});
