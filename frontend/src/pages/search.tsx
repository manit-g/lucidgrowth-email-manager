import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Search, Filter, Mail, Calendar, User, Globe } from 'lucide-react';
import api from '../lib/api';

/**
 * Email Search Page
 * Provides full-text search and advanced filtering capabilities
 */
export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    accountId: '',
    folder: '',
    espType: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const params: any = {
        q: searchQuery,
        page,
        limit: 20,
      };

      // Add filters if they exist
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const response = await api.get('/api/search', { params });
      setSearchResults(response.data.data.emails || []);
      setTotalResults(response.data.data.pagination.totalCount || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvancedSearch = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: 20,
      };

      // Add advanced search criteria
      if (searchQuery) params.content = searchQuery;
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const response = await api.get('/api/search/advanced', { params });
      setSearchResults(response.data.data.emails || []);
      setTotalResults(response.data.data.pagination.totalCount || 0);
      setCurrentPage(1);
    } catch (error) {
      console.error('Advanced search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getESPBadgeColor = (espType: string) => {
    switch (espType) {
      case 'Webmail':
        return 'badge-info';
      case 'Transactional':
        return 'badge-success';
      case 'Marketing':
        return 'badge-warning';
      case 'Support':
        return 'badge-gray';
      default:
        return 'badge-gray';
    }
  };

  return (
    <>
      <Head>
        <title>Search - Lucid Growth Email Manager</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Email Search</h1>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn-secondary flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>

        {/* Search Form */}
        <div className="card p-6">
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search emails..."
                  className="input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="btn-primary flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="label">Account</label>
                  <select
                    className="input"
                    value={filters.accountId}
                    onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
                  >
                    <option value="">All Accounts</option>
                    {/* Add account options here */}
                  </select>
                </div>
                <div>
                  <label className="label">Folder</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Inbox, Sent, etc."
                    value={filters.folder}
                    onChange={(e) => setFilters({ ...filters, folder: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">ESP Type</label>
                  <select
                    className="input"
                    value={filters.espType}
                    onChange={(e) => setFilters({ ...filters, espType: e.target.value })}
                  >
                    <option value="">All Types</option>
                    <option value="Webmail">Webmail</option>
                    <option value="Transactional">Transactional</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="label">Date From</label>
                  <input
                    type="date"
                    className="input"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Date To</label>
                  <input
                    type="date"
                    className="input"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAdvancedSearch}
                    className="btn-primary w-full"
                  >
                    Advanced Search
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Search Results ({totalResults.toLocaleString()})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {searchResults.map((email, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                          {email.subject || '(No Subject)'}
                        </h3>
                        {email.espType && (
                          <span className={`badge ${getESPBadgeColor(email.espType)}`}>
                            {email.espType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {email.from}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(email.date)}
                        </div>
                        {email.sendingDomain && (
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-1" />
                            {email.sendingDomain}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {email.textContent || email.content || 'No content available'}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        {email.supportsTLS && (
                          <span className="badge badge-success" title="TLS Supported">
                            TLS
                          </span>
                        )}
                        {email.isOpenRelay && (
                          <span className="badge badge-danger" title="Open Relay">
                            Open Relay
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {email.folder}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalResults > 20 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalResults)} of {totalResults} results
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSearch(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn-secondary"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handleSearch(currentPage + 1)}
                      disabled={currentPage * 20 >= totalResults}
                      className="btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {searchQuery && searchResults.length === 0 && !isLoading && (
          <div className="card p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="card p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching emails...</p>
          </div>
        )}
      </div>
    </>
  );
}
