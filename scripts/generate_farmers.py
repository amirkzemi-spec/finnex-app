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

WHAT IS FICTIONAL (clearly synthetic, not from any source):
- Individual farmer names (drawn from common regional first/last name
  pools, randomly combined — does not correspond to any real person)
- Exact GPS coordinates (randomized within real regional bounding boxes)
- Specific loan amounts, exact yields per individual farm, exact
  experience years (randomized within realistic ranges per source data)
- Cooperative/project names

USAGE:
  python3 generate_farmers.py --count 75 --api-url https://finnex-api-production.up.railway.app --dry-run
  python3 generate_farmers.py --count 75 --api-url https://finnex-api-production.up.railway.app
"""

import argparse
import random
import time
import requests

REGIONS = {
    "Kenya": {
        "crops": ["Maize", "Coffee", "Tea", "Beans"],
        "regions": ["Nakuru", "Kiambu", "Uasin Gishu", "Meru", "Kericho", "Bungoma"],
        "farm_size_range": (0.8, 4.5),
        "bbox": (-1.5, 1.5, 34.0, 39.0),
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
        "first_names": ["Okello", "Namutebi", "Ssemwogerere", "Nakato", "Mugisha",
                        "Atim", "Byaruhanga", "Nansubuga", "Wasswa", "Kyomugisha"],
        "last_names": ["Okello", "Ssempala", "Nakimuli", "Mugabi", "Atuhaire",
                       "Wabwire", "Nantongo", "Byamukama", "Lubega", "Ainebyoona"],
    },
}

COUNTRIES = list(REGIONS.keys())


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

    experience_years = random.randint(2, 22)
    is_cooperative = random.random() < 0.55
    has_certification = random.random() < 0.3
    has_offtake = random.random() < 0.45
    uses_irrigation = random.random() < 0.4
    has_loans = random.random() < 0.35
    good_repayment = random.random() < 0.7

    capital_requested = round(random.uniform(800, 1200) * farm_size, -1)

    project_name = f"{region} {crop} {'Cooperative' if is_cooperative else 'Smallholding'}"

    # loan_history maps to scorer's loan_history field via has_previous_loans
    if not has_loans:
        loan_history = "none"
    elif good_repayment:
        loan_history = "good_standing"
    else:
        loan_history = "defaulted"

    payload = {
        "project_name": project_name,
        "crop_type": crop,
        "country": country,
        "region": region,
        "gps_lat": lat,
        "gps_lng": lon,
        "land_area_ha": farm_size,
        "full_name": full_name,
        "experience_years": str(experience_years),
        "is_cooperative": is_cooperative,
        "certifications": ["organic"] if has_certification else [],
        "has_offtake_contract": "signed" if has_offtake else "none",
        "water_source": "irrigation" if uses_irrigation else "rain_fed",
        "has_previous_loans": loan_history,
        "capital_requested": capital_requested,
    }

    return payload


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
            print(f"[{i+1}/{args.count}] {payload['full_name']} — {payload['project_name']} ({country})")
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
