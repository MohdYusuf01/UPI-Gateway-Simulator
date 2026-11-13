# UPI-Gateway-Simulator
UPI Gateway Simulator is a full-stack application that simulates UPI payments, transaction processing, payment validation, and transaction history management to demonstrate real-world digital payment workflows.

## Features
- **User Authentication**: Secure JWT-based authentication and role management (User & Admin).
- **Virtual UPI ID Creation**: Link bank accounts and create custom UPI handles.
- **Simulated Payment Gateway**: Real-time fund transfer, balance checks, transaction statuses (SUCCESS, PENDING, FAILED).
- **Admin Dashboard**: System metrics, transaction monitoring, user management, and dynamic limit controls.
- **Modern Responsive Frontend**: Built with React, Tailwind CSS, and Lucide icons.
- **Spring Boot Backend**: Powered by Spring Boot 3 with JPA, Spring Security, and H2/MySQL database support.

## Architecture
- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Spring Boot 3, Spring Security (JWT), Spring Data JPA
- **Database**: H2 (In-memory, default) / MySQL (Docker-ready)

## Getting Started

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
Runs on `http://localhost:8080`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.
