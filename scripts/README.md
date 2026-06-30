# scripts/

## generate_farmers.py

Generates **synthetic (fictional) farmer applications** for demo and testing purposes, and submits them through the real FINNEX API so they are scored by the production scoring engine — exactly as a genuine farmer submission would be.

### What this does

- Generates randomised farmer profiles grounded in real regional agricultural patterns (farm sizes, crop mixes, country/region combinations)
- Submits each profile to `POST /api/farmer/apply` — the same endpoint the public onboarding form uses
- Each submission is scored, stored in Supabase, and appears in the admin review queue as a `submitted` entry
- Approved entries surface in the investor dashboard

### Data disclaimer

**No real person's data is used.** Names, GPS coordinates, and specific figures are entirely fictional. The realism comes from aggregate regional statistics sourced from FAO, AGRA, and peer-reviewed research — all sources are documented in the script's module docstring.

### Usage

```bash
# Dry run — prints payloads without submitting
python3 scripts/generate_farmers.py --count 75 --api-url https://finnex-api-production.up.railway.app --dry-run

# Live run — submits to the real API
python3 scripts/generate_farmers.py --count 75 --api-url https://finnex-api-production.up.railway.app

# Options
#   --count     Number of applications to generate (default: 75)
#   --api-url   Base URL of the finnex-api (required)
#   --dry-run   Print payloads without submitting
#   --delay     Seconds between requests (default: 0.3)
```

### Dependencies

```bash
pip install requests
```
