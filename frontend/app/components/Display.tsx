"use client";
import { useState, useEffect } from 'react';
import { getData } from "@/routes/route";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DisplayProps {
  username: string;
}

interface GitHubData {
  profile: {
    username: string;
    avatar_url: string;
    join_date: string;
  };
  stats: {
    activity: {
      streak: number;
      weekly_commits?: Record<string, number>;
    };
    languages: Array<{
      name: string;
      percentage: number;
    }>;
    repos: number;
    stars: number;
  };
}

export default function Display({ username }: DisplayProps) {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!username?.trim()) return;
      setLoading(true);
      setError(null);
      
      try {
        const result = await getData(username);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div>Loading data for {username}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const weeklyCommits = data.stats.activity?.weekly_commits ? Object.values(data.stats.activity.weekly_commits) : Array(52).fill(0);
  const languages = data.stats.languages;
  const topLanguages = languages.slice(0, 5);

  const weeklyCommitsData = {
    labels: Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`),
    datasets: [
      {
        label: 'Commits',
        data: weeklyCommits,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const languageData = {
    labels: topLanguages.map(lang => lang.name),
    datasets: [
      {
        label: 'Language Usage',
        data: topLanguages.map(lang => lang.percentage),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const weeklyCommitsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Commits',
        font: {
          size: 16,
          weight: 'bold' as const,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const languageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Language Usage',
        font: {
          size: 16,
          weight: 'bold' as const,
        }
      },
    },
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `GitHub Wrapped - ${username}`,
          text: `Check out ${username}'s GitHub Wrapped!`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          GitHub Wrapped for {username}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div style={{ height: '400px' }}>
              {weeklyCommits.every(commit => commit === 0) ? (
                <p>No commit data available.</p>
              ) : (
                <Bar options={weeklyCommitsOptions} data={weeklyCommitsData} />
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div style={{ height: '400px' }}>
              <Pie options={languageOptions} data={languageData} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Profile Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4">
              <img 
                src={data.profile.avatar_url} 
                alt={`${username}'s avatar`}
                className="w-16 h-16 rounded-full"
                loading="lazy"
              />
              <div>
                <p className="font-medium">Username: {data.profile.username}</p>
                <p>Joined: {new Date(data.profile.join_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Repositories:</span> {data.stats.repos}</p>
              <p><span className="font-medium">Total Stars:</span> {data.stats.stars}</p>
              <p><span className="font-medium">Longest Streak:</span> {data.stats.activity.streak} days</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleShare}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            aria-label="Share report"
          >
            Share Report
          </button>
        </div>
      </div>
    </div>
  );
}
