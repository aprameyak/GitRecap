import { useState, useEffect } from 'react';
import { getData } from "@/routes/route";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

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
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        <p className="mt-4 text-gray-400">Loading {username}'s data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900/50 backdrop-blur-sm rounded-xl border border-red-500/20 p-8">
        <div className="text-red-400 mb-4 text-center">
          <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.stats || !data.profile) {
    return (
      <div className="text-center p-8 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10">
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
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            size: 12,
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${username}'s GitRecap`,
          text: `Check out ${username}'s year in code!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Sharing failed:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10">
        <img 
          src={data.profile.avatar_url} 
          alt={username} 
          className="w-24 h-24 rounded-full ring-2 ring-violet-500"
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 text-transparent bg-clip-text">
            {data.profile.name || data.profile.username}
          </h2>
          {data.profile.bio && <p className="text-gray-400 mt-2">{data.profile.bio}</p>}
          {data.profile.location && (
            <p className="text-gray-400 flex items-center justify-center md:justify-start mt-1">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {data.profile.location}
            </p>
          )}
          <p className="text-gray-400 mb-6">Joined {new Date(data.profile.join_date).toLocaleDateString()}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Repositories', value: data.stats.repos },
              { label: 'Stars', value: data.stats.stars },
              { label: 'Followers', value: data.stats.followers },
              { label: 'Following', value: data.stats.following },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-white/5 hover:border-violet-500/30 transition-colors">
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Weekly Commits">
          <Bar 
            data={{
              labels: Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`),
              datasets: [{
                label: 'Commits',
                data: data.stats.activity.weekly_commits,
                backgroundColor: 'rgba(139, 92, 246, 0.5)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 1,
              }]
            }} 
            options={chartOptions} 
          />
        </ChartCard>

        <ChartCard title="Top Languages">
          <Pie 
            data={{
              labels: data.stats.languages.map(lang => lang.name),
              datasets: [{
                data: data.stats.languages.map(lang => lang.percentage),
                backgroundColor: data.stats.languages.map(lang => lang.color || '#6E40C9'),
                borderColor: data.stats.languages.map(lang => darkenColor(lang.color || '#6E40C9')),
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
                }
              }
            }} 
          />
        </ChartCard>

        <ChartCard title="When You Code">
          <Bar 
            data={{
              labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
              datasets: [{
                label: 'Commits',
                data: data.stats.activity.commit_time_distribution,
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
              }]
            }} 
            options={chartOptions} 
          />
        </ChartCard>

        <ChartCard title="Contribution Heatmap">
          <div className="h-[250px]">
            <CalendarHeatmap
              startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
              endDate={new Date()}
              values={data.stats.activity.contribution_data}
              classForValue={(value) => {
                if (!value || !value.count) return 'color-empty';
                const level = Math.min(4, Math.ceil(value.count / 3));
                return `color-scale-${level}`;
              }}
              showWeekdayLabels
              gutterSize={2}
              tooltipDataAttrs={(value: any) => ({
                'data-tooltip': value ? `${value.date}: ${value.count} commits` : 'No data'
              })}
            />
          </div>
        </ChartCard>
      </div>

      <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 p-6 rounded-lg border border-white/10">
        <h3 className="text-xl font-semibold mb-4 text-white">Developer Personality</h3>
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-2">{data.stats.developer_personality}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
              <p className="text-gray-400">Longest Streak</p>
              <p className="text-2xl font-bold text-white">{data.stats.longest_streak} days</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
              <p className="text-gray-400">Favorite Language</p>
              <p className="text-2xl font-bold text-white">{data.stats.favorite_language}</p>
            </div>
          </div>
          <p className="text-gray-300 mt-4">
            {data.stats.developer_personality === "Night Owl" 
              ? "You do most of your coding late at night!"
              : data.stats.developer_personality === "Weekend Warrior" 
              ? "You're most active on weekends!"
              : "You maintain consistent coding habits throughout the week."}
          </p>
        </div>
      </div>

      {data.sentiment && (
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-6 rounded-lg border border-white/10">
          <h3 className="text-xl font-semibold mb-4 text-white">Commit Sentiment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium mb-2">Sentiment Distribution</h4>
              <div className="flex items-center justify-between mb-1">
                <span>Positive</span>
                <span>{data.sentiment.positive} commits</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${(data.sentiment.positive / (data.sentiment.positive + data.sentiment.neutral + data.sentiment.negative)) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between mb-1 mt-3">
                <span>Neutral</span>
                <span>{data.sentiment.neutral} commits</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-yellow-500 h-2.5 rounded-full" 
                  style={{ width: `${(data.sentiment.neutral / (data.sentiment.positive + data.sentiment.neutral + data.sentiment.negative)) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between mb-1 mt-3">
                <span>Negative</span>
                <span>{data.sentiment.negative} commits</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-red-500 h-2.5 rounded-full" 
                  style={{ width: `${(data.sentiment.negative / (data.sentiment.positive + data.sentiment.neutral + data.sentiment.negative)) * 100}%` }}
                ></div>
              </div>

              <p className="mt-4">
                Average Polarity: <span className="font-semibold">{data.sentiment.average_polarity > 0 ? '😊' : data.sentiment.average_polarity < 0 ? '😞' : '😐'} {data.sentiment.average_polarity}</span>
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">Commit Types</h4>
              <div className="space-y-2">
                {Object.entries(data.sentiment.commit_types).map(([type, count]) => (
                  <div key={type} className="flex items-center">
                    <span className="w-24 capitalize">{type}</span>
                    <div className="flex-1 mx-2">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-purple-500 h-2.5 rounded-full" 
                          style={{ width: `${(count / Object.values(data.sentiment.commit_types).reduce((a, b) => a + b, 0)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {Object.keys(data.sentiment.common_words).length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-2">Common Commit Words</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.sentiment.common_words).map(([word, count]) => (
                  <span 
                    key={word} 
                    className="px-3 py-1 bg-slate-800/50 rounded-full text-sm"
                  >
                    {word} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

function darkenColor(hex: string, amount = 20): string {
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  
  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-white/10">
      <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
      <div className="h-[300px]">
        {children}
      </div>
    </div>
  );
}