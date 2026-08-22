# StudySync 🚀
> **AI-Powered Academic Collaboration & Study Partner Matching Platform**  
> *Built for the PromptWars Hackathon — "Student Life" Challenge*

---

## 🎯 The Core Problem & Solution

- **The Problem:** Students tackle heavy assignments, labs, quizzes, and exams in isolation, unaware of peers working on the exact same academic tasks or deadlines.
- **The Solution:** StudySync automatically pairs students based on academic task synergy and personal study preferences using a **transparent, deterministic 5-Factor Compatibility Algorithm**, and gives them structured study group sprints.

---

## ⚡ 5-Factor Matching Formula

StudySync computes an explainable compatibility score ($0-100\%$) for every academic task:

| Factor | Weight | Metric & Logic |
| :--- | :---: | :--- |
| **Course & Task Synergy** | **30%** | Exact course code match ($100\%$), same department ($65\%$), and matching task type (Lab, Assignment, Project). |
| **Topic & Concept Overlap** | **25%** | Jaccard similarity index across extracted syllabus keywords & concepts. |
| **Deadline Proximity** | **20%** | Urgency alignment: identical deadlines within $\le 4\text{h}$ get $100\%$; decays across a 72-hour sprint window. |
| **Schedule Availability** | **15%** | Overlap between preferred study time slots (e.g. Evening, Late Night, Afternoon). |
| **Study Style & Target Goals** | **10%** | Alignment between working rhythms (Deep Focus, Discussion) and target grades ($A / 4.0$). |

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Glassmorphic Design System.
- **Backend:** Node.js, Express, Socket.io (WebSocket ready).
- **Data Layer:** In-memory store with realistic seed data and zero-config instant startup.
- **Size:** Ultra-lightweight repository (< 10 MB).

---

## 🚀 How to Run the Application

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Both Frontend & Backend (1-Click)
```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

Alternatively, run them separately:
```bash
# Terminal 1: Backend API
npm run server

# Terminal 2: Vite Frontend
npm run client
```

---

## 🧪 Demo & Testing Features
1. **Student Profile Switcher:** Click on the top-right profile avatar in the Navbar to switch between realistic students (*Alex Rivera, Priya Patel, Marcus Vance, Elena Rostova, Jordan Lee*) and watch the matching engine recalculate dynamically.
2. **Find Partners Deck:** Navigate to the **Find Partners** tab to see 5-factor breakdown bars and "Why you matched" explainability badges.
3. **Add Task:** Click "+ Add Task" to create a new assignment and immediately run compatibility matching.
4. **Reset Demo Data:** Click the 🔄 reset icon in the Navbar anytime to restore initial seed data.
