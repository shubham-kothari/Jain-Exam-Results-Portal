# Exam Results Portal

A web application for viewing and downloading exam results with certificates.

## Project Structure

```
.
├── frontend/        # React frontend application
│   ├── public/      # Static assets
│   ├── src/         # React source code
│   ├── .env         # Frontend environment variables
│   ├── package.json # Frontend dependencies
│   └── Dockerfile.frontend   # Frontend Docker configuration
├── backend/         # FastAPI backend
│   ├── app/         # Backend source code
│   ├── db/          # Database files
│   ├── pyproject.toml # Python dependencies
│   └── Dockerfile.backend   # Backend Docker configuration
├── docker-compose.yml # Docker orchestration
└── README.md        # Project documentation
```

## Features

- View exam results by area
- Download certificates as PDF
- Responsive design
- Dockerized deployment

## Setup

1. Clone the repository
2. Configure environment variables:
   - Frontend: `frontend/.env`
   - Backend: `backend/.env`

## Running the Application

### Option 1: Run both services together (recommended)
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:8002

### Option 2: Run services separately using Docker Compose

#### Frontend only:
```bash
docker-compose up --build frontend
```

#### Backend only:
```bash
docker-compose up --build backend
```

### Option 3: Run services locally (without Docker)

#### Frontend:
```bash
cd frontend
npm install
npm start
```

#### Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload --port 8002
```

## Technologies Used

- Frontend: React, Bootstrap, html2pdf
- Backend: FastAPI, SQLite
- Infrastructure: Docker, Nginx
