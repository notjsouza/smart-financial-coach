'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthenticator } from '@aws-amplify/ui-react';
import Dashboard from '../components/Dashboard';
import { CONFIG } from '../lib/constants';

interface GoogleUser {
  name: string;
  email: string;
}

function HomeContent() {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  
  // Check if user came back from successful OAuth
  useEffect(() => {
    const oauthSuccess = searchParams.get('oauth_success');
    if (oauthSuccess === 'true') {
      // Store a flag to show dashboard even without Amplify user
      localStorage.setItem('oauth_authenticated', 'true');
      // Try to get user info from localStorage if stored by callback
      const storedUser = localStorage.getItem('google_user');
      if (storedUser) {
        setGoogleUser(JSON.parse(storedUser));
      }
      
      // Dispatch event to notify navbar and other components
      window.dispatchEvent(new Event('auth-change'));
      
      // Clean up URL by removing the oauth_success parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('oauth_success');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  // Check localStorage on mount and listen for changes
  useEffect(() => {
    const checkAuthState = () => {
      const isOAuthAuthenticated = localStorage.getItem('oauth_authenticated') === 'true';
      const storedUser = localStorage.getItem('google_user');
      if (isOAuthAuthenticated && storedUser) {
        setGoogleUser(JSON.parse(storedUser));
      } else {
        setGoogleUser(null);
      }
    };

    // Check initial state
    checkAuthState();

    // Listen for storage changes (when sign out happens)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'oauth_authenticated' || e.key === 'google_user') {
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab changes)
    const handleAuthChange = () => checkAuthState();
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${CONFIG.OAUTH_HANDLER_URL}/auth/google`;
  };

  // If user is authenticated via Amplify OR Google OAuth, show dashboard
  const isAuthenticated = user || googleUser;

  if (isAuthenticated) {
    return <Dashboard />;
  }

  // Show login screen
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Smart Financial Coach
            </h2>
            <p className="text-gray-600">
              Your AI-powered financial planning assistant
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-50 px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign in with Email
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
