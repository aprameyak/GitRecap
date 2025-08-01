# GitRecap 🚀

**Discover your GitHub coding patterns with Spotify Wrapped-style analytics**

GitRecap is a powerful GitHub analytics platform that provides deep insights into developer activity patterns, coding habits, and repository analysis. Think of it as "Spotify Wrapped" for your GitHub profile!

## ✨ Features

### 🎯 **Core Analytics**
- **Repository Analysis**: Deep insights into your projects, languages, and collaboration patterns
- **Commit Patterns**: Visualize your coding activity with heatmaps and time distribution
- **Developer Personality**: Discover if you're a Night Owl, Early Bird, or Weekend Warrior
- **Productivity Metrics**: Track your consistency, streaks, and activity levels

### 📊 **Advanced Insights**
- **Language Preferences**: See your most used programming languages with color coding
- **Activity Heatmaps**: GitHub-style contribution graphs with detailed analytics
- **Collaboration Score**: Measure your open-source contribution level
- **Project Focus**: Identify if you're focused on personal, professional, or open-source projects
- **Experience Level**: Get insights into your development journey

### 🎨 **User Experience**
- **Trending Developers**: Discover popular GitHub users to analyze
- **Recent Searches**: Quick access to previously analyzed profiles
- **Real-time Analytics**: Instant insights with beautiful visualizations
- **Mobile Responsive**: Works perfectly on all devices

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- GitHub Personal Access Token (optional but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/GitRecap.git
   cd GitRecap
   ```

2. **Set up the backend**
   ```bash
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   echo "GITHUB_ACCESS_TOKEN=your_github_token_here" > .env
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Run the application**
   ```bash
   # Terminal 1: Start backend
   cd .. && source venv/bin/activate
   python3 app.py
   
   # Terminal 2: Start frontend
   cd frontend && npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` and start analyzing!

## 🔧 Configuration

### GitHub Token Setup
For better performance and higher rate limits:

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with `public_repo` scope
3. Add it to your `.env` file:
   ```
   GITHUB_ACCESS_TOKEN=ghp_your_token_here
   ```

### Environment Variables
```bash
# Backend (.env)
GITHUB_ACCESS_TOKEN=your_token_here
FLASK_ENV=development
PORT=5001

# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

## 📈 What You'll Discover

### **Developer Personality Types**
- **Night Owl**: Most active between 10 PM - 4 AM
- **Early Bird**: Most active between 6 AM - 10 AM  
- **Day Developer**: Most active during business hours
- **Weekend Warrior**: Primarily active on weekends
- **Consistent Contributor**: Regular activity throughout the week

### **Project Focus Categories**
- **Open Source**: High star count and community engagement
- **Personal Projects**: Many repositories with moderate activity
- **Professional**: Focused on work-related repositories

### **Experience Levels**
- **Beginner**: 1-5 repositories
- **Intermediate**: 6-20 repositories
- **Experienced**: 21-50 repositories
- **Veteran**: 50+ repositories

## 🎯 Use Cases

### **For Developers**
- **Self-Analysis**: Understand your coding patterns and productivity
- **Portfolio Enhancement**: Showcase your GitHub activity professionally
- **Goal Setting**: Track consistency and set improvement targets
- **Skill Assessment**: Identify your strongest programming languages

### **For Teams**
- **Hiring Insights**: Analyze candidate's GitHub activity and patterns
- **Team Productivity**: Understand team member's contribution patterns
- **Project Planning**: Identify team's expertise and collaboration styles

### **For Open Source**
- **Contributor Analysis**: Understand community member activity
- **Project Health**: Analyze repository contribution patterns
- **Community Building**: Identify active contributors and maintainers

## 🔍 API Endpoints

### Core Analytics
- `GET /analyze/{username}` - Full GitHub profile analysis
- `GET /trending` - Get trending developers
- `GET /stats` - API usage statistics

### Example Response
```json
{
  "profile": {
    "username": "octocat",
    "name": "The Octocat",
    "avatar_url": "https://github.com/octocat.png",
    "join_date": "2011-01-25",
    "location": "San Francisco"
  },
  "stats": {
    "repos": 8,
    "stars": 1000,
    "followers": 10000,
    "languages": [
      {"name": "JavaScript", "count": 5, "color": "#f1e05a"}
    ],
    "insights": {
      "productivity_score": 85.2,
      "consistency_score": 92.1,
      "collaboration_level": "High",
      "activity_pattern": "Day Developer",
      "project_focus": "Open Source",
      "experience_level": "Experienced"
    }
  }
}
```

## 🛠️ Technology Stack

### Backend
- **Flask**: Python web framework
- **GitHub API**: Official GitHub REST API
- **TextBlob**: Natural language processing for commit analysis
- **Flask-Limiter**: Rate limiting and API protection

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Chart.js**: Beautiful data visualizations
- **React Calendar Heatmap**: GitHub-style contribution graphs

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for frontend components
- Add tests for new features
- Update documentation for API changes

## 📊 Roadmap

### Upcoming Features
- [ ] **Team Analytics**: Compare multiple developers
- [ ] **Repository Deep Dive**: Detailed project analysis
- [ ] **Export Reports**: PDF/CSV export functionality
- [ ] **Notifications**: Activity alerts and insights
- [ ] **API Dashboard**: Usage analytics and monitoring
- [ ] **Mobile App**: Native iOS/Android applications

### Planned Enhancements
- **Machine Learning**: Predict developer productivity patterns
- **Integration APIs**: Connect with other developer tools
- **Custom Dashboards**: Personalized analytics views
- **Advanced Filters**: Time-based and repository-specific analysis

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **GitHub API**: For providing comprehensive developer data
- **Chart.js**: For beautiful data visualizations
- **React Community**: For excellent component libraries
- **Open Source Contributors**: For making this project possible

## 📞 Support

- **Documentation**: [GitRecap Docs](https://gitrecap.com/docs)
- **Issues**: [GitHub Issues](https://github.com/yourusername/GitRecap/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/GitRecap/discussions)
- **Email**: support@gitrecap.com

---

**Made with ❤️ by the GitRecap team**

*Discover your coding story with GitRecap - because every developer has a unique journey to tell.*
