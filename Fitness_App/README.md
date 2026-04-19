# Fitverse - The Ultimate AI-Powered Fitness Tracker

![Fitverse Demo](https://img.shields.io/badge/Status-Active-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38B2AC) ![Zustand](https://img.shields.io/badge/Zustand-Persist-orange)
 
Welcome to **Fitverse** (formerly AuraFit), a premium, highly-interactive, and intelligent fitness tracker designed to help you organize, analyze, and optimize your workout journey.

---

## 🎯 Problem Statement

Many individuals regularly attend the gym and perform workouts, but a significant number of them do not systematically track or analyze their exercise routines. As a result, they lack visibility into their workout patterns, muscle group distribution, and overall progress over time. This absence of data-driven insights often leads to imbalanced training, inefficient workouts, and slower achievement of fitness goals.

There is a need for a user-friendly solution that enables gym-goers to record their daily workouts, monitor muscle group engagement, and analyze performance trends. Such a system would empower users to make informed decisions, optimize their training plans, and ensure balanced muscle development.

---

## 💡 The Solution

**Fitverse** solves this problem by offering an intuitive, gorgeous, and deeply intelligent platform that seamlessly integrates into your daily gym sessions. It takes the guesswork out of fitness by tracking volume, analyzing muscle fatigue, generating plans, and providing real-time AI assistance.

Every single data point—from your active workout state to your chat history with the AI—is **robustly persisted via Local Storage**, meaning your data is always exactly where you left it, even without a network connection.

---

## 🌟 Comprehensive Feature List

### 1. Active Workout Tracker
- **Real-Time Session Monitoring:** Start, pause, and record workouts with an active live timer.
- **Dynamic Logging:** Add custom exercises on the fly. Log sets, reps, and weights effortlessly.
- **Routine Management:** Save customized routines and load them instantly on your next visit.
- **Beautiful UI:** Glow effects, glassmorphic design, and smooth Framer Motion animations keep you focused and motivated.

### 2. Smart AI Workout Planner
- **Biometric Integration:** Inputs like gender, height, weight, activity level, and specific goals (e.g., Muscle Gain) power the AI.
- **7-Day Dynamic Generation:** Creates a perfectly balanced, week-long workout split tailored specifically to your body and goals.
- **Smart Persistence:** Your generated plan is saved entirely to local storage. 

### 3. Data-Driven Analytics Dashboard
- **Volume & Set Tracking:** Visualize your total volume lifted and sets performed over time.
- **Muscle Group Distribution:** Ensure balanced development by reviewing your weekly muscular engagement charts.
- **Historical Logs:** View past workouts instantly and identify performance trends.

### 4. Fitverse Coach (AI Assistant)
- **Always-Available Chatbot:** A smart floating button gives you instant access to the Fitverse AI Coach.
- **Context-Aware Assistance:** Ask about form, substitutes for exercises, or nutrition macros.
- **Saved Conversations:** Every conversation is securely backed up in the browser’s local storage.

### 5. Multi-Method Authentication
- Fully integrated with Firebase Auth, enabling fast, secure sign-in forms protecting your personalized dashboard.

### 6. Universal Data Persistence Ecosystem 💾
- **100% Local Storage Backed:** We've implemented `zustand/middleware` `persist` alongside native `localStorage` for **the entire website**. 
  - 🏋️ `workout-progress-storage`: Remembers ongoing session time, sets, and history.
  - 👤 `fitness-profile-storage`: Remembers biometrics, metrics, and goals.
  - 🤖 `fitverse-coach-chat`: Remembers your AI assistant chat history.
  - 📋 `fitverse_workout_plan`: Saves your custom-generated week schedule.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 (Vite)
- **Styling:** TailwindCSS, Vanilla CSS, Lucide React (Icons)
- **Animations:** Framer Motion
- **State Management:** Zustand (with Local Storage Persistence hooks)
- **Database / Auth:** Firebase Authentication
- **Routing:** React Router DOM
- **AI Integrations:** Google Gemini API 

---

## 🚀 How to Use & Run Locally

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/fitverse.git
   cd fitverse/Fitness_App
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Create a `.env` file in the root.
   - Add your Firebase and Gemini API keys:
     ```env
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     ...
     VITE_GEMINI_API_KEY=your_gemini_api_key
     ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   *The application will boot up on `http://localhost:5173`.*

### App Workflow

1. **Login/Register:** Sign up using your credentials.
2. **Profile Setup:** Head to the settings/profile to input your biometrics (Age, Weight, Goal).
3. **Generate Plan:** Visit the **Smart Workout Plan** page to let the AI build your week.
4. **Hit the Gym:** Go to **Workouts**, pick a routine, and start the timer.
5. **Log Real-Time:** Add sets and reps as you lift. When finished, hit "End Session".
6. **Review Progress:** Check your **Analytics** tab to see your volume trend and muscle distribution over the month!

---

*Built with ❤️ for a smarter, data-driven fitness journey.*
