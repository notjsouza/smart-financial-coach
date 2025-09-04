import { defineFunction } from '@aws-amplify/backend';

export const plaidHandler = defineFunction({
  name: 'plaid-handler',
  entry: './handler.ts',
  environment: {
    PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID || '',
    PLAID_SECRET: process.env.PLAID_SECRET || '',
    PLAID_ENV: process.env.PLAID_ENV || 'sandbox',
  },
});
