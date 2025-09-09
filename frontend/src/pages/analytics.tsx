import { useState, useEffect } from 'react';
import Head from 'next/head';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Mail, Globe, Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../lib/api';

/**
 * Analytics Dashboard Page
 * Displays comprehensive email analytics including ESP distribution, TLS validation, and domain analysis
 */
export default function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimeRange]);

  const loadAnalytics = async () => {
    try {
      const dateFrom = new Date();
      if (selectedTimeRange === '7d') {
        dateFrom.setDate(dateFrom.getDate() - 7);
      } else if (selectedTimeRange === '30d') {
        dateFrom.setDate(dateFrom.getDate() - 30);
      } else if (selectedTimeRange === '90d') {
        dateFrom.setDate(dateFrom.getDate() - 90);
      }

      const response = await api.get('/api/analytics/dashboard', {
        params: {
          dateFrom: dateFrom.toISOString(),
        },
      });
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Analytics - Lucid Growth Email Manager</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Email Analytics</h1>
          <div className="flex space-x-2">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  selectedTimeRange === range
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-8 w-8 text-primary-600" />
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
                <Globe className="h-8 w-8 text-green-600" />
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
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">TLS Support</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.tls?.tlsSummary?.tlsSupportPercentage?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Relays</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.openRelay?.summary?.openRelays || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ESP Distribution */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ESP Distribution</h2>
            {analytics?.esp?.espTypes?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.esp.espTypes.map((esp: any) => ({
                      name: esp._id,
                      value: esp.totalCount,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.esp.espTypes.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No ESP data available</p>
              </div>
            )}
          </div>

          {/* Top Domains */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Sending Domains</h2>
            {analytics?.domains?.domains?.length > 0 ? (
              <div className="space-y-3">
                {analytics.domains.domains.slice(0, 8).map((domain: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-sm font-medium text-gray-900">{domain._id}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{domain.count}</p>
                      <p className="text-xs text-gray-500">{domain.espType}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No domain data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TLS Validation */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">TLS Security Analysis</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">TLS Supported</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {analytics?.tls?.tlsSummary?.tlsSupported || 0} emails
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-700">Valid Certificates</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {analytics?.tls?.tlsSummary?.validCertificates || 0} emails
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${analytics?.tls?.tlsSummary?.tlsSupportPercentage || 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                {analytics?.tls?.tlsSummary?.tlsSupportPercentage?.toFixed(1) || 0}% of emails support TLS
              </p>
            </div>
          </div>

          {/* Time Delta Analysis */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Time Analysis</h2>
            {analytics?.timeDelta?.overall ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Average</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {(analytics.timeDelta.overall.avgTimeDelta / 1000 / 60).toFixed(1)} min
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Median</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {(analytics.timeDelta.overall.medianTimeDelta / 1000 / 60).toFixed(1)} min
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">95th Percentile</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {(analytics.timeDelta.overall.p95TimeDelta / 1000 / 60).toFixed(1)} min
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">99th Percentile</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {(analytics.timeDelta.overall.p99TimeDelta / 1000 / 60).toFixed(1)} min
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No time delta data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Open Relay Detection */}
        {analytics?.openRelay?.openRelayDomains?.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Open Relay Detection</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-red-800">
                  {analytics.openRelay.summary.openRelays} emails detected from open relay servers
                </span>
              </div>
              <div className="space-y-2">
                {analytics.openRelay.openRelayDomains.slice(0, 5).map((relay: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-red-700">{relay._id}</span>
                    <span className="text-red-600 font-medium">{relay.count} emails</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
