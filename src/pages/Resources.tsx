import { useEffect, useState } from 'react';
import { resourceAPI } from '../lib/api';
import { Search, FileText, CheckCircle, XCircle, Upload, Eye } from 'lucide-react';

interface Resource {
    _id: string;
    title: string;
    description: string;
    category: string;
    accessLevel: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    isApproved: boolean;
    uploadedBy: {
        _id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    createdAt: string;
}

export default function Resources() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const [uploadFormData, setUploadFormData] = useState({
        title: '',
        description: '',
        category: '',
        accessLevel: 'public',
        tags: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchResources();
    }, [search, categoryFilter, statusFilter]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (search) params.search = search;
            if (categoryFilter) params.category = categoryFilter;
            if (statusFilter !== 'all') params.isApproved = statusFilter === 'approved' ? 'true' : 'false';

            const response = await resourceAPI.getAll(params);
            setResources(response.data.data);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await resourceAPI.approve(id);
            await fetchResources();
        } catch (error) {
            console.error('Failed to approve resource:', error);
            alert('Failed to approve resource');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;
        try {
            await resourceAPI.delete(id);
            await fetchResources();
        } catch (error) {
            console.error('Failed to delete resource:', error);
            alert('Failed to delete resource');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Please select a file');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('title', uploadFormData.title);
            formData.append('description', uploadFormData.description);
            formData.append('category', uploadFormData.category);
            formData.append('accessLevel', uploadFormData.accessLevel);
            formData.append('tags', uploadFormData.tags);
            formData.append('resource', selectedFile);

            await resourceAPI.create(formData);

            setShowUploadModal(false);
            setUploadFormData({
                title: '',
                description: '',
                category: '',
                accessLevel: 'public',
                tags: '',
            });
            setSelectedFile(null);
            await fetchResources();
        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(error.response?.data?.message || 'Failed to upload resource');
        } finally {
            setIsUploading(false);
        }
    };

    if (loading && resources.length === 0) {
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
                    <h1 className="text-3xl font-bold text-gray-900">Resources Library</h1>
                    <p className="text-gray-600 mt-2">Manage uploaded resources and materials</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Upload className="w-4 h-4" />
                    Upload Resource
                </button>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search resources..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && fetchResources()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Categories</option>
                            <option value="worksheet">Worksheet</option>
                            <option value="assessment">Assessment</option>
                            <option value="video">Video</option>
                            <option value="audio">Audio</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="all">All Statuses</option>
                            <option value="approved">Approved</option>
                            <option value="unapproved">Pending Approval</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Resource
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Uploader
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Access
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {resources.map((resource) => (
                                <tr key={resource._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 line-clamp-1">{resource.title}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1">{resource.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 capitalize">
                                            {resource.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {resource.uploadedBy ? `${resource.uploadedBy.firstName} ${resource.uploadedBy.lastName}` : 'admin'}
                                        </div>
                                        <div className="text-xs text-gray-500 capitalize">{resource.uploadedBy?.role || 'admin'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${resource.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {resource.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                                        {resource.accessLevel}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(resource.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-3">
                                            {!resource.isApproved && (
                                                <button
                                                    onClick={() => handleApprove(resource._id)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                            <a
                                                href={`http://localhost:5001${resource.fileUrl}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Asset"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(resource._id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {resources.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        No resources found matching the criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Upload Admin Resource</h3>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={uploadFormData.title}
                                    onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={uploadFormData.description}
                                    onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        required
                                        value={uploadFormData.category}
                                        onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="">Select...</option>
                                        <option value="worksheet">Worksheet</option>
                                        <option value="assessment">Assessment</option>
                                        <option value="video">Video</option>
                                        <option value="audio">Audio</option>
                                        <option value="guide">Guide</option>
                                        <option value="template">Template</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                                    <select
                                        required
                                        value={uploadFormData.accessLevel}
                                        onChange={(e) => setUploadFormData({ ...uploadFormData, accessLevel: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="public">Public</option>
                                        <option value="SLPA">SLPA+</option>
                                        <option value="SLP">SLP Only</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={uploadFormData.tags}
                                    onChange={(e) => setUploadFormData({ ...uploadFormData, tags: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., speech, child, phonics"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                                <input
                                    type="file"
                                    required
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isUploading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    Upload
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
