import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { Search, UserCheck, Mail, Phone, Calendar, DollarSign } from 'lucide-react';

interface Therapist {
  _id: string;
  userId?: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  specialization?: string[];
  hourlyRate?: number;
  experience?: number;
  createdAt?: string;
}

export default function Therapists() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
        <p className="text-gray-600 mt-2">View all registered therapists</p>
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
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
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
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {therapist.userId?.email || 'N/A'}
                    </div>
                    {therapist.userId?.phone && (
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {therapist.userId.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {therapist.specialization && therapist.specialization.length > 0 ? (
                        <>
                          {therapist.specialization.slice(0, 2).map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded"
                            >
                              {spec}
                            </span>
                          ))}
                          {therapist.specialization.length > 2 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{therapist.specialization.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">No specializations</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {therapist.experience || 0} years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                      <DollarSign className="w-4 h-4" />
                      ${therapist.hourlyRate || 0}/hr
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {therapist.createdAt ? new Date(therapist.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
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

