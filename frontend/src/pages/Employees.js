import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

function Employees() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    joinDate: ''
  });

  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      alert('❌ You must be logged in');
      navigate('/login');
    } else {
      setUser(storedUser);
      fetchEmployees();
    }
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.name || !form.email || !form.joinDate) {
      alert('⚠️ Name, Email, and Join Date are required.');
      return;
    }

    try {
      await axios.post('/employees', form);
      alert('✅ Employee registered');
      setForm({ name: '', email: '', department: '', position: '', joinDate: '' });
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      console.error('❌ Registration error:', err.response?.data || err.message);
      alert('❌ Error registering employee: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchEmployees = () => {
    axios.get('/employees')
      .then(res => setEmployees(res.data))
      .catch(err => console.error('❌ Error fetching employees:', err));
  };

  return (
    <Layout user={user}>
      <div className="min-h-screen px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-10">
          {user?.role === 'admin' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-[#232f3e]">👤 Register New Employee</h2>
                <button
                  onClick={() => setShowForm(prev => !prev)}
                  className="text-sm text-yellow-600 hover:text-yellow-500 font-medium underline"
                >
                  {showForm ? 'Hide Form' : '➕ Add New'}
                </button>
              </div>

              {showForm && (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <input
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    name="department"
                    placeholder="Department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    name="position"
                    placeholder="Position"
                    value={form.position}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="date"
                    name="joinDate"
                    value={form.joinDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-white py-2 rounded-md font-semibold transition"
                  >
                    Register
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-[#232f3e] mb-4">📋 Registered Employees</h3>
            {employees.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map(emp => (
                  <div
                    key={emp._id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                  >
                    <h4 className="text-lg font-bold text-gray-800 mb-1">{emp.name}</h4>
                    <p className="text-sm text-gray-600"><strong>📧 Email:</strong> {emp.email}</p>
                    <p className="text-sm text-gray-600"><strong>🏢 Department:</strong> {emp.department || '—'}</p>
                    <p className="text-sm text-gray-600"><strong>💼 Position:</strong> {emp.position || '—'}</p>
                    <p className="text-sm text-gray-600"><strong>📅 Join Date:</strong> {new Date(emp.joinDate).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No employees found.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Employees;
