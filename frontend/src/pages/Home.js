import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

function Home() {
  const [summary, setSummary] = useState({
    employees: 0,
    courses: 0,
    certifications: 0,
    expiring: []
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
    fetchDashboardData(storedUser);
  }, []);

  const fetchDashboardData = async (user) => {
    try {
      if (user?.role === 'admin') {
        const [empRes, courseRes, certRes, expiringRes] = await Promise.all([
          axios.get('/employees'),
          axios.get('/courses'),
          axios.get('/certifications'),
          axios.get('/certifications/expiring-soon')
        ]);

        setSummary({
          employees: empRes.data.length,
          courses: courseRes.data.length,
          certifications: certRes.data.length,
          expiring: expiringRes.data
        });
      } else {
        const [myCertsRes, myExpiringRes, myCoursesRes, empRes] = await Promise.all([
          axios.get('/certifications'),
          axios.get('/certifications/expiring-soon'),
          axios.get('/assigned-courses/my'),
          axios.get('/employees')
        ]);

        const myCertifications = myCertsRes.data.filter(
          cert => cert.employee?._id === user?.employee?._id
        );

        const myExpiring = myExpiringRes.data.filter(
          cert => cert.employee?._id === user?.employee?._id
        );

        setSummary({
          employees: empRes.data.length,
          courses: myCoursesRes.data.length,
          certifications: myCertifications.length,
          expiring: myExpiring
        });
      }
    } catch (err) {
      console.error('❌ Dashboard fetch failed:', err);
    }
  };

  const handleDeleteCertification = async (id) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      try {
        await axios.delete(`/certifications/${id}`);
        alert('✅ Certification deleted');
        fetchDashboardData(user);
      } catch (err) {
        console.error('❌ Delete failed:', err);
        alert('❌ Failed to delete certification');
      }
    }
  };

  return (
    <Layout user={user}>
      <div className="min-h-screen px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Welcome Header */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
            <h2 className="text-3xl font-bold text-[#232f3e] mb-2">
              🏠 Welcome to the Corporate Training System
            </h2>
            <p className="text-gray-600">
              Manage employee development, training, and certifications efficiently.
            </p>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                <h3 className="text-lg font-semibold text-blue-600">👥 Employees</h3>
                <p className="text-2xl font-bold text-gray-900">{summary.employees}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                <h3 className="text-lg font-semibold text-purple-600">📚 Courses</h3>
                <p className="text-2xl font-bold text-gray-900">{summary.courses}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                <h3 className="text-lg font-semibold text-green-600">🎓 Certifications</h3>
                <p className="text-2xl font-bold text-gray-900">{summary.certifications}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                <h3 className="text-lg font-semibold text-red-600">⚠️ Expiring Soon</h3>
                <p className="text-2xl font-bold text-gray-900">{summary.expiring.length}</p>
              </div>
            </div>
          </div>

          {/* Expiring Certifications */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-[#232f3e] mb-4">🔔 Certifications Expiring Soon</h3>
            <ul className="space-y-2">
              {summary.expiring.length === 0 ? (
                <li className="text-green-600 font-medium">✅ No upcoming expirations.</li>
              ) : (
                summary.expiring.map(cert => (
                  <li
                    key={cert._id}
                    className="bg-gray-50 p-3 rounded-lg flex justify-between items-center border border-gray-200"
                  >
                    <span className="text-gray-700">
                      {cert.title} –{' '}
                      <span className="font-medium text-blue-600">{cert.employee?.name || 'N/A'}</span> →{' '}
                      <b className="text-red-500">{new Date(cert.expiryDate).toLocaleDateString()}</b>
                    </span>
                    {user?.role === 'admin' && (
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                        onClick={() => handleDeleteCertification(cert._id)}
                      >
                        🗑 Delete
                      </button>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Quick Actions for Admin */}
          {user?.role === 'admin' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold text-[#232f3e] mb-4">🚀 Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Link to="/courses">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                    ➕ Add Course
                  </button>
                </Link>
                <Link to="/employees">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                    ➕ Add Employee
                  </button>
                </Link>
                <Link to="/certifications">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                    🎓 Assign Certification
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Home;
