import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { Save, DollarSign, AlertCircle } from 'lucide-react';

interface RateCaps {
  SLP: number;
  SLPA: number;
  cancellationFees?: {
    SLP: number;
    SLPA: number;
  };
  slpaCancellationFee?: number; // Legacy support
}

export default function RateCaps() {
  const [rateCaps, setRateCaps] = useState<RateCaps>({ 
    SLP: 75, 
    SLPA: 55, 
    cancellationFees: { SLP: 20, SLPA: 15 },
    slpaCancellationFee: 15 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slpCap, setSlpCap] = useState(75);
  const [slpaCap, setSlpaCap] = useState(55);
  const [slpCancellationFee, setSlpCancellationFee] = useState(20);
  const [slpaCancellationFee, setSlpaCancellationFee] = useState(15);

  useEffect(() => {
    fetchRateCaps();
  }, []);

  const fetchRateCaps = async () => {
    try {
      const response = await adminAPI.getRateCaps();
      const data = response.data.data;
      setRateCaps(data);
      setSlpCap(data.SLP);
      setSlpaCap(data.SLPA);
      
      // Handle both new format (cancellationFees object) and legacy format
      if (data.cancellationFees) {
        setSlpCancellationFee(data.cancellationFees.SLP || 20);
        setSlpaCancellationFee(data.cancellationFees.SLPA || 15);
      } else if (data.slpaCancellationFee) {
        setSlpaCancellationFee(data.slpaCancellationFee);
        setSlpCancellationFee(20); // Default for SLP
      }
    } catch (error) {
      console.error('Failed to fetch rate caps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (slpCap < 0 || slpCap > 200) {
      alert('SLP rate cap must be between 0 and 200');
      return;
    }

    if (slpaCap < 0 || slpaCap > 200) {
      alert('SLPA rate cap must be between 0 and 200');
      return;
    }

    if (slpCancellationFee < 0 || slpCancellationFee > 100) {
      alert('SLP cancellation fee must be between 0 and 100');
      return;
    }

    if (slpaCancellationFee < 0 || slpaCancellationFee > 100) {
      alert('SLPA cancellation fee must be between 0 and 100');
      return;
    }

    setSaving(true);
    try {
      await adminAPI.updateRateCaps({
        SLP: slpCap,
        SLPA: slpaCap,
        slpCancellationFee: slpCancellationFee,
        slpaCancellationFee: slpaCancellationFee,
      });
      await fetchRateCaps();
      alert('Rate caps updated successfully!');
    } catch (error) {
      console.error('Failed to update rate caps:', error);
      alert('Failed to update rate caps');
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rate Caps Configuration</h1>
        <p className="text-gray-600 mt-2">
          Configure maximum hourly rates and cancellation fees for SLP and SLPA credentials
        </p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 max-w-4xl">
        {/* Info Alert */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">How Rate Caps Work:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>SLP (Full License):</strong> Maximum hourly rate therapists with SLP credentials can charge</li>
              <li><strong>SLPA (Assistant):</strong> Maximum hourly rate therapists with SLPA credentials can charge</li>
              <li><strong>SLP Cancellation Fee:</strong> Flat rate ($20 default) paid to SLP when patient cancels and SLP logs the cancellation</li>
              <li><strong>SLPA Cancellation Fee:</strong> Flat rate ($15 default) paid to SLPA when patient cancels and SLPA logs the cancellation</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* SLP Rate Cap */}
          <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-semibold text-indigo-900">SLP Rate Cap</h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Hourly Rate ($)
              </label>
              <input
                type="number"
                min="0"
                max="200"
                value={slpCap}
                onChange={(e) => setSlpCap(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-indigo-700">
              Therapists with SLP credentials cannot set hourly rates above this amount
            </p>
          </div>

          {/* SLPA Rate Cap */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">SLPA Rate Cap</h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Hourly Rate ($)
              </label>
              <input
                type="number"
                min="0"
                max="200"
                value={slpaCap}
                onChange={(e) => setSlpaCap(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-green-700">
              Therapists with SLPA credentials cannot set hourly rates above this amount
            </p>
          </div>

          {/* SLP Cancellation Fee */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">SLP Cancellation Fee</h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flat Rate ($)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={slpCancellationFee}
                onChange={(e) => setSlpCancellationFee(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-blue-700">
              Flat rate paid to SLP when patient cancels and SLP logs the cancellation
            </p>
          </div>

          {/* SLPA Cancellation Fee */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900">SLPA Cancellation Fee</h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flat Rate ($)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={slpaCancellationFee}
                onChange={(e) => setSlpaCancellationFee(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-purple-700">
              Flat rate paid to SLPA when patient cancels and SLPA logs the cancellation
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Current Configuration Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">SLP Max Rate:</span>
              <span className="font-medium text-gray-900 ml-2">${slpCap}/hour</span>
            </div>
            <div>
              <span className="text-gray-600">SLPA Max Rate:</span>
              <span className="font-medium text-gray-900 ml-2">${slpaCap}/hour</span>
            </div>
            <div>
              <span className="text-gray-600">SLP Cancellation Fee:</span>
              <span className="font-medium text-gray-900 ml-2">${slpCancellationFee}</span>
            </div>
            <div>
              <span className="text-gray-600">SLPA Cancellation Fee:</span>
              <span className="font-medium text-gray-900 ml-2">${slpaCancellationFee}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={
            saving ||
            (slpCap === rateCaps.SLP &&
              slpaCap === rateCaps.SLPA &&
              slpCancellationFee === (rateCaps.cancellationFees?.SLP || 20) &&
              slpaCancellationFee === (rateCaps.cancellationFees?.SLPA || rateCaps.slpaCancellationFee || 15))
          }
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

