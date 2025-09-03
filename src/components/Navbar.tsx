"use client";
import { useAuthenticator } from "@aws-amplify/ui-react";

function Navbar() {
  const { user, signOut } = useAuthenticator((context) => [context.user, context.signOut]);

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">Smart Financial Coach</h1>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {user.signInDetails?.loginId || user.username}
              </span>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;