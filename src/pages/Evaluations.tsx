import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    X,
    Eye,
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    CreditCard,
    Video,
    FileText,
    RefreshCw,
    UserPlus
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Evaluation {
    _id: string;
    clientId: {
        _id: string;
        userId: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
    };
    therapistId?: {
        _id: string;
        userId: {
            _id: string;
            firstName: string;
            lastName: string;
        };
        credentials?: string;
    };
    status: string;
    amountPaid: number;
    scheduledDate?: string;
    scheduledTime?: string;
    therapistReviewDeadline?: string;
    meetingLink?: string;
    meetingDuration?: number;
    recommendations?: {
        subscriptionTier?: string;
        notes?: string;
        resourceIds?: string[];
    };
    createdAt: string;
    updatedAt: string;
}

interface Therapist {
    _id: string;
    userId: { _id: string; firstName: string; lastName: string };
    credentials?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800', icon: CreditCard },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    therapist_assigned: { label: 'Therapist Assigned', color: 'bg-blue-100 text-blue-800', icon: Users },
    therapist_reviewing: { label: 'Therapist Reviewing', color: 'bg-indigo-100 text-indigo-800', icon: Clock },
    ready_for_meeting: { label: 'Ready for Meeting', color: 'bg-emerald-100 text-emerald-800', icon: Video },
    meeting_scheduled: { label: 'Meeting Scheduled', color: 'bg-teal-100 text-teal-800', icon: Video },
    in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800', icon: Video },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    recommendations_sent: { label: 'Recommendations Sent', color: 'bg-green-200 text-green-900', icon: FileText },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

const Evaluations = () => {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [availableTherapists, setAvailableTherapists] = useState<Therapist[]>([]);
    const [assigningTherapist, setAssigningTherapist] = useState(false);
    const [selectedTherapistId, setSelectedTherapistId] = useState('');

    useEffect(() => {
        fetchEvaluations();
    }, []);

    const getToken = () => localStorage.getItem('admin_token');

    const fetchEvaluations = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${API_URL}/evaluations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvaluations(response.data.data || []);
        } catch (error) {
            console.error('Error fetching evaluations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTherapists = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${API_URL}/evaluations/available-therapists`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableTherapists(response.data.data?.therapists || []);
        } catch (error) {
            console.error('Error fetching therapists:', error);
        }
    };

