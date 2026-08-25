# Draftsman

A full-stack web application designed to provide a reliable and user-friendly workflow through a modern web interface.

## 🌐 Live Demo

**[Open Draftsman](https://draftsman.onrender.com)**

## 📌 Overview

Draftsman is a full-stack web application with a separate frontend and backend, containerized using Docker and deployed on Render.

The project focuses on building a clean, responsive user experience while maintaining a structured backend architecture for reliable application workflows.

## ✨ Features

- Responsive and user-friendly web interface
- Full-stack frontend and backend architecture
- REST API integration
- Structured frontend and backend separation
- Dockerized application deployment
- Production deployment on Render
- Reliable API request and response handling

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript / TypeScript
- HTML5
- CSS3
- Responsive Web Design

### Backend
- Python
- REST APIs

### DevOps & Deployment
- Docker
- Docker Compose
- Render
- Git
- GitHub

## 🏗️ Architecture

The application follows a full-stack architecture:

```text
                    ┌──────────────────┐
                    │     Frontend     │
                    │   React.js UI    │
                    └────────┬─────────┘
                             │
                             │ REST API
                             ▼
                    ┌──────────────────┐
                    │     Backend      │
                    │   API Server     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     Services     │
                    │  / Data Layer    │
                    └──────────────────┘
