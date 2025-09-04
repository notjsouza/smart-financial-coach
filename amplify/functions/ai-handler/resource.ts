import { defineFunction, secret } from '@aws-amplify/backend';

export const aiHandler = defineFunction({
  name: 'ai-handler',
  entry: './handler.ts',
  environment: {
    OPENAI_API_KEY: secret('OPENAI_API_KEY'),
  },
});
