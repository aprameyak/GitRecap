import { useState, useEffect } from 'react';
import { getData } from "@/routes/route";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
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
      weekly_commits: number[];
      streak: number;
      top_repos: Array<{
        name: string;
        stars: number;
      }>;
      commit_time_distribution: number[];
      contribution_data: Array<{
        date: string;
        count: number;
      }>;
    };
    languages: Array<{
      name: string;
      percentage: number;
    }>;
    repos: number;
    stars: number;
    developer_personality: string;
  };
}

export default function Display({ username }: DisplayProps) {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;
      setLoading(true);
      try {
        const result = await getData(username);
        setData(result);
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20">
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  if (!data || !data.stats || !data.profile) {
    return (
      <div className="text-center p-8 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  const weeklyCommits = data.stats.activity?.weekly_commits || Array(52).fill(0);
  const languages = data.stats.languages || [];
  const topLanguages = languages.slice(0, 5);
  const commitTimeDistribution = data.stats.activity?.commit_time_distribution || Array(24).fill(0);
  const contributionData = data.stats.activity?.contribution_data || [];
  const developerPersonality = data.stats.developer_personality || "Consistent Contributor";

  const weeklyCommitsData = {
    labels: Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`),
    datasets: [
      {
        label: 'Commits',
        data: weeklyCommits,
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const languageData = {
    labels: topLanguages.map(lang => lang?.name || 'Unknown'),
    datasets: [
      {
        label: 'Language Usage',
        data: topLanguages.map(lang => lang?.percentage || 0),
        backgroundColor: [
          'rgba(236, 72, 153, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderColor: [
          'rgba(236, 72, 153, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(249, 115, 22, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const commitTimeData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Commits',
        data: commitTimeDistribution,
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      title: {
        display: true,
        color: 'rgba(255, 255, 255, 0.9)',
        font: {
          size: 16,
          weight: 'bold',
          family: "'Inter', sans-serif"
        }
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: "'Inter', sans-serif"
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: "'Inter', sans-serif"
          }
        }
      }
    }
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
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-8 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl">
        <img 
          src={data.profile.avatar_url || 'default-avatar.png'} 
          alt={username} 
          className="w-24 h-24 rounded-full ring-2 ring-violet-500 shadow-lg transform hover:scale-105 transition-transform duration-200"
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-500 text-transparent bg-clip-text">
            {data.profile.username || username}
          </h2>
          <p className="text-gray-400 mb-6">Joined {data.profile.join_date || 'N/A'}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-white/5 hover:border-violet-500/50 transition-colors duration-200">
              <p className="text-gray-400 text-sm font-medium">Repositories</p>
              <p className="text-2xl font-bold text-white">{data.stats.repos || 0}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-white/5 hover:border-violet-500/50 transition-colors duration-200">
              <p className="text-gray-400 text-sm font-medium">Stars</p>
              <p className="text-2xl font-bold text-white">{data.stats.stars || 0}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-white/5 hover:border-violet-500/50 transition-colors duration-200">
              <p className="text-gray-400 text-sm font-medium">Streak</p>
              <p className="text-2xl font-bold text-white">{data.stats.activity?.streak || 0} days</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-white/5 hover:border-violet-500/50 transition-colors duration-200">
              <p className="text-gray-400 text-sm font-medium">Languages</p>
              <p className="text-2xl font-bold text-white">{languages.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">Weekly Commits</h3>
          <div className="h-[300px]">
            <Bar 
              data={weeklyCommitsData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Commits Over Time'
                  }
                }
              }} 
            />
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">Top Languages</h3>
          <div className="h-[300px] flex items-center justify-center">
            <Pie 
              data={languageData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Language Distribution'
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">Commit Time Distribution</h3>
          <div className="h-[300px]">
            <Bar 
              data={commitTimeData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'When You Code (24h)'
                  }
                }
              }} 
            />
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">Contribution Heatmap</h3>
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <CalendarHeatmap
              startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
              endDate={new Date()}
              values={contributionData}
              classForValue={(value) => {
                if (!value || !value.count) {
                  return 'color-empty';
                }
                return `color-github-${Math.min(4, value.count)}`;
              }}
              gutterSize={2}
              showWeekdayLabels={true}
              tooltipDataAttrs={(value: any) => {
                if (!value || !value.date) {
                  return { 'data-tooltip': 'No data' };
                }
                return {
                  'data-tooltip': `${value.date}: ${value.count || 0} commits`
                };
              }}
            />
          </div>
          <style jsx global>{`
            .react-calendar-heatmap .color-empty {
              fill: #2d374850;
            }
            .react-calendar-heatmap .color-github-0 {
              fill: rgba(139, 92, 246, 0.1);
            }
            .react-calendar-heatmap .color-github-1 {
              fill: rgba(139, 92, 246, 0.3);
            }
            .react-calendar-heatmap .color-github-2 {
              fill: rgba(139, 92, 246, 0.5);
            }
            .react-calendar-heatmap .color-github-3 {
              fill: rgba(139, 92, 246, 0.7);
            }
            .react-calendar-heatmap .color-github-4 {
              fill: rgba(139, 92, 246, 0.9);
            }
            .react-calendar-heatmap text {
              fill: rgba(255, 255, 255, 0.7);
              font-size: 8px;
            }
          `}</style>
        </div>
      </div>

      <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 p-6 rounded-lg shadow-lg backdrop-blur-sm border border-white/10">
        <h3 className="text-xl font-semibold mb-4 text-white">Year in Review</h3>
        <p className="text-lg text-gray-200 mb-4">You've had an amazing year on GitHub! Here are some highlights:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5 text-center">
            <p className="text-gray-400 text-sm">Most Used Language</p>
            <p className="text-2xl font-bold text-white">{topLanguages[0]?.name || 'N/A'}</p>
            <p className="text-violet-400">{topLanguages[0]?.percentage || 0}% of code</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5 text-center">
            <p className="text-gray-400 text-sm">Longest Streak</p>
            <p className="text-2xl font-bold text-white">{data.stats.activity?.streak || 0} days</p>
            <p className="text-violet-400">of consistent coding</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5 text-center">
            <p className="text-gray-400 text-sm">Developer Personality</p>
            <p className="text-2xl font-bold text-white">{developerPersonality}</p>
            <p className="text-violet-400">based on your commit patterns</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleShare}
          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
          aria-label="Share report"
        >
          Share Your GitHub Wrapped!
        </button>
      </div>
    </div>
  );
}