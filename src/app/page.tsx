"use client";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { AuthUser } from 'aws-amplify/auth';
import Dashboard from "../components/Dashboard";
import Login from "./login/page";

export default function Home() {
  const { user } = useAuthenticator((context: { user: AuthUser }) => [context.user]);

  return (
    <main>
      {user ? <Dashboard /> : <Login />}
    </main>
  );
}
