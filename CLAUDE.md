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

---

## Session 4 — Critical scoring engine bug fixes (today)

### What was discovered
While building a synthetic farmer data generator for demo purposes, a full field-by-field audit between the farmer onboarding form (finnex-app) and the scoring engine (finnex-api) revealed that the form and scorer had never been validated against each other. Real farmers have likely been receiving silently incorrect scores since Phase 1 launch.

### Root cause
The form sends human-readable string values (e.g. "yes_signed", "exporter", "5-10") but the scorer's lookup tables expected different string keys (e.g. "signed", "export", an integer). Any mismatch silently fell back to DEFAULT_MISSING_SCORE = 40 — treating real farmer answers as if they were never provided, with no error or warning.

### Bugs fixed (finnex-api)
1. experience_years crash — int("5-10") would throw a 500 error on any real submission. Now parses range strings to an integer midpoint.
2. has_offtake_contract — form values ("yes_signed", "yes_verbal", "in_negotiation", "no") now correctly map to scorer keys ("signed", "verbal", "mou", "none"). Affects Market dimension (weight 0.25).
3. has_previous_loans / loan_history — form values now map correctly; added "yes_ongoing" → neutral score instead of falling to default. Affects Finance dimension (weight 0.20).
4. buyer_type — "exporter" now maps to "export"; added "government" and "ngo" as legitimate scorer keys instead of defaulting to missing.
5. water_source — "rain" now maps to "rain_fed"; added "hybrid" as a scorer key.
6. repayment_plan — "post_harvest" now maps to "lump_sum".
7. pricing_model — added "floor" and "revenue_share" as scorer keys.
8. soil_type — added "volcanic" as a scorer key; "unknown" now explicitly scores as missing (honest, not penalised as error).
9. is_cooperative — fixed Optional[bool] coercion bug where "informal" caused a 422 validation error. Schema changed to Optional[str]; router normalises "yes"/"informal"/"no" to bool for the scorer.
10. status filter — was completely unwired; ?status=pending/approved/rejected was ignored and the endpoint always returned all rows. Now fixed. This likely caused the admin panel's tab counts to be wrong.

### Impact
A real farmer with a signed offtake contract, good loan repayment history, and an export buyer relationship was previously losing approximately 15–20 overall score points purely due to string mismatches — potentially being misclassified into a worse risk band than their actual profile warranted.

### Action needed
Any real (non-test) farmer submissions made before this fix should be considered to have unreliable scores and may need manual review or rescoring once a rescore utility exists.

### Demo data
A synthetic farmer generator was built at finnex-app/scripts/generate_farmers.py — generates fictional but regionally realistic farmer profiles (grounded in FAO/AGRA/IAEA public research, documented in script docstring) and submits them to the real API for scoring. Cooperative membership now correlates with stronger profiles across water_source, certifications, buyer_type, and offtake_contract odds, reflecting real-world patterns (collective bargaining, shared infrastructure costs). Current demo dataset: 75 synthetic farmers, distribution ~3% Low / 60% Medium / 37% High risk band, mean score 68.5.

### Open product question
How should the scoring engine handle genuinely missing data from real farmers (e.g. a farmer who doesn't know their "pricing model")? Currently most missing fields silently default to 40 (penalised as if risky). Three options considered: (1) make all scored fields required in the form, (2) neutral default + show data-completeness percentage to investors, (3) confidence/completeness score alongside risk score. Leaning toward option 3 for institutional credibility — not yet implemented.
