import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { Search, UserCircle, Mail, Phone, Calendar, UserCheck, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Client {
  _id: string;
  userId: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  assignedTherapist?: {
    userId: {
      firstName: string;
      lastName: string;
    };
  };
  intake?: {
    clientType?: 'child' | 'adult';
    primaryConcerns?: string;
    communicationConcerns?: string;
    stateOfResidence?: string;
    telehealthConsent?: {
      consented: boolean;
      understandsTechnology: boolean;
      understandsPrivacy: boolean;
      understandsLimitations: boolean;
      emergencyContactProvided: boolean;
      consentSignature?: string;
      relationshipToClient?: string;
      consentDate?: string;
    };
    intakeCompleted?: boolean;
    completedAt?: string;
    additionalNotes?: string;
  };
  createdAt: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [intakeFilter, setIntakeFilter] = useState<'all' | 'completed' | 'pending' | 'incomplete'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  const getDropOffStep = (client: any) => {
    if (!client.intake?.intakeCompleted) return 'Questionnaire Pending';
    if (!client.hasCompletedEvaluation && !client.hasPaidEvaluationFee) return 'Pending Evaluation Booking';
    return 'Onboarding Complete';
  };

  useEffect(() => {
    fetchClients();
  }, [search, intakeFilter]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      
      const response = await adminAPI.getClients(params);
      let clientsData = response.data.data;
      
      // Filter by intake status on frontend
      if (intakeFilter === 'completed') {
        clientsData = clientsData.filter((client: Client) => client.intake?.intakeCompleted === true);
      } else if (intakeFilter === 'pending') {
        clientsData = clientsData.filter((client: Client) => !client.intake?.intakeCompleted);
      } else if (intakeFilter === 'incomplete') {
        clientsData = clientsData.filter((client: any) => !client.intake?.intakeCompleted || (!client.hasCompletedEvaluation && !client.hasPaidEvaluationFee));
      }
      
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (clientId: string) => {
    try {
      setSendingReminder(clientId);
      await adminAPI.sendOnboardingReminder(clientId);
      alert('Reminder email sent successfully.');
    } catch (error) {
      console.error('Failed to send reminder:', error);
      alert('Failed to send reminder email. Please try again.');
    } finally {
      setSendingReminder(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Calculate intake statistics
  const totalClients = clients.length;
  const completedIntake = clients.filter((client: Client) => client.intake?.intakeCompleted === true).length;
  const pendingIntake = clients.filter((client: Client) => !client.intake?.intakeCompleted).length;
  const intakeCompletionRate = totalClients > 0 ? Math.round((completedIntake / totalClients) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600 mt-2">View all registered clients</p>
      </div>

      {/* Intake Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Clients</div>
          <div className="text-2xl font-bold text-gray-900">{totalClients}</div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Intake Completed</div>
          <div className="text-2xl font-bold text-green-600">{completedIntake}</div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Intake Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{pendingIntake}</div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
          <div className="text-2xl font-bold text-indigo-600">{intakeCompletionRate}%</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Intake Status</label>
              <select
                value={intakeFilter}
                onChange={(e) => setIntakeFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Clients</option>
                <option value="completed">Intake Completed</option>
                <option value="pending">Questionnaire Pending</option>
                <option value="incomplete">Incomplete Onboarding (Escalation)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Therapist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intake Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {client.userId.firstName} {client.userId.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{client.userId.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {client.userId.email}
                    </div>
                    {client.userId.phone && (
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {client.userId.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.assignedTherapist ? (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-900">
                          {client.assignedTherapist.userId.firstName}{' '}
                          {client.assignedTherapist.userId.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.intake?.intakeCompleted ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                        <span className="text-xs text-gray-500">{getDropOffStep(client)}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-yellow-600">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Pending</span>
                        </div>
                        <span className="text-xs text-red-500 font-medium">{getDropOffStep(client)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(client.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowIntakeModal(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Intake</span>
                      </button>
                      
                      {getDropOffStep(client) !== 'Onboarding Complete' && (
                        <button
                          onClick={() => handleSendReminder(client._id)}
                          disabled={sendingReminder === client._id}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-100 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
                        >
                          <Mail className="w-4 h-4" />
                          <span>{sendingReminder === client._id ? 'Sending...' : 'Send Reminder'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intake Details Modal */}
      {showIntakeModal && selectedClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-3xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Intake Form - {selectedClient.userId.firstName} {selectedClient.userId.lastName}
              </h3>
              <button
                onClick={() => {
                  setShowIntakeModal(false);
                  setSelectedClient(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {selectedClient.intake?.intakeCompleted ? (
              <div className="space-y-6">
                {/* Client Type */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Client Type</h4>
                  <p className="text-gray-900 capitalize">{selectedClient.intake.clientType || 'Not specified'}</p>
                </div>

                {/* Primary Concerns */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Primary Concerns</h4>
                  <p className="text-gray-900 whitespace-pre-line">{selectedClient.intake.primaryConcerns || 'Not provided'}</p>
                </div>

                {/* Communication Concerns */}
                {selectedClient.intake.communicationConcerns && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Communication Concerns</h4>
                    <p className="text-gray-900 whitespace-pre-line">{selectedClient.intake.communicationConcerns}</p>
                  </div>
                )}

                {/* State of Residence */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">State of Residence</h4>
                  <p className="text-gray-900">{selectedClient.intake.stateOfResidence || 'Not provided'}</p>
                </div>

                {/* Telehealth Consent */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Telehealth Consent</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {selectedClient.intake.telehealthConsent?.consented ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-700">Consent to Telehealth Services</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedClient.intake.telehealthConsent?.understandsTechnology ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-700">Understands Technology Requirements</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedClient.intake.telehealthConsent?.understandsPrivacy ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-700">Understands Privacy & Security</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedClient.intake.telehealthConsent?.understandsLimitations ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-700">Understands Telehealth Limitations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedClient.intake.telehealthConsent?.emergencyContactProvided ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-700">Emergency Contact Provided</span>
                    </div>
                    {selectedClient.intake.telehealthConsent?.consentSignature && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">Signed by: <span className="font-medium text-gray-900">{selectedClient.intake.telehealthConsent.consentSignature}</span></p>
                        <p className="text-sm text-gray-600">Relationship: <span className="font-medium text-gray-900">{selectedClient.intake.telehealthConsent.relationshipToClient}</span></p>
                        {selectedClient.intake.telehealthConsent.consentDate && (
                          <p className="text-sm text-gray-600">Date: <span className="font-medium text-gray-900">{new Date(selectedClient.intake.telehealthConsent.consentDate).toLocaleDateString()}</span></p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                {selectedClient.intake.additionalNotes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Notes</h4>
                    <p className="text-gray-900 whitespace-pre-line">{selectedClient.intake.additionalNotes}</p>
                  </div>
                )}

                {/* Completion Date */}
                {selectedClient.intake.completedAt && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Intake completed on {new Date(selectedClient.intake.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Intake Form Not Completed</h4>
                <p className="text-gray-600">
                  This client has not yet completed their intake form.
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowIntakeModal(false);
                  setSelectedClient(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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

