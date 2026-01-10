import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { Save, DollarSign, Percent, Users } from 'lucide-react';

interface PaymentSplit {
  SLP?: {
    platformFeePercent: number;
    therapistFeePercent: number;
  };
  SLPA?: {
  platformFeePercent: number;
  therapistFeePercent: number;
  };
  platformFeePercent?: number;
  therapistFeePercent?: number;
}

export default function PaymentSplit() {
  const [split, setSplit] = useState<PaymentSplit>({
    SLP: { platformFeePercent: 45, therapistFeePercent: 55 },
    SLPA: { platformFeePercent: 45, therapistFeePercent: 55 },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slpPlatformFee, setSlpPlatformFee] = useState(45);
  const [slpaPlatformFee, setSlpaPlatformFee] = useState(45);

  useEffect(() => {
    fetchPaymentSplit();
  }, []);

  const fetchPaymentSplit = async () => {
    try {
      const response = await adminAPI.getPaymentSplit();
      const data = response.data.data;
      
      // Handle both old format (single split) and new format (differentiated)
      if (data.SLP && data.SLPA) {
        setSplit(data);
        setSlpPlatformFee(data.SLP.platformFeePercent);
        setSlpaPlatformFee(data.SLPA.platformFeePercent);
      } else if (data.platformFeePercent) {
        // Old format - apply to both
        setSplit({
          SLP: { platformFeePercent: data.platformFeePercent, therapistFeePercent: 100 - data.platformFeePercent },
          SLPA: { platformFeePercent: data.platformFeePercent, therapistFeePercent: 100 - data.platformFeePercent },
        });
        setSlpPlatformFee(data.platformFeePercent);
        setSlpaPlatformFee(data.platformFeePercent);
      }
    } catch (error) {
      console.error('Failed to fetch payment split:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (credentialType?: 'SLP' | 'SLPA') => {
    if (credentialType) {
      const platformFee = credentialType === 'SLP' ? slpPlatformFee : slpaPlatformFee;
    if (platformFee < 0 || platformFee > 100) {
      alert('Platform fee must be between 0 and 100');
      return;
    }

    setSaving(true);
    try {
        await adminAPI.updatePaymentSplit({ credentialType, platformFeePercent: platformFee });
        await fetchPaymentSplit();
        alert(`${credentialType} payment split updated successfully!`);
      } catch (error) {
        console.error('Failed to update payment split:', error);
        alert('Failed to update payment split');
      } finally {
        setSaving(false);
      }
    } else {
      // Update both
      if (slpPlatformFee < 0 || slpPlatformFee > 100 || slpaPlatformFee < 0 || slpaPlatformFee > 100) {
        alert('Platform fee must be between 0 and 100');
        return;
      }

      setSaving(true);
      try {
        await adminAPI.updatePaymentSplit({ credentialType: 'SLP', platformFeePercent: slpPlatformFee });
        await adminAPI.updatePaymentSplit({ credentialType: 'SLPA', platformFeePercent: slpaPlatformFee });
      await fetchPaymentSplit();
        alert('Payment splits updated successfully!');
    } catch (error) {
      console.error('Failed to update payment split:', error);
      alert('Failed to update payment split');
    } finally {
      setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const slpTherapistFee = 100 - slpPlatformFee;
  const slpaTherapistFee = 100 - slpaPlatformFee;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Split Configuration</h1>
        <p className="text-gray-600 mt-2">Configure payment splits by credential type (SLP vs SLPA)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLP Split */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">SLP (Fully Licensed)</h2>
          </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform Fee Percentage
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="100"
                  value={slpPlatformFee}
                  onChange={(e) => setSlpPlatformFee(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="text-2xl font-bold text-gray-700">%</div>
          </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-indigo-900">Platform</h3>
              </div>
              <div className="text-2xl font-bold text-indigo-600">{slpPlatformFee}%</div>
        </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-semibold text-green-900">Therapist</h3>
              </div>
              <div className="text-2xl font-bold text-green-600">{slpTherapistFee}%</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Example ($100 payment)</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Platform:</span>
                <span className="font-medium text-indigo-600">${slpPlatformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Therapist:</span>
                <span className="font-medium text-green-600">${slpTherapistFee.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSave('SLP')}
            disabled={saving || slpPlatformFee === split.SLP?.platformFeePercent}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save SLP Split'}
          </button>
        </div>

        {/* SLPA Split */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">SLPA (Assistants)</h2>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform Fee Percentage
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={slpaPlatformFee}
                  onChange={(e) => setSlpaPlatformFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="text-2xl font-bold text-gray-700">%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-indigo-900">Platform</h3>
              </div>
              <div className="text-2xl font-bold text-indigo-600">{slpaPlatformFee}%</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-semibold text-green-900">Therapist</h3>
              </div>
              <div className="text-2xl font-bold text-green-600">{slpaTherapistFee}%</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Example ($100 payment)</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Platform:</span>
                <span className="font-medium text-indigo-600">${slpaPlatformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Therapist:</span>
                <span className="font-medium text-green-600">${slpaTherapistFee.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
            onClick={() => handleSave('SLPA')}
            disabled={saving || slpaPlatformFee === split.SLPA?.platformFeePercent}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save SLPA Split'}
        </button>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Payment splits are now differentiated by credential type. SLP (fully licensed) and SLPA (assistants) can have different split structures to reflect their different roles and compensation models.
        </p>
      </div>
    </div>
  );
}
