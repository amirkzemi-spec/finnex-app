"""
FINNEX Synthetic Farmer Data Generator
========================================

Generates realistic SYNTHETIC (fictional) farmer applications grounded in
real regional agricultural patterns, then submits them through the live
FINNEX API (POST /api/farmer/apply) so they get scored by the actual
production scoring engine — same as a real submission would.

IMPORTANT — DATA PROVENANCE:
This script does NOT scrape, access, or reproduce any real individual
farmer's personal or financial data. All names, GPS coordinates, and
specific figures are fictional/randomly generated. The realism comes
from REGIONAL STATISTICAL PATTERNS sourced from public aggregate
research, listed below. No real person's data is used.

SOURCES USED FOR REALISM:
1. FAO — "Subnational distribution of average farm size and smallholder
   contributions to global food production"
   https://www.fao.org/family-farmtail/en/c/463373/
   -> Used for: typical farm size ranges (<2ha to ~5ha) by region

2. FAO — "Leaping & Learning" (smallholder farms in sub-Saharan Africa)
   https://www.fao.org/family-farming/detail/en/c/289255/
   -> Used for: ~33 million smallholder farms in SSA, 80% of all farms

3. AGRA — Africa Agriculture Status Report 2017
   https://agra.org/wp-content/uploads/2017/09/Final-AASR-2017-Aug-28.pdf
   -> Used for: average smallholder plot size (<2 ha)

4. Biology Insights — "Major Staple and Cash Crops in Africa"
   https://biologyinsights.com/major-staple-and-cash-crops-in-africa/
   -> Used for: crop-by-country mapping (coffee/tea Kenya, cocoa Ghana/
   Cote d'Ivoire, cassava West/Central Africa, maize East/Southern Africa)

5. FAO — "A review of cassava in Africa" (country case studies: Nigeria,
   Ghana, Tanzania, Uganda, Benin)
   https://www.fao.org/4/a0154e/a0154e02.htm
   -> Used for: cassava as dominant crop in Nigeria/Ghana, yield ranges

6. IAEA — cassava yields in Ghana (14-21 t/ha)
   https://www.iaea.org/newscenter/news/africas-major-crop
   -> Used for: realistic yield figures per crop

7. Wikipedia — Agriculture in Uganda (avg farm size 2.5 ha, crop mix)
   https://en.wikipedia.org/wiki/Agriculture_in_Uganda
   -> Used for: Uganda farm size and crop diversity baseline

8. Frontiers in Nutrition — maize farming in Ghana regions
   https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9437942/
   -> Used for: maize as ~31% of Ghana's food crop area

9. FAO — "Water for Sustainable Food and Agriculture"
   https://www.fao.org/3/i7959e/i7959e.pdf
   -> Used for: irrigation access rates in SSA (~5-10% of cultivated land
   is irrigated; borehole/river water common in highland Kenya/Tanzania)

10. IIED — "Soil health and smallholder farming" (working paper)
    -> Used for: typical soil type distribution — clay-loam dominant in
    highland East Africa, sandy/sandy-loam in drier savanna zones

11. CGIAR — "Smallholder market participation in sub-Saharan Africa"
    https://www.cgiar.org/
    -> Used for: buyer type distribution (70-80% sell to local/informal
    markets; ~15% to processors or cooperatives; export rare for unorganised)

12. IFC — "Agri-finance in Sub-Saharan Africa" (2022)
    -> Used for: ~35% of SSA smallholders have had formal credit; good
    repayment rates (~70%) among those with access; revenue-share and
    seasonal repayment preferred over monthly

WHAT IS FICTIONAL (clearly synthetic, not from any source):
- Individual farmer names (drawn from common regional first/last name
  pools, randomly combined — does not correspond to any real person)
- Exact GPS coordinates (randomized within real regional bounding boxes)
- Specific loan amounts, exact farm figures, exact experience years
  (randomized within realistic ranges per source data above)
- Cooperative/project names

KNOWN SCORER LIMITATION:
  The API router (routers/apply.py) hardcodes years_experience=None when
  mapping ScoreRequest -> FarmerApplication, so experience_years is stored
  in the database but does NOT affect the scoring output. The field is still
  sent to populate the DB record accurately.

USAGE:
  python3 generate_farmers.py --count 75 --api-url https://finnex-api-production.up.railway.app --dry-run
  python3 generate_farmers.py --count 75 --api-url https://finnex-api-production.up.railway.app
"""

