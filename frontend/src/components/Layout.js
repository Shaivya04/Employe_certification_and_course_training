import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function Layout({ children, user }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-56 pt-16 bg-gray-100 min-h-screen transition-all duration-300 ease-in-out">
        <Topbar user={user} />
        <main className="p-4 md:p-6 max-w-[1400px] mx-auto transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
