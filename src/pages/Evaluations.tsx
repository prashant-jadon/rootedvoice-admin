import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FileText,
    Search,
    Filter,
    Plus,
    ChevronRight,
    CheckCircle,
    Clock,
    AlertCircle,
    X,
    Save,
    Trash2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Question {
    id: string;
    text: string;
    type: string;
    options?: string[];
    required: boolean;
}

interface Evaluation {
    _id: string;
    clientId: {
        firstName: string;
        lastName: string;
        email: string;
    };
    status: string;
    questions: Question[];
    answers?: { questionId: string; answer: any }[];
    createdAt: string;
}

const Evaluations = () => {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        fetchEvaluations();
    }, []);

    const fetchEvaluations = async () => {
        try {
            setLoading(true);
            setLoading(true);
            // Use local storage key consistent with AuthContext or use configured instance
            const token = localStorage.getItem('admin_token');
            const response = await axios.get(`${API_URL}/evaluations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvaluations(response.data.data);
        } catch (error) {
            console.error('Error fetching evaluations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvaluation = (client) => {
        // Logic to create a new evaluation for a client (if not exists)
        // For this demo, we assume the backend creates the record when they book.
        // So we just edit "questions".
    };

    const openBuilder = (evaluation) => {
        setSelectedEvaluation(evaluation);
        setQuestions(evaluation.questions || []);
        setIsModalOpen(true);
    };

    const addQuestion = (type = 'text') => {
        const newQuestion = {
            id: Date.now().toString(),
            text: '',
            type,
            options: type === 'radio' || type === 'select' ? ['Option 1'] : [],
            required: true
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (id, field, value) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    const removeQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const saveQuestions = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`${API_URL}/evaluations/${selectedEvaluation._id}/questions`, {
                questions
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            fetchEvaluations();
            alert('Questionnaire updated successfully');
        } catch (error) {
            console.error('Error saving questions:', error);
            alert('Failed to save questionnaire');
        }
    };

    const markAsReviewed = async (evaluationId: string) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`${API_URL}/evaluations/${evaluationId}/review`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchEvaluations();
            alert('Evaluation marked as reviewed. Client can now book sessions.');
        } catch (error) {
            console.error('Error marking as reviewed:', error);
            alert('Failed to mark evaluation as reviewed');
        }
    };

    const filteredEvaluations = evaluations.filter(ev => {
        const matchesSearch = ev.clientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ev.clientId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || ev.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex h-screen bg-gray-50 font-sans">


            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm border-b border-gray-200 p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Evaluations</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage client intake forms and questionnaires</p>
                        </div>
                        <button
                            onClick={() => { }} // TODO: Add manual create
                            className="bg-black text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-gray-800"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Evaluation
                        </button>
                    </div>
                </header>

                <main className="p-6">
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
                            <option value="assigned">Assigned</option>
                            <option value="completed">Completed</option>
                            <option value="pending_creation">Pending Creation</option>
                        </select>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Client</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Questions</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Date Created</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                                    ) : filteredEvaluations.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No evaluations found</td></tr>
                                    ) : (
                                        filteredEvaluations.map((evaluation) => (
                                            <tr key={evaluation._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {evaluation.clientId?.firstName} {evaluation.clientId?.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{evaluation.clientId?.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${evaluation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            evaluation.status === 'reviewed' ? 'bg-purple-100 text-purple-800' :
                                                                evaluation.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-yellow-100 text-yellow-800'}`}>
                                                        {evaluation.status === 'completed' ? 'Completed' :
                                                            evaluation.status === 'reviewed' ? 'Reviewed ✓' :
                                                                evaluation.status === 'assigned' ? 'Assigned' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {evaluation.questions?.length || 0} questions
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {new Date(evaluation.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => openBuilder(evaluation)}
                                                        className="text-black font-medium hover:underline mr-4"
                                                    >
                                                        {evaluation.status === 'completed' || evaluation.status === 'reviewed' ? 'View Answers' : 'Edit Questions'}
                                                    </button>
                                                    {evaluation.status === 'completed' && (
                                                        <button
                                                            onClick={() => markAsReviewed(evaluation._id)}
                                                            className="text-purple-600 font-medium hover:underline"
                                                        >
                                                            Mark as Reviewed
                                                        </button>
                                                    )}
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

            {/* Form Builder Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Evaluation Questionnaire Builder</h2>
                                <p className="text-sm text-gray-500">
                                    Client: {selectedEvaluation?.clientId?.firstName} {selectedEvaluation?.clientId?.lastName}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            {/* Check if already completed */}
                            {selectedEvaluation?.status === 'completed' ? (
                                <div className="space-y-6">
                                    {selectedEvaluation.answers?.map((ans, idx) => {
                                        const q = questions.find(q => q.id === ans.questionId);
                                        return (
                                            <div key={idx} className="bg-white p-6 rounded-lg border border-gray-100">
                                                <p className="font-semibold text-gray-900 mb-2">{q?.text || 'Unknown Question'}</p>
                                                <div className="p-4 bg-gray-50 rounded text-gray-700">
                                                    {ans.answer}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {questions.map((q, index) => (
                                        <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative group">
                                            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="grid gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                                                    <input
                                                        type="text"
                                                        value={q.text}
                                                        onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        placeholder="e.g., What are your primary concerns?"
                                                    />
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="w-1/3">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                                        <select
                                                            value={q.type}
                                                            onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        >
                                                            <option value="text">Short Text</option>
                                                            <option value="textarea">Long Text</option>
                                                            <option value="select">Dropdown</option>
                                                            <option value="radio">Multiple Choice</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center mt-6">
                                                        <label className="flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={q.required}
                                                                onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                                                                className="mr-2"
                                                            />
                                                            <span className="text-sm text-gray-600">Required</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                {(q.type === 'select' || q.type === 'radio') && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Options (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            value={q.options?.join(', ')}
                                                            onChange={(e) => updateQuestion(q.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                            placeholder="Option 1, Option 2, Option 3"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex justify-center gap-4 mt-8">
                                        <button onClick={() => addQuestion('text')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">+ Add Text Question</button>
                                        <button onClick={() => addQuestion('textarea')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">+ Add Long Text</button>
                                        <button onClick={() => addQuestion('radio')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">+ Add Multiple Choice</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-white flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            {selectedEvaluation?.status !== 'completed' && (
                                <button
                                    onClick={saveQuestions}
                                    className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 flex items-center"
                                >
                                    <Save className="w-5 h-5 mr-2" />
                                    Save & Assign
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Evaluations;