    const assignTherapist = async (evaluationId: string, therapistId: string) => {
        try {
            setAssigningTherapist(true);
            const token = getToken();
            await axios.put(`${API_URL}/evaluations/${evaluationId}/assign-therapist`, {
                therapistId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Therapist assigned successfully');
            fetchEvaluations();
            setIsDetailOpen(false);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to assign therapist');
        } finally {
            setAssigningTherapist(false);
        }
    };

    const openDetail = (evaluation: Evaluation) => {
        setSelectedEvaluation(evaluation);
        setIsDetailOpen(true);
        if (['paid'].includes(evaluation.status)) {
            fetchTherapists();
        }
    };

    const filteredEvaluations = evaluations.filter(ev => {
        const clientName = `${ev.clientId?.userId?.firstName || ''} ${ev.clientId?.userId?.lastName || ''}`.toLowerCase();
        const matchesSearch = clientName.includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || ev.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm border-b border-gray-200 p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Evaluations</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage diagnostic evaluation bookings and therapist assignments</p>
                        </div>
                        <button
                            onClick={fetchEvaluations}
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center hover:bg-gray-50"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </button>
                    </div>
                </header>

                <main className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        {[
                            { label: 'Total', count: evaluations.length, color: 'text-gray-900' },
                            { label: 'Pending Payment', count: evaluations.filter(e => e.status === 'pending_payment').length, color: 'text-yellow-600' },
                            { label: 'Paid / Awaiting Assignment', count: evaluations.filter(e => e.status === 'paid').length, color: 'text-green-600' },
                            { label: 'In Review', count: evaluations.filter(e => ['therapist_assigned', 'therapist_reviewing'].includes(e.status)).length, color: 'text-blue-600' },
                            { label: 'Completed', count: evaluations.filter(e => ['completed', 'recommendations_sent'].includes(e.status)).length, color: 'text-purple-600' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
                                <p className="text-xs text-gray-500 uppercase font-medium">{stat.label}</p>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search clients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="pending_payment">Pending Payment</option>
                            <option value="paid">Paid</option>
                            <option value="therapist_assigned">Therapist Assigned</option>
                            <option value="therapist_reviewing">Therapist Reviewing</option>
                            <option value="ready_for_meeting">Ready for Meeting</option>
                            <option value="meeting_scheduled">Meeting Scheduled</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="recommendations_sent">Recommendations Sent</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Client</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Therapist</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Amount</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Scheduled</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Created</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                                    ) : filteredEvaluations.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No evaluations found</td></tr>
                                    ) : (
                                        filteredEvaluations.map((evaluation) => (
                                            <tr key={evaluation._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {evaluation.clientId?.userId?.firstName} {evaluation.clientId?.userId?.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{evaluation.clientId?.userId?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {evaluation.therapistId ? (
                                                        <div>
                                                            <div className="font-medium">
                                                                {evaluation.therapistId.userId?.firstName} {evaluation.therapistId.userId?.lastName}
                                                            </div>
                                                            <div className="text-xs text-gray-500">{evaluation.therapistId.credentials}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Not assigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(evaluation.status)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    ${evaluation.amountPaid || 0}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">
                                                    {evaluation.scheduledDate
                                                        ? new Date(evaluation.scheduledDate).toLocaleDateString()
                                                        : '—'}
                                                    {evaluation.scheduledTime && (
                                                        <div className="text-xs text-gray-400">{evaluation.scheduledTime}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">
                                                    {new Date(evaluation.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => openDetail(evaluation)}
                                                        className="text-black font-medium hover:underline flex items-center gap-1"
                                                    >
                                                        <Eye className="w-4 h-4" /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Detail Modal */}
            {isDetailOpen && selectedEvaluation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Evaluation Details</h2>
                                <p className="text-sm text-gray-500">
                                    {selectedEvaluation.clientId?.userId?.firstName} {selectedEvaluation.clientId?.userId?.lastName}
                                </p>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="text-gray-500 hover:text-black">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Status</span>
                                {getStatusBadge(selectedEvaluation.status)}
                            </div>

                            {/* Payment Info */}
                            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-500 uppercase">Amount Paid</span>
                                    <p className="font-semibold text-gray-900">${selectedEvaluation.amountPaid || 0}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 uppercase">Created</span>
                                    <p className="font-semibold text-gray-900">{new Date(selectedEvaluation.createdAt).toLocaleString()}</p>
                                </div>
                                {selectedEvaluation.scheduledDate && (
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase">Scheduled Date</span>
                                        <p className="font-semibold text-gray-900">{new Date(selectedEvaluation.scheduledDate).toLocaleDateString()}</p>
                                    </div>
                                )}
                                {selectedEvaluation.scheduledTime && (
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase">Scheduled Time</span>
                                        <p className="font-semibold text-gray-900">{selectedEvaluation.scheduledTime}</p>
                                    </div>
                                )}
                                {selectedEvaluation.therapistReviewDeadline && (
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase">Review Deadline</span>
                                        <p className="font-semibold text-gray-900">{new Date(selectedEvaluation.therapistReviewDeadline).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>

                            {/* Therapist Info */}
                            {selectedEvaluation.therapistId && (
                                <div className="border rounded-lg p-4">
                                    <span className="text-sm font-medium text-gray-700">Assigned Therapist</span>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                                            {selectedEvaluation.therapistId.userId?.firstName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {selectedEvaluation.therapistId.userId?.firstName} {selectedEvaluation.therapistId.userId?.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">{selectedEvaluation.therapistId.credentials}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Admin Therapist Assignment (for "paid" status) */}
                            {selectedEvaluation.status === 'paid' && !selectedEvaluation.therapistId && (
                                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                        <UserPlus className="w-4 h-4" /> Assign Therapist (Admin)
                                    </h3>
                                    <select
                                        value={selectedTherapistId}
                                        onChange={e => setSelectedTherapistId(e.target.value)}
                                        className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="">Select a therapist...</option>
                                        {availableTherapists.map(t => (
                                            <option key={t._id} value={t._id}>
                                                {t.userId.firstName} {t.userId.lastName} {t.credentials ? `(${t.credentials})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            if (selectedTherapistId) {
                                                assignTherapist(selectedEvaluation._id, selectedTherapistId);
                                            }
                                        }}
                                        disabled={!selectedTherapistId || assigningTherapist}
                                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                                    >
                                        {assigningTherapist ? 'Assigning...' : 'Assign Therapist'}
                                    </button>
                                </div>
                            )}

                            {/* Recommendations */}
                            {selectedEvaluation.recommendations && (
                                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-green-800 mb-2">Recommendations</h3>
                                    {selectedEvaluation.recommendations.subscriptionTier && (
                                        <p className="text-green-700 text-sm">
                                            <strong>Recommended Plan:</strong>{' '}
                                            <span className="capitalize">{selectedEvaluation.recommendations.subscriptionTier}</span>
                                        </p>
                                    )}
                                    {selectedEvaluation.recommendations.notes && (
                                        <p className="text-green-700 text-sm mt-1">{selectedEvaluation.recommendations.notes}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Evaluations;
