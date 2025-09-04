"use client";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface GoogleUser {
  name: string;
  email: string;
}

function Navbar() {
  const { user, signOut } = useAuthenticator((context) => [context.user, context.signOut]);
  const router = useRouter();
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);

  // Check localStorage for Google OAuth user and listen for changes
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

    // Listen for storage changes and custom auth events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'oauth_authenticated' || e.key === 'google_user') {
        checkAuthState();
      }
    };

    const handleAuthChange = () => {
      // Small delay to ensure localStorage is updated
      setTimeout(checkAuthState, 100);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('focus', checkAuthState);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('focus', checkAuthState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Check if user is authenticated (either Amplify or Google OAuth)
  const isAuthenticated = user || googleUser;

  // If not authenticated, don't render the navbar
  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = () => {
    // Handle Amplify sign out
    if (user) {
      signOut();
    }
    
    // Handle Google OAuth sign out
    localStorage.removeItem('oauth_authenticated');
    localStorage.removeItem('google_user');
    setGoogleUser(null);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('auth-change'));
    
    // Redirect to home
    router.push('/');
  };

  // Get display name from either Amplify user or Google user
  const displayName = user?.signInDetails?.loginId || user?.username || googleUser?.name || 'User';

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">Smart Financial Coach</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Welcome, {displayName}
            </span>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;