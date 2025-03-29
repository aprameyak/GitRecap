import requests
from flask import Flask, jsonify
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from collections import defaultdict
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import base64
from io import BytesIO
from flask_cors import CORS

load_dotenv()
token = os.getenv('GITHUB_ACCESS_TOKEN')
headers = {'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'}
app = Flask(__name__)
CORS(app, resources={
    r"/analyze/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

def generate_heatmap(data):
    plt.switch_backend('Agg')
    fig, ax = plt.subplots(figsize=(12, 2))
    ax.imshow([data], cmap='Greens', aspect='auto', interpolation='nearest')
    ax.set_xticks(range(0, 52, 4))
    ax.set_xticklabels([f'W{i}' for i in range(0, 52, 4)])
    ax.set_yticks([])
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
    plt.close(fig)
    return base64.b64encode(buf.getvalue()).decode('utf-8')

@app.route('/analyze/<username>', methods=['GET'])
def analyze_github(username):
    try:
        user_data = requests.get(f'https://api.github.com/users/{username}', headers=headers, timeout=10).json()
        repos = []
        next_url = f'https://api.github.com/users/{username}/repos?per_page=100&sort=pushed'
        
        while next_url:
            response = requests.get(next_url, headers=headers, timeout=10)
            repos.extend(response.json())
            next_url = response.links.get('next', {}).get('url')

        now = datetime.now()
        one_year_ago = now - timedelta(days=365)
        commit_heatmap = [0]*52
        language_bytes = defaultdict(int)
        repo_types = {'personal': 0, 'forked': 0}
        days_active = set()

        for repo in repos[:10]:
            if repo['fork']:
                repo_types['forked'] += 1
            else:
                repo_types['personal'] += 1

            langs = requests.get(repo['languages_url'], headers=headers, timeout=10).json()
            for lang, bytes in langs.items():
                language_bytes[lang] += bytes

            commits = requests.get(f"{repo['url']}/commits?since={one_year_ago.isoformat()}&per_page=50", headers=headers, timeout=10).json()
            for commit in commits:
                if isinstance(commit, dict) and 'commit' in commit:
                    date = datetime.strptime(commit['commit']['author']['date'], '%Y-%m-%dT%H:%M:%SZ')
                    week_num = min(51, (date - one_year_ago).days // 7)
                    commit_heatmap[week_num] += 1
                    days_active.add(date.date())

        total_language_bytes = sum(language_bytes.values())
        top_languages = [{
            'name': lang,
            'percentage': round(bytes/total_language_bytes*100, 1)
        } for lang, bytes in sorted(language_bytes.items(), key=lambda x: -x[1])[:5]]

        current_streak = 0
        max_streak = 0
        today = datetime.now().date()
        for i in range(365):
            day = today - timedelta(days=i)
            if day in days_active:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0

        return jsonify({
            'profile': {
                'username': username,
                'avatar_url': user_data.get('avatar_url'),
                'join_date': user_data.get('created_at', '')[:10]
            },
            'stats': {
                'repos': len(repos),
                'stars': sum(repo.get('stargazers_count', 0) for repo in repos),
                'languages': top_languages,
                'activity': {
                    'weekly_commits': commit_heatmap,
                    'heatmap_image': generate_heatmap(commit_heatmap),
                    'streak': current_streak
                }
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)
