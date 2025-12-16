import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { Save, DollarSign, Percent } from 'lucide-react';

interface PaymentSplit {
  platformFeePercent: number;
  therapistFeePercent: number;
}

export default function PaymentSplit() {
  const [split, setSplit] = useState<PaymentSplit>({ platformFeePercent: 20, therapistFeePercent: 80 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [platformFee, setPlatformFee] = useState(20);

  useEffect(() => {
    fetchPaymentSplit();
  }, []);

  const fetchPaymentSplit = async () => {
    try {
      const response = await adminAPI.getPaymentSplit();
      setSplit(response.data.data);
      setPlatformFee(response.data.data.platformFeePercent);
    } catch (error) {
      console.error('Failed to fetch payment split:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (platformFee < 0 || platformFee > 100) {
      alert('Platform fee must be between 0 and 100');
      return;
    }

    setSaving(true);
    try {
      await adminAPI.updatePaymentSplit({ platformFeePercent: platformFee });
      await fetchPaymentSplit();
      alert('Payment split updated successfully!');
    } catch (error) {
      console.error('Failed to update payment split:', error);
      alert('Failed to update payment split');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const therapistFee = 100 - platformFee;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Split Configuration</h1>
        <p className="text-gray-600 mt-2">Configure how payments are split between platform and therapists</p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 max-w-2xl">
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
                value={platformFee}
                onChange={(e) => setPlatformFee(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="text-2xl font-bold text-gray-700">%</div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            The percentage of each payment that goes to the platform
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-semibold text-indigo-900">Platform Fee</h3>
            </div>
            <div className="text-3xl font-bold text-indigo-600">{platformFee}%</div>
            <p className="text-sm text-indigo-700 mt-2">
              Example: On a $100 payment, platform receives ${platformFee.toFixed(2)}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <Percent className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Therapist Fee</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">{therapistFee}%</div>
            <p className="text-sm text-green-700 mt-2">
              Example: On a $100 payment, therapist receives ${therapistFee.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Payment Breakdown Example</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Payment:</span>
              <span className="font-medium">$100.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee ({platformFee}%):</span>
              <span className="font-medium text-indigo-600">${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Therapist Fee ({therapistFee}%):</span>
              <span className="font-medium text-green-600">${therapistFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-semibold text-gray-900">$100.00</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || platformFee === split.platformFeePercent}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

