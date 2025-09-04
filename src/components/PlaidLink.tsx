'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { PlaidService } from '../lib/plaid';

interface PlaidLinkProps {
  userId: string;
  onSuccess: (accessToken: string, itemId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

interface PlaidError {
  error_message?: string;
}

export default function PlaidLink({ userId, onSuccess, onError, className }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        setLoading(true);
        const token = await PlaidService.createLinkToken(userId);
        setLinkToken(token);
      } catch (error) {
        console.error('Failed to create link token:', error);
        onError?.(error as Error);
      } finally {
        setLoading(false);
      }
    };

    createLinkToken();
  }, [userId, onError]);

  const onPlaidSuccess = useCallback(
    async (public_token: string) => {
      try {
        setLoading(true);
        const { accessToken, itemId } = await PlaidService.exchangePublicToken(public_token);
        onSuccess(accessToken, itemId);
      } catch (error) {
        console.error('Failed to exchange public token:', error);
        onError?.(error as Error);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onError: (error: unknown) => {
      console.error('Plaid Link error:', error);
      const errorMessage = typeof error === 'object' && error !== null && 'error_message' in error 
        ? (error as PlaidError).error_message || 'Plaid Link failed'
        : 'Plaid Link failed';
      onError?.(new Error(errorMessage));
    },
    onExit: (error: unknown) => {
      if (error) {
        console.error('Plaid Link exit with error:', error);
        const errorMessage = typeof error === 'object' && error !== null && 'error_message' in error 
          ? (error as PlaidError).error_message || 'User exited Plaid Link'
          : 'User exited Plaid Link';
        onError?.(new Error(errorMessage));
      }
    },
  };

  const { open, ready } = usePlaidLink(config);

  const handleClick = () => {
    if (ready && linkToken) {
      open();
    }
  };

  if (loading || !linkToken) {
    return (
      <button
        disabled
        className={`flex items-center justify-center px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed ${className || ''}`}
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={!ready}
      className={`flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-lg transition-colors ${className || ''}`}
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Connect Bank Account
    </button>
  );
}
