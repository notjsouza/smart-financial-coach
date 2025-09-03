"use client";
import { Authenticator } from '@aws-amplify/ui-react';
import { AuthUser } from 'aws-amplify/auth';

function Login() {
  return (
    <Authenticator
      socialProviders={['google']}
      variation="modal"
      loginMechanisms={['email']}
    >
      {({ signOut, user }: { signOut?: () => void; user?: AuthUser }) => (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Welcome to Smart Financial Coach!</h1>
          <p>Hello, {user?.username || user?.signInDetails?.loginId}!</p>
          <button 
            onClick={signOut}
            style={{
              backgroundColor: '#ff4757',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </Authenticator>
  );
}

export default Login;