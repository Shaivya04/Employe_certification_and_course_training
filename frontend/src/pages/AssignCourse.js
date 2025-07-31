import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { FaUser, FaBook } from 'react-icons/fa';

function AssignCourse() {
  const [employees, setEmployees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [form, setForm] = useState({
    employeeId: '',
    courseId: ''
  });

  const fetchData = async () => {
    try {
      const [empRes, courseRes, assignRes] = await Promise.all([
        axios.get('/employees'),
        axios.get('/courses'),
        axios.get('/assigned-courses'),
      ]);

      setEmployees(empRes.data);
      setCourses(courseRes.data);
      setAssignments(assignRes.data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.employeeId || !form.courseId) {
      alert('⚠️ Select both employee and course');
      return;
    }
    try {
      // ✅ Match backend keys exactly
      await axios.post('/assigned-courses', {
        employee: form.employeeId,
        course: form.courseId,
      });

      alert('✅ Course assigned');
      setForm({ employeeId: '', courseId: '' });
      fetchData();
    } catch (err) {
      alert('❌ Assignment failed: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-xl border border-gray-200 rounded-xl p-8 transition-all duration-300 ease-in-out">
        <h2 className="text-2xl font-bold text-[#232f3e] mb-6 animate-fadeIn">📌 Assign Course to Employee</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaUser className="text-purple-600" /> Select Employee
            </label>
            <select
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:ring-2 focus:ring-purple-500 transition"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaBook className="text-indigo-600" /> Select Course
            </label>
            <select
              name="courseId"
              value={form.courseId}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">-- Choose Course --</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 font-semibold rounded-lg shadow-md transition-all duration-200"
          >
            ✅ Assign Course
          </button>
        </form>

        <div className="mt-10 animate-fadeIn">
          <h3 className="text-xl font-semibold text-[#232f3e] mb-4">🗂️ Assigned Courses</h3>
          {assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map(assign => (
                <div
                  key={assign._id}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 shadow-sm flex justify-between items-center hover:shadow-md transition"
                >
                  <span className="text-gray-700 text-sm">
                    <strong>{assign.course?.name || '—'}</strong>{' '}
                    <span className="text-gray-500">→ {assign.employee?.name || '—'}</span>{' '}
                    <span className="text-gray-400">({new Date(assign.assignedDate).toLocaleDateString()})</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No course assignments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssignCourse;
