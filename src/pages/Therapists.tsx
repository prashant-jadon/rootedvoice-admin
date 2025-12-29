import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { Search, UserCheck, Mail, Phone, Calendar, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, Eye, Pause, Play, FileCheck } from 'lucide-react';

interface Therapist {
  _id: string;
  userId?: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  specialization?: string[];
  specializations?: string[];
  hourlyRate?: number;
  experience?: number;
  createdAt?: string;
  status?: 'pending' | 'inactive' | 'active' | 'paused';
  credentials?: 'SLP' | 'SLPA';
  isVerified?: boolean;
  complianceDocuments?: {
    stateLicense?: {
      verified?: boolean;
    };
    liabilityInsurance?: {
      verified?: boolean;
    };
  };
}

export default function Therapists() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [statusReason, setStatusReason] = useState('');

  useEffect(() => {
    fetchTherapists();
  }, [search]);

  const fetchTherapists = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      
      const response = await adminAPI.getTherapists(params);
      setTherapists(response.data.data);
    } catch (error) {
      console.error('Failed to fetch therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (therapistId: string, newStatus: string) => {
    try {
      await adminAPI.updateTherapistStatus(therapistId, newStatus, statusReason);
      await fetchTherapists();
      setShowStatusModal(false);
      setSelectedTherapist(null);
      setStatusReason('');
      alert('Therapist status updated successfully');
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert(error.response?.data?.message || 'Failed to update therapist status');
    }
  };

  const handleComplianceVerify = async (therapistId: string, documentType: string, verified: boolean, notes?: string) => {
    try {
      await adminAPI.verifyTherapistCompliance(therapistId, documentType, verified, notes);
      await fetchTherapists();
      setShowComplianceModal(false);
      setSelectedTherapist(null);
      alert('Compliance verification updated successfully');
    } catch (error: any) {
      console.error('Failed to verify compliance:', error);
      alert(error.response?.data?.message || 'Failed to update compliance verification');
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case 'paused':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full flex items-center gap-1"><Pause className="w-3 h-3" /> Paused</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Inactive</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Therapists</h1>
        <p className="text-gray-600 mt-2">View and manage all registered therapists</p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search therapists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Therapist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credentials
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {therapists.map((therapist) => (
                <tr key={therapist._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {therapist.userId?.firstName || 'N/A'} {therapist.userId?.lastName || ''}
                        </div>
                        <div className="text-sm text-gray-500">{therapist.userId?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(therapist.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {therapist.credentials || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(therapist.specialization || therapist.specializations || []).length > 0 ? (
                        <>
                          {(therapist.specialization || therapist.specializations || []).slice(0, 2).map((spec: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded"
                            >
                              {spec}
                            </span>
                          ))}
                          {(therapist.specialization || therapist.specializations || []).length > 2 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{(therapist.specialization || therapist.specializations || []).length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">No specializations</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                      <DollarSign className="w-4 h-4" />
                      ${therapist.hourlyRate || 0}/hr
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {therapist.complianceDocuments?.stateLicense?.verified && therapist.complianceDocuments?.liabilityInsurance?.verified ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-yellow-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTherapist(therapist);
                          setShowStatusModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                      >
                        {therapist.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        Status
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTherapist(therapist);
                          setShowComplianceModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 flex items-center gap-1"
                      >
                        <FileCheck className="w-4 h-4" />
                        Verify
                      </button>
                      <a
                        href={`/therapists/earnings?therapistId=${therapist._id}`}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Earnings
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && selectedTherapist && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Update Therapist Status</h3>
            <p className="text-sm text-gray-600 mb-4">
              Current status: <strong>{selectedTherapist.status}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                defaultValue={selectedTherapist.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  if (newStatus === 'paused' || newStatus === 'inactive') {
                    // Show reason input
                  }
                }}
              >
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Enter reason for status change..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedTherapist(null);
                  setStatusReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const select = document.querySelector('select') as HTMLSelectElement;
                  handleStatusChange(selectedTherapist._id, select.value);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Modal */}
      {showComplianceModal && selectedTherapist && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Verify Compliance Documents</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State License</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'stateLicense', true)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'stateLicense', false)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                  {selectedTherapist.complianceDocuments?.stateLicense?.verified && (
                    <span className="text-green-600 text-sm">✓ Verified</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Liability Insurance</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'liabilityInsurance', true)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'liabilityInsurance', false)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                  {selectedTherapist.complianceDocuments?.liabilityInsurance?.verified && (
                    <span className="text-green-600 text-sm">✓ Verified</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  setShowComplianceModal(false);
                  setSelectedTherapist(null);
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
