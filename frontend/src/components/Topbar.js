import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

function Topbar({ user }) {
  return (
    <header className="fixed top-0 left-56 right-0 h-16 bg-white shadow-md flex items-center justify-between px-8 z-30 border-b border-gray-200 transition-all duration-300 ease-in-out">
      {/* Welcome Message */}
      <div className="text-gray-800 text-base md:text-lg font-medium tracking-wide">
        Welcome, <span className="font-semibold">{user?.name || 'User'}</span> 👋
      </div>

      {/* User Info */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <FaUserCircle className="text-2xl text-gray-500" />
        <span className="hidden sm:inline">{user?.email || 'user@example.com'}</span>
      </div>
    </header>
  );
}

export default Topbar;
