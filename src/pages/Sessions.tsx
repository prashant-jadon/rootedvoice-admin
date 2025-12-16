import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { Search, Calendar, Video, User, Clock, Filter, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Session {
  _id: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: string;
  sessionType: string;
  clientId: {
    userId: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  therapistId: {
    userId: {
      firstName: string;
      lastName: string;
    };
  };
  meetingLink?: string;
  createdAt: string;
}

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  useEffect(() => {
    fetchSessions();
  }, [statusFilter, dateFilter]);

  const fetchSessions = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      
      const response = await adminAPI.getSessions(params);
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedSessions.length === 0) {
      alert('Please select sessions');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedSessions.length} session(s)?`)) {
      return;
    }

    try {
      await adminAPI.bulkSessionAction(selectedSessions, action);
      await fetchSessions();
      setSelectedSessions([]);
    } catch (error) {
      console.error(`Failed to ${action} sessions:`, error);
      alert(`Failed to ${action} sessions`);
    }
  };

  const exportSessions = () => {
    const csv = [
      ['Date', 'Time', 'Client', 'Therapist', 'Duration', 'Type', 'Status'].join(','),
      ...sessions.map(s => [
        new Date(s.scheduledDate).toLocaleDateString(),
        s.scheduledTime,
        `${s.clientId.userId.firstName} ${s.clientId.userId.lastName}`,
        `${s.therapistId.userId.firstName} ${s.therapistId.userId.lastName}`,
        s.duration,
        s.sessionType,
        s.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sessions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-600 mt-2">Manage all therapy sessions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportSessions}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchSessions()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={fetchSessions}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedSessions.length > 0 && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-900">
              {selectedSessions.length} session(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('cancel')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Cancel Selected
              </button>
              <button
                onClick={() => setSelectedSessions([])}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedSessions.length === sessions.length && sessions.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSessions(sessions.map(s => s._id));
                      } else {
                        setSelectedSessions([]);
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Therapist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(session._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSessions([...selectedSessions, session._id]);
                        } else {
                          setSelectedSessions(selectedSessions.filter(id => id !== session._id));
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(session.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.scheduledTime}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {session.clientId.userId.firstName} {session.clientId.userId.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{session.clientId.userId.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.therapistId.userId.firstName} {session.therapistId.userId.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.duration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                      {session.sessionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                      {getStatusIcon(session.status)}
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {session.meetingLink && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                      >
                        <Video className="w-4 h-4" />
                        Join
                      </a>
                    )}
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

