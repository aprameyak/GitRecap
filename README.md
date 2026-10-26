# GitRecap

GitRecap is a "Spotify Wrapped" for GitHub profiles. Enter a username and it pulls public data from the GitHub API and shows commit patterns, languages, streaks, top repositories, and a short developer profile.

Built at HooHacks 2025. Live site: https://gitrecap.vercel.app

## Usage

Open the live site, type a GitHub username, and the recap renders in the browser. The same data is available from the Flask API:

```bash
curl http://localhost:5000/analyze/octocat
```

The JSON response has a `profile` object (avatar, name, bio, join date) and a `stats` object with repo, star, and follower counts, `languages`, `activity` (weekly commits, streaks, commit hours, contribution data, top repos), `developer_personality`, and `insights`. A `sentiment` object is included when commit messages were found. Pass `?token=<github-token>` to use your own GitHub rate limit.

## Features

- Profile summary: repos, stars, forks, followers, longest and current commit streak, favorite language
- Contribution heatmap (react-calendar-heatmap) and weekly commit and language charts (Chart.js)
- Commit time distribution, most active hour, and a label such as "Night Owl" or "Weekend Warrior"
- Commit message analysis with TextBlob (positive/neutral/negative counts) and commit type counts (feature, bugfix, refactor, docs)
- Quick-search list of well-known GitHub users and a recent searches list stored in the browser
- Per-IP rate limiting on the API with Flask-Limiter

## Tech stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Chart.js
- Backend: Python 3.11, Flask, Flask-Limiter, TextBlob, Waitress
- Data source: GitHub REST API

## Getting started

Prerequisites: Node.js 20 and Python 3.11.

### Backend (Flask API)

```bash
pip install -r requirements.txt
python app.py
```

The API listens on `PORT` (default 5000). Set `FLASK_ENV=production` to serve with Waitress instead of the Flask dev server. In production it runs with `waitress-serve --port=$PORT app:app` (see `Procfile`).

### Frontend

The root Next.js app (`app/`) and the newer one in `webapp/` both read the backend URL from `NEXT_PUBLIC_BACKEND_URL`. If it is unset, the root app falls back to `http://localhost:5001` and `webapp/` falls back to `http://localhost:5000`, so set it to match your backend port.

```bash
# root app
npm install
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000 npm run dev

# or the webapp/ version
cd webapp
npm install
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000 npm run dev
```

Other environment variables used by `webapp/`: `NEXT_PUBLIC_GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` for GitHub OAuth. There is no `.env.example` in the repo. In `webapp/`, submitting the search form while signed out redirects to GitHub login, but the code-for-token exchange in `webapp/app/auth/callback/page.tsx` runs in the browser, where the non-public client secret is not available, so treat that login flow as unfinished. The quick-search buttons and the root app do not require login and use GitHub's anonymous rate limit.

There are no automated tests. CI (`.github/workflows/ci.yml`) runs `npm ci` and `npm run build` for the root app and for `webapp/`.

## How it works

- `app.py` is the Flask API. `GET /analyze/<username>` fetches the user's profile, repos, and recent commits from the GitHub API (optionally with a `token` query parameter), then computes streaks, language percentages, weekly commits, commit hours, commit sentiment, and derived scores. `GET /trending` returns a fixed list of suggested users and `GET /stats` describes the API.
- `app/page.tsx` and `app/components/Display.tsx` are the original Next.js frontend, which calls the API and renders the charts.
- `webapp/` is a second copy of the frontend with Vercel Analytics and a GitHub login step added before searching.
- `vercel.json` rewrites `/api/*` to the backend hosted at `https://gitrecap.onrender.com`.

## Project structure

```
app.py              Flask API
requirements.txt    Python dependencies
Procfile            Waitress start command for hosting
app/                Next.js frontend (root package.json)
webapp/             Next.js frontend with analytics and OAuth (own package.json)
vercel.json         /api rewrite to the hosted backend
```

## Contributing

Issues and pull requests are welcome. Before opening a PR, run `npm run build` in the root and in `webapp/` (the same checks CI runs) and make sure `python app.py` starts.

## License

MIT, see [LICENSE](LICENSE).
