# VidTrack - Content Creator Agency Platform

## Problem Statement
Web app for a content creator agency called VidTrack. Creators publish TikTok and Instagram video URLs for automatic tracking of views, likes, comments, and shares. Each creator has a dashboard with total metrics. Admins have full access to all creators' dashboards and data.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI (port 3000)
- **Backend**: FastAPI + Motor (async MongoDB driver) (port 8001)
- **Database**: MongoDB
- **Auth**: JWT with email/password, role-based (creator/admin)
- **Video Tracking**: Web scraping via httpx + BeautifulSoup (TikTok oembed API + page scraping, Instagram page scraping)

## User Personas
1. **Content Creator**: Registers, adds TikTok/Instagram video URLs, views personal dashboard with metrics
2. **Admin**: Views all creators, accesses each creator's dashboard, sees agency-wide stats and charts

## Core Requirements
- [x] JWT authentication with email/password
- [x] Role-based access (creator/admin)
- [x] Add video by URL (TikTok & Instagram only)
- [x] Automatic platform detection from URL
- [x] Video metric scraping (views, likes, comments, shares)
- [x] Creator dashboard with total stats
- [x] Video list with search and platform filters
- [x] Admin overview with agency-wide stats and charts
- [x] Admin creators list with drill-into-detail
- [x] Video CRUD (add, refresh, delete)
- [x] Dark modern minimalist UI theme

## What's Been Implemented (March 2026)
- Full auth system (register/login/logout) with JWT
- Creator dashboard with stats cards and video grid
- Add Video dialog with URL validation and platform detection
- Video cards with metrics, dropdown actions (refresh, delete, open original)
- Creator Videos page with search and platform filtering
- Admin Overview with pie chart (platform breakdown) and bar chart (top creators)
- Admin Creators list with stats table
- Admin Creator Detail page with videos
- Sidebar navigation for both roles
- Web scraping service for TikTok (oembed + page parsing) and Instagram (meta tags + JSON-LD)
- Responsive dark theme with Manrope/DM Sans fonts, glassmorphism, micro-animations

## Prioritized Backlog
### P0 (Critical)
- None remaining

### P1 (Important)
- Manual metric entry as fallback when scraping fails
- Scheduled periodic metric refresh (background job)
- Video metric history/trends over time

### P2 (Nice to have)
- Export reports (CSV/PDF)
- Creator rankings/leaderboards
- Email notifications for milestones
- Multi-language support
- Mobile-responsive sidebar (collapsible)

## Next Tasks
1. Add manual metric editing when scraping returns 0
2. Implement scheduled background job for periodic metric refreshing
3. Add metric history tracking with time-series charts
4. Mobile responsive sidebar improvements
