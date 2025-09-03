"use client";
import { useAuthenticator } from "@aws-amplify/ui-react";
import Dashboard from "../components/Dashboard";
import Login from "./login/page";

export default function Home() {
  const { user } = useAuthenticator((context) => [context.user]);

  return (
    <main>
      {user ? <Dashboard /> : <Login />}
    </main>
  );
}
