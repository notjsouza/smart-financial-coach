'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CONFIG } from '../../../../lib/constants';

interface UserInfo {
  name: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  user: UserInfo;
  tokens?: {
    access_token: string;
    id_token: string;
  };
  cognitoTokens?: {
    status: string;
  } | null;
  error?: string;
}

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string>('');

  const exchangeCodeAndSignIn = useCallback(async (code: string) => {
    try {
      setStatus('loading');
      
      const requestUrl = `${CONFIG.OAUTH_HANDLER_URL}/auth/google/callback?code=${encodeURIComponent(code)}`;
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        
        setStatus('error');
        setError(errorMessage);
        return;
      }

      const data: AuthResponse = await response.json();

      if (!data.success) {
        setStatus('error');
        setError(data.error || 'OAuth authentication failed');
        return;
      }

      setUserInfo(data.user);
      setStatus('success');
      
      localStorage.setItem('oauth_authenticated', 'true');
      localStorage.setItem('google_user', JSON.stringify(data.user));
      
      setTimeout(() => {
        router.push('/?oauth_success=true');
      }, 2000);
      
    } catch (err: unknown) {
      console.error('Fetch error:', err);
      setStatus('error');
      setError(`Network error: ${err instanceof Error ? err.message : 'Failed to fetch'}`);
    }
  }, [router]);

  useEffect(() => {
    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setStatus('error');
      setError(`OAuth error: ${oauthError}`);
      return;
    }

    if (code) {
      exchangeCodeAndSignIn(code);
    } else {
      setStatus('error');
      setError('No authorization code received');
    }
  }, [searchParams, router, exchangeCodeAndSignIn]);

  const handleRetry = () => {
    window.location.href = '/';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Processing authentication...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Authentication Failed</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">{error}</p>
            </div>
            <div className="mt-6">
              <button
                onClick={handleRetry}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Authentication Successful!</h3>
          {userInfo && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">Welcome, {userInfo.name}!</p>
              <p className="text-xs text-gray-500">{userInfo.email}</p>
            </div>
          )}
          <div className="mt-6">
            <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
