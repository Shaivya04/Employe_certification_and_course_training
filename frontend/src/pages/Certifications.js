import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

function Certifications() {
  const [form, setForm] = useState({
    title: '',
    issueDate: '',
    expiryDate: '',
    employee: ''
  });

  const [employees, setEmployees] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [selectedFile, setSelectedFile] = useState({});
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      alert('❌ You must be logged in');
      navigate('/login');
    } else {
      console.log('✅ Logged-in user:', storedUser);
      setUser(storedUser);
      fetchCertifications();
      fetchExpiringSoon();
      if (storedUser.role === 'admin') fetchEmployees();
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch employees', err);
    }
  };

  const fetchCertifications = async () => {
    try {
      const res = await axios.get('/certifications');
      const data = res.data;
      console.log('📦 All fetched certifications:', data);
      setCertifications(data);
    } catch (err) {
      console.error('❌ Failed to fetch certifications', err);
    }
  };

  const fetchExpiringSoon = async () => {
    try {
      const res = await axios.get('/certifications/expiring-soon');
      setExpiringSoon(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch expiring certifications', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/certifications', form);
      alert('✅ Certification assigned');
      setForm({ title: '', issueDate: '', expiryDate: '', employee: '' });
      fetchCertifications();
      fetchExpiringSoon();
    } catch (err) {
      alert('❌ Failed to assign certification');
      console.error(err);
    }
  };

  const handleFileChange = (e, certId) => {
    setSelectedFile((prev) => ({ ...prev, [certId]: e.target.files[0] }));
  };

  const handleUpload = async (certId) => {
    const file = selectedFile[certId];
    if (!file) return;
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      await axios.post(`/certifications/upload/${certId}`, formData);
      alert('📤 Certificate uploaded!');
      fetchCertifications();
    } catch (err) {
      console.error('❌ Upload failed', err);
      alert('❌ Upload failed');
    }
  };

  const handleDelete = async (certId) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;
    try {
      await axios.delete(`/certifications/${certId}`);
      alert('✅ Certification deleted');
      fetchCertifications();
      fetchExpiringSoon();
    } catch (err) {
      alert('❌ Failed to delete');
      console.error(err);
    }
  };

  return (
    <Layout user={user}>
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-200">

          {user?.role === 'admin' && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎓 Assign Certification</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Certification Title"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="issueDate"
                  value={form.issueDate}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="employee"
                  value={form.employee}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition"
                >
                  ➕ Assign Certification
                </button>
              </form>
              <hr className="my-6" />
            </>
          )}

          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            📋 {user?.role === 'admin' ? 'All Certifications' : 'Your Certifications'}
          </h3>

          <ul className="space-y-4">
            {certifications.map(cert => (
              <li
                key={cert._id}
                className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm"
              >
                <div className="mb-2 font-semibold text-gray-800">
                  {cert.title} — {cert.employee?.name || ''} —{' '}
                  <span className="text-red-600 font-medium">
                    Exp: {new Date(cert.expiryDate).toLocaleDateString()}
                  </span>
                </div>

                {cert.file ? (
                  <a
                    href={`/api/certifications/download/${cert.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    📄 Download Certificate
                  </a>
                ) : user?.role === 'admin' ? (
                  <div className="mt-2 space-y-2">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, cert._id)}
                      className="border border-gray-300 px-4 py-2 rounded-md"
                    />
                    <button
                      onClick={(e) => { e.preventDefault(); handleUpload(cert._id); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md"
                    >
                      Upload PDF
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">No file uploaded</p>
                )}

                {user?.role === 'admin' && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleDelete(cert._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md"
                    >
                      🗑 Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <hr className="my-8" />

          <h3 className="text-lg font-semibold text-gray-800 mb-4">⏰ Expiring Soon (Next 30 Days)</h3>
          <ul className="space-y-2">
            {expiringSoon.length === 0 ? (
              <li className="text-green-600">✅ No upcoming expirations</li>
            ) : (
              expiringSoon.map(cert => (
                <li
                  key={cert._id}
                  className="bg-yellow-100 p-3 rounded-md border border-yellow-300 flex justify-between items-center"
                >
                  <span>
                    {cert.title} - {cert.employee?.name} →{' '}
                    <b className="text-red-700">{new Date(cert.expiryDate).toLocaleDateString()}</b>
                  </span>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(cert._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                    >
                      🗑
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </Layout>
  );
}

export default Certifications;
