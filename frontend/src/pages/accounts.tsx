import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Plus, Settings, TestTube, Trash2, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

/**
 * Email Accounts Management Page
 * Allows users to add, configure, and manage email accounts
 */
export default function Accounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    email: '',
    imapHost: '',
    imapPort: 993,
    useTLS: true,
    authMethod: 'PLAIN',
    password: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await api.get('/api/accounts');
      setAccounts(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/accounts', newAccount);
      toast.success('Account added successfully');
      setShowAddForm(false);
      setNewAccount({
        name: '',
        email: '',
        imapHost: '',
        imapPort: 993,
        useTLS: true,
        authMethod: 'PLAIN',
        password: '',
      });
      loadAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add account');
    }
  };

  const handleTestConnection = async (accountId: string) => {
    try {
      const response = await api.post(`/api/accounts/${accountId}/test`);
      if (response.data.data.success) {
        toast.success('Connection test successful');
      } else {
        toast.error('Connection test failed');
      }
      loadAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Connection test failed');
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    try {
      await api.delete(`/api/accounts/${accountId}`);
      toast.success('Account deleted successfully');
      loadAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

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
        <title>Email Accounts - Lucid Growth Email Manager</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Email Accounts</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </button>
        </div>

        {/* Add Account Form */}
        {showAddForm && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Email Account</h2>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Account Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="My Gmail Account"
                  />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="input"
                    value={newAccount.email}
                    onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="label">IMAP Host</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={newAccount.imapHost}
                    onChange={(e) => setNewAccount({ ...newAccount, imapHost: e.target.value })}
                    placeholder="imap.gmail.com"
                  />
                </div>
                <div>
                  <label className="label">IMAP Port</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={newAccount.imapPort}
                    onChange={(e) => setNewAccount({ ...newAccount, imapPort: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Authentication Method</label>
                  <select
                    className="input"
                    value={newAccount.authMethod}
                    onChange={(e) => setNewAccount({ ...newAccount, authMethod: e.target.value })}
                  >
                    <option value="PLAIN">PLAIN</option>
                    <option value="LOGIN">LOGIN</option>
                    <option value="OAUTH2">OAuth2</option>
                  </select>
                </div>
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    required
                    className="input"
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                    placeholder="App password or OAuth token"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useTLS"
                  checked={newAccount.useTLS}
                  onChange={(e) => setNewAccount({ ...newAccount, useTLS: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="useTLS" className="ml-2 block text-sm text-gray-900">
                  Use TLS encryption
                </label>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary">
                  Add Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Accounts List */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Configured Accounts</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {accounts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No email accounts configured</p>
                <p className="text-sm text-gray-500 mt-2">
                  Add your first email account to get started
                </p>
              </div>
            ) : (
              accounts.map((account) => (
                <div key={account._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Mail className="h-8 w-8 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{account.name}</h3>
                        <p className="text-sm text-gray-600">{account.email}</p>
                        <p className="text-xs text-gray-500">
                          {account.imapHost}:{account.imapPort} ({account.authMethod})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {account.isConnected ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className={`ml-1 text-sm ${account.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                          {account.isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleTestConnection(account._id)}
                        className="btn-secondary flex items-center"
                        title="Test Connection"
                      >
                        <TestTube className="h-4 w-4" />
                      </button>
                      <button
                        className="btn-secondary flex items-center"
                        title="Settings"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account._id)}
                        className="btn-danger flex items-center"
                        title="Delete Account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {account.lastSyncAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last sync: {new Date(account.lastSyncAt).toLocaleString()}
                    </p>
                  )}
                  {account.errorMessage && (
                    <p className="text-xs text-red-500 mt-2">
                      Error: {account.errorMessage}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
