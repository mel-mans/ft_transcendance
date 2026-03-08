

# 🏠 RoomMate42 — *ft_transcendence*

> **The last and greatest Common-Core project — our magnum opus, our Sistine Chapel, our... okay maybe we're exaggerating, but we're very proud of it 😅**

[![42 School](https://img.shields.io/badge/42-School-black?style=for-the-badge&logo=42&logoColor=white)](https://42.fr)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://nginx.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)

</div>

---

## 🤔 What is ft_transcendence?

**ft_transcendence** is the **final and most ambitious Common-Core project** at [42 School](https://42.fr). It challenges students to build a **full-stack, production-grade web application** from scratch — featuring real-time features, authentication, microservices, and more.

We didn't just build *a* project. We built **RoomMate42** — a platform that solves a very real problem for every 42 student on the planet.

<div align="center">
<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHNhNGk1Z3J5eTdneXhiMHNmejlrZjdpOGp4aWJ1cXh3bGFlazl3eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LmNwrBhejkK9EFP504/giphy.gif" width="400" alt="thinking gif"/>
</div>

---

## 💡 The Problem We Solve

<p align="center">
  <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGhhcnVrOHkycHNvZnptYXdtazF2ZnVvMHZ2enJvZ3ZqNGlkYTA3MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jXS1fR2InDp9D7sbVE/giphy.gif" />
</p>

Every 42 student knows the struggle:

- 🏙️ You just got accepted to 42 — **congrats!** Now… where do you live?
- 📱 Scrolling through Facebook groups, Telegram chats, and random Discord servers at 2 AM looking for a room
- 😩 Finding a great apartment only to discover you'd be living with someone whose coding music playlist is *death metal on loop*
- 💸 Overpaying for a room because you had no time to search properly between your 42 projects

**RoomMate42** fixes all of this.

> 🎯 **Our platform allows authenticated 42 students (via their 42 Intra account) to find available homes for rent AND find their perfect roommate — all in one place, built by 42 students, for 42 students.**

No more scrolling. No more guessing. Just find your next roommate, ping them on our chat, and focus on what matters — **coding until 3 AM together** 🧑‍💻

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **42 OAuth Authentication** | Log in securely with your 42 Intra account |
| 🏘️ **Housing Listings** | Browse and post available rooms/apartments near your campus |
| 🤝 **Roommate Matching** | Find compatible roommates based on your profile |
| 💬 **Real-time Chat** | Message potential roommates instantly |
| 🤖 **AI Assistant** | Smart recommendations powered by our AI service |
| 🛡️ **Secure by Design** | HTTPS everywhere, OWASP ModSecurity, JWT tokens |

---

## 🏗️ Architecture

<div align="center">
<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnFobnpjNW1vZnUzOHRnN3ZqcjhoMm56eGViMzdvZml1NGd5aGFxYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RbDKaczqWovIugyJmW/giphy.gif" width="350" alt="architecture gif"/>
</div>

The project is built on a **Microservices Architecture**, orchestrated with **Docker Compose** and secured behind an **Nginx reverse-proxy + load balancer**:

```
                         ┌─────────────────────────────────────────┐
                         │          🌐 Internet / Browser           │
                         └─────────────────┬───────────────────────┘
                                           │ HTTPS :443 / HTTP :80
                         ┌─────────────────▼───────────────────────┐
                         │  🛡️  NGINX  (Reverse Proxy + WAF)        │
                         │   • SSL/TLS Termination                  │
                         │   • OWASP ModSecurity WAF                │
                         │   • Load Balancing                       │
                         │   • Request Routing                      │
                         └──┬──────┬──────┬───────┬──────┬─────────┘
                            │      │      │       │      │
              ┌─────────────▼┐ ┌───▼──┐ ┌▼─────┐ ┌▼────┐ ┌▼──────────┐
              │  🖥️ Frontend  │ │ Auth │ │ Chat │ │User │ │ Listings  │
              │  (Next.js)   │ │ API  │ │ API  │ │ API │ │    API    │
              └─────────────┘ └──┬───┘ └──────┘ └─────┘ └───────────┘
                                 │
                         ┌───────▼──────┐
                         │  PostgreSQL  │
                         │  (Database)  │
                         └─────────────┘
```

### Services

| Service | Path | Port | Description |
|---|---|---|---|
| 🛡️ **Nginx** | `/` | 443/80 | Gateway, reverse proxy, WAF |
| 🖥️ **Frontend** | `/` | 3003 | Next.js UI |
| 🔐 **Auth** | `/api/auth` | 3004 | 42 OAuth, JWT |
| 💬 **Chat** | `/api/chat` | 3001 | Real-time messaging |
| 👤 **User Management** | `/api/user` | 3002 | Profiles & roommate matching |
| 🏘️ **Listings** | `/api/listings` | 3005 | Housing listings |
| 🤖 **AI Service** | `/api/ai` | — | Smart recommendations |
| 🗄️ **PostgreSQL** | — | 5432 | Main database |

---

## 👥 The Dream Team

<div align="center">
  <img src="https://github.com/user-attachments/assets/976bed21-8fd6-4fc4-a476-d06e1b7c9f38" alt="giphy" />
</div>


### 🧑‍✈️ ibougajd — *The DevOps Captain* ⚓

> *"I don't write features. I make sure everyone else's features actually work in production."*

<div align="center">
<img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYW40NzQ5dGE3bm9icXV4MHZuOHhicmJxbjJvZWNobm1nZjljZTVuMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PApUm1HPVYlDNLoMmr/giphy.gif" width="350" alt="devops gif"/>
</div>

**ibougajd** is the **DevOps Leader** and the architect behind the entire project infrastructure. While the rest of the team was writing code, ibougajd was building the fortress that keeps it all running.

**Responsibilities:**
- 🐳 **Docker & Docker Compose** — Containerized every single service; wrote the entire `docker-compose.yml` that orchestrates all microservices with health checks, restart policies, and dependency management
- 🛡️ **Nginx as Reverse Proxy + Load Balancer** — Configured Nginx with OWASP ModSecurity WAF as the single entry point to the application. All traffic is routed through Nginx which acts as a load balancer distributing requests across services and as a proxy server forwarding requests to the correct microservice
- 🔒 **SSL/TLS Security** — Set up automatic self-signed certificate generation via the `Makefile` so HTTPS works out of the box
- 📦 **Makefile Automation** — Created a clean `Makefile` so anyone can spin up the entire stack with a single `make all`
- 🗄️ **PostgreSQL Setup** — Configured the database container with persistent volumes and automated initialization scripts
- 🌐 **Network Isolation** — Designed the Docker network topology so microservices communicate internally without exposing unnecessary ports
- 📊 **Monitoring & Logging Stack** — Prepared infrastructure for ELK stack, Prometheus, and Grafana (for when we have more sleep)

**Tech Stack:**
`Docker` · `Docker Compose` · `Nginx` · `OWASP ModSecurity` · `SSL/TLS` · `PostgreSQL` · `Bash` · `Makefile`

---

### 🔧 Youness — *The Backend Wizard* 🪄

> *"If it's not RESTful, it's not real."*

<div align="center">
<img src="https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif" width="300" alt="backend gif"/>
</div>

**Youness** engineered the core backend services that power RoomMate42.

**Responsibilities:**
- 🔐 **Auth Service** — Built the entire 42 Intra OAuth2 flow, JWT token issuance & validation, and session management
- 👤 **User Management Service** — Designed and implemented user profiles, roommate preference matching algorithms, and the API endpoints consumed by the frontend
- 🏘️ **Listings Service** — Created the housing listings API with full CRUD operations, search filters, and availability tracking
- 🗃️ **Prisma ORM** — Defined the entire database schema using Prisma, managing migrations and relationships between users, listings, and matches

**Tech Stack:**
`NestJS` · `TypeScript` · `Prisma ORM` · `PostgreSQL` · `JWT` · `OAuth2` · `REST API`

---

### 🎨 Mohammed — *The Frontend Architect* 🖼️

> *"I turn Figma dreams into pixel-perfect reality. Also, I fix the bugs Youness says are 'frontend issues'."*

<div align="center">
<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHZ1NHc1M2k5aXowZHJ2dm1qeWFxM3lvcmR4YTYxdzB6bDlxbmxlZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/bGgsc5mWoryfgKBx1u/giphy.gif" width="350" height="200" alt="frontend gif"/>
</div>

**Mohammed** built the beautiful, responsive, and intuitive user interface that makes RoomMate42 a pleasure to use.

**Responsibilities:**
- 🖥️ **Next.js Frontend** — Architected the entire frontend application with server-side rendering (SSR) and client-side navigation for lightning-fast page loads
- 🎨 **UI/UX Design** — Designed and implemented responsive layouts that work seamlessly on all devices
- 🔗 **API Integration** — Connected the frontend to all backend microservices through the Nginx gateway
- 🔐 **Auth Flow** — Implemented the OAuth2 redirect flow on the client side, handling tokens and protected routes
- ⚡ **Performance** — Optimized assets and implemented lazy loading for the best possible user experience

**Tech Stack:**
`Next.js` · `React` · `TypeScript` · `CSS/Tailwind` · `REST API`

---

### 💬 Hamza — *The Real-Time Maestro* 🎵

> *"Latency is my enemy. I will defeat it."*

<div align="center">
<img src="https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif" width="300" alt="chat gif"/>
</div>

**Hamza** built the real-time chat system that allows 42 students to connect with potential roommates instantly.

**Responsibilities:**
- 💬 **Chat Service** — Designed and implemented the entire real-time messaging backend using NestJS
- 🔌 **WebSockets** — Built the WebSocket gateway for real-time bidirectional communication
- 📨 **Message Persistence** — Implemented message storage and retrieval so conversations are never lost
- 🔔 **Notifications** — Added real-time notification system for new messages and roommate requests
- 🛡️ **Chat Security** — Ensured messages are scoped to authenticated users only with proper authorization checks

**Tech Stack:**
`NestJS` · `TypeScript` · `WebSockets` · `Socket.io` · `Prisma ORM` · `PostgreSQL`

---

### 🤖 Ismail — *The AI Genius* 🧠

> *"I taught machines to find you the perfect roommate. You're welcome."*

<div align="center">
<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2Vmb253dG1sNzdkejZ5NnNkOW1sYWl1amY2OXJuc2Mzc3dsMWtmaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7qE1YN7aBOFPRw8E/giphy.gif" width="300" alt="ai gif"/>
</div>

**Ismail** built the AI service that makes RoomMate42 smarter than your average roommate-finding app.

**Responsibilities:**
- 🤖 **AI Recommendation Engine** — Built the AI service that analyzes user profiles and preferences to suggest the most compatible roommates
- 🔍 **Smart Search** — Implemented intelligent filtering so students find listings that match their lifestyle, budget, and campus proximity
- 📊 **Data Analysis** — Built endpoints that process user behavior and preferences to continuously improve matching quality
- 🧬 **Profile Compatibility** — Developed algorithms that match students based on schedule, habits, budget, and study style

**Tech Stack:**
`NestJS` · `TypeScript` · `Python` · `Machine Learning` · `REST API`

---

## 🚀 Getting Started

<div align="center">
<img src="https://media.giphy.com/media/LHZyixOnHwDDy/giphy.gif" width="300" alt="launch gif"/>
</div>

### Prerequisites

- 🐳 [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- 🔧 Make
- 🔑 A valid 42 Intra API application (for OAuth)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ibougajd/ft_transcendence.git
   cd ft_transcendence
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your 42 API credentials and secrets
   ```

3. **Launch everything with one command:**
   ```bash
   make all
   ```
   > This generates SSL certificates, builds all Docker images, and starts all containers. ☕ Grab a coffee, it might take a moment.

4. **Open your browser:**

   👉 **https://localhost**

   *(Accept the self-signed certificate warning for local development)*

### Available Make Commands

| Command | Description |
|---|---|
| `make all` | Build and start all services |
| `make fclean` | Stop all containers and remove volumes |
| `make re` | Clean rebuild of everything |

---

## 📂 Project Structure

```text
ft_transcendence/
├── 🖥️  frontend/               # Next.js Frontend Application
├── 🏗️  infrastructure/
│   ├── nginx/                 # Nginx reverse proxy config + SSL certs
│   ├── postgres/              # PostgreSQL init scripts
│   ├── logging/               # ELK stack config (Elasticsearch, Logstash, Kibana)
│   └── monitoring/            # Prometheus + Grafana config
├── 🔧 services/
│   ├── auth/                  # Authentication Service (42 OAuth + JWT)
│   ├── chat/                  # Real-time Chat Service (WebSockets)
│   ├── user_management/       # User Profile & Roommate Matching
│   └── listings/              # Housing Listings API
├── 🗃️  prisma/                 # Shared Prisma ORM schema & migrations
├── 🧪 tests/                  # Integration & E2E tests
├── .env.example               # Environment variables template
├── docker-compose.yml         # Full stack orchestration
└── Makefile                   # Automation commands
```

---

## 🛡️ Security Features

<div align="center">
<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExanoxNTdodW1xNWJuZGt2aXVqamRxY2EwMG1pc2l3ZzFhazhjeGhlaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/077i6AULCXc0FKTj9s/giphy.gif" width="300" alt="security gif"/>
</div>

- 🔒 **HTTPS Only** — All traffic is encrypted via SSL/TLS (self-signed for dev, production-ready for deployment)
- 🛡️ **OWASP ModSecurity WAF** — Nginx runs with the OWASP ModSecurity Web Application Firewall image to protect against common attacks (SQLi, XSS, etc.)
- 🔑 **42 OAuth2** — No custom passwords — students authenticate exclusively via their official 42 Intra credentials
- 🪙 **JWT Tokens** — Stateless, short-lived tokens for secure API access
- 🌐 **Network Isolation** — All microservices communicate on an internal Docker network; only Nginx is exposed to the outside world
- 🚫 **Port Security** — No unnecessary ports exposed; all external requests go through the single Nginx gateway

---

## 😂 Behind the Scenes

<div align="center">
<img src="https://media.giphy.com/media/13GIgrGdslD9oQ/giphy.gif" width="400" alt="funny coding gif"/>
</div>

Let's be honest. Building ft_transcendence was... an experience. 🙃

---

**A timeline of this project:**

| Week | What we planned | What actually happened |
|---|---|---|
| Week 1 | "We'll be done in 3 weeks" | We argued about the architecture for 5 days |
| Week 2 | "Let's start coding!" | ibougajd spent 4 days making Docker work on M1 Macs |
| Week 3 | "Backend is almost ready" | "Almost" |
| Week 4 | "Frontend looks great!" | Mohammed redesigned it 3 times |
| Week 5 | "Chat is done!" | Hamza discovered WebSockets |
| Week 6 | "AI is integrated!" | Ismail: "What's a neural network again?" |
| Week 7 | "Just polishing!" | 47 bug fixes, 3 all-nighters |
| Week 8 | "We're done!" | We were done ✅ |

---

**Some fun facts:**

- 🍕 Total pizzas consumed: **too many to count**
- ☕ Total coffees: **definitely above the healthy limit**
- 🐛 Bugs introduced by "just a quick fix": **all of them**
- 🕐 Times ibougajd said "it works on my machine": **0** *(because it works in Docker, not "your machine")*
- 📞 Times we called each other at midnight: **every single night during evaluation prep**
- 🤦 Times we forgot to `cp .env.example .env`: **embarrassingly many**

---

<div align="center">
<img src="https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif" width="350" alt="proud gif"/>
</div>

> *"We came. We saw. We dockerized."* — ibougajd, probably

> *"The API works, it's definitely a frontend bug."* — Youness, always

> *"It looks better now, trust me."* — Mohammed, for the 4th redesign

> *"The message arrives... eventually."* — Hamza, optimistically

> *"The AI said you're a 97% match. With a cactus."* — Ismail, debugging

---

## 🏆 ft_transcendence — Our Last CC Project

<div align="center">
<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGo4NHVhMzR4a2NoY2Nnd3FsNzVhcWU5bjE4cW5kNmt3bHk4MzVqZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYt5jPR6QX5pnqM/giphy.gif" width="400" alt="celebration gif"/>
</div>

**ft_transcendence** is the **crown jewel of the 42 Common Core**. It's the project where everything you've learned — from C pointers to Docker networking — comes together in one glorious, over-engineered web application.

We are incredibly proud of what we built. Not just because it works (it does, we promise), but because:

- 🤝 We did it **together**, as a team, despite the distance, the timezone differences, and the occasional disagreement about tabs vs. spaces
- 🧠 We learned things we never imagined — microservices, WebSockets, OAuth, WAF, container orchestration, AI integration
- 💪 We pushed ourselves way beyond the subject requirements because we wanted to build something **real** and **useful**
- 🌍 We built something that could genuinely help **thousands of 42 students** around the world find a safe, comfortable place to live and the right people to live with

This project represents the end of the Common Core and the beginning of something bigger. We're not just 42 students anymore — we're engineers who can build full production systems from scratch.

**Thank you 42. It's been a ride. 🚀**

---

<div align="center">

Made with ❤️, ☕, 🍕, and a dangerous amount of `docker-compose down --volumes` by the **RoomMate42 Team**

| | Contributor | Role |
|---|---|---|
| 🧑‍✈️ | **ibougajd** | DevOps & Infrastructure Lead |
| 🔧 | **Youness** | Backend Engineer |
| 🎨 | **Mohammed** | Frontend Engineer |
| 💬 | **Hamza** | Chat Service Engineer |
| 🤖 | **Ismail** | AI Service Engineer |

<br/>

*ft_transcendence — 42 School Common Core — Final Project*

<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHduaGNna3gzaHp1aXI3NThzMGpnc3R3ZHlkdnBoeGd0ZGZ5d284biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26u4cqiYI30juCOGY/giphy.gif" width="300" alt="bye gif"/>

</div>
