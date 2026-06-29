---

## Phase 2 — Investor Dashboard (today)

### What was built

**finnex-api**
- GET /api/projects endpoint in routers/projects.py
- Accepts optional query params: country, risk_band, crop_type
- Returns all fields from farmer_applications ordered by overall_score DESC
- Router registered in main.py under /api prefix

**finnex-app**
- app/dashboard/page.tsx — live investor dashboard
  - Fetches from /api/projects on load
  - Filter dropdowns built dynamically from live data
  - Project cards: name, country, crop, score, risk badge, 6 dimension bars
  - Colour coding: ≥70 green, ≥50 amber, <50 red
- app/dashboard/[id]/page.tsx — project detail page
  - Six-Dimension Assessment grid (D1–D6) with scores, bars, descriptions
  - Project Metadata key-value section
  - Back to dashboard navigation

### Phase 3 next
- Supabase Auth — investor registration and login
- Admin review panel — approve projects before they go public
- Role-based access — investors see only approved projects
