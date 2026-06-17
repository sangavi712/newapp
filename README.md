# 🐾 BuddyLearn AI `v1.1.0-release`

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

## 🔄 Cross-System Login & Cloud Synchronization

To allow logging in and retrieving your learning progress, XP, streaks, and knowledge tree when working across multiple systems or testing on other devices:

### 1. Cloud Persistence Configuration (Required for Cross-System Login)
By default, the application runs in **local-only mode** using a system-specific SQLite database cache (`backend/instance/buddylearn.db`). If you switch to another machine, this local database will be empty. 
To share accounts and progress across systems:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Set the `MONGODB_URI` environment variable in your `backend/.env` file on both machines:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   ```
3. When connected, any registration or progress update automatically replicates to MongoDB Atlas. When logging in on a new system, the backend detects a local cache miss and automatically pulls all your profiles, streaking history, coding lessons, stories, and knowledge tree data down to that machine's local SQLite database.

### 2. Networking Setup (For External/Mobile Devices)
If you run the app on your developer machine and want to access it from another system or mobile device on the same local network:
- **Frontend URL Config**: Create a `.env.local` file in the `frontend` folder and set `NEXT_PUBLIC_API_URL` to your developer machine's local IP address (instead of `localhost`):
  ```env
  NEXT_PUBLIC_API_URL=http://<YOUR_DEV_IP_ADDRESS>:5000/api
  ```
- **Backend CORS Config**: In `backend/.env`, set `CLIENT_URL` to your frontend's hostname/IP so the backend accepts cross-origin requests:
  ```env
  CLIENT_URL=http://<YOUR_DEV_IP_ADDRESS>:3000
  ```
- The backend automatically binds to `0.0.0.0:5000` to accept connections on all network interfaces.

### 3. Database Initialization & Seeding
On any new system, you must initialize and seed the SQLite cache database with early learning lessons, music tracks, vocabulary, and stories. Run:
```bash
cd backend
# Make sure virtual env is active
venv\Scripts\activate
# Run seed script
python seed.py
```

## 🌐 Production Deployment

- **Frontend (Vercel)**: Fully optimized for one-click deployment on [Vercel](https://vercel.com). Connect this repository to Vercel, and configure the following environment variable:
  - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g., `https://<backend>.onrender.com/api`)

- **Backend (Render / Railway / Heroku)**: Can be deployed on any Python-friendly hosting service. Ensure you configure the following environment variables:
  - `MONGODB_URI`: Your MongoDB Atlas connection string for persistent cloud storage and cross-device sync.
  - `CLIENT_URL`: Your deployed frontend URL (e.g., `https://<frontend>.vercel.app`) to configure CORS.
  - `JWT_SECRET_KEY`: A secure random string for signing authentication tokens.
  - `OPENAI_API_KEY`: Your OpenAI key for AI Buddy features.

---
*Built with ❤️ to make learning magical.*

