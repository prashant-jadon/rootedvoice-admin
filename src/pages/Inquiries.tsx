import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Archive } from 'lucide-react';
import { adminAPI } from '../lib/api';

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

export default function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await adminAPI.getInquiries();
      setInquiries(response.data.data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminAPI.updateInquiryStatus(id, status);
      fetchInquiries();
      if (selectedInquiry?._id === id) {
        setSelectedInquiry(prev => prev ? { ...prev, status: status as any } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(search.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(search.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">New</span>;
      case 'read': return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Read</span>;
      case 'replied': return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Replied</span>;
      case 'archived': return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Archived</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Contact Inquiries</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(inquiry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {inquiry.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{inquiry.name}</p>
                        <p className="text-sm text-gray-500">{inquiry.email}</p>
                        {inquiry.phone && <p className="text-xs text-gray-400">{inquiry.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inquiry.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(inquiry.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No inquiries found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Inquiry Details</h2>
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">From</h3>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{selectedInquiry.name}</p>
                  <p className="text-sm text-gray-500">
                    <a href={`mailto:${selectedInquiry.email}`} className="text-indigo-600 hover:underline">{selectedInquiry.email}</a>
                  </p>
                  {selectedInquiry.phone && <p className="text-sm text-gray-500">{selectedInquiry.phone}</p>}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Received</h3>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Subject: {selectedInquiry.subject}</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[150px] whitespace-pre-wrap text-gray-700">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Update Status</h3>
                <div className="flex gap-3">
                  <button
                    disabled={selectedInquiry.status === 'new'}
                    onClick={() => handleUpdateStatus(selectedInquiry._id, 'new')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border ${selectedInquiry.status === 'new' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Mark as New
                  </button>
                  <button
                    disabled={selectedInquiry.status === 'read'}
                    onClick={() => handleUpdateStatus(selectedInquiry._id, 'read')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border ${selectedInquiry.status === 'read' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Mark as Read
                  </button>
                  <button
                    disabled={selectedInquiry.status === 'replied'}
                    onClick={() => handleUpdateStatus(selectedInquiry._id, 'replied')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 ${selectedInquiry.status === 'replied' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Replied
                  </button>
                  <button
                    disabled={selectedInquiry.status === 'archived'}
                    onClick={() => handleUpdateStatus(selectedInquiry._id, 'archived')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 ${selectedInquiry.status === 'archived' ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">Note: To reply, click the sender's email address above to open your default email client.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
