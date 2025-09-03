"use client";
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../lib/amplifyconfig';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(amplifyconfig);

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
