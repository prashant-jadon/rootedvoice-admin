import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { Plus, Edit, Trash2, DollarSign, Save, X } from 'lucide-react';

interface PricingTier {
  name: string;
  price: number;
  duration: number;
  billingCycle: string;
  sessionsPerMonth: number;
  features: string[];
  popular?: boolean;
}

export default function Pricing() {
  const [pricing, setPricing] = useState<Record<string, PricingTier>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState<Partial<PricingTier & { tier: string }>>({});

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await adminAPI.getPricing();
      setPricing(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tier: string) => {
    setEditing(tier);
    setFormData(pricing[tier]);
  };

  const handleSave = async () => {
    if (!editing) return;

    try {
      await adminAPI.updatePricing(editing, formData);
      await fetchPricing();
      setEditing(null);
      setFormData({});
    } catch (error) {
      console.error('Failed to update pricing:', error);
      alert('Failed to update pricing');
    }
  };

  const handleDelete = async (tier: string) => {
    if (!confirm(`Are you sure you want to delete ${pricing[tier].name}?`)) return;

    try {
      await adminAPI.deletePricing(tier);
      await fetchPricing();
    } catch (error) {
      console.error('Failed to delete pricing:', error);
      alert('Failed to delete pricing');
    }
  };

  const handleCreate = async () => {
    if (!formData.tier || !formData.name || !formData.price) {
      alert('Tier key, name, and price are required');
      return;
    }

    try {
      await adminAPI.createPricing(formData);
      await fetchPricing();
      setShowCreate(false);
      setFormData({});
    } catch (error: any) {
      console.error('Failed to create pricing:', error);
      alert(error.response?.data?.message || 'Failed to create pricing');
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600 mt-2">Manage subscription pricing tiers</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          Add Tier
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Create New Pricing Tier</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tier Key</label>
              <input
                type="text"
                value={formData.tier || ''}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., premium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Premium Tier"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
              <input
                type="number"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Billing Cycle</label>
              <select
                value={formData.billingCycle || ''}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="monthly">Monthly</option>
                <option value="every-4-weeks">Every 4 Weeks</option>
                <option value="pay-as-you-go">Pay as You Go</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sessions/Month</label>
              <input
                type="number"
                value={formData.sessionsPerMonth || ''}
                onChange={(e) => setFormData({ ...formData, sessionsPerMonth: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="4"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Save className="w-4 h-4" />
              Create
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setFormData({});
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(pricing).map(([tier, tierData]) => (
          <div
            key={tier}
            className={`bg-white rounded-lg shadow border-2 p-6 ${
              tierData.popular ? 'border-indigo-500' : 'border-gray-200'
            }`}
          >
            {tierData.popular && (
              <div className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                Popular
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{tierData.name}</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">
                  <DollarSign className="w-6 h-6 inline" />
                  {tierData.price}
                </span>
              </div>
            </div>

            {editing === tier ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="number"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(null);
                      setFormData({});
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-600 mb-4">
                  <p>Duration: {tierData.duration} minutes</p>
                  <p>Billing: {tierData.billingCycle}</p>
                  <p>Sessions: {tierData.sessionsPerMonth}/month</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(tier)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tier)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

