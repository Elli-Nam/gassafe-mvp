from openai import OpenAI

client = OpenAI(
    base_url="https://inference.baseten.co/v1",
    api_key="YOUR_NEW_KEY_HERE"
)

prompt = """
Output ONLY React code, no explanation, no markdown, no ```, start with import React.
Create App.jsx for GasSafe Filling Plant QC PWA - based on real dashboard photos.

Header: GasSafe Filling Plant - PCB-GS-V2 Same PCB Different Load Cell - GNFS SOP - PWA READY. Show static Plant Location badge: Tema Filling Plant - GE-321-1234 - Tema Metro, Greater Accra. Do NOT include NATIONAL / All Regions / All Districts filters.

Sections in order:
1. Cylinder Specs - Same PCB: Show 4 cards: HOME 50kg cell + HOME 6 tare + 6.5 gas = 12.5 gross kg HOME badge, HOME 50kg cell + HOME 14.5 tare + 12 gas = 26.5 gross kg HOME badge, COMMERCIAL 150kg cell + COMM 19.5 tare + 13 gas = 32.5 gross kg COMM badge, COMMERCIAL 150kg cell + COMM 52 tare + 35 gas = 87 gross kg COMM badge. Below show warning: Commercial 19.5kg & 52kg tare needs trolley + 2 persons per spec. 19.5kg moved to commercial per spec.

2. Safety Checklist - Valve / Leak / Visual: 3 checkboxes - Valve integrity no crack thread OK, Leak test soap/detector PASS, Visual no rust foot ring handle OK. Text: All checks must PASS before Confirm Fill & Sync to Depot+NPA.

3. Weight Verification Logic: Card on right with title Weight Verification Logic, text Input actual gross vs spec target. diff <=0.2kg -> PASS, <=0.5kg -> ADJUST, >0.5kg -> FAIL. Also note Commercial trolley warning auto-shown for COMM cylinder PCB note enforced.

4. Queue to Fill - Filling Plant - 2 queued: Table columns Serial/Type/Location, Target Gross, Actual Gross Input (input field), Result, Action. Rows: GH-H-OLD-88321 HOME Depot-B PCB-GS-V2 Target 12.5kg Actual input 12.5 kg, GH-C-OLD-77201 COMMERCIAL Depot-B PCB-GS-V2 Target 87kg Actual 87 kg Trolley + 2 persons required note, GH-H-OLD-88322 HOME Filling-Q PCB-GS-V2 Target 26.5kg, GH-C-OLD-77203 COMMERCIAL Filling-Q PCB-GS-V2 Target 32.5kg. Each row has button Confirm Fill & Sync that is disabled until all 3 safety checks PASS.

Dark professional UI, Tailwind CSS, interactive.

"""

response = client.chat.completions.create(
    model="meta-models/muse-spark-open-1026",
    messages=[{"role": "user", "content": prompt}]
)

with open("filling_plant_code_v2.jsx", "w", encoding="utf-8") as f:
    f.write(response.choices[0].message.content)

print("Done! Check filling_plant_code_v2.jsx")