import argparse
import random
import time
import requests

# ── Regional profiles ─────────────────────────────────────────────────────────

REGIONS = {
    "Kenya": {
        "crops": ["Maize", "Coffee", "Tea", "Beans"],
        "regions": ["Nakuru", "Kiambu", "Uasin Gishu", "Meru", "Kericho", "Bungoma"],
        "farm_size_range": (0.8, 4.5),
        "bbox": (-1.5, 1.5, 34.0, 39.0),
        # Highland Kenya: loam/clay-loam dominant (volcanic soils); some sandy-loam in drier zones
        "soil_weights": ["loam", "loam", "clay_loam", "clay_loam", "sandy_loam"],
        # ~30% irrigated (borehole/river common in highland; drip growing in horticulture zones)
        "water_weights": ["rain_fed", "rain_fed", "rain_fed", "rain_fed", "borehole", "river", "irrigation"],
        "first_names": ["Wanjiru", "Kamau", "Achieng", "Otieno", "Njoroge", "Wambui",
                        "Mwangi", "Akinyi", "Kiprotich", "Chebet"],
        "last_names": ["Mwangi", "Otieno", "Kamau", "Njoroge", "Kiprono", "Wanjiku",
                       "Korir", "Kipchoge", "Wairimu", "Omondi"],
    },
    "Nigeria": {
        "crops": ["Cassava", "Maize", "Rice", "Yam"],
        "regions": ["Oyo", "Kaduna", "Benue", "Ogun", "Kano", "Enugu"],
        "farm_size_range": (1.0, 5.0),
        "bbox": (6.0, 11.5, 3.0, 9.0),
        # Nigeria: sandy-loam in northern savanna (Kano/Kaduna); clay/clay-loam in south (Benue/Enugu)
        "soil_weights": ["sandy_loam", "sandy_loam", "clay", "clay_loam", "sandy", "clay_loam"],
        # Very low irrigation penetration (~3-5% of farms); mostly rain-fed
        "water_weights": ["rain_fed", "rain_fed", "rain_fed", "rain_fed", "rain_fed", "river", "irrigation"],
        "first_names": ["Chinedu", "Aisha", "Emeka", "Fatima", "Adaeze", "Ibrahim",
                        "Ngozi", "Yusuf", "Oluwaseun", "Hauwa"],
        "last_names": ["Okafor", "Bello", "Eze", "Mohammed", "Adeyemi", "Abubakar",
                       "Nwosu", "Aliyu", "Okonkwo", "Suleiman"],
    },
    "Ghana": {
        "crops": ["Cassava", "Cocoa", "Maize", "Plantain"],
        "regions": ["Ashanti", "Eastern", "Brong-Ahafo", "Volta", "Central"],
        "farm_size_range": (1.0, 4.0),
        "bbox": (5.0, 9.5, -2.5, 0.5),
        # Forest-zone soils: clay-loam and sandy-loam common; loam in Ashanti forest fringe
        "soil_weights": ["clay_loam", "clay_loam", "sandy_loam", "loam", "clay"],
        "water_weights": ["rain_fed", "rain_fed", "rain_fed", "rain_fed", "river", "irrigation"],
        "first_names": ["Kwame", "Akosua", "Kofi", "Ama", "Yaw", "Abena",
                        "Kwabena", "Adwoa", "Kojo", "Efua"],
        "last_names": ["Boateng", "Mensah", "Owusu", "Asante", "Appiah", "Darko",
                       "Agyeman", "Antwi", "Nkrumah", "Osei"],
    },
    "Tanzania": {
        "crops": ["Maize", "Cassava", "Coffee", "Beans"],
        "regions": ["Mbeya", "Iringa", "Morogoro", "Arusha", "Kilimanjaro"],
        "farm_size_range": (1.0, 4.5),
        "bbox": (-9.5, -2.5, 30.0, 38.0),
        # Southern highlands (Mbeya/Iringa): loam dominant; Arusha/Kili: clay-loam volcanic
        "soil_weights": ["loam", "loam", "clay_loam", "clay_loam", "sandy_loam"],
        # Kilimanjaro/Arusha have gravity-fed irrigation; most areas rain-fed
        "water_weights": ["rain_fed", "rain_fed", "rain_fed", "river", "borehole", "irrigation"],
        "first_names": ["Juma", "Amina", "Hassan", "Halima", "Mussa", "Zainabu",
                        "Athumani", "Fatuma", "Saidi", "Rehema"],
        "last_names": ["Mwakasege", "Kileo", "Mushi", "Nyangoma", "Lupembe",
                       "Kimaro", "Mbwana", "Senzighe", "Mhando", "Sanga"],
    },
    "Uganda": {
        "crops": ["Cassava", "Maize", "Coffee", "Beans"],
        "regions": ["Mbale", "Mukono", "Mbarara", "Gulu", "Masaka"],
        "farm_size_range": (1.0, 3.5),
        "bbox": (-1.0, 3.5, 29.5, 34.5),
        # Uganda: fertile volcanic clay-loam; Mbarara/Masaka have loam; Gulu more sandy-loam
        "soil_weights": ["clay_loam", "clay_loam", "loam", "loam", "sandy_loam"],
        "water_weights": ["rain_fed", "rain_fed", "rain_fed", "rain_fed", "river", "borehole"],
        "first_names": ["Okello", "Namutebi", "Ssemwogerere", "Nakato", "Mugisha",
                        "Atim", "Byaruhanga", "Nansubuga", "Wasswa", "Kyomugisha"],
        "last_names": ["Okello", "Ssempala", "Nakimuli", "Mugabi", "Atuhaire",
                       "Wabwire", "Nantongo", "Byamukama", "Lubega", "Ainebyoona"],
    },
}

