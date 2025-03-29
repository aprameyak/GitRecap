"use client"
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

export default function Display({ username }: DisplayProps) {
    const [data, setData] = useState<any>(null);
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

    if (!data) return null;

    const weeklyCommits = Object.values(data.stats.activity.weekly_commits);
    const languages = data.stats.languages;
    const topLanguages = languages.slice(0, 5);

    const weeklyCommitsData = {
        labels: Array.from({ length: 52 }, (_, i) => `Week ${i}`),
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
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
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
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Weekly Commits',
            },
        },
    };

    const languageOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Language Usage',
            },
        },
    };

    return (
        <div>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error}</div>}
            {data && (
                <div>
                    <h2>GitHub Wrapped for {username}</h2>
                    <div style={{ width: '800px', height: '400px' }}>
                        <Bar options={weeklyCommitsOptions} data={weeklyCommitsData} />
                    </div>
                    <div style={{ width: '400px', height: '400px' }}>
                        <Pie options={languageOptions} data={languageData} />
                    </div>
                    <p><strong>Profile Summary:</strong></p>
                    <ul>
                        <li><strong>Username:</strong> {data.profile.username}</li>
                        <li><strong>Avatar URL:</strong> <img src={data.profile.avatar_url} alt="Avatar" width="50" height="50" /></li>
                        <li><strong>Join Date:</strong> {data.profile.join_date}</li>
                        <li><strong>Repositories:</strong> {data.stats.repos}</li>
                        <li><strong>Stars:</strong> {data.stats.stars}</li>
                        <li><strong>Longest Streak:</strong> {data.stats.activity.streak} days</li>
                    </ul>
                    <button onClick={() => {
                        console.log('Share report');
                    }}>
                        Share Report
                    </button>
                </div>
            )}
        </div>
    );
}
