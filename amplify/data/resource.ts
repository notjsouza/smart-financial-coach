import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  oauth: a
    .mutation()
    .arguments({
      provider: a.string().required(),
      action: a.string().required(),
    })
    .returns(a.string())
    .handler(a.handler.function('oauthHandler'))
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
