import { useState, useEffect } from 'react';
import { getData } from "@/routes/route";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
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
      setError(null);
      try {
        const result = await getData(username);
        if (!result?.stats) {
          throw new Error('No data received from server');
        }
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching data');
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
        <p className="text-gray-400">No data available for {username}</p>
      </div>
    );
  }

  // Process data with fallbacks
  const weeklyCommits = data.stats.activity?.weekly_commits || Array(52).fill(0);
  const languages = data.stats.languages || [];
  const commitTimeDistribution = data.stats.activity?.commit_time_distribution || Array(24).fill(0);
  const contributionData = data.stats.activity?.contribution_data || [];
  const developerPersonality = data.stats.developer_personality || "Consistent Contributor";

  // Chart data configurations
  const weeklyCommitsData = {
    labels: Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`),
    datasets: [{
      label: 'Commits',
      data: weeklyCommits,
      backgroundColor: 'rgba(139, 92, 246, 0.5)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 1,
    }]
  };

  const languageData = {
    labels: languages.slice(0, 5).map(lang => lang?.name || 'Unknown'),
    datasets: [{
      label: 'Language Usage',
      data: languages.slice(0, 5).map(lang => lang?.percentage || 0),
      backgroundColor: [
        'rgba(236, 72, 153, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(249, 115, 22, 0.8)',
      ],
      borderWidth: 1,
    }]
  };

  const commitTimeData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Commits',
      data: commitTimeDistribution,
      backgroundColor: 'rgba(16, 185, 129, 0.5)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.raw}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${username}'s GitHub Wrapped`,
          text: `Check out ${username}'s GitHub activity summary!`,
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
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-slate-900/50 rounded-xl border border-white/10">
        <img 
          src={data.profile.avatar_url} 
          alt={username} 
          className="w-24 h-24 rounded-full ring-2 ring-violet-500"
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 text-transparent bg-clip-text">
            {data.profile.username}
          </h2>
          <p className="text-gray-400 mb-6">Joined {data.profile.join_date}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Repositories', value: data.stats.repos },
              { label: 'Stars', value: data.stats.stars },
              { label: 'Streak', value: `${data.stats.activity.streak} days` },
              { label: 'Languages', value: languages.length },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Weekly Commits">
          <Bar data={weeklyCommitsData} options={chartOptions} />
        </ChartCard>
        
        <ChartCard title="Top Languages">
          <Pie data={languageData} options={chartOptions} />
        </ChartCard>
        
        <ChartCard title="When You Code">
          <Bar data={commitTimeData} options={chartOptions} />
        </ChartCard>
        
        <ChartCard title="Contribution Heatmap">
          <div className="h-full">
            {contributionData.length > 0 ? (
              <CalendarHeatmap
                startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                endDate={new Date()}
                values={contributionData}
                classForValue={(value) => {
                  if (!value?.count) return 'color-empty';
                  return `color-scale-${Math.min(4, value.count)}`;
                }}
                showWeekdayLabels
                gutterSize={2}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No contribution data available
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Highlights Section */}
      <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 p-6 rounded-lg border border-white/10">
        <h3 className="text-xl font-semibold mb-4 text-white">Year in Review</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              label: 'Most Used Language', 
              value: languages[0]?.name || 'N/A', 
              subtext: `${languages[0]?.percentage || 0}% of code` 
            },
            { 
              label: 'Longest Streak', 
              value: `${data.stats.activity.streak} days`, 
              subtext: 'of consistent coding' 
            },
            { 
              label: 'Developer Personality', 
              value: developerPersonality, 
              subtext: 'based on your commit patterns' 
            },
          ].map((item, i) => (
            <div key={i} className="bg-slate-800/50 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">{item.label}</p>
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-violet-400">{item.subtext}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Share Button */}
      <div className="flex justify-center">
        <button
          onClick={handleShare}
          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-3 px-8 rounded-lg hover:shadow-lg transition-all"
        >
          Share Your GitHub Wrapped
        </button>
      </div>

      <style jsx global>{`
        .react-calendar-heatmap .color-empty { 
          fill: rgba(255, 255, 255, 0.05); 
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
          font-size: 6px; 
        }
      `}</style>
    </div>
  );
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
