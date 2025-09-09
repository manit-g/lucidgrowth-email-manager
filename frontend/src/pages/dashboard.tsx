import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  Mail, 
  Plus, 
  Settings, 
  LogOut, 
  BarChart3, 
  Search, 
  Sync,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Shield,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Main dashboard component
 * Provides overview of email accounts, sync status, and analytics
 */
export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(userData));
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load accounts and analytics in parallel
      const [accountsRes, analyticsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData.data || []);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.data || null);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <Sync className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'PAUSED':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Lucid Growth Email Manager</title>
        <meta name="description" content="Email management dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-primary-600" />
                <h1 className="ml-2 text-xl font-bold text-gray-900">Email Manager</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, <span className="font-semibold">{user?.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Mail className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                  <p className="text-2xl font-semibold text-gray-900">{accounts.length}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Emails</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics?.esp?.totalEmails || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unique Domains</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics?.domains?.totalDomains || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">TLS Support</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics?.tls?.tlsSummary?.tlsSupportPercentage?.toFixed(1) || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Email Accounts */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Email Accounts</h2>
                <button className="btn-primary flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </button>
              </div>

              {accounts.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No email accounts configured</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Add your first email account to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{account.name}</h3>
                          <p className="text-sm text-gray-600">{account.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`badge ${account.isConnected ? 'badge-success' : 'badge-danger'}`}>
                            {account.isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                          <button className="btn-secondary">
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {account.lastSyncAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last sync: {new Date(account.lastSyncAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ESP Analytics */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">ESP Distribution</h2>
                <button className="btn-secondary flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Details
                </button>
              </div>

              {analytics?.esp?.espTypes?.length > 0 ? (
                <div className="space-y-4">
                  {analytics.esp.espTypes.slice(0, 5).map((esp: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{esp._id}</p>
                        <p className="text-sm text-gray-600">
                          {esp.totalCount} emails
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {((esp.totalCount / analytics.esp.totalEmails) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No analytics data available</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Sync some emails to see ESP analytics
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="card p-6 text-left hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <Search className="h-6 w-6 text-primary-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Search Emails</h3>
                    <p className="text-sm text-gray-600">Full-text search across all emails</p>
                  </div>
                </div>
              </button>

              <button className="card p-6 text-left hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <Sync className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Sync All Accounts</h3>
                    <p className="text-sm text-gray-600">Start synchronization for all accounts</p>
                  </div>
                </div>
              </button>

              <button className="card p-6 text-left hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">View Analytics</h3>
                    <p className="text-sm text-gray-600">Detailed email analytics and reports</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
