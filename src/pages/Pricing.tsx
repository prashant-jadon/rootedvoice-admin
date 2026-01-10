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
  description?: string;
  icon?: string;
  monthlyPrice?: number;
  perSessionPrice?: number;
}

export default function Pricing() {
  const [pricing, setPricing] = useState<Record<string, PricingTier>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState<Partial<PricingTier & { tier: string; newFeature: string }>>({
    features: [],
    newFeature: '',
  });

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
    setFormData({
      ...pricing[tier],
      newFeature: '',
    });
  };

  const handleSave = async () => {
    if (!editing) return;

    try {
      const { newFeature, tier, ...updateData } = formData;
      await adminAPI.updatePricing(editing, updateData);
      await fetchPricing();
      setEditing(null);
      setFormData({ features: [], newFeature: '' });
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
      const { newFeature, ...createData } = formData;
      await adminAPI.createPricing(createData);
      await fetchPricing();
      setShowCreate(false);
      setFormData({ features: [], newFeature: '' });
    } catch (error: any) {
      console.error('Failed to create pricing:', error);
      alert(error.response?.data?.message || 'Failed to create pricing');
    }
  };

  const addFeature = () => {
    if (!formData.newFeature?.trim()) return;
    const currentFeatures = formData.features || [];
    setFormData({
      ...formData,
      features: [...currentFeatures, formData.newFeature.trim()],
      newFeature: '',
    });
  };

  const removeFeature = (index: number) => {
    const currentFeatures = formData.features || [];
    setFormData({
      ...formData,
      features: currentFeatures.filter((_, i) => i !== index),
    });
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tier Key *</label>
                <input
                  type="text"
                  value={formData.tier || ''}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., premium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Premium Tier"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  value={formData.icon || ''}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="🌱"
                  maxLength={2}
                />
                <p className="text-xs text-gray-500 mt-1">Enter an emoji or icon symbol</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlyPrice || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) || undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Auto-calculated from price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Per Session Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.perSessionPrice || ''}
                  onChange={(e) => setFormData({ ...formData, perSessionPrice: parseFloat(e.target.value) || undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Auto-calculated"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
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
                  value={formData.billingCycle || 'monthly'}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="monthly">Monthly</option>
                  <option value="every-4-weeks">Every 4 Weeks</option>
                  <option value="pay-as-you-go">Pay as You Go</option>
                  <option value="one-time">One-Time Payment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sessions Per Month</label>
                <input
                  type="number"
                  value={formData.sessionsPerMonth || ''}
                  onChange={(e) => setFormData({ ...formData, sessionsPerMonth: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="4"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="popular"
                  checked={formData.popular || false}
                  onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="popular" className="ml-2 text-sm font-medium text-gray-700">
                  Mark as Popular
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Build a strong foundation where growth begins"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.newFeature || ''}
                    onChange={(e) => setFormData({ ...formData, newFeature: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Add a feature (e.g., '2 sessions per month')"
                  />
                  <button
                    onClick={addFeature}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {(formData.features || []).map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700">{feature}</span>
                      <button
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
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
                  setFormData({ features: [], newFeature: '' });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
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
              <div className="flex items-center gap-2 mb-2">
                {tierData.icon && <span className="text-3xl">{tierData.icon}</span>}
                <h3 className="text-2xl font-bold text-gray-900">{tierData.name}</h3>
              </div>
              {tierData.description && (
                <p className="text-sm text-gray-600 mb-2">{tierData.description}</p>
              )}
              <div className="mt-2 flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">
                  <DollarSign className="w-6 h-6 inline" />
                  {tierData.price}
                </span>
                {tierData.billingCycle === 'monthly' && (
                  <span className="text-lg text-gray-600 ml-2">/month</span>
                )}
                {tierData.billingCycle === 'pay-as-you-go' && (
                  <span className="text-lg text-gray-600 ml-2">/session</span>
                )}
                {tierData.billingCycle === 'one-time' && (
                  <span className="text-lg text-gray-600 ml-2">one-time</span>
                )}
              </div>
            </div>

            {editing === tier ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                    <input
                      type="text"
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="🌱"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthlyPrice || ''}
                      onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Per Session ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.perSessionPrice || ''}
                      onChange={(e) => setFormData({ ...formData, perSessionPrice: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      value={formData.duration || ''}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                    <select
                      value={formData.billingCycle || ''}
                      onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="every-4-weeks">Every 4 Weeks</option>
                      <option value="pay-as-you-go">Pay as You Go</option>
                      <option value="one-time">One-Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sessions/Month</label>
                    <input
                      type="number"
                      value={formData.sessionsPerMonth || ''}
                      onChange={(e) => setFormData({ ...formData, sessionsPerMonth: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.newFeature || ''}
                        onChange={(e) => setFormData({ ...formData, newFeature: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Add feature"
                      />
                      <button
                        onClick={addFeature}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {(formData.features || []).map((feature, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                          <span className="text-gray-700">{feature}</span>
                          <button
                            onClick={() => removeFeature(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`popular-${tier}`}
                    checked={formData.popular || false}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor={`popular-${tier}`} className="ml-2 text-sm font-medium text-gray-700">
                    Mark as Popular
                  </label>
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
                      setFormData({ features: [], newFeature: '' });
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
                  <p className="font-semibold text-gray-900">
                    {tierData.billingCycle === 'monthly' && `$${tierData.price}/month`}
                    {tierData.billingCycle === 'pay-as-you-go' && `$${tierData.price}/session`}
                    {tierData.billingCycle === 'one-time' && `$${tierData.price} one-time`}
                    {tierData.billingCycle === 'every-4-weeks' && `$${tierData.price} (billed monthly)`}
                  </p>
                  <p>Duration: {tierData.duration} minutes</p>
                  <p>Billing: {tierData.billingCycle === 'every-4-weeks' ? 'Monthly (every 4 weeks)' : tierData.billingCycle}</p>
                  {tierData.sessionsPerMonth > 0 && (
                    <p>Sessions: {tierData.sessionsPerMonth}/month</p>
                  )}
                  {tierData.features && tierData.features.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold text-gray-900 mb-1">Features:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {tierData.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-xs text-gray-600">{feature}</li>
                        ))}
                        {tierData.features.length > 3 && (
                          <li className="text-xs text-gray-500">+{tierData.features.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
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
