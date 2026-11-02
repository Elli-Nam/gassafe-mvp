from openai import OpenAI

client = OpenAI(
    base_url="https://inference.baseten.co/v1",
    api_key="YOUR_NEW_KEY_HERE"
)

prompt = """
Create React App.jsx for GasSafe Depot Filling Station standalone PWA.
Header: GasSafe Depot / Filling Station - INVENTORY FULL vs EMPTY - EMPTY 50 READY 120 In-Filling 20 QUEUED HOME COMM FRAUD kept visible.
NO FIRE SMOKE HEAT in header. LEAK/BURST only as red status badge inside table, not header filters.
Specs: 4 FULL 2 EMPTY 4 HOME 4 COMM, PCB-GS-V2, Same PCB different load cell HOME 50kg cell 6kg=12.5kg gross 14.5kg=26.5kg 15kg vs COMM 150kg cell 19.5kg=32.5kg 35kg 45kg 50kg 52kg=87kg, 19.5kg moved HOME to COMM, trolley+2 officers per GNFS SOP.
Features: Rider List ACTIVE TODAY Kwame Asare RIDER-006 142 trips Abena 98 Kojo 76, Log Exchange Depot Form ORDER_ID ORD-789 RIDER_ID RIDER-006 OLD GH-H-OLD-88321 NEW GH-H-NEW-45210 GE-321-1234 LAT 5.6037 LNG -0.1870 API POST /api/exchange/log, Depot Inventory table Serial Scale HOME/COMM Status FULL/EMPTY/QUEUED Gross Location Depot-A/B PCB-GS-V2 Filling-Q rows GH-H-NEW-45210 HOME FULL 26.5kg.
Filters: District ⊂ Region ⊂ National 16 regions, Search GE-321-1234 GA-123-4567 NPA-CRM-GH-001 GC-12345, Maps button, gate pass QR 2 hours, collapsible Analytics TOTAL CYLINDERS 7/620 Active.
Dark professional pitching UI, PWA.
"""

response = client.chat.completions.create(
    model="meta-models/muse-spark-open-1026",
    messages=[{"role": "user", "content": prompt}]
)

with open("depot_code.jsx", "w", encoding="utf-8") as f:
    f.write(response.choices[0].message.content)

print("Done! Check depot_code.jsx")