# PulseOps ⚡

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

> **Real-Time Customer Support Triage & SLA Incident Engine.**  
> Built for fast-moving SaaS engineering teams to automate incident classification, prevent SLA breaches, and manage high-volume customer inquiries in real time.

---

## 🎯 Overview

When production outages, billing discrepancies, or critical API failures occur, support queues get flooded with tickets. Without automated prioritization, urgent enterprise incidents often get lost beneath minor inquiries, causing SLA (Service Level Agreement) violations and customer churn.

**PulseOps** solves this by providing:
1. **Rule-Based NLP Auto-Triage Engine**: Automatically scans ticket payload text for urgency signals (payment failures, 500 errors, system down) and assigns severity tiers (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) along with dynamic SLA target resolution windows.
2. **Real-Time Incident Queue**: A split-pane workspace featuring client-side countdown badges that calculate remaining seconds until breach.
3. **Bi-Directional WebSocket Sync**: Instantly broadcasts ticket updates, state transitions, and staff notes across all active agents without page refreshes.
4. **Executive SLA Analytics**: Aggregates resolution velocity, category distributions, and compliance scores.

---

## 🏗️ System Architecture

```
[ Customer / Client Portal ]  ── (HTTP REST)  ──┐
                                                 │
[ Support Agent Dashboard  ]  ── (WebSockets) ──┼──► [ FastAPI Backend Core ] ──► [ MongoDB Document Store ]
  - Split-pane Workspace                         │     - Triage Engine               - Tickets Collection
  - Dynamic SLA Countdown                        │     - SLA Tracker Service         - Audit Logs Collection
  - Internal Staff Notes                         │     - Event Broadcaster
```

---

## ⚡ Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Vite | High-performance reactive UI with client-side state caching and live second-level interval calculations. |
| **Styling** | Tailwind CSS v4, Lucide Icons | Dark-mode interface designed for high-density enterprise data operations. |
| **Backend API** | Python 3.14, FastAPI | Asynchronous ASGI REST server handling validation via Pydantic and async I/O. |
| **Real-Time** | WebSockets (`/ws`) | Persistent full-duplex socket channel broadcasting incident updates. |
| **Database** | MongoDB (Motor Async) | JSON document store managing conversation threads, audit trails, and dynamic metadata. |

---

## 🚀 Key Features

* **Intelligent Auto-Triage**:
  * Evaluates subject and body content against priority criteria.
  * Dynamically computes deadlines:
    * `CRITICAL`: 2-hour SLA response target
    * `HIGH`: 4-hour SLA response target
    * `MEDIUM`: 12-hour SLA response target
    * `LOW`: 24-hour SLA response target
* **Live SLA Countdown Indicators**:
  * Dynamic visual status:
    * 🔵 **Cyan:** Compliant window active
    * 🟡 **Amber:** Urgent (< 45 minutes remaining)
    * 🔴 **Pulsing Red:** Overdue / SLA breached
    * 🟢 **Emerald:** Resolved within SLA commitment
* **Split-Pane Agent Workspace**:
  * Threaded message history separating customer communications from internal staff-only notes.
  * Canned responses for accelerated ticket resolution.
  * One-click lifecycle transitions: `Open` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`.
* **SLA Analytics Engine**:
  * Real-time compliance score percentage calculation (`(Compliant / Total) * 100`).
  * Average resolution duration tracking.
  * Breakdown charts by severity tier and category.

---

## 🛠️ Local Development & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Seed initial sample incidents
python seed_data.py

# Start the FastAPI server
python -m uvicorn app.main:app --reload
```

The interactive OpenAPI / Swagger documentation will be available at `/docs`.

### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

---

## 📡 API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/tickets` | Retrieve filterable list of tickets with live SLA calculations |
| `POST` | `/api/v1/tickets` | Create a new ticket (triggers automated triage engine) |
| `GET` | `/api/v1/tickets/{id}` | Fetch full ticket conversation history and audit metadata |
| `PATCH` | `/api/v1/tickets/{id}/status` | Update incident status and record resolution timestamps |
| `POST` | `/api/v1/tickets/{id}/messages` | Append customer response or internal staff note |
| `GET` | `/api/v1/analytics` | Aggregate global SLA compliance rate and queue distributions |
| `WS` | `/ws` | WebSocket connection for real-time incident event streaming |
| `GET` | `/api/v1/health` | Service health status and database connectivity check |

---

## 📄 License

MIT License. Designed and developed as a modern enterprise incident response system.
