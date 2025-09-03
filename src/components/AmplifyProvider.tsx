"use client";
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import amplifyOutputs from '../../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(amplifyOutputs);

export default function AmplifyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticator.Provider>
      {children}
    </Authenticator.Provider>
  );
}
