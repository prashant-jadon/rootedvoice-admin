import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import { DollarSign, Clock, TrendingUp, Users, Calendar } from 'lucide-react';

interface EarningsData {
  therapist: {
    _id: string;
    credentials: string;
    hourlyRate: number;
  };
  summary: {
    totalHours: number;
    totalEarnings: number;
    totalRevenue: number;
    totalSessions: number;
  };
  byCredential: {
    [key: string]: {
      hours: number;
      earnings: number;
      sessions: number;
    };
  };
  period: {
    startDate: string | null;
    endDate: string | null;
  };
}

interface AllTherapistsEarnings {
  therapists: Array<{
    therapistId: string;
    name: string;
    email: string;
    credentials: string;
    totalHours: number;
    totalEarnings: number;
    totalSessions: number;
  }>;
  aggregate: {
    totalTherapists: number;
    totalHours: number;
    totalEarnings: number;
    byCredential: {
      SLP: {
        count: number;
        totalHours: number;
        totalEarnings: number;
      };
      SLPA: {
        count: number;
        totalHours: number;
        totalEarnings: number;
      };
    };
  };
  period: {
    startDate: string | null;
    endDate: string | null;
  };
}

export default function TherapistEarnings() {
  const [searchParams] = useSearchParams();
  const therapistIdParam = searchParams.get('therapistId');
  
  const [view, setView] = useState<'all' | 'individual'>(therapistIdParam ? 'individual' : 'all');
  const [allEarnings, setAllEarnings] = useState<AllTherapistsEarnings | null>(null);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>(therapistIdParam || '');
  const [individualEarnings, setIndividualEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (therapistIdParam) {
      setView('individual');
      setSelectedTherapistId(therapistIdParam);
    }
  }, [therapistIdParam]);

  useEffect(() => {
    if (view === 'all') {
      fetchAllEarnings();
    } else if (selectedTherapistId) {
      fetchIndividualEarnings();
    }
  }, [view, selectedTherapistId, startDate, endDate]);

  const fetchAllEarnings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await adminAPI.getAllTherapistsEarnings(params);
      setAllEarnings(response.data.data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIndividualEarnings = async () => {
    if (!selectedTherapistId) return;
    
    setLoading(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await adminAPI.getTherapistEarnings(selectedTherapistId, params);
      setIndividualEarnings(response.data.data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Therapist Earnings & Hours</h1>
        <p className="text-gray-600 mt-2">View therapist earnings, hours worked, and aggregate statistics</p>
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setView('all')}
          className={`px-4 py-2 rounded-lg ${
            view === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Therapists
        </button>
        <button
          onClick={() => setView('individual')}
          className={`px-4 py-2 rounded-lg ${
            view === 'individual'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Individual Therapist
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
      </div>

      {view === 'all' && allEarnings && (
        <div className="space-y-6">
          {/* Aggregate Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Therapists</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {allEarnings.aggregate.totalTherapists}
                  </p>
                </div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {allEarnings.aggregate.totalHours.toFixed(2)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(allEarnings.aggregate.totalEarnings)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg per Therapist</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {allEarnings.aggregate.totalTherapists > 0
                      ? formatCurrency(allEarnings.aggregate.totalEarnings / allEarnings.aggregate.totalTherapists)
                      : '$0.00'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* By Credential Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SLP (Fully Licensed)</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Count:</span>
                  <span className="font-semibold">{allEarnings.aggregate.byCredential.SLP.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Hours:</span>
                  <span className="font-semibold">{allEarnings.aggregate.byCredential.SLP.totalHours.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Earnings:</span>
                  <span className="font-semibold">{formatCurrency(allEarnings.aggregate.byCredential.SLP.totalEarnings)}</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SLPA (Assistants)</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Count:</span>
                  <span className="font-semibold">{allEarnings.aggregate.byCredential.SLPA.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Hours:</span>
                  <span className="font-semibold">{allEarnings.aggregate.byCredential.SLPA.totalHours.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Earnings:</span>
                  <span className="font-semibold">{formatCurrency(allEarnings.aggregate.byCredential.SLPA.totalEarnings)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Therapists Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Individual Therapist Earnings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Therapist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credentials</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sessions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allEarnings.therapists.map((therapist) => (
                    <tr key={therapist.therapistId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{therapist.name}</div>
                          <div className="text-sm text-gray-500">{therapist.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {therapist.credentials}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{therapist.totalHours.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(therapist.totalEarnings)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{therapist.totalSessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {view === 'individual' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Therapist</label>
            <select
              value={selectedTherapistId}
              onChange={(e) => setSelectedTherapistId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select a therapist...</option>
              {allEarnings?.therapists.map((t) => (
                <option key={t.therapistId} value={t.therapistId}>
                  {t.name} ({t.credentials})
                </option>
              ))}
            </select>
          </div>

          {individualEarnings && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {individualEarnings.summary.totalHours.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(individualEarnings.summary.totalEarnings)}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(individualEarnings.summary.totalRevenue)}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {individualEarnings.summary.totalSessions}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Therapist Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credentials:</span>
                    <span className="font-semibold">{individualEarnings.therapist.credentials}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hourly Rate:</span>
                    <span className="font-semibold">${individualEarnings.therapist.hourlyRate}/hr</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