COUNTRIES = list(REGIONS.keys())

# Buyer type by crop: export crops (coffee/tea/cocoa) access processors and exporters;
# staple crops (cassava/maize/yam/rice) mostly sold locally or through aggregators.
CROP_BUYER_PROFILES = {
    "Coffee":   ["export", "export", "processor", "processor", "cooperative", "aggregator"],
    "Tea":      ["export", "export", "processor", "processor", "cooperative"],
    "Cocoa":    ["export", "processor", "processor", "cooperative", "aggregator"],
    "Maize":    ["local_market", "local_market", "aggregator", "cooperative", "processor"],
    "Cassava":  ["local_market", "local_market", "local_market", "aggregator", "direct_consumer"],
    "Rice":     ["local_market", "local_market", "aggregator", "processor", "cooperative"],
    "Yam":      ["local_market", "local_market", "direct_consumer", "aggregator"],
    "Beans":    ["local_market", "local_market", "cooperative", "aggregator"],
    "Plantain": ["local_market", "local_market", "direct_consumer", "aggregator"],
}

# Certifications relevant to each crop (each has a non-trivial probability)
CROP_CERT_PROFILES = {
    "Coffee":   ["organic", "fairtrade", "rainforest", "globalgap"],
    "Tea":      ["organic", "fairtrade", "rainforest"],
    "Cocoa":    ["organic", "fairtrade", "rainforest"],
    "Maize":    ["organic", "globalgap"],
    "Cassava":  ["organic"],
    "Rice":     ["organic", "fairtrade"],
    "Yam":      ["organic"],
    "Beans":    ["organic", "fairtrade"],
    "Plantain": ["organic", "rainforest"],
}

# Crops that are food-security staples per STAPLE_CROPS in scorer config
STAPLE_CROPS = {"maize", "rice", "cassava", "yam", "beans", "sorghum", "millet", "wheat"}

# Jobs-per-ha ranges by crop (labour intensity varies: coffee/cocoa are high-labour;
# maize/cassava are lower with some mechanisation at smallholder scale)
CROP_JOBS_PER_HA = {
    "Coffee":   (2.0, 5.5),
    "Tea":      (3.0, 6.0),
    "Cocoa":    (1.5, 4.0),
    "Maize":    (0.5, 2.0),
    "Cassava":  (0.5, 1.5),
    "Rice":     (1.0, 3.0),
    "Yam":      (1.0, 3.0),
    "Beans":    (0.5, 2.0),
    "Plantain": (1.0, 2.5),
}


# ── Generator ─────────────────────────────────────────────────────────────────

def random_gps(bbox):
    lat_min, lat_max, lon_min, lon_max = bbox
    lat = round(random.uniform(lat_min, lat_max), 4)
    lon = round(random.uniform(lon_min, lon_max), 4)
    return lat, lon


