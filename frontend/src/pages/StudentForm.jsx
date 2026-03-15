import { useState, useEffect, useContext } from 'react';
import { createStudent, getOwnStudentProfile, updateStudent, uploadOfferLetter } from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

export default function StudentForm({ isProfile = false }) {
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(isProfile);
  const [studentId, setStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState('Basic Info');

  const tabs = ['Basic Info', 'Enrollments', 'Placements', 'Higher Education', 'Alumni Details'];
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    user_id: user?.id || '',
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    is_alumni: false,
    enrollments: [],
    higher_education: [],
    placements: [],
    alumni_details: null
  });

  useEffect(() => {
    if (isProfile) {
      loadOwnProfile();
    }
  }, [isProfile]);

  const loadOwnProfile = async () => {
    try {
      const response = await getOwnStudentProfile();
      if (response.data) {
        setStudentId(response.data.id);
        const data = response.data;
        setFormData({
          user_id: data.user_id,
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          date_of_birth: data.date_of_birth ? String(data.date_of_birth) : '',
          is_alumni: data.is_alumni || false,
          enrollments: data.enrollments.map(e => ({ ...e, enrollment_date: e.enrollment_date ? String(e.enrollment_date).split('T')[0] : '' })),
          higher_education: data.higher_education || [],
          placements: data.placements?.map(p => ({ ...p, placement_date: p.placement_date ? String(p.placement_date).split('T')[0] : '' })) || [],
          alumni_details: data.alumni_details || null
        });
      }
    } catch (err) {
      // 404 means no profile yet
      console.log("No profile found.");
    } finally {
      setInitialLoad(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addCourse = () => {
    setFormData({
      ...formData,
      enrollments: [
        ...formData.enrollments,
        { course_name: 'BCA', enrollment_date: new Date().toISOString().split('T')[0] }
      ]
    });
  };

  const removeCourse = (index) => {
    const newEnrollments = [...formData.enrollments];
    newEnrollments.splice(index, 1);
    setFormData({ ...formData, enrollments: newEnrollments });
  };

  const handleCourseChange = (index, field, value) => {
    const newEnrollments = [...formData.enrollments];
    newEnrollments[index][field] = value;
    setFormData({ ...formData, enrollments: newEnrollments });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      higher_education: [
        ...formData.higher_education,
        { degree_name: '', institution: '', passing_year: new Date().getFullYear(), percentage_or_cgpa: 0 }
      ]
    });
  };

  const removeEducation = (index) => {
    const newEdus = [...formData.higher_education];
    newEdus.splice(index, 1);
    setFormData({ ...formData, higher_education: newEdus });
  };

  const handleEducationChange = (index, field, value) => {
    const newEdus = [...formData.higher_education];
    newEdus[index][field] = value;
    setFormData({ ...formData, higher_education: newEdus });
  };

  const addPlacement = () => {
    setFormData({
      ...formData,
      placements: [
        ...formData.placements,
        { company_name: '', job_role: '', package: 0, placement_date: new Date().toISOString().split('T')[0], offer_letter_url: null }
      ]
    });
  };

  const removePlacement = (index) => {
    const newPlacements = [...formData.placements];
    newPlacements.splice(index, 1);
    setFormData({ ...formData, placements: newPlacements });
  };

  const handlePlacementChange = (index, field, value) => {
    const newPlacements = [...formData.placements];
    newPlacements[index][field] = value;
    setFormData({ ...formData, placements: newPlacements });
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;
    const formUpload = new FormData();
    formUpload.append('file', file);
    try {
      const res = await uploadOfferLetter(formUpload);
      handlePlacementChange(index, 'offer_letter_url', res.data.url);
      alert('Offer letter uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload file');
    }
  };

  const handleAlumniChange = (field, value) => {
    setFormData({
      ...formData,
      alumni_details: {
        ...(formData.alumni_details || { current_status: '', passing_year: new Date().getFullYear() }),
        [field]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (studentId) {
        await updateStudent(studentId, formData);
      } else {
        await createStudent(formData);
      }
      
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        alert("Profile saved successfully!");
      }
    } catch (error) {
      console.error(error);
      alert('Error saving student. Check console.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) return <div className="p-12 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center">
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => navigate('/admin')}
            className="mr-4 inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-900">
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={(e) => { e.preventDefault(); setActiveTab(tab); }}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow border border-gray-100">
        
        {/* Basic Info */}
        {activeTab === 'Basic Info' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            {!isProfile && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Link User Account ID (Required)</label>
                <input required type="number" name="user_id" value={formData.user_id} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                <p className="mt-1 text-xs text-gray-500">The database ID of the registered user account to bind to.</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input required type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input required type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>
        </div>
        )}

        {/* Courses */}
        {activeTab === 'Enrollments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Course Enrollments</h3>
            <button type="button" onClick={addCourse} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
              <Plus className="-ml-1 mr-1 h-4 w-4" /> Add Course
            </button>
          </div>
          {formData.enrollments.map((course, index) => (
            <div key={index} className="flex items-end gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Course Name</label>
                <select value={course.course_name} onChange={(e) => handleCourseChange(index, 'course_name', e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md py-2 px-3">
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="BCOM">BCOM</option>
                  <option value="BSC">BSC</option>
                  <option value="BA">BA</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Enrollment Date</label>
                <input required type="date" value={course.enrollment_date} onChange={(e) => handleCourseChange(index, 'enrollment_date', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
              </div>
              <button type="button" onClick={() => removeCourse(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-full mb-1">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        )}

        {/* Higher Education */}
        {activeTab === 'Higher Education' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Higher Education Details</h3>
            <button type="button" onClick={addEducation} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
              <Plus className="-ml-1 mr-1 h-4 w-4" /> Add Education
            </button>
          </div>
          {formData.higher_education.map((edu, index) => (
            <div key={index} className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-5 bg-gray-50 p-4 rounded-md border border-gray-200 items-end">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Degree Name</label>
                <input required placeholder="e.g. MCA, MBA" type="text" value={edu.degree_name} onChange={(e) => handleEducationChange(index, 'degree_name', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Institution</label>
                <input required type="text" value={edu.institution} onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <input required type="number" value={edu.passing_year} onChange={(e) => handleEducationChange(index, 'passing_year', parseInt(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">CGPA / Percentage</label>
                <input required type="number" step="0.1" value={edu.percentage_or_cgpa} onChange={(e) => handleEducationChange(index, 'percentage_or_cgpa', parseFloat(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
              </div>
              <div className="sm:col-span-3 flex justify-end">
                <button type="button" onClick={() => removeEducation(index)} className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Placements */}
        {activeTab === 'Placements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Placement Tracking</h3>
            <button type="button" onClick={addPlacement} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
              <Plus className="-ml-1 mr-1 h-4 w-4" /> Add Placement
            </button>
          </div>
          {formData.placements.map((placement, index) => (
            <div key={index} className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6 bg-gray-50 p-4 rounded-md border border-gray-200 items-end">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input required type="text" value={placement.company_name} onChange={(e) => handlePlacementChange(index, 'company_name', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Job Role</label>
                <input required type="text" value={placement.job_role} onChange={(e) => handlePlacementChange(index, 'job_role', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Package (LPA)</label>
                <input required type="number" step="0.1" value={placement.package} onChange={(e) => handlePlacementChange(index, 'package', parseFloat(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input required type="date" value={placement.placement_date} onChange={(e) => handlePlacementChange(index, 'placement_date', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="sm:col-span-5 flex items-center mt-2">
                <label className="block text-sm font-medium text-gray-700 mr-4">Offer Letter</label>
                {placement.offer_letter_url ? (
                  <span className="text-sm text-green-600 font-medium">Uploaded Successfully</span>
                ) : (
                  <input type="file" onChange={(e) => handleFileUpload(index, e.target.files[0])} className="text-sm border border-gray-300 rounded-md py-1 px-2" />
                )}
              </div>
              <div className="sm:col-span-1 flex justify-end">
                <button type="button" onClick={() => removePlacement(index)} className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Alumni Details */}
        {activeTab === 'Alumni Details' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Alumni Status & Tracking</h3>
          </div>
          <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="is_alumni"
                checked={formData.is_alumni}
                onChange={(e) => setFormData({ ...formData, is_alumni: e.target.checked })}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_alumni" className="ml-3 block text-md font-medium text-gray-900">
                Mark as Graduated Alumni
              </label>
            </div>

            {formData.is_alumni && (
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Passing Year</label>
                  <input
                    type="number"
                    value={formData.alumni_details?.passing_year || new Date().getFullYear()}
                    onChange={(e) => handleAlumniChange('passing_year', parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Status</label>
                  <select
                    value={formData.alumni_details?.current_status || ''}
                    onChange={(e) => handleAlumniChange('current_status', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Employed">Employed / Working</option>
                    <option value="Higher Education">Pursuing Higher Education</option>
                    <option value="Seeking Opportunities">Seeking Opportunities</option>
                    <option value="Entrepreneur">Entrepreneur / Self-Employed</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        <div className="pt-8 flex justify-end">
          {user?.role === 'ADMIN' && (
            <button type="button" onClick={() => navigate('/admin')} className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
