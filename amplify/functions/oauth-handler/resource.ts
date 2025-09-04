import { defineFunction } from '@aws-amplify/backend';

export const oauthHandler = defineFunction({
  name: 'oauth-handler',
  entry: './handler.ts',
  environment: {

    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    USER_POOL_ID: process.env.USER_POOL_ID || '',
    USER_POOL_CLIENT_ID: process.env.USER_POOL_CLIENT_ID || '',
  },
});
