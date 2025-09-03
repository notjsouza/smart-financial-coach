"use client";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { AuthUser } from 'aws-amplify/auth';
import Dashboard from "../components/Dashboard";
import Login from "./login/page";

export default function Home() {
  const { user, authStatus } = useAuthenticator((context: { user: AuthUser; authStatus: string }) => [context.user, context.authStatus]);

  if (authStatus === 'configuring') {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main>
      {user ? <Dashboard /> : <Login />}
    </main>
  );
}
