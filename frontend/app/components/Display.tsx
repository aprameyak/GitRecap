"use client";
import { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
// @ts-ignore - react-calendar-heatmap doesn't have proper types
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { 
  GitBranch, Star, Users, UserPlus, 
  MapPin, Calendar, BarChart2, Moon, 
  Sun, Clock, Zap, Code, TrendingUp 
} from 'react-feather';

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
    name?: string;
    bio?: string;
    location?: string;
  };
  stats: {
    activity: {
      weekly_commits: number[];
      streak: number;
      top_repos: Array<{
        name: string;
        stars: number;
        description?: string;
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
      color?: string;
    }>;
    repos: number;
    stars: number;
    followers: number;
    following: number;
    developer_personality: string;
    longest_streak: number;
    favorite_language: string;
  };
  sentiment?: {
    positive: number;
    neutral: number;
    negative: number;
    average_polarity: number;
    common_words: Record<string, number>;
    commit_types: {
      feature: number;
      bugfix: number;
      refactor: number;
      docs: number;
      chore: number;
      other: number;
    };
  };
}

// Fetch data from the backend API
async function getData(username: string): Promise<GitHubData | null> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    const response = await fetch(`${backendUrl}/analyze/${username}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export default function Display({ username }: DisplayProps) {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getData(username);
        if (!result) {
          throw new Error('No data received');
        }
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-40 rounded-xl bg-slate-900/50"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-slate-800/50"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 rounded-xl bg-slate-900/50"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900/50 rounded-xl border border-red-500/20 p-8">
        <div className="text-center p-6 bg-red-500/10 rounded-lg">
          <h3 className="text-xl font-semibold mb-2 text-red-400">Error Loading Data</h3>
          <p className="text-red-300">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.stats || !data.profile) {
    return (
      <div className="text-center p-8 bg-slate-900/50 rounded-xl border border-white/10">
        <p className="text-gray-400">No data available for {username}</p>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12,
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)'
        }
      }
    }
  };

  const getPersonalityIcon = () => {
    switch(data.stats.developer_personality) {
      case "Night Owl": return <Moon className="text-purple-400" />;
      case "Weekend Warrior": return <Sun className="text-amber-400" />;
      default: return <Clock className="text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-[length:40px_40px] opacity-5"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
          <div className="relative group">
            <img 
              src={data.profile.avatar_url} 
              alt={username} 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full ring-2 ring-violet-500/80 group-hover:ring-4 transition-all duration-300"
            />
            <div className="absolute -bottom-2 -right-2 bg-violet-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center">
              <Star size={12} className="mr-1" /> {data.stats.stars}
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 text-transparent bg-clip-text">
              {data.profile.name || data.profile.username}
            </h2>
            {data.profile.bio && (
              <p className="text-gray-300 mt-2 max-w-lg text-sm md:text-base">{data.profile.bio}</p>
            )}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4 text-xs md:text-sm">
              {data.profile.location && (
                <span className="flex items-center text-gray-400">
                  <MapPin size={14} className="mr-1" />
                  {data.profile.location}
                </span>
              )}
              <span className="flex items-center text-gray-400">
                <Calendar size={14} className="mr-1" />
                Joined {new Date(data.profile.join_date).toLocaleDateString()}
              </span>
              <span className="flex items-center text-gray-400">
                <GitBranch size={14} className="mr-1" />
                {data.stats.repos} Repos
              </span>
              <span className="flex items-center text-gray-400">
                <Star size={14} className="mr-1" />
                {data.stats.stars} Stars
              </span>
              <span className="flex items-center text-gray-400">
                <Users size={14} className="mr-1" />
                {data.stats.followers} Followers
              </span>
              <span className="flex items-center text-gray-400">
                <UserPlus size={14} className="mr-1" />
                {data.stats.following} Following
              </span>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-3">
            <div className="text-gray-400 text-sm flex items-center space-x-1">
              {getPersonalityIcon()}
              <span>{data.stats.developer_personality}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ChartCard icon={<Zap size={20} />} title="Longest Streak" value={`${data.stats.longest_streak} days`} />
        <ChartCard icon={<Code size={20} />} title="Favorite Language" value={data.stats.favorite_language} />
        <ChartCard icon={<TrendingUp size={20} />} title="Total Stars" value={`${data.stats.stars}`} />
        <ChartCard icon={<BarChart2 size={20} />} title="Total Repos" value={`${data.stats.repos}`} />
      </div>

      {/* Charts & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Commits Bar Chart */}
        <div className="bg-slate-900/80 rounded-xl p-6">
          <h3 className="mb-4 font-semibold text-lg text-gray-200">Weekly Commits</h3>
          <div className="h-48">
            <Bar
              data={{
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                datasets: [
                  {
                    label: 'Commits',
                    data: data.stats.activity.weekly_commits,
                    backgroundColor: 'rgba(139, 92, 246, 0.7)',
                    borderRadius: 4,
                    maxBarThickness: 30,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Languages Pie Chart */}
        <div className="bg-slate-900/80 rounded-xl p-6">
          <h3 className="mb-4 font-semibold text-lg text-gray-200">Languages Used</h3>
          <div className="h-48">
            <Pie
              data={{
                labels: data.stats.languages.map((lang) => lang.name),
                datasets: [
                  {
                    data: data.stats.languages.map((lang) => lang.percentage),
                    backgroundColor: data.stats.languages.map((lang) => lang.color || '#888'),
                    borderWidth: 1,
                    borderColor: '#222',
                  },
                ],
              }}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    position: 'right',
                    labels: {
                      color: 'rgba(255, 255, 255, 0.8)',
                      font: { size: 12 },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Commit Time Distribution Bar Chart */}
        <div className="bg-slate-900/80 rounded-xl p-6">
          <h3 className="mb-4 font-semibold text-lg text-gray-200">Commit Time Distribution</h3>
          <div className="h-48">
            <Bar
              data={{
                labels: [
                  '12am', '1am', '2am', '3am', '4am', '5am', '6am',
                  '7am', '8am', '9am', '10am', '11am', '12pm', '1pm',
                  '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm',
                  '9pm', '10pm', '11pm',
                ],
                datasets: [
                  {
                    label: 'Commits',
                    data: data.stats.activity.commit_time_distribution,
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderRadius: 4,
                    maxBarThickness: 20,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Contribution Heatmap */}
        <div className="bg-slate-900/80 rounded-xl p-6 overflow-x-auto">
          <h3 className="mb-4 font-semibold text-lg text-gray-200">Contribution Heatmap</h3>
          <CalendarHeatmap
            startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
            endDate={new Date()}
            values={data.stats.activity.contribution_data}
            classForValue={(value: any) => {
              if (!value || value.count === 0) return 'color-empty';
              if (value.count < 3) return 'color-scale-1';
              if (value.count < 6) return 'color-scale-2';
              if (value.count < 9) return 'color-scale-3';
              return 'color-scale-4';
            }}
            tooltipDataAttrs={(value: any) => ({
              'data-tip': value
                ? `${value.date}: ${value.count} contributions`
                : 'No contributions',
            })}
            showWeekdayLabels={true}
          />
        </div>
      </div>
    </div>
  );
}

// Simple reusable card for stats with icon
function ChartCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="bg-slate-900/70 rounded-xl p-4 flex items-center space-x-4 border border-white/10">
      <div className="text-violet-400">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-white text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
} 