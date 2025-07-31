import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaUserFriends,
  FaBook,
  FaGraduationCap,
  FaPlus,
  FaSignOutAlt,
  FaThLarge
} from 'react-icons/fa';

function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-56 bg-gradient-to-b from-[#0066cc] to-[#004c99] text-white fixed top-0 left-0 min-h-screen shadow-xl z-50 transition-all duration-300 ease-in-out">
      {/* Brand */}
      <div className="flex items-center justify-center h-16 font-bold text-xl bg-[#003366] border-b border-blue-900 shadow-inner tracking-wide">
        <FaThLarge className="mr-2 animate-pulse" />
        TrainSphere
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-4 py-6 text-sm font-medium">
        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-700 transition-all">
          <FaHome /> Dashboard
        </Link>
        <Link to="/courses" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-700 transition-all">
          <FaBook /> Courses
        </Link>
        <Link to="/certifications" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-700 transition-all">
          <FaGraduationCap /> Certifications
        </Link>
        <Link to="/employees" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-700 transition-all">
          <FaUserFriends /> Employees
        </Link>

        {user?.role === 'admin' && (
          <>
            <Link to="/add-course" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-700 transition-all">
              <FaPlus /> Add Course
            </Link>
            <Link to="/assign-course" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-700 transition-all">
              <FaPlus /> Assign Course
            </Link>
          </>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-3 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition"
        >
          <FaSignOutAlt /> Logout
        </button>
      </nav>

      {/* Footer user info */}
      {user && (
        <div className="absolute bottom-4 left-4 text-xs text-white font-light opacity-80">
          👤 {user.name || 'User'} ({user.role})
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
