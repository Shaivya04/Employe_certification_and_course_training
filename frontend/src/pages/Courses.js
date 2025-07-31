import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    instructor: '',
    duration: '',
    startDate: ''
  });

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      alert('❌ You must be logged in');
      navigate('/login');
    } else {
      setUser(storedUser);
      fetchCourses(storedUser);
    }
  }, []);

  const fetchCourses = async (user) => {
    try {
      if (user.role === 'admin') {
        const res = await axios.get('/courses');
        setCourses(res.data);
      } else {
        const res = await axios.get('/assigned-courses/my');
        const courseList = res.data
          .filter(item => item.course && item.course._id)
          .map(item => item.course);
        setCourses(courseList);
      }
    } catch (err) {
      console.error('❌ Failed to fetch courses:', err);
    }
  };

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      axios.delete(`/courses/${id}`)
        .then(() => {
          alert('✅ Course deleted');
          fetchCourses(user);
        })
        .catch(() => alert('❌ Failed to delete course'));
    }
  };

  const handleEditClick = (course) => {
    setEditId(course._id);
    setEditForm({
      name: course.name,
      description: course.description,
      instructor: course.instructor,
      duration: course.duration,
      startDate: course.startDate?.slice(0, 10) || ''
    });
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = e => {
    e.preventDefault();
    axios.put(`/courses/${editId}`, editForm)
      .then(() => {
        alert('✅ Course updated');
        setEditId(null);
        fetchCourses(user);
      })
      .catch(() => alert('❌ Update failed'));
  };

  return (
    <Layout user={user}>
      <div className="min-h-screen px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232f3e] mb-8">
            📚 {user?.role === 'admin' ? 'All Courses' : 'Your Courses'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div
                key={course._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                {editId === course._id ? (
                  <form onSubmit={handleEditSubmit} className="space-y-3">
                    <input
                      name="name"
                      placeholder="Course Name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      name="instructor"
                      placeholder="Instructor"
                      value={editForm.instructor}
                      onChange={handleEditChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      name="duration"
                      placeholder="Duration"
                      value={editForm.duration}
                      onChange={handleEditChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      name="startDate"
                      value={editForm.startDate}
                      onChange={handleEditChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 resize-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-between gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-500 transition"
                      >
                        ✅ Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 rounded-md hover:bg-gray-400 transition"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{course.name}</h3>
                    <p className="text-gray-700 mb-1"><strong>👨‍🏫 Instructor:</strong> {course.instructor}</p>
                    <p className="text-gray-700 mb-1"><strong>🕒 Duration:</strong> {course.duration}</p>
                    <p className="text-gray-700 mb-2"><strong>📅 Start:</strong> {new Date(course.startDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{course.description}</p>

                    {user?.role === 'admin' && (
                      <div className="flex justify-between items-center mt-4">
                        <button
                          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-500 transition"
                          onClick={() => handleEditClick(course)}
                        >
                          ✏ Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-400 transition"
                          onClick={() => handleDelete(course._id)}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Courses;
