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
        if response.status_code != 200:
            break
        items.extend(response.json())
        url = response.links.get('next', {}).get('url')
    return items

def get_language_color(language):
    colors = {
        'Python': '#3572A5',
        'JavaScript': '#F1E05A',
        'TypeScript': '#3178C6',
        'Java': '#B07219',
        'C++': '#F34B7D',
        'C': '#555555',
        'Go': '#00ADD8',
        'Ruby': '#701516',
        'Swift': '#FFAC45',
        'Kotlin': '#A97BFF',
        'HTML': '#E34C26',
        'CSS': '#563D7C',
        'Jupyter Notebook': '#DA5B0B',
        'Shell': '#89E051',
        'PHP': '#4F5D95',
        'Rust': '#DEA584',
        'SCSS': '#C6538C',
        'Dart': '#00B4AB',
        'Elixir': '#6E4A7E',
        'Clojure': '#DB5855',
        'Groovy': '#4298B8',
        'TeX': '#3D6117'
    }
    return colors.get(language, '#6E40C9')

@app.route('/analyze/<username>', methods=['GET'])
def analyze_github(username):
    try:
        user_response = requests.get(f'https://api.github.com/users/{username}', headers=headers, timeout=10)
        if user_response.status_code != 200:
            return jsonify({'error': 'User not found'}), 404
        user_data = user_response.json()

        repos = get_all_pages(f'https://api.github.com/users/{username}/repos?per_page=100&sort=pushed')
        
        one_year_ago = datetime.now() - timedelta(days=365)
        language_bytes = defaultdict(int)
        days_active = set()
        weekly_commits = [0]*52
        commit_time_distribution = [0]*24
        date_count = defaultdict(int)

        for repo in repos:
            langs_response = requests.get(repo['languages_url'], headers=headers, timeout=10)
            if langs_response.status_code == 200:
                for lang, bytes in langs_response.json().items():
                    language_bytes[lang] += bytes

            commits = get_all_pages(f"{repo['url']}/commits?since={one_year_ago.isoformat()}&per_page=100")
            for commit in commits:
                if isinstance(commit, dict) and 'commit' in commit:
                    try:
                        date = datetime.strptime(commit['commit']['author']['date'], '%Y-%m-%dT%H:%M:%SZ')
                        week_num = min(51, (date - one_year_ago).days // 7)
                        weekly_commits[week_num] += 1
                        days_active.add(date.date())
                        commit_time_distribution[date.hour] += 1
                        date_count[date.date().isoformat()] += 1
                    except (ValueError, KeyError):
                        continue

        contribution_data = [{'date': date, 'count': count} for date, count in date_count.items()]
        total_language_bytes = sum(language_bytes.values())
        
        top_languages = []
        if total_language_bytes > 0:
            top_languages = [
                {
                    'name': lang,
                    'percentage': round(bytes/total_language_bytes*100, 1),
                    'color': get_language_color(lang)
                } 
                for lang, bytes in sorted(language_bytes.items(), key=lambda x: -x[1])[:5]
            ]

        current_streak = max_streak = 0
        today = datetime.now().date()
        for i in range(365):
            day = today - timedelta(days=i)
            if day in days_active:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0

        total_commits = sum(commit_time_distribution)
        night_owl = total_commits > 0 and sum(commit_time_distribution[22:] + commit_time_distribution[:4]) > total_commits * 0.4
        weekend_warrior = len(days_active) > 0 and sum(1 for date in days_active if date.weekday() >= 5) > len(days_active) * 0.3
        developer_personality = "Night Owl" if night_owl else "Weekend Warrior" if weekend_warrior else "Consistent Contributor"

        top_repos = sorted(repos, key=lambda x: x.get('stargazers_count', 0), reverse=True)[:5]
        favorite_language = top_languages[0]['name'] if top_languages else "None"

        return jsonify({
            'profile': {
                'username': username,
                'avatar_url': user_data.get('avatar_url'),
                'join_date': user_data.get('created_at', '')[:10],
                'name': user_data.get('name'),
                'bio': user_data.get('bio'),
                'location': user_data.get('location')
            },
            'stats': {
                'repos': len(repos),
                'stars': sum(repo.get('stargazers_count', 0) for repo in repos),
                'followers': user_data.get('followers', 0),
                'following': user_data.get('following', 0),
                'languages': top_languages,
                'activity': {
                    'weekly_commits': weekly_commits,
                    'streak': max_streak,
                    'commit_time_distribution': commit_time_distribution,
                    'contribution_data': contribution_data,
                    'top_repos': [{
                        'name': repo['name'], 
                        'stars': repo.get('stargazers_count', 0),
                        'description': repo.get('description')
                    } for repo in top_repos]
                },
                'developer_personality': developer_personality,
                'longest_streak': max_streak,
                'favorite_language': favorite_language
            }
        })

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'GitHub API error: {str(e)}'}), 502
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)