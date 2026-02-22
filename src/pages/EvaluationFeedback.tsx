import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Evaluation {
    _id: string;
    clientId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
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
    recommendations?: {
        subscriptionTier?: string;
        notes?: string;
        sentAt?: string;
    };
    createdAt: string;
}



const EvaluationFeedback = () => {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
            setEvaluations(response.data.data?.evaluations || []);
        } catch (error) {
            console.error('Error fetching evaluations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter evaluations that have actual feedback/recommendations
    const evaluationsWithFeedback = evaluations.filter(ev =>
        ev?.recommendations && (ev.recommendations.notes || ev.recommendations.subscriptionTier)
    );

    const filteredEvaluations = evaluationsWithFeedback.filter(ev => {
        if (!ev) return false;
        const clientName = `${ev.clientId?.firstName || ''} ${ev.clientId?.lastName || ''}`.toLowerCase();
        const therapistName = `${ev.therapistId?.userId?.firstName || ''} ${ev.therapistId?.userId?.lastName || ''}`.toLowerCase();
        const matchesSearch = clientName.includes(searchTerm.toLowerCase()) || therapistName.includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm border-b border-gray-200 p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Evaluation Feedback</h1>
                                <p className="text-sm text-gray-500 mt-1">View recommendations and feedback provided by therapists to clients</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by client or therapist name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-900 w-1/5">Client</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 w-1/5">Therapist</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 w-1/5">Recommendation</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 w-2/5">Feedback / Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                                    ) : filteredEvaluations.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No feedback or recommendations found</td></tr>
                                    ) : (
                                        filteredEvaluations.map((evaluation) => {
                                            if (!evaluation) return null;
                                            return (
                                                <tr key={evaluation._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="font-medium text-gray-900">
                                                            {evaluation.clientId?.firstName} {evaluation.clientId?.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{evaluation.clientId?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 align-top">
                                                        {evaluation.therapistId ? (
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {evaluation.therapistId.userId?.firstName} {evaluation.therapistId.userId?.lastName}
                                                                </div>
                                                                <div className="text-xs text-gray-500">{evaluation.therapistId.credentials}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic">Not assigned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 align-top">
                                                        {evaluation.recommendations?.subscriptionTier ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize border border-blue-200">
                                                                {evaluation.recommendations.subscriptionTier}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 italic">None</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 align-top">
                                                        {evaluation.recommendations?.notes ? (
                                                            <div className="text-sm bg-gray-50 p-3 rounded border border-gray-100 whitespace-pre-wrap">
                                                                {evaluation.recommendations.notes}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic">No notes provided</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EvaluationFeedback;
