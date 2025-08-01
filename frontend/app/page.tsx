"use client";
import React, { useState, useEffect } from 'react';
import Display from './components/Display';
import { TrendingUp, Clock, Users, Star, GitBranch, Calendar } from 'react-feather';

export default function Home() {
  const [username, setUsername] = useState('');
  const [submittedUsername, setSubmittedUsername] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gitrecap-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoading(true);
      const cleanUsername = username.trim();
      setSubmittedUsername(cleanUsername);
      
      // Save to recent searches
      const updated = [cleanUsername, ...recentSearches.filter(s => s !== cleanUsername)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('gitrecap-recent-searches', JSON.stringify(updated));
      
      setIsLoading(false);
    }
  };

  const handleQuickSearch = (quickUsername: string) => {
    setUsername(quickUsername);
    setSubmittedUsername(quickUsername);
  };

  const trendingUsers = [
    { username: 'octocat', name: 'GitHub Octocat', description: 'GitHub mascot' },
    { username: 'torvalds', name: 'Linus Torvalds', description: 'Linux creator' },
    { username: 'antirez', name: 'Salvatore Sanfilippo', description: 'Redis creator' },
    { username: 'gvanrossum', name: 'Guido van Rossum', description: 'Python creator' },
    { username: 'jashkenas', name: 'Jeremy Ashkenas', description: 'Backbone.js creator' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 text-transparent bg-clip-text mb-4">
            GitRecap
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-4">
            Discover your GitHub coding patterns with Spotify Wrapped-style analytics
          </p>
          <div className="flex justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              <span>Repository Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Commit Patterns</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Activity Insights</span>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username..."
              className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-lg hover:from-violet-600 hover:to-fuchsia-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>
        </div>

        {/* Display Component */}
        {submittedUsername && (
          <Display username={submittedUsername} />
        )}

        {/* Quick Actions */}
        {!submittedUsername && (
          <div className="max-w-4xl mx-auto">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSearch(search)}
                      className="px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm hover:bg-slate-700/50 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Users */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Developers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingUsers.map((user) => (
                  <button
                    key={user.username}
                    onClick={() => handleQuickSearch(user.username)}
                    className="p-4 bg-slate-800/30 border border-white/10 rounded-lg text-left hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://github.com/${user.username}.png?size=40`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-gray-400">@{user.username}</div>
                        <div className="text-xs text-gray-500">{user.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-800/20 border border-white/10 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-violet-500/20 rounded-lg">
                    <GitBranch className="w-5 h-5 text-violet-400" />
                  </div>
                  <h4 className="font-semibold">Repository Insights</h4>
                </div>
                <p className="text-sm text-gray-400">
                  Analyze repository contributions, languages used, and project activity patterns.
                </p>
              </div>

              <div className="p-6 bg-slate-800/20 border border-white/10 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-fuchsia-500/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-fuchsia-400" />
                  </div>
                  <h4 className="font-semibold">Commit Patterns</h4>
                </div>
                <p className="text-sm text-gray-400">
                  Visualize coding activity over time with heatmaps and commit frequency analysis.
                </p>
              </div>

              <div className="p-6 bg-slate-800/20 border border-white/10 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="font-semibold">Developer Profile</h4>
                </div>
                <p className="text-sm text-gray-400">
                  Get comprehensive insights into coding habits, collaboration patterns, and project focus.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
