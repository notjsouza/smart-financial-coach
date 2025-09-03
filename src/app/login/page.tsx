"use client";
import { Authenticator } from '@aws-amplify/ui-react';
import { AuthUser } from 'aws-amplify/auth';

function Login() {
  return (
    <Authenticator>
      {({ signOut, user }: { signOut?: () => void; user?: AuthUser }) => (
        <div>
          <h1>Welcome, {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </Authenticator>
  );
}

export default Login;