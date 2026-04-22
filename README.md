# FIU Hub

A professional intelligence platform for Financial Intelligence Unit (FIU) members — combining LinkedIn-style social networking with AML/CFT tools, news aggregation, and real-time collaboration.

---

## Tech Stack

| Layer       | Technology                                     |
|-------------|------------------------------------------------|
| Backend     | Django 5 + DRF + Django Channels (ASGI)        |
| Database    | PostgreSQL 16 (full-text search with GIN index)|
| Cache/WS    | Redis 7 + channels-redis                       |
| Task Queue  | Celery 5 + django-celery-beat                  |
| Auth        | JWT (djangorestframework-simplejwt)            |
| Frontend    | React + Vite + TailwindCSS v3                  |
| State       | Zustand + @tanstack/react-query v5             |
| Editor      | Tiptap v2                                      |
| News        | NewsAPI.org                                    |
| Deployment  | Docker Compose → DigitalOcean VPS              |

---

## Features

- **Member Profiles** — custom user profiles with role, organisation, FATF region, expertise tags and verification badge
- **Social Feed** — rich-text posts (discussions, typologies, regulatory updates, case studies), likes, comments, bookmarks, follow/unfollow
- **AML/CFT News Feed** — auto-fetched from NewsAPI every 30 min, categorised (SANCTIONS / FATF / REGULATORY / CRYPTO_AML / ENFORCEMENT / TYPOLOGY)
- **Custom News Alerts** — members subscribe to keyword alerts; matching articles trigger in-app notifications
- **Typology Library** — community-curated ML/CFT typology cards with upvoting
- **Q&A Hub** — Stack Overflow-style questions and answers with accepted answers
- **Working Groups** — public and private groups for topic collaboration
- **Events** — AML/CFT conferences, training and webinars
- **Jurisdictions** — per-country FATF status, MER dates, legislation summaries
- **Real-time Notifications** — WebSocket push via Django Channels

---

## Quick Start (Docker)

### 1. Prerequisites
- Docker Desktop ≥ 24 + Docker Compose v2
- A free [NewsAPI.org](https://newsapi.org) API key

### 2. Configure environment
```bash
# The .env is pre-configured for Docker local dev.
# Add your NewsAPI key:
nano backend/.env   # set NEWS_API_KEY=xxxx
```

### 3. Start all services
```bash
docker compose up --build
```

This will:
- Start **PostgreSQL** on port 5432
- Start **Redis** on port 6379
- Run Django migrations and start **Daphne** on port 8000
- Start **Celery** worker + **Celery Beat** scheduler
- Start **Vite** dev server on port 5173

### 4. Create superuser
```bash
docker compose exec backend python manage.py createsuperuser
```

### 5. Open the app
| URL | Purpose |
|-----|---------|
| http://localhost:5173 | React frontend |
| http://localhost:8000/admin/ | Django admin |
| http://localhost:8000/api/docs/ | Swagger UI |

---

## Local Development (without Docker)

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Update .env: set DB_HOST=localhost, REDIS_URL=redis://localhost:6379/0
# Ensure PostgreSQL and Redis are running locally

python manage.py migrate
python manage.py createsuperuser
daphne -b 0.0.0.0 -p 8000 fiuhub.asgi:application
```

Start Celery (separate terminal):
```bash
celery -A fiuhub worker -l info
celery -A fiuhub beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
FIU hub/
├── backend/
│   ├── fiuhub/          # Django project (settings, urls, asgi, celery)
│   ├── accounts/        # Custom User, UserProfile, Follow
│   ├── posts/           # Posts, Likes, Comments, Bookmarks, Reports
│   ├── news/            # NewsArticle, AlertSubscription, Celery tasks
│   ├── alerts/          # Notification model, WebSocket consumer
│   ├── typologies/      # TypologyCard, TypologyVote
│   ├── qa/              # Question, Answer, AnswerVote
│   ├── groups/          # WorkingGroup, GroupMember
│   ├── events/          # Event
│   ├── jurisdictions/   # Country (FATF data)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
└── frontend/
    ├── src/
    │   ├── api/         # Axios client + endpoint functions
    │   ├── store/       # Zustand auth + notification stores
    │   ├── components/  # Navbar, Feed, PostCard, PostComposer, NewsCard…
    │   └── pages/       # Home, News, Profile, Typologies, Q&A, Groups…
    └── tailwind.config.js
```

---

## API Endpoints

Full interactive docs available at `/api/docs/` (Swagger) or `/api/redoc/`.

| Prefix | Description |
|--------|-------------|
| `/api/auth/` | Register, login, logout, JWT refresh, profile |
| `/api/members/` | Member list, profiles, follow/unfollow |
| `/api/posts/` | Feed, CRUD, likes, comments, bookmarks |
| `/api/news/` | Articles, save, alert subscriptions |
| `/api/alerts/` | In-app notifications |
| `/api/typologies/` | Typology library & voting |
| `/api/qa/` | Questions, answers, voting |
| `/api/groups/` | Working groups |
| `/api/events/` | Events |
| `/api/countries/` | Jurisdictions |

---

## Deployment (DigitalOcean VPS)

1. Provision a Droplet (Ubuntu 22.04, 4 GB RAM recommended)
2. Install Docker + Docker Compose
3. Clone the repo; set production values in `backend/.env`:
   - `DEBUG=False`
   - Strong random `SECRET_KEY`
   - `ALLOWED_HOSTS=yourdomain.com`
   - Real database credentials
   - `USE_SPACES=True` + Spaces credentials for media storage
4. Add an Nginx reverse proxy (port 80/443 → 8000)
5. `docker compose -f docker-compose.yml up -d --build`
