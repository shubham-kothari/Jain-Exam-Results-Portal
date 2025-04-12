# Exam Results Portal

A web application for viewing and downloading exam results with certificates.

## Project Structure

```
servers/
├── frontend/        # React frontend application
│   ├── public/      # Static assets
│   ├── src/         # React source code
│   ├── .env         # Frontend environment variables
│   ├── package.json # Frontend dependencies
│   └── Dockerfile   # Frontend Docker configuration
├── backend/         # FastAPI backend
│   ├── app/         # Backend source code
│   ├── db/          # Database files
│   ├── requirements.txt # Python dependencies
│   └── Dockerfile   # Backend Docker configuration
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
   - Frontend: `servers/frontend/.env`
   - Backend: `servers/backend/.env`

## Running the Application

```bash
cd servers
docker compose up --build
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:8002

## Technologies Used

- Frontend: React, Bootstrap, html2pdf
- Backend: FastAPI, SQLite
- Infrastructure: Docker, Nginx
