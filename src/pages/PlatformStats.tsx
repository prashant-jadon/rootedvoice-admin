import { useState, useEffect } from 'react'
import { adminAPI } from '../lib/api'
import { Save, Loader2 } from 'lucide-react'

interface PlatformStats {
  whoWeAreStats: {
    licensedTherapists: { number: string; label: string; context: string }
    yearsExperience: { number: string; label: string; context: string }
    sessionsCompleted: { number: string; label: string; context: string }
    clientSatisfaction: { number: string; label: string; context: string }
  }
  landingPageStats: {
    activeTherapists: { number: string; label: string; icon: string }
    sessionsCompleted: { number: string; label: string; icon: string }
    platformUptime: { number: string; label: string; icon: string }
    clientRating: { number: string; label: string; icon: string }
  }
}

export default function PlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getPlatformStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch platform stats:', error)
      setMessage({ type: 'error', text: 'Failed to load platform stats' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!stats) return
    
    try {
      setSaving(true)
      setMessage(null)
      await adminAPI.updatePlatformStats(stats)
      setMessage({ type: 'success', text: 'Platform stats updated successfully!' })
    } catch (error) {
      console.error('Failed to update platform stats:', error)
      setMessage({ type: 'error', text: 'Failed to update platform stats' })
    } finally {
      setSaving(false)
    }
  }

  const updateWhoWeAreStat = (key: string, field: 'number' | 'label' | 'context', value: string) => {
    if (!stats) return
    setStats({
      ...stats,
      whoWeAreStats: {
        ...stats.whoWeAreStats,
        [key]: {
          ...stats.whoWeAreStats[key as keyof typeof stats.whoWeAreStats],
          [field]: value,
        },
      },
    })
  }

  const updateLandingPageStat = (key: string, field: 'number' | 'label' | 'icon', value: string) => {
    if (!stats) return
    setStats({
      ...stats,
      landingPageStats: {
        ...stats.landingPageStats,
        [key]: {
          ...stats.landingPageStats[key as keyof typeof stats.landingPageStats],
          [field]: value,
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-12">Failed to load platform stats</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Stats</h1>
          <p className="text-gray-600 mt-2">Manage statistics displayed on Who We Are and Landing pages</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Who We Are Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Who We Are Page Stats</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Licensed Therapists */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">Licensed Therapists</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input
                type="text"
                value={stats.whoWeAreStats.licensedTherapists.number}
                onChange={(e) => updateWhoWeAreStat('licensedTherapists', 'number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={stats.whoWeAreStats.licensedTherapists.label}
                onChange={(e) => updateWhoWeAreStat('licensedTherapists', 'label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
              <textarea
                value={stats.whoWeAreStats.licensedTherapists.context}
                onChange={(e) => updateWhoWeAreStat('licensedTherapists', 'context', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={2}
              />
            </div>
          </div>

          {/* Years Experience */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">Years Combined Experience</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input
                type="text"
                value={stats.whoWeAreStats.yearsExperience.number}
                onChange={(e) => updateWhoWeAreStat('yearsExperience', 'number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={stats.whoWeAreStats.yearsExperience.label}
                onChange={(e) => updateWhoWeAreStat('yearsExperience', 'label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
              <textarea
                value={stats.whoWeAreStats.yearsExperience.context}
                onChange={(e) => updateWhoWeAreStat('yearsExperience', 'context', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={2}
              />
            </div>
          </div>

          {/* Sessions Completed */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">Sessions Completed</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input
                type="text"
                value={stats.whoWeAreStats.sessionsCompleted.number}
                onChange={(e) => updateWhoWeAreStat('sessionsCompleted', 'number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={stats.whoWeAreStats.sessionsCompleted.label}
                onChange={(e) => updateWhoWeAreStat('sessionsCompleted', 'label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
              <textarea
                value={stats.whoWeAreStats.sessionsCompleted.context}
                onChange={(e) => updateWhoWeAreStat('sessionsCompleted', 'context', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={2}
              />
            </div>
          </div>

          {/* Client Satisfaction */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">Client Satisfaction Rate</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input
                type="text"
                value={stats.whoWeAreStats.clientSatisfaction.number}
                onChange={(e) => updateWhoWeAreStat('clientSatisfaction', 'number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={stats.whoWeAreStats.clientSatisfaction.label}
                onChange={(e) => updateWhoWeAreStat('clientSatisfaction', 'label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
              <textarea
                value={stats.whoWeAreStats.clientSatisfaction.context}
                onChange={(e) => updateWhoWeAreStat('clientSatisfaction', 'context', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Landing Page Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Landing Page Stats</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Therapists */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">Active Therapists</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input
                type="text"
                value={stats.landingPageStats.activeTherapists.number}
                onChange={(e) => updateLandingPageStat('activeTherapists', 'number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={stats.landingPageStats.activeTherapists.label}
                onChange={(e) => updateLandingPageStat('activeTherapists', 'label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
              <input
                type="text"
                value={stats.landingPageStats.activeTherapists.icon}
                onChange={(e) => updateLandingPageStat('activeTherapists', 'icon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="🎯"
              />
            </div>
          </div>

          {/* Sessions Completed */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">Sessions Completed</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input
                type="text"
                value={stats.landingPageStats.sessionsCompleted.number}
                onChange={(e) => updateLandingPageStat('sessionsCompleted', 'number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={stats.landingPageStats.sessionsCompleted.label}
                onChange={(e) => updateLandingPageStat('sessionsCompleted', 'label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
              <input
                type="text"
                value={stats.landingPageStats.sessionsCompleted.icon}
                onChange={(e) => updateLandingPageStat('sessionsCompleted', 'icon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="⚡"
              />
            </div>
          </div>

          {/* Platform Uptime */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">Platform Uptime</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input
                type="text"
                value={stats.landingPageStats.platformUptime.number}
                onChange={(e) => updateLandingPageStat('platformUptime', 'number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={stats.landingPageStats.platformUptime.label}
                onChange={(e) => updateLandingPageStat('platformUptime', 'label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
              <input
                type="text"
                value={stats.landingPageStats.platformUptime.icon}
                onChange={(e) => updateLandingPageStat('platformUptime', 'icon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="⭐"
              />
            </div>
          </div>

          {/* Client Rating */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">Client Rating</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input
                type="text"
                value={stats.landingPageStats.clientRating.number}
                onChange={(e) => updateLandingPageStat('clientRating', 'number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={stats.landingPageStats.clientRating.label}
                onChange={(e) => updateLandingPageStat('clientRating', 'label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
              <input
                type="text"
                value={stats.landingPageStats.clientRating.icon}
                onChange={(e) => updateLandingPageStat('clientRating', 'icon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="⭐"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

