import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { Download, Calendar, TrendingUp, DollarSign, Users, BarChart3 } from 'lucide-react';

interface ReportData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  sessions: {
    total: number;
    completed: number;
    cancelled: number;
    averagePerDay: number;
  };
  users: {
    total: number;
    newThisMonth: number;
    active: number;
  };
  topTherapists: Array<{
    name: string;
    sessions: number;
    revenue: number;
  }>;
  subscriptionDistribution: Record<string, number>;
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      const params: any = { range: dateRange };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await adminAPI.getReports(params);
      setReportData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    if (!reportData) return;
    
    if (format === 'csv') {
      const csv = [
        ['Metric', 'Value'].join(','),
        ['Total Revenue', reportData.revenue.total].join(','),
        ['This Month Revenue', reportData.revenue.thisMonth].join(','),
        ['Total Sessions', reportData.sessions.total].join(','),
        ['Completed Sessions', reportData.sessions.completed].join(','),
        ['Total Users', reportData.users.total].join(','),
        ['New Users This Month', reportData.users.newThisMonth].join(','),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!reportData) {
    return <div className="text-center py-12 text-gray-500">No report data available</div>;
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive platform analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
          {dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="End Date"
              />
            </>
          )}
          <button
            onClick={() => exportReport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${(reportData.revenue.total / 100).toFixed(2)}
          </p>
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {reportData.revenue.growth > 0 ? '+' : ''}{reportData.revenue.growth.toFixed(1)}% vs last month
          </p>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">This Month</h3>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${(reportData.revenue.thisMonth / 100).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {((reportData.revenue.thisMonth / reportData.revenue.total) * 100).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Sessions</h3>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{reportData.sessions.total}</p>
          <p className="text-sm text-gray-500 mt-2">
            {reportData.sessions.averagePerDay.toFixed(1)} avg/day
          </p>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{reportData.users.active}</p>
          <p className="text-sm text-gray-500 mt-2">
            {reportData.users.newThisMonth} new this month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Session Statistics */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Statistics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-semibold text-gray-900">
                  {reportData.sessions.completed} ({((reportData.sessions.completed / reportData.sessions.total) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(reportData.sessions.completed / reportData.sessions.total) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Cancelled</span>
                <span className="text-sm font-semibold text-gray-900">
                  {reportData.sessions.cancelled} ({((reportData.sessions.cancelled / reportData.sessions.total) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(reportData.sessions.cancelled / reportData.sessions.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Distribution */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Distribution</h2>
          <div className="space-y-3">
            {Object.entries(reportData.subscriptionDistribution).map(([tier, count]) => (
              <div key={tier}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">{tier}</span>
                  <span className="text-sm text-gray-900">{count} users</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{
                      width: `${(count / reportData.users.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Therapists */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Therapists</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Therapist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sessions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.topTherapists.map((therapist, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-indigo-600">#{index + 1}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {therapist.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {therapist.sessions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${(therapist.revenue / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

