Draftsman

AI-powered Statement of Purpose (SOP) analysis and improvement platform.

Live Deployment

Application: https://sop-draftman.onrender.com

GitHub: github.com/an04jali/sop_match

Features
User registration and login
PDF and DOCX SOP upload
AI-powered SOP analysis
Scoring across 7 dimensions:
Clarity
Specificity
Motivation
Programme Fit
Academic Readiness
Career Vision
Writing Quality
Structural analysis including:
Word count
Paragraph count
Sentence count
Reading time
Average sentence length
Opening and closing strength
Paragraph balance
Weakest paragraph identification
AI-powered paragraph improvement
Before/after paragraph comparison
Full SOP rewriting
Analysis history
Downloadable analysis report
Dark/light theme support
Responsive UI
Interactive 3D globe visualization
Tech Stack

Languages: Python, TypeScript, JavaScript, HTML, CSS

Frontend: Next.js 16, React 19, Tailwind CSS, Three.js

Backend: FastAPI, Python, Uvicorn, REST APIs

AI: Google Gemini API, Generative AI, Prompt Engineering, LLM Integration

Document Processing: PDF, DOCX, Text Extraction

Authentication: User Authentication, Protected Routes, Session Management

Tools: Git, GitHub, VS Code, npm, ESLint

Deployment: Docker,Render, Environment Variables, Production Builds, Git-based Deployment

Project Structure
abr-p2-draftsman/
├── backend/
│   └── app/
│       ├── api/
│       ├── prompts/
│       └── services/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── services/
│   ├── package.json
│   └── package-lock.json
│
└── README.md
Local Setup
Frontend
cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:3000
Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

Backend runs on:

http://localhost:8000
Environment Variables

Create a .env file in the backend:

GEMINI_API_KEY=your_gemini_api_key

Do not commit API keys or .env files to GitHub.

Production Build

Before deploying frontend changes:

cd frontend
npm run build

The project is deployed through Render and connected to the GitHub repository for production deployment.
