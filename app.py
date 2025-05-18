import os
from dotenv import load_dotenv
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
from collections import defaultdict
from textblob import TextBlob
import time
from functools import wraps
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import re

load_dotenv()
token = os.getenv('GITHUB_ACCESS_TOKEN')

if not token:
    raise ValueError("No GITHUB_ACCESS_TOKEN found in .env file")

headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3+json'
}

app = Flask(__name__)
CORS(app)

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

def sanitize_username(username):
    if not username:
        return None
    username = username.strip()
    if not re.match(r'^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$', username):
        return None
    return username

def debug_request(response):
    print(f"Request to {response.url}")
    print(f"Status: {response.status_code}")
    print(f"Rate limit: {response.headers.get('X-RateLimit-Remaining')}/{response.headers.get('X-RateLimit-Limit')}")
    if response.status_code != 200:
        print(f"Error response: {response.text[:200]}")

def get_all_pages(url):
    items = []
    while url:
        try:
            response = requests.get(url, headers=headers, timeout=15)
            debug_request(response)
            
            if response.status_code == 403 and 'rate limit exceeded' in response.text.lower():
                reset_time = int(response.headers.get('X-RateLimit-Reset', 0))
                wait_time = max(reset_time - time.time(), 0)
                if wait_time > 0:
                    time.sleep(wait_time)
                    continue
                else:
                    break
                    
            if response.status_code != 200:
                break
                
            items.extend(response.json())
            url = response.links.get('next', {}).get('url')
            remaining = int(response.headers.get('X-RateLimit-Remaining', 0))
            if remaining < 10:
                time.sleep(2)
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")
            break
    return items

def get_language_color(language):
    colors = {
        'Python': '#3572A5', 'JavaScript': '#F1E05A', 'TypeScript': '#3178C6',
        'Java': '#B07219', 'C++': '#F34B7D', 'Go': '#00ADD8',
        'Ruby': '#701516', 'Swift': '#FFAC45', 'Kotlin': '#A97BFF',
        'HTML': '#E34C26', 'CSS': '#563D7C', 'Jupyter Notebook': '#DA5B0B',
        'Shell': '#89E051', 'PHP': '#4F5D95', 'Rust': '#DEA584',
        'SCSS': '#C6538C', 'Dart': '#00B4AB', 'Elixir': '#6E4A7E',
        'Vue': '#41B883', 'R': '#198CE7', 'MATLAB': '#E16737'
    }
    return colors.get(language, '#6E40C9')

def normalize_language_percentages(languages):
    if not languages:
        return []
    
    total = sum(lang['count'] for lang in languages)
    if total == 0:
        return []
    
    normalized = []
    remaining = 100.0
    for i, lang in enumerate(languages):
        if i == len(languages) - 1:
            normalized.append({**lang, 'percentage': round(remaining, 1)})
        else:
            percentage = round((lang['count'] / total) * 100, 1)
            remaining -= percentage
            normalized.append({**lang, 'percentage': percentage})
    
    return normalized

def get_weekly_commits(commits, one_year_ago):
    weekly_commits = [0] * 52
    for commit in commits:
        if isinstance(commit, dict) and 'commit' in commit:
            try:
                date = datetime.strptime(commit['commit']['author']['date'], '%Y-%m-%dT%H:%M:%SZ')
                days_since = (date - one_year_ago).days
                if 0 <= days_since < 365:
                    week_num = days_since // 7
                    if week_num < 52:
                        weekly_commits[week_num] += 1
            except (ValueError, KeyError):
                continue
    return weekly_commits

def analyze_commit_sentiment(commits):
    messages = [c['commit']['message'] for c in commits if isinstance(c, dict) and 'commit' in c]
    if not messages:
        return None
        
    analysis = {
        'positive': 0,
        'neutral': 0,
        'negative': 0,
        'average_polarity': 0,
        'common_words': {},
        'commit_types': {
            'feature': 0,
            'bugfix': 0,
            'refactor': 0,
            'docs': 0,
            'chore': 0,
            'other': 0
        }
    }
    
    word_counts = defaultdict(int)
    stop_words = {"the", "and", "a", "an", "in", "on", "at", "to", "of", "for"}

    for message in messages:
        try:
            blob = TextBlob(message)
            polarity = blob.sentiment.polarity
            analysis['average_polarity'] += polarity
            
            if polarity > 0.2:
                analysis['positive'] += 1
            elif polarity < -0.2:
                analysis['negative'] += 1
            else:
                analysis['neutral'] += 1

            msg_lower = message.lower()
            if any(word in msg_lower for word in ['fix', 'bug', 'error', 'issue']):
                analysis['commit_types']['bugfix'] += 1
            elif any(word in msg_lower for word in ['add', 'implement', 'feature', 'feat']):
                analysis['commit_types']['feature'] += 1
            elif any(word in msg_lower for word in ['refactor', 'clean', 'optimize', 'improve']):
                analysis['commit_types']['refactor'] += 1
            elif any(word in msg_lower for word in ['doc', 'readme', 'comment', 'wiki']):
                analysis['commit_types']['docs'] += 1
            elif any(word in msg_lower for word in ['chore', 'update', 'bump', 'merge']):
                analysis['commit_types']['chore'] += 1
            else:
                analysis['commit_types']['other'] += 1

            for word in blob.words.lower().split():
                if (word not in stop_words and len(word) > 3 and word.isalpha()):
                    word_counts[word] += 1

        except Exception:
            continue

    analysis['average_polarity'] = round(analysis['average_polarity'] / len(messages), 2)
    analysis['common_words'] = dict(sorted(word_counts.items(), key=lambda x: -x[1])[:10])
    return analysis

