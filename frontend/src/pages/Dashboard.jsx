import { useState, useEffect } from 'react';
import { getStudents, deleteStudent } from '../api/axios';
import { Users, GraduationCap, Plus, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(id);
        fetchStudents();
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            Student Information System
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage degree students (BCA, BBA, BCOM) and higher education details.
          </p>
        </div>
        <button
          onClick={() => navigate('/form')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Student Profile
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No students</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new student record.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {students.map((student) => (
              <li key={student.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-indigo-600 truncate">
                      {student.first_name} {student.last_name}
                    </h4>
                    <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6 gap-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        Email: {student.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        Phone: {student.phone_number}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        DOB: {student.date_of_birth}
                      </div>
                    </div>
                    {/* Courses */}
                    <div className="mt-3">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Enrolled Courses</h5>
                      <div className="flex gap-2">
                        {student.enrollments?.map(enc => (
                          <span key={enc.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {enc.course_name}
                          </span>
                        ))}
                        {(!student.enrollments || student.enrollments.length === 0) && (
                          <span className="text-sm text-gray-400">No courses listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex gap-2">
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete Student"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
