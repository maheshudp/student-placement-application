import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002', // Changed to avoid port 8000/8001 zombie conflict
  headers: {
    'Bypass-Tunnel-Reminder': 'true' // Bypasses the localtunnel warning screen for API calls
  }
});

export const getStudents = () => api.get('/students/');
export const getStudent = (id) => api.get(`/students/${id}`);
export const getOwnStudentProfile = () => api.get('/students/me');
export const createStudent = (data) => api.post('/students/', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const getStudentTokens = (id) => api.get(`/students/${id}`);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

export const uploadOfferLetter = (formData) => api.post('/upload/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const getReports = () => api.get('/reports/');

export const downloadReportCSV = () => api.get('/reports/download/csv', { responseType: 'blob' });
export const downloadReportPDF = () => api.get('/reports/download/pdf', { responseType: 'blob' });

export default api;