@app.route('/analyze/<username>', methods=['GET'])
@limiter.limit("30 per minute")
def analyze_github(username):
    try:
        username = sanitize_username(username)
        if not username:
            return jsonify({'error': 'Invalid username format'}), 400

        try:
            api_status = requests.get('https://api.github.com', headers=headers, timeout=5)
            if api_status.status_code != 200:
                return jsonify({'error': 'GitHub API unavailable'}), 502
        except requests.exceptions.RequestException:
            return jsonify({'error': 'GitHub API unavailable'}), 502

        try:
            user_response = requests.get(f'https://api.github.com/users/{username}', headers=headers, timeout=10)
            if user_response.status_code == 404:
                return jsonify({'error': 'User not found'}), 404
            if user_response.status_code == 403:
                return jsonify({'error': 'GitHub API rate limit exceeded'}), 429
            if user_response.status_code != 200:
                return jsonify({'error': 'GitHub API error'}), user_response.status_code
        except requests.exceptions.RequestException:
            return jsonify({'error': 'Failed to fetch user data'}), 502

        user_data = user_response.json()
        repos = get_all_pages(f'https://api.github.com/users/{username}/repos?per_page=100&sort=pushed')
        if not repos:
            return jsonify({'error': 'No public repositories found'}), 404

        one_year_ago = datetime.now() - timedelta(days=365)
        language_counts = defaultdict(int)
        days_active = set()
        commit_time_distribution = [0] * 24
        date_count = defaultdict(int)
        all_commits = []

        for repo in repos[:20]:
            if not repo.get('fork', False):
                try:
                    langs_response = requests.get(repo['languages_url'], headers=headers, timeout=10)
                    if langs_response.status_code == 200:
                        repo_langs = langs_response.json()
                        if repo_langs:
                            primary_lang = max(repo_langs.items(), key=lambda x: x[1])[0]
                            language_counts[primary_lang] += 1
                except requests.exceptions.RequestException:
                    continue

            try:
                commits_url = f"{repo['url']}/commits?since={one_year_ago.isoformat()}&author={username}&per_page=100"
                commits = get_all_pages(commits_url)
                all_commits.extend(commits)

                for commit in commits:
                    if isinstance(commit, dict) and 'commit' in commit:
                        try:
                            date = datetime.strptime(commit['commit']['author']['date'], '%Y-%m-%dT%H:%M:%SZ')
                            days_active.add(date.date())
                            commit_time_distribution[date.hour] += 1
                            date_count[date.date().isoformat()] += 1
                        except (ValueError, KeyError):
                            continue
            except requests.exceptions.RequestException:
                continue

        weekly_commits = get_weekly_commits(all_commits, one_year_ago)
        
        top_languages = []
        if language_counts:
            top_languages = sorted([
                {
                    'name': lang,
                    'count': count,
                    'color': get_language_color(lang)
                }
                for lang, count in language_counts.items()
            ], key=lambda x: -x['count'])
            
            top_languages = normalize_language_percentages(top_languages)

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

        top_repos = sorted(
            [repo for repo in repos if not repo.get('fork', False)],
            key=lambda x: x.get('stargazers_count', 0),
            reverse=True
        )[:5]

        favorite_language = top_languages[0]['name'] if top_languages else "None"
        sentiment = analyze_commit_sentiment(all_commits)

        response_data = {
            'profile': {
                'username': username,
                'avatar_url': user_data.get('avatar_url'),
                'join_date': user_data.get('created_at', '')[:10],
                'name': user_data.get('name'),
                'bio': user_data.get('bio'),
                'location': user_data.get('location')
            },
            'stats': {
                'repos': len([repo for repo in repos if not repo.get('fork', False)]),
                'stars': sum(repo.get('stargazers_count', 0) for repo in repos),
                'followers': user_data.get('followers', 0),
                'following': user_data.get('following', 0),
                'languages': top_languages,
                'activity': {
                    'weekly_commits': weekly_commits,
                    'streak': max_streak,
                    'commit_time_distribution': commit_time_distribution,
                    'contribution_data': [{'date': d, 'count': c} for d, c in date_count.items()],
                    'top_repos': [{
                        'name': repo['name'],
                        'stars': repo.get('stargazers_count', 0),
                        'description': repo.get('description', ''),
                        'url': repo['html_url']
                    } for repo in top_repos]
                },
                'developer_personality': developer_personality,
                'longest_streak': max_streak,
                'favorite_language': favorite_language
            }
        }

        if sentiment:
            response_data['sentiment'] = sentiment

        return jsonify(response_data)

    except requests.exceptions.RequestException as e:
        print(f"Network error: {str(e)}")
        return jsonify({'error': 'Network error'}), 502
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)