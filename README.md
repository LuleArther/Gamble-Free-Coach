# 🎯 Gamble Free Coach

**A simple, evidence-based web app that helps young people reduce or quit gambling.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange.svg)](https://web.dev/progressive-web-apps/)

## 🚀 Live Demo

[Coming Soon - Deploy to Vercel/Netlify]

## 📱 Features

### Core Functionality
- **🎯 Quick Help**: 10-minute urge timer with distraction activities
- **🤖 AI Coach**: Gemini-powered chat with CBT-based responses and safety guardrails
- **📊 Daily Check-ins**: Track urges and gambling behavior with streak tracking
- **📚 Learn Section**: 12 evidence-based CBT micro-modules
- **👤 Profile**: Goal setting, progress tracking, and data management
- **🔥 Streak Tracking**: Visual progress and gamification elements

### Technical Features
- **Progressive Web App (PWA)**: Installable and works offline
- **Mobile-First Design**: Fully responsive for all devices
- **Privacy-First**: Local storage with optional cloud sync
- **Evidence-Based**: Built on proven CBT and harm reduction principles

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Custom CSS with modern design system
- **AI**: Google Gemini API
- **Database**: Supabase (optional) with localStorage fallback
- **Deployment**: Vercel/Netlify ready

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/LuleArther/Gamble-Free-Coach.git
cd gamble-free
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🔑 Configuration

### Environment Variables

```env
# Gemini API (Required)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Supabase (Optional - for cloud sync)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudflare Worker (Production)
VITE_WORKER_URL=your_cloudflare_worker_url
```

### Supabase Setup (Optional)

If you want to enable cloud sync:

1. Create a free account at [supabase.com](https://supabase.com)
2. Create the following tables:

```sql
-- Users table is handled by Supabase Auth

-- Check-ins table
CREATE TABLE check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date TIMESTAMP,
  urge_level INTEGER,
  gambled BOOLEAN,
  amount DECIMAL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Goals table
CREATE TABLE goals (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  target_days INTEGER,
  reason TEXT,
  start_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Plans table
CREATE TABLE plans (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  if_then JSONB,
  activities JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

3. Enable Row Level Security (RLS) on all tables
4. Add your Supabase credentials to `.env`

## 📂 Project Structure

```
gamble-free/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API services (Supabase, Gemini)
│   ├── data/           # Static data (learning cards)
│   ├── hooks/          # Custom React hooks
│   └── styles/         # CSS files
├── public/             # Static assets
├── .env               # Environment variables
└── vite.config.js     # Vite configuration
```

## 🎯 Evidence-Based Methodology

### CBT Micro-Skills
- **Urge Surfing**: Ride out cravings without acting
- **Trigger Identification**: Recognize gambling triggers
- **If-Then Planning**: Implementation intentions
- **Cognitive Restructuring**: Challenge gambling thoughts
- **Behavioral Activation**: Replace gambling with activities

### Safety Features
- AI blocks gambling tips and strategies
- Crisis detection and support resources
- Self-exclusion information
- Helpline integration

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LuleArther/Gamble-Free-Coach)

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/LuleArther/Gamble-Free-Coach)

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Evidence-based CBT techniques from gambling addiction research
- Google Gemini API for AI-powered coaching
- Supabase for backend infrastructure
- React community for excellent tools and libraries

## 📞 Support Resources

If you or someone you know needs help with gambling:

- **National Problem Gambling Helpline**: 1-800-522-4700
- **Crisis Text Line**: Text HOME to 741741
- **Gamblers Anonymous**: [www.gamblersanonymous.org](https://www.gamblersanonymous.org)

## 🔒 Privacy & Security

- All data is stored locally by default
- Optional cloud sync with end-to-end encryption
- No tracking or analytics without consent
- Full data export and deletion available
- GDPR compliant

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] WhatsApp integration
- [ ] Parent/teacher resources
- [ ] Peer support features
- [ ] Advanced analytics dashboard
- [ ] Research partnerships

---

**Built with ❤️ to help young people take control of their gambling habits**

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
