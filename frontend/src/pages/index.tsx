import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Mail, Shield, Search, BarChart3, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Landing page component
 * Provides login functionality and showcases application features
 */
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.access_token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Mail,
      title: 'Multi-IMAP Support',
      description: 'Connect to multiple email accounts across different IMAP servers simultaneously with connection pooling.',
    },
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'Support for OAuth2, PLAIN, and LOGIN authentication methods with TLS validation.',
    },
    {
      icon: Search,
      title: 'Full-Text Search',
      description: 'Search across all processed email content with advanced filtering and suggestions.',
    },
    {
      icon: BarChart3,
      title: 'ESP Analytics',
      description: 'Detect Email Service Providers, analyze sending patterns, and validate TLS certificates.',
    },
    {
      icon: Users,
      title: 'Domain Analysis',
      description: 'Track sending domains, detect open relays, and monitor email delivery patterns.',
    },
    {
      icon: Clock,
      title: 'Real-time Sync',
      description: 'Pause and resume email synchronization with folder hierarchy preservation.',
    },
  ];

  return (
    <>
      <Head>
        <title>Lucid Growth Email Manager</title>
        <meta name="description" content="Centralized email management with advanced analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-primary-600" />
                <h1 className="ml-2 text-2xl font-bold text-gradient">Lucid Growth Email Manager</h1>
              </div>
              <div className="text-sm text-gray-600">
                Developed by <span className="font-semibold">Manit</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Login Form */}
            <div className="card p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to access your email management dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="username" className="label">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    className="input"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="input"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Demo Credentials:</strong><br />
                  Username: <code>admin</code><br />
                  Password: <code>admin123</code>
                </p>
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Powerful Email Management Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <feature.icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>&copy; 2024 Lucid Growth. All rights reserved.</p>
              <p className="mt-2 text-sm">Built with Next.js, NestJS, and MongoDB</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
