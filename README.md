# GitRecap

![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white&style=for-the-badge)
![Flask](https://img.shields.io/badge/Flask-000000?logo=flask&logoColor=white&style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white&style=for-the-badge)
![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white&style=for-the-badge)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chart.js&logoColor=white&style=for-the-badge)

## About

**GitRecap** is a dynamic analytics dashboard that visualizes GitHub user activity with interactive charts and detailed statistics. This application provides Spotify Wrapped-style insights into coding patterns, repository analytics, and contribution history.

## Features

- **Profile Analytics**: View GitHub profile info including avatar, join date, stars, and repo/follower counts  
- **Weekly Commit Patterns**: Visualize weekly commit trends over the past year  
- **Language Distribution**: Breakdown of programming languages used, with percentages  
- **Commit Time Distribution**: Displays most active commit hours during the day  
- **Top Repositories**: Lists repositories sorted by star count  
- **Contribution Calendar**: Heatmap of contribution activity  
- **Developer Personality**: Classifies coding patterns as Night Owl, Weekend Warrior, or Consistent Contributor

## Technology Stack

- **Backend**: Flask (Python), GitHub API, TextBlob  
- **Frontend**: Next.js, React.js, Chart.js  
- **Data Visualization**: Chart.js, React Calendar Heatmap  
- **Styling**: TailwindCSS

## 🌟 Core Features

### Profile Analytics
- User profile overview with avatar and join date
- Repository count and total stars
- Follower and following statistics
- Bio and location display
- Developer personality classification (Night Owl, Weekend Warrior, or Consistent Contributor)

### Activity Visualization
- Weekly commit patterns over the past year
- Language distribution with percentage breakdown
- Commit time distribution (24-hour activity pattern)
- Top repositories by stars
- Contribution calendar heatmap
- Commit sentiment analysis

### Interactive Features
- Responsive charts and graphs
- Loading states with animations
- Error handling with user-friendly messages
- Mobile-responsive design
- Real-time GitHub API integration

## 🛠️ Technical Implementation

#### Key Features
- Real-time GitHub data fetching
- Rate limit handling
- Error recovery
- Responsive design
- Performance optimized

## 🚀 Getting Started

1. Clone the repository
2. Set up environment variables:
   ```
   GITHUB_ACCESS_TOKEN=your_github_token
   ```
3. Install dependencies:
   ```bash
   # Backend
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```
4. Run the application:
   ```bash
   # Backend (from root)
   python app.py
   
   # Frontend (from frontend directory)
   npm run dev
   ```

## 📝 Notes
- Requires a GitHub Personal Access Token
- Rate limited by GitHub API
- Optimized for modern browsers
