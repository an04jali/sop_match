# Draftsman

### AI-Powered Statement of Purpose Analysis & Improvement Platform

Draftsman is a full-stack web application that uses Generative AI to analyze and improve Statements of Purpose (SOPs).

Users can upload a PDF or DOCX SOP and receive a structured analysis covering writing quality, motivation, programme fit, academic readiness, career vision, clarity, and specificity. The platform also provides structural analysis, paragraph-level improvement, and full SOP rewriting.

---

## 🌐 Live Application

**Live Demo:**  
https://sop-draftman.onrender.com

**Source Code:**  
https://github.com/an04jali/sop_match

---

## ✨ Features

### 🔐 Authentication
- User registration
- User login and logout
- Protected application routes
- Session-based authentication

### 📄 SOP Upload & Processing
- Upload SOPs in PDF and DOCX formats
- Automatic text extraction
- Word and document structure analysis

### 🤖 AI-Powered Evaluation

Draftsman evaluates an SOP across seven key dimensions:

| Dimension | Purpose |
|---|---|
| Clarity | Evaluates how clearly ideas are communicated |
| Specificity | Identifies generic statements and lack of concrete details |
| Motivation | Evaluates the applicant's motivation and reasoning |
| Programme Fit | Measures alignment with the chosen programme |
| Academic Readiness | Evaluates academic preparation and capabilities |
| Career Vision | Evaluates clarity and relevance of future goals |
| Writing Quality | Evaluates overall writing and language quality |

Each dimension receives a score out of **5**, along with reasoning and supporting evidence where available.

### 📊 Structural Analysis

The application provides additional document-level insights:

- Word count
- Paragraph count
- Sentence count
- Reading time
- Average sentence length
- Opening strength
- Closing strength
- Paragraph balance

### ✍️ AI-Powered Improvements

Users can identify and improve weak sections of their SOP.

The application supports:

- Weakest paragraph identification
- Paragraph-level AI feedback
- Suggested improvements
- Improved paragraph generation
- Before/after comparison
- Copying improved content
- Replacing the original paragraph

### 📝 Full SOP Rewrite

Draftsman can generate an improved version of the complete SOP while preserving the original ideas, details, tone, and voice as much as possible.

The rewrite also includes a summary of the changes made.

### 📚 Analysis History

Users can access their previous SOP analyses through the analysis history functionality.

### 🎨 User Interface

- Dark and light theme support
- Responsive design
- Interactive 3D globe visualization
- Animated authentication interface
- Loading and error states
- Structured analysis reports
- Responsive report components

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │        User          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Next.js Frontend   │
                    │                      │
                    │ React + TypeScript   │
                    │ Tailwind CSS         │
                    │ Three.js             │
                    └──────────┬───────────┘
                               │
                          REST API
                               │
                               ▼
                    ┌──────────────────────┐
                    │   FastAPI Backend    │
                    │                      │
                    │ Authentication      │
                    │ File Processing      │
                    │ SOP Analysis         │
                    │ History              │
                    │ Improvements         │
                    └──────────┬───────────┘
                               │
                         Gemini API
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Google Gemini     │
                    │                      │
                    │ SOP Evaluation       │
                    │ Feedback             │
                    │ Improvements         │
                    │ Full Rewrite         │
                    └──────────────────────┘
###🛠️ Technology Stack
##Frontend
Next.js 16
React 19
TypeScript
JavaScript
Tailwind CSS
Three.js
jsPDF
React Context API

##Backend
Python
FastAPI
Uvicorn
REST APIs

##Generative AI
Google Gemini API
Google GenAI SDK
Prompt Engineering
LLM Integration

Structured JSON responses
AI response parsing and validation
Retry handling for temporary API failures
Document Processing
PDF processing
DOCX processing
Text extraction
Document structure analysis
Authentication & Security
User authentication
Protected routes
Session management
CORS configuration
Environment variable based secret management

## DevOps & Deployment
Docker
Render
Git
GitHub
Environment variables
Production builds

Git-based deployment
Development Tools
Visual Studio Code
npm
ESLint
Python virtual environments

📁 Project Structure
abr-p2-draftsman/
│
├── backend/
│   └── app/
│       ├── api/
│       ├── prompts/
│       ├── services/
│       └── ...
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   ├── globals.css
│   │   │   ├── layout.js
│   │   │   └── page.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── upload/
│   │   │   ├── ui/
│   │   │   ├── Globe.tsx
│   │   │   └── ThemeToggle.tsx
│   │   │
│   │   ├── context/
│   │   ├── hooks/
│   │   └── services/
│   │
│   ├── package.json
│   └── package-lock.json
│
├── Dockerfile
└── README.md
🚀 Local Development
Prerequisites

Make sure you have the following installed:

Node.js
npm
Python 3.12+
Git
Docker (if running through containers)
1. Clone the Repository
git clone https://github.com/an04jali/sop_match.git
cd sop_match
2. Backend Setup

Navigate to the backend:

cd backend

Create a virtual environment:

Windows
python -m venv venv
venv\Scripts\activate
macOS/Linux
python3 -m venv venv
source venv/bin/activate

Install dependencies:

pip install -r requirements.txt
3. Configure Environment Variables

Create a .env file inside the backend directory:

GEMINI_API_KEY=your_gemini_api_key

Keep API keys private and never commit .env files to GitHub.

4. Start the Backend

From the backend directory:

uvicorn app.main:app --reload

The backend will run at:

http://localhost:8000
5. Start the Frontend

Open another terminal and navigate to the frontend:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will run at:

http://localhost:3000
🐳 Docker

The backend can also be containerized using Docker.

Build the image:

docker build -t draftsman .

Run the container:

docker run -p 8000:8000 draftsman
🔑 Environment Variables

The application uses environment variables for sensitive configuration.

Backend
GEMINI_API_KEY=your_gemini_api_key
Frontend

Frontend environment variables should contain the appropriate backend API URL for the environment being used.

Never commit API keys, passwords, tokens, or .env files to the repository.

🧪 Production Build

Before deploying frontend changes, verify the production build:

cd frontend
npm run build

A successful build confirms that the Next.js application can be compiled for production.

☁️ Deployment

The project is deployed using Render and connected to the GitHub repository.

Production workflow:

Code Changes
     │
     ▼
Git Commit
     │
     ▼
Git Push
     │
     ▼
GitHub
     │
     ▼
Render Deployment
     │
     ▼
Production Application

Production application:

https://sop-draftman.onrender.com

🔄 Development Workflow

For frontend changes:

cd frontend
npm run build

After confirming the build succeeds:

cd ..
git status
git add .
git commit -m "Describe your changes"
git push origin main

Render can then automatically deploy the latest commit when automatic deployment is enabled.

📌 Key Technical Skills Demonstrated
Full-Stack Web Development
React & Next.js Development
TypeScript Development
REST API Development
FastAPI Backend Development
Generative AI / LLM Integration
Google Gemini API Integration
Prompt Engineering
AI Response Parsing
Authentication & Authorization
File Upload & Document Processing
PDF/DOCX Text Extraction
State Management
React Context API
Responsive UI/UX Development
Three.js 3D Visualization
Docker & Containerization
Git & GitHub
Cloud Deployment with Render
Environment & Configuration Management
Production Build & Deployment Debugging
