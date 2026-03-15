import React, { useEffect, useState } from 'react';
import { getReports } from '../api/axios';
import { BarChart3, Users, Briefcase, IndianRupee, GraduationCap } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className={`flex-shrink-0 bg-${color}-100 rounded-md p-3`}>
          <Icon className={`h-6 w-6 text-${color}-600`} aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-lg font-medium text-gray-900">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getReports();
        setReports(res.data);
      } catch (err) {
        setError('Failed to fetch reports. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="mr-3 text-indigo-600 h-8 w-8" />
          University Analytics Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          A broad overview of student population logic, placements, and alumni networking metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Registered Students" 
          value={reports.total_students} 
          icon={Users} 
          color="indigo" 
        />
        <StatCard 
          title="Total Placements" 
          value={reports.total_placements} 
          icon={Briefcase} 
          color="green" 
        />
        <StatCard 
          title="Average Package (LPA)" 
          value={`₹${reports.average_package_lpa}`} 
          icon={IndianRupee} 
          color="emerald" 
        />
        <StatCard 
          title="Alumni Network Size" 
          value={reports.total_alumni} 
          icon={GraduationCap} 
          color="purple" 
        />
      </div>

      <div className="mt-12 bg-white shadow rounded-lg p-6 border-t-4 border-indigo-500">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Placement Rate Insights</h3>
        <div className="mt-5 relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                Placement Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-indigo-600">
                {reports.total_students > 0 
                  ? Math.round((reports.placed_students / reports.total_students) * 100) 
                  : 0}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
            <div 
              style={{ width: `${reports.total_students > 0 ? (reports.placed_students / reports.total_students) * 100 : 0}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-1000 ease-out"
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {reports.placed_students} distinct out of {reports.total_students} total students have secured at least one placement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
