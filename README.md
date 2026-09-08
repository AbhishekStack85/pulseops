# PulseOps ⚡ — Real-Time Customer Support Triage & SLA Incident Hub

> **Full-Stack Enterprise Support Desk with Smart NLP Auto-Triage, Live SLA Countdown Timers, and Real-Time Incident Streaming.**

---

## 🎯 The Real-World Problem It Solves

High-growth SaaS companies and fintechs receive hundreds of customer tickets every day across payment gateways, webhooks, and core applications. 
- **The Pain Point:** Urgent issues (such as credit card double charges, server outages, or SSO lockouts) get buried under low-priority queries (such as cosmetic typos or minor suggestions).
- **The Consequence:** High-paying enterprise clients experience prolonged downtime, resulting in broken SLAs (Service Level Agreements), costly refunds, and churn.
- **The Solution (PulseOps):** An automated triage desk that parses incoming tickets, calculates severity & SLA response windows dynamically, provides live countdown timers for support agents, and aggregates SLA compliance metrics for engineering leaders.

---

## 🛠️ Tech Stack

| Layer | Technology | Role & Architecture |
|---|---|---|
| **Frontend** | **React.js (Vite, JavaScript)** | High-performance split-pane inbox, live countdown timers, reactive search/filters, and canned response workflows. |
| **Styling** | **Tailwind CSS + Lucide Icons** | Polished, accessible dark-theme UI inspired by modern developer platforms like Linear and Vercel. |
| **Backend** | **Python 3.14 + FastAPI** | High-throughput asynchronous REST APIs, Pydantic data validation, and real-time WebSocket event broadcasting. |
| **Database** | **MongoDB (Motor Async Driver)** | Flexible JSON-document store for threaded conversations, auto-triage tags, and dynamic incident metadata (with zero-friction local fallback). |

---

## 🌟 Key Features

1. **Smart Auto-Triage Engine**:
   - Analyzes ticket subjects and descriptions against critical incident patterns (e.g. *payment failed, double charged, 500 error, outage*).
   - Automatically computes SLA response windows:
     - **Critical:** 2.0h SLA window
     - **High:** 4.0h SLA window
     - **Medium:** 12.0h SLA window
     - **Low:** 24.0h SLA window
2. **Live SLA Countdown Badges**:
   - Real-time client-side ticker calculating remaining seconds until breach.
   - Distinct states: *Compliant (Cyan) ➔ Urgent <45m (Amber) ➔ Breached (Pulsing Red) ➔ Resolved (Emerald)*.
3. **Agent Workspace & Split-Pane Layout**:
   - Threaded conversation viewer separating customer communications from internal staff notes.
   - Quick one-click canned response insertions.
   - Status workflow transitions (`Open` ➔ `In Progress` ➔ `Resolved` ➔ `Reopened`).
4. **WebSocket Real-Time Sync**:
   - Automatically pushes ticket creations, status transitions, and message replies across all open agent sessions.
5. **Executive SLA & Incident Analytics**:
   - Real-time KPI cards: Global SLA Compliance Rate (%), Active Incident Queue, Breach Count, and Average Resolution Time.
   - Priority and category distribution visualizations.

---

## 🚀 Getting Started

### 1. Start the FastAPI Backend
```powershell
cd pulseops/backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Interactive Swagger Docs: `http://localhost:8000/docs`
* Health Check: `http://localhost:8000/api/v1/health`

### 2. Start the React Frontend
```powershell
cd pulseops/frontend
npm run dev
```
* Open your browser at: `http://localhost:5173`

---

## 📄 Resume Bullet Points (Ready to copy-paste into your CV)

* **Full-Stack Support Desk & SLA Triage Hub (React.js, FastAPI, Python, MongoDB)**
  * *Designed and built an enterprise incident triage platform that automatically computes SLA response windows and categorizes support tickets using FastAPI and asynchronous background workers.*
  * *Architected a dual-role React dashboard with live countdown timers, WebSocket streaming for real-time ticket ingestion, and an audit trail for SLA breach detection.*
  * *Structured flexible document schemas and aggregation pipelines in MongoDB to track historical resolution times and executive compliance rates (>85% SLA target).*
