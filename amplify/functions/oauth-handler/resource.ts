import { defineFunction } from '@aws-amplify/backend';

export const oauthHandler = defineFunction({
  name: 'oauth-handler',
  entry: './handler.ts',
  environment: {
    FRONTEND_URL: 'https://master.de1wgui96xpih.amplifyapp.com',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  },
});