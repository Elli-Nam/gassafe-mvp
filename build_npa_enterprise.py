from openai import OpenAI

client = OpenAI(
    base_url="https://inference.baseten.co/v1",
    api_key="YOUR_NEW_KEY_HERE"
)

prompt = """
Output ONLY React code, no explanation, no markdown, no ```, start with import React.
Create App.jsx for GasSafe NPA Enterprise National Dashboard PWA.

Header: GasSafe NPA Enterprise - PCB-GS-V2 Same PCB Different Load Cell - PWA READY. Static badge Tema Filling Plant GE-321-1234. Keep FULL vs EMPTY HOME vs COMM stats visible, no FIRE SMOKE HEAT in header.

Top KPIs 4 cards: TOTAL_EXCHANGES All regions, TOTAL_TODAY Today, HOME HOME cell 50kg, COMM COMM cell 150kg. No pricing note, no FREE 2 years, no SaaS.

Filters row: Region ALL dropdown with 16 Ghana regions Greater Accra Ashanti Western etc, District ALL dropdown Ga East Tema Metro etc, Search GE / serial / ORD input, Text Showing 3 logs last 90 from npaplus/dashboard.

Tabs - 4 tabs:
Tab 1 Exchange Log default: Table columns TIME, HOUSE + Ghana Digital Address, SCALE CHECK, OLD -> NEW SERIAL CRM, RIDER, VERIFIED, MAPS. Rows: TIME 05:40 PM 10/31/2024 HOUSE-GE-321-1234 GE-321-1234 HOME badge SCALE CHECK 26.5kg gross 14.5 tare +12 gas PASS green OLD NEW GH-H-OLD-88321 -> GH-H-NEW-45218 Sale PCB-GS-V2 RIDER-006 VERIFIED GhanaPost GPS + Google Maps Depot Filling Plant MAPS 5.6037 -0.1870 button. Row 04:34 PM HOUSE-GE-321-3345 GE-321-3345 COMM badge 87kg gross 52 tare +35 gas PASS GH-C-OLD-77201 -> GH-C-NEW-99382 RIDER-012. Row 03:38 PM HOUSE-GE-321-3345 32.5kg gross 19.5 tare +13 gas PASS GH-C-OLD -> GH-C-NEW.

Tab 2 Fraud & Safety: Table columns TIME, SERIAL, ISSUE, DETAIL, SEVERITY, ACTION. Issues: weight anomaly diff >0.5kg FAIL, duplicate serial, outside district, LEAK BURST isolated per GNFS SOP, trolley non-compliance for 52kg 87kg gross. Show red badges.

Tab 3 Depots & Plants: Table columns PLANT NAME, LOCATION GE- code, REGION, DISTRICT, FULL, EMPTY, READY, LEAK, LAST SYNC, ACTION MAPS. Rows: Tema Filling Plant GE-321-1234 Greater Accra Tema Metro FULL 50 EMPTY 50 READY 120 Last Sync 05:40 PM Maps 5.6037 -0.1870.

Tab 4 Analytics National: Cylinder Specs Same PCB Commercial needs trolley 2 persons. 4 cards: HOME 50kg cell 6 tare +6.5 gas =12.5 gross HOME badge, HOME 50kg cell 14.5 tare +12 gas =26.5 gross HOME badge, COMMERCIAL 150kg cell 19.9 tare +13 gas =32.5 gross COMM badge, COMMERCIAL 150kg cell 52 tare +35 gas =87 gross COMM badge. Note Commercial 19.5kg & 52kg tare needs trolley +2 persons per spec 19.5kg moved to commercial per spec.

Dark professional UI Tailwind CSS. No pricing, no SaaS wording, no extra explanation.
"""

response = client.chat.completions.create(
    model="meta-models/muse-spark-open-1026",
    messages=[{"role": "user", "content": prompt}]
)

with open("npa_enterprise.jsx", "w", encoding="utf-8") as f:
    f.write(response.choices[0].message.content)

print("Done! Check npa_enterprise.jsx")