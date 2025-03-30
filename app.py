import os
from dotenv import load_dotenv
import requests
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from collections import defaultdict

load_dotenv()
token = os.getenv('GITHUB_ACCESS_TOKEN')
headers = {'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'}

app = Flask(__name__)
CORS(app, resources={r"/analyze/*": {"origins": ["http://localhost:3000"]}})

def get_all_pages(url):
    items = []
    while url:
        response = requests.get(url, headers=headers, timeout=15)
        items.extend(response.json())
        url = response.links.get('next', {}).get('url')
    return items

@app.route('/analyze/<username>', methods=['GET'])
def analyze_github(username):
    try:
        user_response = requests.get(f'https://api.github.com/users/{username}', headers=headers, timeout=10)
        if user_response.status_code != 200:
            return jsonify({'error': 'User not found'}), 404
        
        repos = get_all_pages(f'https://api.github.com/users/{username}/repos?per_page=100&sort=pushed')
        one_year_ago = datetime.now() - timedelta(days=365)
        language_bytes = defaultdict(int)
        days_active = set()
        weekly_commits = [0]*52
        commit_time_distribution = [0]*24
        date_count = defaultdict(int)

        for repo in repos:
            langs = requests.get(repo['languages_url'], headers=headers, timeout=10).json()
            for lang, bytes in langs.items():
                language_bytes[lang] += bytes

            commits = get_all_pages(f"{repo['url']}/commits?since={one_year_ago.isoformat()}&per_page=100")
            for commit in commits:
                if isinstance(commit, dict) and 'commit' in commit:
                    date = datetime.strptime(commit['commit']['author']['date'], '%Y-%m-%dT%H:%M:%SZ')
                    week_num = min(51, (date - one_year_ago).days // 7)
                    weekly_commits[week_num] += 1
                    days_active.add(date.date())
                    commit_time_distribution[date.hour] += 1
                    date_count[date.date().isoformat()] += 1

        contribution_data = [{'date': date, 'count': count} for date, count in date_count.items()]
        
        total_language_bytes = sum(language_bytes.values())
        top_languages = [{
            'name': lang,
            'percentage': round(bytes/total_language_bytes*100, 1)
        } for lang, bytes in sorted(language_bytes.items(), key=lambda x: -x[1])[:5]] if total_language_bytes > 0 else []

        current_streak = max_streak = 0
        today = datetime.now().date()
        for i in range(365):
            if (today - timedelta(days=i)) in days_active:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0

        total_commits = sum(commit_time_distribution)
        night_owl = total_commits > 0 and sum(commit_time_distribution[22:] + commit_time_distribution[:4]) > total_commits * 0.4
        weekend_warrior = len(days_active) > 0 and sum(1 for date in days_active if date.weekday() >= 5) > len(days_active) * 0.3

        return jsonify({
            'profile': {
                'username': username,
                'avatar_url': user_response.json().get('avatar_url'),
                'join_date': user_response.json().get('created_at', '')[:10]
            },
            'stats': {
                'repos': len(repos),
                'stars': sum(repo.get('stargazers_count', 0) for repo in repos),
                'languages': top_languages,
                'activity': {
                    'weekly_commits': weekly_commits,
                    'streak': max_streak,
                    'commit_time_distribution': commit_time_distribution,
                    'contribution_data': contribution_data,
                    'top_repos': [{'name': r['name'], 'stars': r.get('stargazers_count', 0)} for r in sorted(repos, key=lambda x: x.get('stargazers_count', 0), reverse=True)[:5]]
                },
                'developer_personality': "Night Owl" if night_owl else "Weekend Warrior" if weekend_warrior else "Consistent Contributor"
            }
        })

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'GitHub API error: {str(e)}'}), 502
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)
