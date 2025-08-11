# StudyMaster AI - Production Study Platform

StudyMaster AI is a comprehensive, production-ready study platform that combines intelligent flashcard systems, spaced repetition learning, quiz generation, and progress tracking. Built with React, TypeScript, Vite, and Supabase, it delivers a professional learning experience with real-time data persistence and modern UI design.

## ✨ Features

### 🎓 Core Learning Features
- **Intelligent Flashcard System** - Create, organize, and study flashcards with AI-powered difficulty assessment
- **Spaced Repetition Algorithm** - SM-2 algorithm implementation for optimal memory retention
- **Interactive Quiz Engine** - Multiple choice, true/false, and short answer question types
- **Progress Tracking** - Comprehensive analytics with visual charts and performance metrics
- **Topic Organization** - Hierarchical organization by subjects and difficulty levels

### 🔧 Production Features
- **Real-time Database** - Supabase PostgreSQL with row-level security
- **User Authentication** - Secure signup/signin with email and password
- **Responsive Design** - Mobile-first design that works on all devices
- **Data Visualization** - Charts and graphs for progress tracking
- **Export Capabilities** - Download your study data
- **Offline Support** - Service worker for basic offline functionality

### 🎨 User Experience
- **Beautiful UI** - Modern, clean interface with thoughtful animations
- **Dark/Light Themes** - Customizable appearance preferences
- **Accessibility** - WCAG compliant design
- **Performance Optimized** - Fast loading and smooth interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A Supabase account

### 1. Clone and Install
```bash
git clone <repository-url>
cd studymaster-ai
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=StudyMaster AI
VITE_APP_URL=http://localhost:5173
```

### 3. Database Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the migration file: `supabase/migrations/20250811192041_tiny_bonus.sql`
4. This will create all necessary tables and security policies

### 4. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main application layout
│   ├── Navbar.tsx      # Navigation component
│   ├── FlashcardComponent.tsx
│   ├── CreateFlashcardModal.tsx
│   └── LoadingSpinner.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication logic
│   ├── useFlashcards.ts # Flashcard management
│   └── useQuizzes.ts   # Quiz functionality
├── pages/              # Main application pages
│   ├── AuthPage.tsx    # Login/signup
│   ├── Dashboard.tsx   # User dashboard
│   ├── StudyPage.tsx   # Flashcard study interface
│   ├── QuizPage.tsx    # Quiz taking interface
│   ├── ProgressPage.tsx # Analytics and progress
│   └── SettingsPage.tsx # User preferences
├── lib/               # Utilities and configuration
│   └── supabase.ts    # Database client and types
└── App.tsx           # Root component
```

## 🗄️ Database Schema

The application uses the following main tables:

- **profiles** - User profile information and preferences
- **topics** - Subject categories for organizing content
- **flashcards** - Individual flashcard content
- **srs_items** - Spaced repetition scheduling data
- **quiz_templates** - Quiz structure and configuration
- **questions** - Individual quiz questions
- **quiz_attempts** - User quiz session records
- **quiz_responses** - Individual question answers
- **study_sessions** - Study activity tracking
- **user_progress** - Learning progress by topic

All tables include Row Level Security (RLS) policies to ensure data privacy and security.

## 🔐 Security Features

### Authentication
- Email/password authentication via Supabase Auth
- Secure session management
- Protected routes and API endpoints

### Database Security
- Row Level Security (RLS) on all tables
- User-scoped data access policies
- Parameterized queries to prevent SQL injection
- Environment variable management for secrets

### Privacy
- User data isolation
- Optional data sharing controls
- GDPR-compliant data export functionality

## 🎯 Spaced Repetition Algorithm

The application implements the SM-2 spaced repetition algorithm:

1. **Initial Interval**: 1 day for new cards
2. **Quality Assessment**: 5-point scale (1-5)
3. **Interval Calculation**: Based on previous performance and ease factor
4. **Ease Factor Adjustment**: Dynamic difficulty based on user performance

## 📊 Analytics & Progress Tracking

### Dashboard Metrics
- Total study time and session count
- Cards mastered vs. total cards studied
- Average quiz scores and completion rates
- Learning streaks and goal progress

### Detailed Progress
- Topic-specific mastery levels
- Daily activity charts
- Subject area breakdown
- Historical performance trends

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Husky for pre-commit hooks

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Create and edit flashcards
- [ ] Study session with spaced repetition
- [ ] Quiz creation and taking
- [ ] Progress tracking and analytics
- [ ] Settings and preferences
- [ ] Mobile responsiveness
- [ ] Data persistence across sessions

### Automated Tests
```bash
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 🌐 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Environment Variables for Production
```bash
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_APP_NAME=StudyMaster AI
VITE_APP_URL=your_production_domain
```

## 📱 Mobile Support

The application is fully responsive and includes:
- Mobile-first design approach
- Touch-friendly interface elements
- Optimized layouts for tablets and phones
- Progressive Web App (PWA) capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Join our community Discord (link in repository)

## 🚧 Roadmap

### Upcoming Features
- [ ] AI-generated flashcards from text/PDFs
- [ ] Collaborative study groups
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Offline synchronization
- [ ] Third-party integrations (Google Drive, Notion)

---

**StudyMaster AI** - Empowering learners with intelligent, data-driven study tools.