"use client";
import { Authenticator } from "@aws-amplify/ui-react";
import { AuthUser } from 'aws-amplify/auth';
import Dashboard from "../components/Dashboard";

export default function Home() {
  return (
    <main>
      <Authenticator
        socialProviders={['google']}
        loginMechanisms={['email']}
        signUpAttributes={['email']}
      >
        {({ user }: { user?: AuthUser }) => (
          <div>
            {user ? (
              <Dashboard />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Please sign in to continue</div>
              </div>
            )}
          </div>
        )}
      </Authenticator>
    </main>
  );
}
