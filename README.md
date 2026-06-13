# 🐾 BuddyLearn AI

![BuddyLearn Banner](frontend/public/logo.png)

**BuddyLearn AI** is a next-generation, gamified, AI-powered learning platform designed to make education highly engaging, interactive, and fun for all ages. With built-in gamification, an advanced multilingual AI companion, and various specialized hubs, learning becomes an adventure.

## ✨ Key Features

- 🌟 **Gamified Learning**: Earn XP, collect Coins, maintain Streaks, and unlock Achievements as you progress.
- 🌳 **Knowledge Tree**: Visually grow your very own Knowledge Tree by completing tasks and learning new concepts.
- 🐱 **TomBuddy AI Companion**: A cute, 3D interactive plush AI kitten that motivates you, acts as your mentor, and speaks fluently in **your** language (supports English, Tamil, Spanish, French, and more!).
- 💻 **Coding & Tech Hub**: Interactive coding lessons tailored to your skill level.
- 📚 **Vocabulary Builder**: Learn new words daily with AI-generated context and pronunciation.
- 🎨 **Kids Learning Hub**: Specially crafted modules for early learners, making basics fun.
- 📖 **AI Story & Music Hubs**: Generate custom stories and songs to learn through creativity.
- 🎮 **Games Hub**: Brain-training mini-games including Memory Match, Sudoku, Math Puzzles, and more.
- ❤️ **Emotion Tracking**: Track your mood and let the AI adapt its teaching style to support your well-being.

## 🛠️ Technology Stack

This project is structured as a monorepo with a robust frontend and backend.

**Frontend:**
- [Next.js 14](https://nextjs.org/) (React Framework)
- Tailwind CSS (Styling & Animations)
- Framer Motion (Micro-animations)
- Three.js (3D TomBuddy AI Rendering)
- Zustand (State Management)

**Backend:**
- [Python 3.10+](https://www.python.org/)
- [Flask](https://flask.palletsprojects.com/) (API Framework)
- SQLAlchemy (Database ORM)
- SQLite (Development Database)
- OpenAI GPT-4 API (AI Companion & Content Generation)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup (Flask)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Set up your environment variables
set OPENAI_API_KEY=your_api_key_here

# Run the backend server
python run.py
```
*The backend will run on `http://localhost:5000`*

### 2. Frontend Setup (Next.js)
```bash
cd frontend
npm install

# Run the frontend server
npm run dev
```
*The frontend will run on `http://localhost:3000`*

## 🌐 Deployment
- **Frontend**: Fully optimized for one-click deployment on [Vercel](https://vercel.com). Just connect this repository and it will automatically deploy using the `vercel.json` config!
- **Backend**: Can be deployed on any Python-friendly hosting service like Render, Heroku, or Railway. (Remember to configure a persistent PostgreSQL database for production instead of SQLite).

---
*Built with ❤️ to make learning magical.*
