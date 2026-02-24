import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { Search, UserCheck, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, Eye, Pause, Play, FileCheck, Check, X, Star, Puzzle, FileText, Download, ZoomIn, XCircle as XClose } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Convert private Vercel Blob URLs to go through our authenticated proxy
const getBlobProxyUrl = (url: string): string => {
  if (!url) return url;
  if (url.includes('blob.vercel-storage.com')) {
    return `${API_BASE_URL}/blob/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

// Helper to detect if a URL is an image
const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const lowerUrl = url.toLowerCase().split('?')[0]; // strip query params
  return imageExtensions.some(ext => lowerUrl.endsWith(ext));
};

// Helper to detect if a URL is a PDF
const isPdfUrl = (url: string): boolean => {
  return url.toLowerCase().split('?')[0].endsWith('.pdf');
};

// Reusable document preview component
const DocumentPreview = ({ url, onImageClick }: { url: string; onImageClick?: (url: string) => void }) => {
  if (!url) return null;
  const proxiedUrl = getBlobProxyUrl(url);

  // For blob URLs, we can't reliably detect filetype from extension.
  // Try to render as image; if it fails, the onError handler shows a Download link.
  const isBlobUrl = url.includes('blob.vercel-storage.com');
  const shouldTryImage = isBlobUrl || isImageUrl(url);
  const shouldShowPdf = !isBlobUrl && isPdfUrl(url);

  if (shouldTryImage) {
    return (
      <div className="mt-2 mb-2">
        <div
          className="relative group cursor-pointer inline-block border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          onClick={() => onImageClick?.(proxiedUrl)}
        >
          <img
            src={proxiedUrl}
            alt="Document"
            className="max-w-full max-h-48 object-contain rounded-lg"
            onError={(e) => {
              // If image fails (e.g. it's a PDF), hide the image and show fallback link
              const img = e.target as HTMLImageElement;
              const parent = img.closest('.mt-2.mb-2');
              if (parent) {
                parent.innerHTML = `<a href="${proxiedUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;color:#2563eb;font-size:14px;text-decoration:none;">📄 View / Download Document</a>`;
              }
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
        </div>
        <a href={proxiedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs mt-1">
          <Download className="w-3 h-3" /> Open full size
        </a>
      </div>
    );
  }

  if (shouldShowPdf) {
    return (
      <div className="mt-2 mb-2">
        <a href={proxiedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-blue-600 hover:bg-gray-100 text-sm transition-colors">
          <FileText className="w-4 h-4" />
          View PDF Document
          <Download className="w-3 h-3" />
        </a>
      </div>
    );
  }

  // Fallback for other file types
  return (
    <div className="mt-2 mb-2">
      <a href={proxiedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-blue-600 hover:bg-gray-100 text-sm transition-colors">
        <FileText className="w-4 h-4" />
        View Document
        <Download className="w-3 h-3" />
      </a>
    </div>
  );
};

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
  canSupervise?: boolean;
  isVerified?: boolean;
  complianceDocuments?: {
    // US-based fields (primary)
    ashaCertification?: {
      certificationNumber?: string;
      expirationDate?: string;
      documentUrl?: string;
      verified?: boolean;
    };

    stateLicensures?: Array<{
      _id: string;
      licenseNumber?: string;
      state?: string;
      expirationDate?: string;
      documentUrl?: string;
      verified?: boolean;
      verifiedAt?: string;
      verifiedBy?: string;
    }>;
    stateLicensure?: {
      licenseNumber?: string;
      state?: string;
      expirationDate?: string;
      documentUrl?: string;
      verified?: boolean;
    };
    supervision?: {
      supervisingSLPName?: string;
      supervisingSLPLicenseNumber?: string;
      supervisingState?: string;
      agreementDocumentUrl?: string;
      verified?: boolean;
    };
    professionalLiabilityInsurance?: {
      provider?: string;
      policyNumber?: string;
      coverageAmount?: string;
      expirationDate?: string;
      documentUrl?: string;
      verified?: boolean;
    };
    backgroundCheck?: {
      clearanceNumber?: string;
      state?: string;
      expirationDate?: string;
      documentUrl?: string;
      verified?: boolean;
    };
    // Legacy fields for backward compatibility
    spaMembership?: {
      membershipNumber?: string;
      membershipType?: string;
      expirationDate?: string;
      documentUrl?: string;
      verified?: boolean;
    };
    stateRegistration?: {
      registrationNumber?: string;
      state?: string;
      expirationDate?: string;
      documentUrl?: string;
      verified?: boolean;
    };
    professionalIndemnityInsurance?: {
      provider?: string;
      policyNumber?: string;
      coverageAmount?: string;
      expirationDate?: string;
      documentUrl?: string;
      verified?: boolean;
    };
    workingWithChildrenCheck?: {
      checkNumber?: string;
      state?: string;
      expirationDate?: string;
      documentUrl?: string;
      verified?: boolean;
    };
    policeCheck?: {
      checkNumber?: string;
      issueDate?: string;
      expirationDate?: string;
      documentUrl?: string;
      verified?: boolean;
    };
    stateLicense?: {
      verified?: boolean;
      number?: string;
      state?: string;
      documentUrl?: string;
    };
    liabilityInsurance?: {
      verified?: boolean;
      provider?: string;
      policyNumber?: string;
      documentUrl?: string;
    };
  };
  availability?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
}

export default function Therapists() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [statusReason, setStatusReason] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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

  const handleComplianceVerify = async (therapistId: string, documentType: string, verified: boolean, notes?: string, credentialId?: string) => {
    try {
      await adminAPI.verifyTherapistCompliance(therapistId, documentType, verified, notes, credentialId);
      await fetchTherapists();
      setShowComplianceModal(false);
      setSelectedTherapist(null);
      alert('Compliance verification updated successfully');
    } catch (error: any) {
      console.error('Failed to verify compliance:', error);
      alert(error.response?.data?.message || 'Failed to update compliance verification');
    }
  };

  const handleQuickApprove = async (therapistId: string) => {
    if (window.confirm('Are you sure you want to approve this therapist? This will set their status to active.')) {
      try {
        await adminAPI.updateTherapistStatus(therapistId, 'active', 'Approved by admin');
        await fetchTherapists();
        alert('Therapist approved successfully');
      } catch (error: any) {
        console.error('Failed to approve therapist:', error);
        alert(error.response?.data?.message || 'Failed to approve therapist');
      }
    }
  };

  const handleQuickReject = async (therapistId: string) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      try {
        await adminAPI.updateTherapistStatus(therapistId, 'inactive', reason || 'Rejected by admin');
        await fetchTherapists();
        alert('Therapist rejected successfully');
      } catch (error: any) {
        console.error('Failed to reject therapist:', error);
        alert(error.response?.data?.message || 'Failed to reject therapist');
      }
    }
  };

  const handleToggleSupervising = async (therapistId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'remove supervising status from' : 'designate as supervisor for';
    if (window.confirm(`Are you sure you want to ${action} this therapist?`)) {
      try {
        await adminAPI.updateTherapistSupervising(therapistId, !currentStatus);
        await fetchTherapists();
        alert(`Therapist ${!currentStatus ? 'designated as supervisor' : 'removed from supervising role'} successfully`);
      } catch (error: any) {
        console.error('Failed to update supervising status:', error);
        alert(error.response?.data?.message || 'Failed to update supervising status');
      }
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
                        <button
                          onClick={() => {
                            setSelectedTherapist(therapist);
                            setShowComplianceModal(true);
                          }}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline text-left"
                          title="View Profile Details"
                        >
                          {therapist.userId?.firstName || 'N/A'} {therapist.userId?.lastName || ''}
                        </button>
                        <div className="text-sm text-gray-500">{therapist.userId?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(therapist.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {therapist.credentials === 'SLP' && therapist.canSupervise ? (
                        <button
                          onClick={() => handleToggleSupervising(therapist._id, true)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors cursor-pointer"
                          title="⭐ Supervising SLP - Click to remove supervising status"
                        >
                          <Star className="w-3.5 h-3.5 fill-yellow-600 text-yellow-600" />
                          Supervising SLP
                        </button>
                      ) : therapist.credentials === 'SLP' ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Licensed SLP
                          </span>
                          <button
                            onClick={() => handleToggleSupervising(therapist._id, false)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors cursor-pointer border border-dashed border-gray-300"
                            title="Click to designate as supervising SLP"
                          >
                            <Star className="w-3 h-3" />
                            Add
                          </button>
                        </div>
                      ) : therapist.credentials === 'SLPA' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          <Puzzle className="w-3.5 h-3.5" />
                          SLPA
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {therapist.credentials || 'N/A'}
                        </span>
                      )}
                    </div>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      {therapist.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleQuickApprove(therapist._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm"
                            title="Approve Therapist"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleQuickReject(therapist._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm"
                            title="Reject Therapist"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleQuickApprove(therapist._id)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1.5 text-sm font-medium transition-colors"
                            title="Activate Therapist"
                          >
                            <Check className="w-4 h-4" />
                            Activate
                          </button>
                          <button
                            onClick={() => handleQuickReject(therapist._id)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1.5 text-sm font-medium transition-colors"
                            title="Deactivate Therapist"
                          >
                            <X className="w-4 h-4" />
                            Deactivate
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedTherapist(therapist);
                          setShowStatusModal(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1.5 text-sm font-medium transition-colors"
                        title="Change Status"
                      >
                        {therapist.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        Status
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTherapist(therapist);
                          setShowComplianceModal(true);
                        }}
                        className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-1.5 text-sm font-medium transition-colors"
                        title="Verify Compliance Documents"
                      >
                        <FileCheck className="w-4 h-4" />
                        Verify
                      </button>
                      <a
                        href={`/therapists/earnings?therapistId=${therapist._id}`}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 text-sm font-medium transition-colors"
                        title="View Earnings"
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
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Therapist Profile & Compliance</h3>
            <p className="text-sm text-gray-600 mb-4">
              Therapist: <strong>{selectedTherapist.userId?.firstName} {selectedTherapist.userId?.lastName}</strong>
            </p>

            {/* Weekly Availability */}
            <div className="border border-blue-200 rounded-lg p-4 mb-6 bg-blue-50">
              <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Weekly Availability
              </h4>
              {selectedTherapist.availability && selectedTherapist.availability.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Group slots by day for display */}
                  {Object.entries(
                    selectedTherapist.availability.reduce((acc: any, slot: any) => {
                      if (!acc[slot.day]) acc[slot.day] = [];
                      acc[slot.day].push({ startTime: slot.startTime, endTime: slot.endTime });
                      return acc;
                    }, {})
                  ).map(([day, slots]: [string, any], idx) => (
                    <div key={idx} className="bg-white rounded-lg px-3 py-2 border border-blue-100">
                      <span className="font-medium text-gray-800 text-sm">{day}</span>
                      <div className="mt-1 space-y-1">
                        {slots.map((s: any, sIdx: number) => (
                          <div key={sIdx} className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-500" />
                            {s.startTime} — {s.endTime}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-blue-600 italic">No availability set by this therapist yet.</p>
              )}
            </div>

            <div className="space-y-6">
              {/* ASHA Certification (SLP Only) */}
              {selectedTherapist.credentials === 'SLP' && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">ASHA Certification (SLP Only)</label>
                    {selectedTherapist.complianceDocuments?.ashaCertification?.verified ? (
                      <span className="text-green-600 text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Pending
                      </span>
                    )}
                  </div>
                  {selectedTherapist.complianceDocuments?.ashaCertification && (
                    <div className="mb-3 space-y-1 text-sm">
                      {selectedTherapist.complianceDocuments.ashaCertification.certificationNumber && (
                        <div><span className="text-gray-600">Certification # (CCC-SLP):</span> <span className="font-medium">{selectedTherapist.complianceDocuments.ashaCertification.certificationNumber}</span></div>
                      )}
                      {selectedTherapist.complianceDocuments.ashaCertification.expirationDate && (
                        <div><span className="text-gray-600">Expiration:</span> <span className="font-medium">{new Date(selectedTherapist.complianceDocuments.ashaCertification.expirationDate).toLocaleDateString()}</span></div>
                      )}
                      {selectedTherapist.complianceDocuments.ashaCertification.documentUrl && (
                        <DocumentPreview url={selectedTherapist.complianceDocuments.ashaCertification.documentUrl} onImageClick={setLightboxImage} />
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleComplianceVerify(selectedTherapist._id, 'ashaCertification', true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      ✓ Verify
                    </button>
                    <button
                      onClick={() => handleComplianceVerify(selectedTherapist._id, 'ashaCertification', false)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              )}

              {/* State Licensure */}
              {(selectedTherapist.complianceDocuments?.stateLicensures && selectedTherapist.complianceDocuments.stateLicensures.length > 0) ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">State Licensures</label>
                  <div className="space-y-4">
                    {selectedTherapist.complianceDocuments.stateLicensures.map((license, index) => (
                      <div key={license._id || index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800">{license.state} License</span>
                          {license.verified ? (
                            <span className="text-green-600 text-sm flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Verified
                            </span>
                          ) : (
                            <span className="text-yellow-600 text-sm flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" /> Pending
                            </span>
                          )}
                        </div>
                        <div className="mb-3 space-y-1 text-sm">
                          {license.licenseNumber && (
                            <div><span className="text-gray-600">License #:</span> <span className="font-medium">{license.licenseNumber}</span></div>
                          )}
                          {license.state && (
                            <div><span className="text-gray-600">State:</span> <span className="font-medium">{license.state}</span></div>
                          )}
                          {license.expirationDate && (
                            <div><span className="text-gray-600">Expiration:</span> <span className="font-medium">{new Date(license.expirationDate).toLocaleDateString()}</span></div>
                          )}
                          {license.documentUrl && (
                            <DocumentPreview url={license.documentUrl} onImageClick={setLightboxImage} />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleComplianceVerify(selectedTherapist._id, 'stateLicensures', true, undefined, license._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            ✓ Verify
                          </button>
                          <button
                            onClick={() => handleComplianceVerify(selectedTherapist._id, 'stateLicensures', false, undefined, license._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">State Licensure</label>
                    {selectedTherapist.complianceDocuments?.stateLicensure?.verified ? (
                      <span className="text-green-600 text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Pending
                      </span>
                    )}
                  </div>
                  {selectedTherapist.complianceDocuments?.stateLicensure && (
                    <div className="mb-3 space-y-1 text-sm">
                      {selectedTherapist.complianceDocuments.stateLicensure.licenseNumber && (
                        <div><span className="text-gray-600">License #:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.stateLicensure.licenseNumber}</span></div>
                      )}
                      {selectedTherapist.complianceDocuments.stateLicensure.state && (
                        <div><span className="text-gray-600">Licensing State:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.stateLicensure.state}</span></div>
                      )}
                      {selectedTherapist.complianceDocuments.stateLicensure.expirationDate && (
                        <div><span className="text-gray-600">Expiration:</span> <span className="font-medium">{new Date(selectedTherapist.complianceDocuments.stateLicensure.expirationDate).toLocaleDateString()}</span></div>
                      )}
                      {selectedTherapist.complianceDocuments.stateLicensure.documentUrl && (
                        <DocumentPreview url={selectedTherapist.complianceDocuments.stateLicensure.documentUrl} onImageClick={setLightboxImage} />
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleComplianceVerify(selectedTherapist._id, 'stateLicensure', true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      ✓ Verify
                    </button>
                    <button
                      onClick={() => handleComplianceVerify(selectedTherapist._id, 'stateLicensure', false)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Supervision (SLPA Only) */}
              {selectedTherapist.credentials === 'SLPA' && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Supervision (SLPA Only)</label>
                    {selectedTherapist.complianceDocuments?.supervision?.verified ? (
                      <span className="text-green-600 text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Pending
                      </span>
                    )}
                  </div>
                  {selectedTherapist.complianceDocuments?.supervision && (
                    <div className="mb-3 space-y-1 text-sm">
                      {selectedTherapist.complianceDocuments.supervision.supervisingSLPName && (
                        <div><span className="text-gray-600">Supervising SLP Name:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.supervision.supervisingSLPName}</span></div>
                      )}
                      {selectedTherapist.complianceDocuments.supervision.supervisingSLPLicenseNumber && (
                        <div><span className="text-gray-600">Supervising SLP License #:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.supervision.supervisingSLPLicenseNumber}</span></div>
                      )}
                      {selectedTherapist.complianceDocuments.supervision.supervisingState && (
                        <div><span className="text-gray-600">Supervising State:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.supervision.supervisingState}</span></div>
                      )}
                      {selectedTherapist.complianceDocuments.supervision.agreementDocumentUrl && (
                        <DocumentPreview url={selectedTherapist.complianceDocuments.supervision.agreementDocumentUrl} onImageClick={setLightboxImage} />
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleComplianceVerify(selectedTherapist._id, 'supervision', true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      ✓ Verify
                    </button>
                    <button
                      onClick={() => handleComplianceVerify(selectedTherapist._id, 'supervision', false)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Professional Liability Insurance */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Professional Liability Insurance</label>
                  {selectedTherapist.complianceDocuments?.professionalLiabilityInsurance?.verified ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <span className="text-yellow-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Pending
                    </span>
                  )}
                </div>
                {selectedTherapist.complianceDocuments?.professionalLiabilityInsurance && (
                  <div className="mb-3 space-y-1 text-sm">
                    {selectedTherapist.complianceDocuments.professionalLiabilityInsurance.provider && (
                      <div><span className="text-gray-600">Provider:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.professionalLiabilityInsurance.provider}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.professionalLiabilityInsurance.policyNumber && (
                      <div><span className="text-gray-600">Policy #:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.professionalLiabilityInsurance.policyNumber}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.professionalLiabilityInsurance.coverageAmount && (
                      <div><span className="text-gray-600">Coverage:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.professionalLiabilityInsurance.coverageAmount}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.professionalLiabilityInsurance.expirationDate && (
                      <div><span className="text-gray-600">Expiration:</span> <span className="font-medium">{new Date(selectedTherapist.complianceDocuments.professionalLiabilityInsurance.expirationDate).toLocaleDateString()}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.professionalLiabilityInsurance.documentUrl && (
                      <DocumentPreview url={selectedTherapist.complianceDocuments.professionalLiabilityInsurance.documentUrl} onImageClick={setLightboxImage} />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'professionalLiabilityInsurance', true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    ✓ Verify
                  </button>
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'professionalLiabilityInsurance', false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>

              {/* Background Check / Child Safety Clearance */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Background Check / Child Safety Clearance</label>
                  {selectedTherapist.complianceDocuments?.backgroundCheck?.verified ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <span className="text-yellow-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Pending
                    </span>
                  )}
                </div>
                {selectedTherapist.complianceDocuments?.backgroundCheck && (
                  <div className="mb-3 space-y-1 text-sm">
                    {selectedTherapist.complianceDocuments.backgroundCheck.clearanceNumber && (
                      <div><span className="text-gray-600">Clearance #:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.backgroundCheck.clearanceNumber}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.backgroundCheck.state && (
                      <div><span className="text-gray-600">State:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.backgroundCheck.state}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.backgroundCheck.expirationDate && (
                      <div><span className="text-gray-600">Expiration:</span> <span className="font-medium">{new Date(selectedTherapist.complianceDocuments.backgroundCheck.expirationDate).toLocaleDateString()}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.backgroundCheck.documentUrl && (
                      <DocumentPreview url={selectedTherapist.complianceDocuments.backgroundCheck.documentUrl} onImageClick={setLightboxImage} />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'backgroundCheck', true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    ✓ Verify
                  </button>
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'backgroundCheck', false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>

              {/* Legacy Documents Section */}
              <div className="border-t-2 border-gray-300 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Legacy Documents (Backward Compatibility)</h4>
              </div>

              {/* SPA Membership (Legacy) */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">SPA Membership (Legacy)</label>
                  {selectedTherapist.complianceDocuments?.spaMembership?.verified ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <span className="text-yellow-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Pending
                    </span>
                  )}
                </div>
                {selectedTherapist.complianceDocuments?.spaMembership && (
                  <div className="mb-3 space-y-1 text-sm">
                    {selectedTherapist.complianceDocuments.spaMembership.membershipNumber && (
                      <div><span className="text-gray-600">Membership #:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.spaMembership.membershipNumber}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.spaMembership.membershipType && (
                      <div><span className="text-gray-600">Type:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.spaMembership.membershipType}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.spaMembership.expirationDate && (
                      <div><span className="text-gray-600">Expiration:</span> <span className="font-medium">{new Date(selectedTherapist.complianceDocuments.spaMembership.expirationDate).toLocaleDateString()}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.spaMembership.documentUrl && (
                      <DocumentPreview url={selectedTherapist.complianceDocuments.spaMembership.documentUrl} onImageClick={setLightboxImage} />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'spaMembership', true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    ✓ Verify
                  </button>
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'spaMembership', false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>

              {/* State Registration */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">State Registration (Legacy)</label>
                  {selectedTherapist.complianceDocuments?.stateRegistration?.verified ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <span className="text-yellow-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Pending
                    </span>
                  )}
                </div>
                {selectedTherapist.complianceDocuments?.stateRegistration && (
                  <div className="mb-3 space-y-1 text-sm">
                    {selectedTherapist.complianceDocuments.stateRegistration.registrationNumber && (
                      <div><span className="text-gray-600">Registration #:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.stateRegistration.registrationNumber}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.stateRegistration.state && (
                      <div><span className="text-gray-600">State:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.stateRegistration.state}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.stateRegistration.expirationDate && (
                      <div><span className="text-gray-600">Expiration:</span> <span className="font-medium">{new Date(selectedTherapist.complianceDocuments.stateRegistration.expirationDate).toLocaleDateString()}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.stateRegistration.documentUrl && (
                      <DocumentPreview url={selectedTherapist.complianceDocuments.stateRegistration.documentUrl} onImageClick={setLightboxImage} />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'stateRegistration', true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    ✓ Verify
                  </button>
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'stateRegistration', false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>

              {/* Professional Indemnity Insurance */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Professional Indemnity Insurance (Legacy)</label>
                  {selectedTherapist.complianceDocuments?.professionalIndemnityInsurance?.verified ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <span className="text-yellow-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Pending
                    </span>
                  )}
                </div>
                {selectedTherapist.complianceDocuments?.professionalIndemnityInsurance && (
                  <div className="mb-3 space-y-1 text-sm">
                    {selectedTherapist.complianceDocuments.professionalIndemnityInsurance.provider && (
                      <div><span className="text-gray-600">Provider:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.professionalIndemnityInsurance.provider}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.professionalIndemnityInsurance.policyNumber && (
                      <div><span className="text-gray-600">Policy #:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.professionalIndemnityInsurance.policyNumber}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.professionalIndemnityInsurance.coverageAmount && (
                      <div><span className="text-gray-600">Coverage:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.professionalIndemnityInsurance.coverageAmount}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.professionalIndemnityInsurance.expirationDate && (
                      <div><span className="text-gray-600">Expiration:</span> <span className="font-medium">{new Date(selectedTherapist.complianceDocuments.professionalIndemnityInsurance.expirationDate).toLocaleDateString()}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.professionalIndemnityInsurance.documentUrl && (
                      <DocumentPreview url={selectedTherapist.complianceDocuments.professionalIndemnityInsurance.documentUrl} onImageClick={setLightboxImage} />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'professionalIndemnityInsurance', true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    ✓ Verify
                  </button>
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'professionalIndemnityInsurance', false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>

              {/* Working with Children Check */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Working with Children Check (Legacy)</label>
                  {selectedTherapist.complianceDocuments?.workingWithChildrenCheck?.verified ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <span className="text-yellow-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Pending
                    </span>
                  )}
                </div>
                {selectedTherapist.complianceDocuments?.workingWithChildrenCheck && (
                  <div className="mb-3 space-y-1 text-sm">
                    {selectedTherapist.complianceDocuments.workingWithChildrenCheck.checkNumber && (
                      <div><span className="text-gray-600">WWCC #:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.workingWithChildrenCheck.checkNumber}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.workingWithChildrenCheck.state && (
                      <div><span className="text-gray-600">State:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.workingWithChildrenCheck.state}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.workingWithChildrenCheck.expirationDate && (
                      <div><span className="text-gray-600">Expiration:</span> <span className="font-medium">{new Date(selectedTherapist.complianceDocuments.workingWithChildrenCheck.expirationDate).toLocaleDateString()}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.workingWithChildrenCheck.documentUrl && (
                      <DocumentPreview url={selectedTherapist.complianceDocuments.workingWithChildrenCheck.documentUrl} onImageClick={setLightboxImage} />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'workingWithChildrenCheck', true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    ✓ Verify
                  </button>
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'workingWithChildrenCheck', false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>

              {/* Police Check */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">National Police Check (Legacy)</label>
                  {selectedTherapist.complianceDocuments?.policeCheck?.verified ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <span className="text-yellow-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Pending
                    </span>
                  )}
                </div>
                {selectedTherapist.complianceDocuments?.policeCheck && (
                  <div className="mb-3 space-y-1 text-sm">
                    {selectedTherapist.complianceDocuments.policeCheck.checkNumber && (
                      <div><span className="text-gray-600">Check #:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.policeCheck.checkNumber}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.policeCheck.issueDate && (
                      <div><span className="text-gray-600">Issue Date:</span> <span className="font-medium">{new Date(selectedTherapist.complianceDocuments.policeCheck.issueDate).toLocaleDateString()}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.policeCheck.expirationDate && (
                      <div><span className="text-gray-600">Expiration:</span> <span className="font-medium">{new Date(selectedTherapist.complianceDocuments.policeCheck.expirationDate).toLocaleDateString()}</span></div>
                    )}
                    {selectedTherapist.complianceDocuments.policeCheck.documentUrl && (
                      <DocumentPreview url={selectedTherapist.complianceDocuments.policeCheck.documentUrl} onImageClick={setLightboxImage} />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'policeCheck', true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    ✓ Verify
                  </button>
                  <button
                    onClick={() => handleComplianceVerify(selectedTherapist._id, 'policeCheck', false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>

              {/* Legacy Support - State License & Liability Insurance */}
              {(selectedTherapist.complianceDocuments?.stateLicense || selectedTherapist.complianceDocuments?.liabilityInsurance) && (
                <>
                  {selectedTherapist.complianceDocuments?.stateLicense && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">State License (Legacy)</label>
                        {selectedTherapist.complianceDocuments.stateLicense.verified ? (
                          <span className="text-green-600 text-sm flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Verified
                          </span>
                        ) : (
                          <span className="text-yellow-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> Pending
                          </span>
                        )}
                      </div>
                      {selectedTherapist.complianceDocuments.stateLicense.number && (
                        <div className="mb-3 space-y-1 text-sm">
                          <div><span className="text-gray-600">License #:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.stateLicense.number}</span></div>
                          {selectedTherapist.complianceDocuments.stateLicense.state && (
                            <div><span className="text-gray-600">State:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.stateLicense.state}</span></div>
                          )}
                          {selectedTherapist.complianceDocuments.stateLicense.documentUrl && (
                            <DocumentPreview url={selectedTherapist.complianceDocuments.stateLicense.documentUrl} onImageClick={setLightboxImage} />
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleComplianceVerify(selectedTherapist._id, 'stateLicense', true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          ✓ Verify
                        </button>
                        <button
                          onClick={() => handleComplianceVerify(selectedTherapist._id, 'stateLicense', false)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedTherapist.complianceDocuments?.liabilityInsurance && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">Liability Insurance (Legacy)</label>
                        {selectedTherapist.complianceDocuments.liabilityInsurance.verified ? (
                          <span className="text-green-600 text-sm flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Verified
                          </span>
                        ) : (
                          <span className="text-yellow-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> Pending
                          </span>
                        )}
                      </div>
                      {selectedTherapist.complianceDocuments.liabilityInsurance.provider && (
                        <div className="mb-3 space-y-1 text-sm">
                          <div><span className="text-gray-600">Provider:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.liabilityInsurance.provider}</span></div>
                          {selectedTherapist.complianceDocuments.liabilityInsurance.policyNumber && (
                            <div><span className="text-gray-600">Policy #:</span> <span className="font-medium">{selectedTherapist.complianceDocuments.liabilityInsurance.policyNumber}</span></div>
                          )}
                          {selectedTherapist.complianceDocuments.liabilityInsurance.documentUrl && (
                            <DocumentPreview url={selectedTherapist.complianceDocuments.liabilityInsurance.documentUrl} onImageClick={setLightboxImage} />
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleComplianceVerify(selectedTherapist._id, 'liabilityInsurance', true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          ✓ Verify
                        </button>
                        <button
                          onClick={() => handleComplianceVerify(selectedTherapist._id, 'liabilityInsurance', false)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Status Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Once both State License and Liability Insurance are verified, the therapist will be automatically activated if their status is currently "pending".
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setShowComplianceModal(false);
                  setSelectedTherapist(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <XClose className="w-8 h-8" />
          </button>
          <img
            src={lightboxImage}
            alt="Document full view"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <a
            href={lightboxImage}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-6 bg-white text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-4 h-4" />
            Open Original
          </a>
        </div>
      )}
    </div>
  );
}
