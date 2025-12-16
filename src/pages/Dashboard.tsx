import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { Users, UserCheck, UserCircle, CreditCard, DollarSign, TrendingUp } from 'lucide-react';

interface Stats {
  users: {
    total: number;
    therapists: number;
    clients: number;
  };
  sessions: {
    total: number;
  };
  subscriptions: {
    active: number;
  };
  payments: {
    total: number;
    revenue: {
      allTime: number;
      thisMonth: number;
    };
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.users.total || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Therapists',
      value: stats?.users.therapists || 0,
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      name: 'Clients',
      value: stats?.users.clients || 0,
      icon: UserCircle,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Sessions',
      value: stats?.sessions.total || 0,
      icon: CreditCard,
      color: 'bg-yellow-500',
    },
    {
      name: 'Active Subscriptions',
      value: stats?.subscriptions.active || 0,
      icon: DollarSign,
      color: 'bg-indigo-500',
    },
    {
      name: 'This Month Revenue',
      value: `$${((stats?.payments.revenue.thisMonth || 0) / 100).toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">All Time Revenue</span>
              <span className="text-2xl font-bold text-gray-900">
                ${((stats?.payments.revenue.allTime || 0) / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Month Revenue</span>
              <span className="text-2xl font-bold text-indigo-600">
                ${((stats?.payments.revenue.thisMonth || 0) / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Payments</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats?.payments.total || 0}
              </span>
            </div>
            {stats?.payments.revenue.thisMonth && stats?.payments.revenue.allTime && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${((stats.payments.revenue.thisMonth / stats.payments.revenue.allTime) * 100).toFixed(1)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.payments.revenue.thisMonth / stats.payments.revenue.allTime) * 100).toFixed(1)}% of total revenue this month
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Distribution</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Therapists</span>
                <span className="font-semibold">{stats?.users.therapists || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stats?.users.total
                        ? (stats.users.therapists / stats.users.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Clients</span>
                <span className="font-semibold">{stats?.users.clients || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stats?.users.total
                        ? (stats.users.clients / stats.users.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold text-gray-900">{stats?.users.total || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/sessions"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Manage Sessions</h3>
            <p className="text-sm text-gray-600">View and manage all therapy sessions</p>
          </a>
          <a
            href="/reports"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-1">View Reports</h3>
            <p className="text-sm text-gray-600">Access detailed analytics and reports</p>
          </a>
          <a
            href="/settings"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-1">System Settings</h3>
            <p className="text-sm text-gray-600">Configure platform settings</p>
          </a>
        </div>
      </div>
    </div>
  );
}

