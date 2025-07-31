import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from './utils/axios';

import Layout from './components/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Certifications from './pages/Certifications';
import Employees from './pages/Employees';
import AddCourse from './pages/AddCourse';
import AssignCourse from './pages/AssignCourse';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🧠 prevent premature redirects

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false); // 🔓 finished checking auth
  }, []);

  const isAuthenticated = () => !!user;
  const isAdmin = () => user?.role === 'admin';

  const PrivateRoute = ({ children }) =>
    isAuthenticated() ? <Layout user={user}>{children}</Layout> : <Navigate to="/login" />;

  const AdminRoute = ({ children }) =>
    isAuthenticated() && isAdmin() ? <Layout user={user}>{children}</Layout> : <Navigate to="/" />;

  if (loading) return null; // or a spinner

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PrivateRoute><Home user={user} /></PrivateRoute>} />
        <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
        <Route path="/certifications" element={<PrivateRoute><Certifications /></PrivateRoute>} />
        <Route path="/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
        <Route path="/add-course" element={<AdminRoute><AddCourse /></AdminRoute>} />
        <Route path="/assign-course" element={<AdminRoute><AssignCourse /></AdminRoute>} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