def generate_farmer(country):
    cfg = REGIONS[country]
    crop = random.choice(cfg["crops"])
    region = random.choice(cfg["regions"])
    farm_size = round(random.uniform(*cfg["farm_size_range"]), 1)
    lat, lon = random_gps(cfg["bbox"])
    first = random.choice(cfg["first_names"])
    last = random.choice(cfg["last_names"])
    full_name = f"{first} {last}"

    # ── Operator ──────────────────────────────────────────────────────────────
    experience_years = random.randint(2, 22)
    is_cooperative = random.random() < 0.55
    farmer_count = random.randint(12, 95) if is_cooperative else None

    # Certifications: export crops have higher cert rates (~35%); staple crops lower (~12%)
    crop_certs = CROP_CERT_PROFILES.get(crop, ["organic"])
    is_export_crop = crop.lower() in {"coffee", "tea", "cocoa"}
    cert_probability = 0.35 if is_export_crop else 0.12
    if random.random() < cert_probability:
        # pick 1–2 certs from the crop-appropriate pool
        n_certs = random.randint(1, min(2, len(crop_certs)))
        certifications = random.sample(crop_certs, n_certs)
    else:
        certifications = []

    # ── Agronomy ──────────────────────────────────────────────────────────────
    water_source = random.choice(cfg["water_weights"])
    soil_type = random.choice(cfg["soil_weights"])

    # ── Market ────────────────────────────────────────────────────────────────
    buyer_type = random.choice(CROP_BUYER_PROFILES.get(crop, ["local_market"]))

    # Offtake: export/processor buyers more likely to have contracts;
    # local/informal markets rarely do
    if buyer_type in ("export", "processor"):
        offtake = random.choices(["signed", "mou", "verbal", "none"], weights=[40, 25, 20, 15])[0]
    elif buyer_type in ("cooperative", "aggregator"):
        offtake = random.choices(["signed", "mou", "verbal", "none"], weights=[20, 20, 25, 35])[0]
    else:
        offtake = random.choices(["verbal", "none", "none"], weights=[25, 60, 15])[0]

    # Pricing: fixed/index-linked for export; spot for local/informal
    if buyer_type in ("export", "processor"):
        pricing_model = random.choices(["fixed", "index_linked", "spot"], weights=[55, 30, 15])[0]
    elif buyer_type in ("cooperative", "aggregator"):
        pricing_model = random.choices(["fixed", "index_linked", "spot"], weights=[35, 35, 30])[0]
    else:
        pricing_model = random.choices(["spot", "fixed", "index_linked"], weights=[60, 25, 15])[0]

    # ── Finance ───────────────────────────────────────────────────────────────
    capital_requested = round(random.uniform(800, 1200) * farm_size, -1)

    # Repayment: cooperatives and export-crop farmers more likely to accept
    # revenue-share or milestone plans; staple crop smallholders prefer monthly/quarterly
    if is_cooperative or is_export_crop:
        repayment_plan = random.choices(
            ["revenue_share", "milestone", "quarterly", "monthly"],
            weights=[35, 20, 25, 20]
        )[0]
    else:
        repayment_plan = random.choices(
            ["monthly", "quarterly", "revenue_share", "annual", "lump_sum"],
            weights=[30, 30, 20, 15, 5]
        )[0]

    # Loan history: ~35% have had a formal loan; of those ~70% good standing
    has_loans = random.random() < 0.35
    if not has_loans:
        loan_history = "none"
    elif random.random() < 0.70:
        loan_history = "good_standing"
    elif random.random() < 0.60:
        loan_history = "partial"
    else:
        loan_history = "defaulted"

    # ── Monitoring ────────────────────────────────────────────────────────────
    # SSA smallholders: field_agent most common; self_report for informal;
    # satellite growing in organised cooperatives/export chains; IoT very rare
    if is_cooperative and is_export_crop:
        monitoring_method = random.choices(
            ["field_agent", "satellite", "hybrid", "self_report", "iot"],
            weights=[40, 25, 15, 15, 5]
        )[0]
    elif is_cooperative:
        monitoring_method = random.choices(
            ["field_agent", "self_report", "satellite", "hybrid"],
            weights=[50, 25, 15, 10]
        )[0]
    else:
        monitoring_method = random.choices(
            ["self_report", "field_agent", "satellite"],
            weights=[55, 35, 10]
        )[0]

    # Frequency aligns with method capability
    if monitoring_method in ("iot", "satellite", "hybrid"):
        monitoring_frequency = random.choices(
            ["realtime", "weekly", "monthly"], weights=[30, 45, 25]
        )[0]
    elif monitoring_method == "field_agent":
        monitoring_frequency = random.choices(
            ["weekly", "monthly", "quarterly"], weights=[20, 55, 25]
        )[0]
    else:
        monitoring_frequency = random.choices(
            ["monthly", "quarterly", "annual"], weights=[35, 45, 20]
        )[0]

    # ── Impact ────────────────────────────────────────────────────────────────
    jobs_min, jobs_max = CROP_JOBS_PER_HA.get(crop, (0.5, 2.0))
    jobs_per_ha = random.uniform(jobs_min, jobs_max)
    jobs_created = max(1, round(farm_size * jobs_per_ha))

    # climate_certified is True if any cert signals climate intent (organic/rainforest/fairtrade)
    # The scorer also checks certifications[] directly, so this is additive for explicit flag
    climate_certs = {"organic", "rainforest", "fairtrade"}
    has_climate_signal = bool(set(certifications) & climate_certs)
    climate_certified = has_climate_signal or (random.random() < 0.08)

    # food_security_crop: explicit for staples; False for export crops
    is_staple = crop.lower() in STAPLE_CROPS
    food_security_crop = True if is_staple else False

    # ── Assemble payload ──────────────────────────────────────────────────────
    project_name = f"{region} {crop} {'Cooperative' if is_cooperative else 'Smallholding'}"

    payload = {
        # Farm basics
        "project_name":     project_name,
        "crop_type":        crop,
        "country":          country,
        "region":           region,
        "gps_lat":          lat,
        "gps_lng":          lon,
        "land_area_ha":     farm_size,
        # Operator
        "full_name":        full_name,
        "experience_years": str(experience_years),  # stored in DB; not scored (router bug)
        "is_cooperative":   is_cooperative,
        "farmer_count":     farmer_count,
        "certifications":   certifications,
        # Agronomy
        "water_source":     water_source,
        "soil_type":        soil_type,
        # Market
        "buyer_type":       buyer_type,
        "has_offtake_contract": offtake,
        "pricing_model":    pricing_model,
        # Finance
        "capital_requested":  capital_requested,
        "repayment_plan":     repayment_plan,
        "has_previous_loans": loan_history,
        # Monitoring
        "monitoring_method":    monitoring_method,
        "monitoring_frequency": monitoring_frequency,
        # Impact
        "jobs_created":       jobs_created,
        "climate_certified":  climate_certified,
        "food_security_crop": food_security_crop,
    }

    return payload


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic FINNEX farmer applications")
    parser.add_argument("--count", type=int, default=75, help="Number of farmers to generate")
    parser.add_argument("--api-url", type=str, required=True, help="Base URL of finnex-api")
    parser.add_argument("--dry-run", action="store_true", help="Print payloads without submitting")
    parser.add_argument("--delay", type=float, default=0.3, help="Seconds between requests")
    args = parser.parse_args()

    endpoint = f"{args.api_url.rstrip('/')}/api/farmer/apply"

    success = 0
    failed = 0

    for i in range(args.count):
        country = random.choice(COUNTRIES)
        payload = generate_farmer(country)

        if args.dry_run:
            certs = ", ".join(payload["certifications"]) or "none"
            print(
                f"[{i+1}/{args.count}] {payload['full_name']:25s} {country:10s} "
                f"{payload['crop_type']:8s} buyer={payload['buyer_type']:14s} "
                f"offtake={payload['has_offtake_contract']:6s} soil={payload['soil_type']:9s} "
                f"monitor={payload['monitoring_method']:10s} certs=[{certs}]"
            )
            continue

        try:
            resp = requests.post(endpoint, json=payload, timeout=15)
            if resp.status_code in (200, 201):
                data = resp.json()
                score = data.get("overall_score", "?")
                band = data.get("risk_band", "?")
                print(f"[{i+1}/{args.count}] OK  {payload['full_name']:25s} {country:10s} "
                      f"score={score} band={band}")
                success += 1
            else:
                print(f"[{i+1}/{args.count}] FAIL ({resp.status_code}) {payload['full_name']} "
                      f"— {resp.text[:200]}")
                failed += 1
        except Exception as e:
            print(f"[{i+1}/{args.count}] ERROR {payload['full_name']} — {e}")
            failed += 1

        time.sleep(args.delay)

    if not args.dry_run:
        print(f"\nDone. {success} submitted successfully, {failed} failed.")


if __name__ == "__main__":
    main()
