import { defineBackend } from '@aws-amplify/backend';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { auth } from './auth/resource';
import { oauthHandler } from './functions/oauth-handler/resource';
import { plaidHandler } from './functions/plaid-handler/resource';
import { aiHandler } from './functions/ai-handler/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
  auth,
  oauthHandler,
  plaidHandler,
  aiHandler,
});

backend.oauthHandler.addEnvironment('USER_POOL_ID', backend.auth.resources.userPool.userPoolId);
backend.oauthHandler.addEnvironment('USER_POOL_CLIENT_ID', backend.auth.resources.userPoolClient.userPoolClientId);

const oauthFunction = backend.oauthHandler.resources.lambda;
const plaidFunction = backend.plaidHandler.resources.lambda;
const aiFunction = backend.aiHandler.resources.lambda;

const oauthFunctionUrl = oauthFunction.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
});

const plaidFunctionUrl = plaidFunction.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
});

const aiFunctionUrl = aiFunction.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
});

backend.addOutput({
  custom: {
    oauthHandlerUrl: oauthFunctionUrl.url,
    plaidHandlerUrl: plaidFunctionUrl.url,
    aiHandlerUrl: aiFunctionUrl.url,
  }
});
