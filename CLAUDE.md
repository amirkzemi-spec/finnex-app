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

---

## Phase 3 — Auth & Admin (today)

### What was built

**finnex-app**
- lib/supabase.ts — Supabase client using @supabase/ssr (createBrowserClient)
- middleware.ts — protects /dashboard/* and /admin/* routes, redirects to /login if unauthenticated
- app/login/page.tsx — FINNEX-styled login, "Access is by invitation only", signInWithPassword, redirects to /dashboard
- app/admin/page.tsx — admin review panel: all projects with Approve/Reject buttons, status tabs (All/Pending/Approved/Rejected), Invite Investor section with magic link email
- app/api/admin/invite/route.ts — server-side invite using supabase.auth.admin.inviteUserByEmail + SUPABASE_SERVICE_ROLE_KEY
- dashboard updated to fetch ?status=approved only

### Environment variables added to Railway finnex-app
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

### Admin setup
- Admin user created in Supabase Auth: amir.k.zemi@gmail.com
- Role set via SQL: UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}' WHERE email = 'amir.k.zemi@gmail.com'
- Middleware checks user_metadata.role === "admin" for /admin routes

### Key fix
- @supabase/auth-helpers-nextjs createMiddlewareClient was deprecated — migrated to @supabase/ssr createServerClient

### What's working end to end
1. Farmer submits → API scores → Supabase stores (pending)
2. Admin logs in → /admin → reviews and approves project
3. Approved project appears on investor dashboard
4. Admin sends invite link to investor email
5. Investor clicks link → sets password → logs in → sees approved projects only
