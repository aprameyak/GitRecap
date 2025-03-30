"use client";
import { useState, useEffect } from 'react';
import { getData, getPredictionData } from "@/routes/route";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
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

interface PredictionData{
  predictions: number;
  username: string;
}

export default function Display({ username }: DisplayProps) {
  const [data, setData] = useState<GitHubData | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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

        const predictionResult = await getPredictionData(username);
        console.log('Prediction Data: ', predictionResult);
        if (predictionResult) {
          setPredictionData(predictionResult)
        }
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
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Repos', value: data.stats.repos, icon: <GitBranch size={16} /> },
          { label: 'Stars', value: data.stats.stars, icon: <Star size={16} /> },
          { label: 'Followers', value: data.stats.followers, icon: <Users size={16} /> },
          { label: 'Following', value: data.stats.following, icon: <UserPlus size={16} /> }
        ].map((stat, i) => (
          <div 
            key={i} 
            className="bg-slate-800/50 p-3 md:p-4 rounded-lg border border-white/5 hover:border-violet-500/30 transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-center gap-2 text-gray-400">
              <div className="p-1 bg-slate-700/50 rounded group-hover:bg-violet-500/20 transition-colors">
                {stat.icon}
              </div>
              <p className="text-xs md:text-sm">{stat.label}</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ChartCard 
          title="Weekly Commits" 
          icon={<TrendingUp size={16} />}
          tooltip="Your commit activity over the past year"
        >
          <Bar 
            data={{
              labels: Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`),
              datasets: [{
                label: 'Commits',
                data: data.stats.activity.weekly_commits,
                backgroundColor: 'rgba(139, 92, 246, 0.5)',
                borderColor: 'rgba(139, 92, 246, 0.8)',
                borderWidth: 1,
                borderRadius: 4,
              }]
            }} 
            options={chartOptions} 
          />
        </ChartCard>

        <ChartCard 
          title="Top Languages" 
          icon={<Code size={16} />}
          tooltip="Your most used programming languages"
        >
          <Pie 
            data={{
              labels: data.stats.languages.map(lang => lang.name),
              datasets: [{
                data: data.stats.languages.map(lang => lang.percentage),
                backgroundColor: data.stats.languages.map(lang => lang.color || '#6E40C9'),
                borderColor: data.stats.languages.map(lang => darkenColor(lang.color || '#6E40C9', 30)),
                borderWidth: 1
              }]
            }} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  ...chartOptions.plugins.legend,
                  position: 'right',
                  labels: {
                    ...chartOptions.plugins.legend.labels,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 16
                  }
                }
              }
            }} 
          />
        </ChartCard>

        <ChartCard 
          title="Coding Hours" 
          icon={<Clock size={16} />}
          tooltip="When you make most of your commits"
        >
          <Bar 
            data={{
              labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
              datasets: [{
                label: 'Commits',
                data: data.stats.activity.commit_time_distribution,
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgba(16, 185, 129, 0.8)',
                borderWidth: 1,
                borderRadius: 4,
              }]
            }} 
            options={chartOptions} 
          />
        </ChartCard>

        <ChartCard 
          title="Contribution Heatmap" 
          icon={<Zap size={16} />}
          tooltip="Your daily commit activity over the past year"
        >
          <div className="h-[220px] md:h-[250px] -mx-2">
            <CalendarHeatmap
              startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
              endDate={new Date()}
              values={data.stats.activity.contribution_data}
              classForValue={(value) => {
                if (!value || !value.count) return 'color-empty';
                const level = Math.min(4, Math.ceil(value.count / 3));
                return `color-scale-${level} rounded-sm`;
              }}
              showWeekdayLabels
              gutterSize={3}
              tooltipDataAttrs={(value: any) => ({
                'data-tooltip': value ? `${value.date}: ${value.count} commit${value.count !== 1 ? 's' : ''}` : 'No data'
              })}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400 px-2">
            <span>Less</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div 
                  key={level}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: `rgba(139, 92, 246, ${0.2 + level * 0.2})`
                  }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </ChartCard>
      </div>

      {/* Personality Card */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-white/10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-1">Coding Personality</h3>
            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text">
              {data.stats.developer_personality}
            </p>
          </div>
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            {getPersonalityIcon()}
          </div>
        </div>
        
        <p className="text-gray-300 mt-3">
          {data.stats.developer_personality === "Night Owl" 
            ? "🌙 You do your best work when the moon is out" 
            : data.stats.developer_personality === "Weekend Warrior" 
            ? "🏆 Weekends are your time to shine" 
            : "⏱️ Consistency is your superpower"}
        </p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/5 p-4 rounded-lg border border-white/5">
            <p className="text-sm text-gray-400">Longest Streak</p>
            <p className="text-xl md:text-2xl font-bold text-white">{data.stats.longest_streak} days</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg border border-white/5">
            <p className="text-sm text-gray-400">Favorite Language</p>
            <p className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              {data.stats.favorite_language}
              <span 
                className="w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: data.stats.languages.find(l => l.name === data.stats.favorite_language)?.color || '#6E40C9'
                }}
              />
            </p>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis */}
      {data.sentiment && (
        <div className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-white">Commit Sentiment</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              data.sentiment.average_polarity > 0.1 
                ? 'bg-green-500/20 text-green-400' 
                : data.sentiment.average_polarity < -0.1 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {data.sentiment.average_polarity > 0.1 ? 'Positive' : 
               data.sentiment.average_polarity < -0.1 ? 'Negative' : 'Neutral'} Mood
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-white/90">Sentiment Breakdown</h4>
              <div className="space-y-3">
                {[
                  { type: 'Positive', value: data.sentiment.positive, color: 'bg-green-500' },
                  { type: 'Neutral', value: data.sentiment.neutral, color: 'bg-yellow-500' },
                  { type: 'Negative', value: data.sentiment.negative, color: 'bg-red-500' }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.type}</span>
                      <span>{item.value} commits</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full`}
                        style={{ 
                          width: `${(item.value / (data.sentiment.positive + data.sentiment.neutral + data.sentiment.negative)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white/90">Commit Types</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(data.sentiment.commit_types).map(([type, count]) => (
                  <div 
                    key={type} 
                    className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors"
                  >
                    <p className="text-sm capitalize text-white/80">{type}</p>
                    <p className="text-xl font-bold">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            {predictionData?.predictions !== undefined && (
              <div className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 p-6 rounded-xl border border-white/10 mt-6">
                <h3 className="text-lg md:text-xl font-semibold text-white">Prediction Data</h3>
                <div className="mt-4">
                  <p className="text-gray-300">
                    Predicted commits in the next year: {predictionData.predictions}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        .react-calendar-heatmap .color-empty {
          fill: #2d374850;
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: rgba(139, 92, 246, 0.3);
        }
        .react-calendar-heatmap .color-scale-2 {
          fill: rgba(139, 92, 246, 0.5);
        }
        .react-calendar-heatmap .color-scale-3 {
          fill: rgba(139, 92, 246, 0.7);
        }
        .react-calendar-heatmap .color-scale-4 {
          fill: rgba(139, 92, 246, 0.9);
        }
        .react-calendar-heatmap text {
          fill: rgba(255, 255, 255, 0.7);
          font-size: 8px;
        }
      `}</style>
    </div>
  );
}

function ChartCard({ 
  title, 
  children, 
  icon,
  tooltip 
}: { 
  title: string; 
  children: React.ReactNode;
  icon?: React.ReactNode;
  tooltip?: string;
}) {
  return (
    <div className="bg-slate-900/50 p-4 md:p-5 rounded-xl border border-white/10 hover:shadow-lg hover:shadow-violet-500/10 transition-all">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
          {icon && (
            <span className="bg-violet-500/10 p-1 rounded-lg">
              {icon}
            </span>
          )}
          {title}
        </h3>
        {tooltip && (
          <div className="group relative">
            <button className="text-gray-400 hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </button>
            <div className="absolute z-10 hidden group-hover:block w-48 bg-slate-800 text-sm text-gray-300 p-2 rounded-md shadow-lg right-0">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="h-[250px] md:h-[280px]">
        {children}
      </div>
    </div>
  );
}

function darkenColor(hex: string, amount = 20): string {
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  
  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
