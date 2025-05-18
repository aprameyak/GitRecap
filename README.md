# GitRecap

A dynamic analytics dashboard that visualizes GitHub user activity with interactive charts and detailed statistics. This application provides Spotify Wrapped-style insights into coding patterns, repository analytics, and contribution history.

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

#### Technology Stack
- Next.js 14
- React 18 with TypeScript
- TailwindCSS for styling
- Chart.js for data visualization
- React Calendar Heatmap
- Flask backend with GitHub API integration

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
