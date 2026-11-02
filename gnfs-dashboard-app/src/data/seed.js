/* GNFS demo twin — deterministic seed: 20 LIVE pending + 90 history.
 * District ⊂ Region ⊂ National. National = Ghana (16 regions).
 * Every cylinder enforces: serial == footRingSerial == qrSerial (else fraud). */

export const NATIONAL = "Ghana";

export const REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Northern",
  "Upper East", "Upper West", "Volta", "Bono", "Bono East", "Ahafo",
  "Savannah", "North East", "Oti", "Western North",
];

export const DISTRICTS = {
  "Greater Accra": ["East Legon Hills", "Abossey", "Community 20", "Tema Metro", "Ga East"],
  Ashanti: ["Kumasi Metro", "Oforikrom", "Ejisu"],
  Western: ["Sekondi-Takoradi", "Tarkwa", "Nzema East"],
  Eastern: ["Koforidua", "Akim Oda", "Mpraeso"],
  Central: ["Cape Coast", "Winneba", "Agona"],
  Northern: ["Tamale Metro", "Yendi", "Savelugu"],
  "Upper East": ["Bolgatanga", "Bawku", "Navrongo"],
  "Upper West": ["Wa Municipal", "Jirapa", "Lawra"],
  Volta: ["Ho Municipal", "Keta", "Kpando"],
  Bono: ["Sunyani Municipal", "Berekum", "Dormaa"],
  "Bono East": ["Techiman", "Kintampo", "Nkoranza"],
  Ahafo: ["Goaso", "Bechem", "Kenyasi"],
  Savannah: ["Damongo", "Bole", "Sawla"],
  "North East": ["Nalerigu", "Walewale", "Gambaga"],
  Oti: ["Dambai", "Jasikan", "Kadjebi"],
  "Western North": ["Sefwi Wiawso", "Bibiani", "Juaboso"],
};

export const ALL_DISTRICTS = Object.entries(DISTRICTS).flatMap(([region, ds]) =>
  ds.map((d) => ({ district: d, region }))
);

export const OFFICERS = [
  { id: "GNFS-014", name: "A. Mensah", rank: "Leading Fireman", phone: "+233 24 000 1014", station: "East Legon Hills" },
  { id: "GNFS-022", name: "K. Owusu", rank: "Fireman", phone: "+233 24 000 1022", station: "Abossey" },
  { id: "GNFS-031", name: "E. Adjei", rank: "Sub Officer", phone: "+233 24 000 1031", station: "Community 20" },
  { id: "GNFS-045", name: "Y. Fuseini", rank: "Fireman", phone: "+233 24 000 1045", station: "Tema Metro" },
  { id: "GNFS-058", name: "R. Akoto", rank: "Leading Fireman", phone: "+233 24 000 1058", station: "Kumasi Metro" },
  { id: "GNFS-063", name: "D. Quartey", rank: "Firewoman", phone: "+233 24 000 1063", station: "East Legon Hills" },
];

const H = (o) => ({
  national: NATIONAL,
  status: "PENDING",
  dispatch: null,
  gateway: { wifi: "CONNECTED", cellular: "CONNECTED", lora: "LINKED", twin: "SYNCED", sim: "MTN" },
  photoProof: "combined-frame-required",
  oldSerial: "",
  ...o,
});

// Hand-pinned rows mirroring the field videos.
const LIVE_PINNED = [
  H({ id: "LV-001", minutesAgo: 5, priority: "P1", sensor: "LEAK", unit: "A12", household: "Kwame Asante Family", digitalAddress: "GE-321-1234", npaCode: "NPA-CRM-GH-00001", serial: "NPA-CRM-GH-00001", footRingSerial: "NPA-CRM-GH-00001", qrSerial: "NPA-CRM-GH-00001", district: "East Legon Hills", region: "Greater Accra", lat: 5.85, lng: -0.196, sizeKg: 6, category: "HOME", cell: "50kg", tare: 6.5, gross: 9.1, gasPpm: 1450, smokePpm: 40, tempC: 34, flame: false, flameOn: false, burst: false, reading: "LEAK detected gas_ppm=1450", floorBattery: 82, floorVolt: 3.9, floorRssi: -71, floorTemp: 34, ceilingSmoke: 40, ceilingGas: 1450, kitchenTemp: 34, heatThreshold: 70, pir: "no motion", pirMinAgo: 42, wifiRssi: -58, heartbeatMinAgo: 1, buzzer: "alarming", backupBatt: 96, avgDaily: 0.45, calibr: "2026-09-14", lastSeenMinAgo: 1 }),
  H({ id: "LV-002", minutesAgo: 8, priority: "P1", sensor: "BURST", unit: "B02", household: "Ama Serwaa Household", digitalAddress: "GE-321-1182", npaCode: "NPA-CRM-GH-00002", serial: "NPA-CRM-GH-00002", footRingSerial: "NPA-CRM-GH-00002", qrSerial: "NPA-CRM-GH-00002", district: "East Legon Hills", region: "Greater Accra", lat: 5.852, lng: -0.198, sizeKg: 19.5, category: "COMMERCIAL", cell: "150kg", tare: 13.0, gross: 32.5, gasPpm: 2100, smokePpm: 120, tempC: 41, flame: false, flameOn: false, burst: true, reading: "BURST pipe continuous leak needs trolley + 2 officers", floorBattery: 91, floorVolt: 4.0, floorRssi: -68, floorTemp: 41, ceilingSmoke: 120, ceilingGas: 2100, kitchenTemp: 41, heatThreshold: 70, pir: "motion", pirMinAgo: 2, wifiRssi: -61, heartbeatMinAgo: 1, buzzer: "alarming", backupBatt: 98, avgDaily: 1.6, calibr: "2026-09-20", lastSeenMinAgo: 0 }),
  H({ id: "LV-003", minutesAgo: 12, priority: "P1", sensor: "FIRE", unit: "A10", household: "Owusu Family", digitalAddress: "GA-123-4567", npaCode: "GC-12345", serial: "GC-12345", footRingSerial: "GC-12345", qrSerial: "GC-12345", district: "Abossey", region: "Greater Accra", lat: 5.845, lng: -0.21, sizeKg: 14.5, category: "HOME", cell: "50kg", tare: 12.0, gross: 22.4, gasPpm: 900, smokePpm: 610, tempC: 88, flame: true, flameOn: true, burst: false, reading: "FIRE confirmed flame sensor active", floorBattery: 88, floorVolt: 3.95, floorRssi: -73, floorTemp: 88, ceilingSmoke: 610, ceilingGas: 900, kitchenTemp: 88, heatThreshold: 70, pir: "motion", pirMinAgo: 1, wifiRssi: -55, heartbeatMinAgo: 0, buzzer: "alarming", backupBatt: 93, avgDaily: 0.6, calibr: "2026-08-30", lastSeenMinAgo: 0, oldSerial: "GC-12345" }),
  H({ id: "LV-004", minutesAgo: 15, priority: "P1", sensor: "HEAT", unit: "A15", household: "Boateng Household", digitalAddress: "GE-321-1400", npaCode: "NPA-CRM-GH-00004", serial: "NPA-CRM-GH-00004", footRingSerial: "NPA-CRM-GH-00004", qrSerial: "NPA-CRM-GH-00004", district: "East Legon Hills", region: "Greater Accra", lat: 5.851, lng: -0.195, sizeKg: 15, category: "HOME", cell: "50kg", tare: 12.5, gross: 24.0, gasPpm: 320, smokePpm: 90, tempC: 78, flame: false, flameOn: false, burst: false, reading: "HEAT temp=78C cylinder", floorBattery: 79, floorVolt: 3.85, floorRssi: -75, floorTemp: 78, ceilingSmoke: 90, ceilingGas: 320, kitchenTemp: 78, heatThreshold: 70, pir: "no motion", pirMinAgo: 55, wifiRssi: -66, heartbeatMinAgo: 2, buzzer: "idle", backupBatt: 90, avgDaily: 0.5, calibr: "2026-09-02", lastSeenMinAgo: 2 }),
  H({ id: "LV-005", minutesAgo: 18, priority: "P2", sensor: "SMOKE", unit: "D04", household: "Abossey Estate D04", digitalAddress: "GA-123-4521", npaCode: "GC-23456", serial: "GC-23456", footRingSerial: "GC-23456", qrSerial: "GC-23456", district: "Abossey", region: "Greater Accra", lat: 5.84, lng: -0.212, sizeKg: 12.5, category: "HOME", cell: "50kg", tare: 11.5, gross: 18.2, gasPpm: 410, smokePpm: 300, tempC: 52, flame: true, flameOn: true, burst: false, reading: "SMOKE detected smoke_ppm=300", floorBattery: 94, floorVolt: 4.05, floorRssi: -69, floorTemp: 52, ceilingSmoke: 300, ceilingGas: 410, kitchenTemp: 52, heatThreshold: 70, pir: "motion", pirMinAgo: 4, wifiRssi: -60, heartbeatMinAgo: 1, buzzer: "idle", backupBatt: 97, avgDaily: 0.55, calibr: "2026-09-11", lastSeenMinAgo: 1, oldSerial: "GC-23456" }),
  H({ id: "LV-006", minutesAgo: 20, priority: "P1", sensor: "LEAK", unit: "C06", household: "Mensah Chop Bar", digitalAddress: "GE-321-2006", npaCode: "NPA-CRM-GH-00006", serial: "NPA-CRM-GH-00006", footRingSerial: "NPA-CRM-GH-00006", qrSerial: "NPA-CRM-GH-00006", district: "Community 20", region: "Greater Accra", lat: 5.848, lng: -0.19, sizeKg: 52, category: "COMMERCIAL", cell: "150kg", tare: 35.0, gross: 87.0, gasPpm: 1650, smokePpm: 60, tempC: 36, flame: false, flameOn: false, burst: false, reading: "LEAK detected gas_ppm=1650 · 52kg=87kg gross", floorBattery: 87, floorVolt: 3.92, floorRssi: -70, floorTemp: 36, ceilingSmoke: 60, ceilingGas: 1650, kitchenTemp: 36, heatThreshold: 70, pir: "motion", pirMinAgo: 6, wifiRssi: -62, heartbeatMinAgo: 1, buzzer: "alarming", backupBatt: 95, avgDaily: 2.4, calibr: "2026-09-18", lastSeenMinAgo: 1 }),
  H({ id: "LV-007", minutesAgo: 22, priority: "P2", sensor: "COOK", unit: "C08", household: "Danso Family", digitalAddress: "GE-321-1190", npaCode: "NPA-CRM-GH-00007", serial: "NPA-CRM-GH-00007", footRingSerial: "NPA-CRM-GH-00007", qrSerial: "NPA-CRM-GH-00007", district: "Community 20", region: "Greater Accra", lat: 5.849, lng: -0.191, sizeKg: 6, category: "HOME", cell: "50kg", tare: 6.5, gross: 11.8, gasPpm: 120, smokePpm: 80, tempC: 70, flame: true, flameOn: true, burst: false, flameMin: 38, reading: "COOK flame + temp 70C · left-on 38 min, no PIR", floorBattery: 90, floorVolt: 4.0, floorRssi: -72, floorTemp: 70, ceilingSmoke: 80, ceilingGas: 120, kitchenTemp: 70, heatThreshold: 70, pir: "no motion", pirMinAgo: 38, wifiRssi: -59, heartbeatMinAgo: 2, buzzer: "alarming", backupBatt: 94, avgDaily: 0.4, calibr: "2026-09-05", lastSeenMinAgo: 2 }),
  H({ id: "LV-008", minutesAgo: 25, priority: "P1", sensor: "LEAK", unit: "E11", household: "Kumasi Eatery", digitalAddress: "AK-044-8812", npaCode: "NPA-CRM-GH-00008", serial: "NPA-CRM-GH-00008", footRingSerial: "NPA-CRM-GH-00008", qrSerial: "NPA-CRM-GH-00099", district: "Kumasi Metro", region: "Ashanti", lat: 6.69, lng: -1.62, sizeKg: 19, category: "COMMERCIAL", cell: "150kg", tare: 12.5, gross: 28.0, gasPpm: 1520, smokePpm: 55, tempC: 35, flame: false, flameOn: false, burst: false, reading: "LEAK detected gas_ppm=1520 · 19kg Commercial", floorBattery: 84, floorVolt: 3.88, floorRssi: -74, floorTemp: 35, ceilingSmoke: 55, ceilingGas: 1520, kitchenTemp: 35, heatThreshold: 70, pir: "motion", pirMinAgo: 3, wifiRssi: -64, heartbeatMinAgo: 3, buzzer: "alarming", backupBatt: 89, avgDaily: 1.8, calibr: "2026-08-22", lastSeenMinAgo: 3, gateway: { wifi: "CONNECTED", cellular: "CONNECTED", lora: "LINKED", twin: "SYNCED", sim: "Telecel" } }),
  H({ id: "LV-009", minutesAgo: 27, priority: "P2", sensor: "SMOKE", unit: "B07", household: "Adu Household", digitalAddress: "GE-321-1301", npaCode: "NPA-CRM-GH-00009", serial: "NPA-CRM-GH-00009", footRingSerial: "NPA-CRM-GH-00009", qrSerial: "NPA-CRM-GH-00009", district: "East Legon Hills", region: "Greater Accra", lat: 5.853, lng: -0.197, sizeKg: 5, category: "HOME", cell: "50kg", tare: 5.3, gross: 8.4, gasPpm: 300, smokePpm: 340, tempC: 48, flame: true, flameOn: true, burst: false, reading: "Food burning! smoke rising + flame ON", floorBattery: 93, floorVolt: 4.02, floorRssi: -66, floorTemp: 48, ceilingSmoke: 340, ceilingGas: 300, kitchenTemp: 48, heatThreshold: 70, pir: "motion", pirMinAgo: 2, wifiRssi: -57, heartbeatMinAgo: 1, buzzer: "alarming", backupBatt: 99, avgDaily: 0.35, calibr: "2026-09-25", lastSeenMinAgo: 1 }),
  H({ id: "LV-010", minutesAgo: 31, priority: "P2", sensor: "HEAT", unit: "F03", household: "Takoradi Canteen", digitalAddress: "WS-114-0207", npaCode: "NPA-CRM-GH-00010", serial: "NPA-CRM-GH-00010", footRingSerial: "NPA-CRM-GH-00010", qrSerial: "NPA-CRM-GH-00010", district: "Sekondi-Takoradi", region: "Western", lat: 4.9, lng: -1.76, sizeKg: 35, category: "COMMERCIAL", cell: "150kg", tare: 25.0, gross: 52.0, gasPpm: 500, smokePpm: 110, tempC: 74, flame: false, flameOn: false, burst: false, reading: "HEAT temp=74C cylinder", floorBattery: 86, floorVolt: 3.9, floorRssi: -71, floorTemp: 74, ceilingSmoke: 110, ceilingGas: 500, kitchenTemp: 74, heatThreshold: 70, pir: "no motion", pirMinAgo: 20, wifiRssi: -63, heartbeatMinAgo: 2, buzzer: "idle", backupBatt: 92, avgDaily: 2.0, calibr: "2026-09-09", lastSeenMinAgo: 2 }),
  H({ id: "LV-011", minutesAgo: 34, priority: "P1", sensor: "FIRE", unit: "G02", household: "Koforidua Bakery", digitalAddress: "EN-009-1134", npaCode: "GC-34567", serial: "GC-34567", footRingSerial: "GC-34567", qrSerial: "GC-34567", district: "Koforidua", region: "Eastern", lat: 6.09, lng: -0.26, sizeKg: 45, category: "COMMERCIAL", cell: "150kg", tare: 30.0, gross: 68.0, gasPpm: 1100, smokePpm: 700, tempC: 95, flame: true, flameOn: true, burst: false, reading: "FIRE confirmed flame sensor active", floorBattery: 89, floorVolt: 3.97, floorRssi: -69, floorTemp: 95, ceilingSmoke: 700, ceilingGas: 1100, kitchenTemp: 95, heatThreshold: 70, pir: "motion", pirMinAgo: 1, wifiRssi: -58, heartbeatMinAgo: 0, buzzer: "alarming", backupBatt: 91, avgDaily: 2.8, calibr: "2026-08-28", lastSeenMinAgo: 0, oldSerial: "GC-34567" }),
  H({ id: "LV-012", minutesAgo: 38, priority: "P3", sensor: "COOK", unit: "A22", household: "Frimpong Family", digitalAddress: "GE-321-1555", npaCode: "NPA-CRM-GH-00012", serial: "NPA-CRM-GH-00012", footRingSerial: "NPA-CRM-GH-00012", qrSerial: "NPA-CRM-GH-00012", district: "Ga East", region: "Greater Accra", lat: 5.855, lng: -0.193, sizeKg: 3, category: "HOME", cell: "50kg", tare: 3.4, gross: 5.9, gasPpm: 90, smokePpm: 60, tempC: 66, flame: true, flameOn: true, burst: false, flameMin: 44, reading: "Cooker left on? 44 min, no motion, no weight change", floorBattery: 95, floorVolt: 4.08, floorRssi: -64, floorTemp: 66, ceilingSmoke: 60, ceilingGas: 90, kitchenTemp: 66, heatThreshold: 70, pir: "no motion", pirMinAgo: 44, wifiRssi: -56, heartbeatMinAgo: 1, buzzer: "alarming", backupBatt: 98, avgDaily: 0.3, calibr: "2026-09-27", lastSeenMinAgo: 1 }),
  H({ id: "LV-013", minutesAgo: 41, priority: "P2", sensor: "LEAK", unit: "H09", household: "Cape Coast Kitchen", digitalAddress: "CR-201-7741", npaCode: "NPA-CRM-GH-00013", serial: "NPA-CRM-GH-00013", footRingSerial: "NPA-CRM-GH-00013", qrSerial: "NPA-CRM-GH-00013", district: "Cape Coast", region: "Central", lat: 5.1, lng: -1.25, sizeKg: 12.5, category: "HOME", cell: "50kg", tare: 11.5, gross: 15.0, gasPpm: 1280, smokePpm: 45, tempC: 33, flame: false, flameOn: false, burst: false, reading: "LEAK detected gas_ppm=1280", floorBattery: 81, floorVolt: 3.84, floorRssi: -76, floorTemp: 33, ceilingSmoke: 45, ceilingGas: 1280, kitchenTemp: 33, heatThreshold: 70, pir: "no motion", pirMinAgo: 15, wifiRssi: -67, heartbeatMinAgo: 4, buzzer: "alarming", backupBatt: 88, avgDaily: 0.5, calibr: "2026-08-19", lastSeenMinAgo: 4 }),
  H({ id: "LV-014", minutesAgo: 47, priority: "P1", sensor: "BURST", unit: "K04", household: "Tamale Grill House", digitalAddress: "NR-077-3091", npaCode: "NPA-CRM-GH-00014", serial: "NPA-CRM-GH-00014", footRingSerial: "NPA-CRM-GH-00014", qrSerial: "NPA-CRM-GH-00014", district: "Tamale Metro", region: "Northern", lat: 9.4, lng: -0.84, sizeKg: 50, category: "COMMERCIAL", cell: "150kg", tare: 32.0, gross: 77.5, gasPpm: 2400, smokePpm: 200, tempC: 39, flame: false, flameOn: false, burst: true, reading: "BURST pipe continuous leak needs trolley + 2 officers", floorBattery: 83, floorVolt: 3.87, floorRssi: -72, floorTemp: 39, ceilingSmoke: 200, ceilingGas: 2400, kitchenTemp: 39, heatThreshold: 70, pir: "motion", pirMinAgo: 2, wifiRssi: -65, heartbeatMinAgo: 2, buzzer: "alarming", backupBatt: 90, avgDaily: 3.0, calibr: "2026-09-01", lastSeenMinAgo: 2 }),
  H({ id: "LV-015", minutesAgo: 52, priority: "P2", sensor: "SMOKE", unit: "V06", household: "Ho Family Kitchen", digitalAddress: "VR-312-0098", npaCode: "GC-45678", serial: "GC-45678", footRingSerial: "GC-45678", qrSerial: "GC-40000", district: "Ho Municipal", region: "Volta", lat: 6.61, lng: 0.47, sizeKg: 6, category: "HOME", cell: "50kg", tare: 6.5, gross: 10.2, gasPpm: 380, smokePpm: 420, tempC: 55, flame: false, flameOn: false, burst: false, reading: "SMOKE detected smoke_ppm=420", floorBattery: 92, floorVolt: 4.01, floorRssi: -67, floorTemp: 55, ceilingSmoke: 420, ceilingGas: 380, kitchenTemp: 55, heatThreshold: 70, pir: "motion", pirMinAgo: 5, wifiRssi: -60, heartbeatMinAgo: 2, buzzer: "idle", backupBatt: 96, avgDaily: 0.42, calibr: "2026-09-16", lastSeenMinAgo: 2, oldSerial: "GC-45678" }),
  H({ id: "LV-016", minutesAgo: 58, priority: "P3", sensor: "HEAT", unit: "S01", household: "Sunyani Home", digitalAddress: "BR-102-5560", npaCode: "NPA-CRM-GH-00016", serial: "NPA-CRM-GH-00016", footRingSerial: "NPA-CRM-GH-00016", qrSerial: "NPA-CRM-GH-00016", district: "Sunyani Municipal", region: "Bono", lat: 7.33, lng: -2.33, sizeKg: 14.5, category: "HOME", cell: "50kg", tare: 12.0, gross: 20.1, gasPpm: 250, smokePpm: 70, tempC: 72, flame: false, flameOn: false, burst: false, reading: "HEAT temp=72C cylinder", floorBattery: 80, floorVolt: 3.83, floorRssi: -77, floorTemp: 72, ceilingSmoke: 70, ceilingGas: 250, kitchenTemp: 72, heatThreshold: 70, pir: "no motion", pirMinAgo: 28, wifiRssi: -68, heartbeatMinAgo: 5, buzzer: "idle", backupBatt: 87, avgDaily: 0.48, calibr: "2026-08-25", lastSeenMinAgo: 5 }),
  H({ id: "LV-017", minutesAgo: 63, priority: "P2", sensor: "LEAK", unit: "T05", household: "Techiman Food Joint", digitalAddress: "BE-410-2210", npaCode: "NPA-CRM-GH-00017", serial: "NPA-CRM-GH-00017", footRingSerial: "NPA-CRM-GH-00017", qrSerial: "NPA-CRM-GH-00017", district: "Techiman", region: "Bono East", lat: 7.58, lng: -1.93, sizeKg: 19.5, category: "COMMERCIAL", cell: "150kg", tare: 13.0, gross: 30.1, gasPpm: 1330, smokePpm: 50, tempC: 34, flame: false, flameOn: false, burst: false, reading: "LEAK detected gas_ppm=1330 · 19.5kg=32.5kg", floorBattery: 88, floorVolt: 3.95, floorRssi: -70, floorTemp: 34, ceilingSmoke: 50, ceilingGas: 1330, kitchenTemp: 34, heatThreshold: 70, pir: "motion", pirMinAgo: 7, wifiRssi: -61, heartbeatMinAgo: 2, buzzer: "alarming", backupBatt: 93, avgDaily: 1.5, calibr: "2026-09-12", lastSeenMinAgo: 2 }),
  H({ id: "LV-018", minutesAgo: 69, priority: "P1", sensor: "FIRE", unit: "D12", household: "Damongo Store", digitalAddress: "SV-600-1142", npaCode: "NPA-CRM-GH-00018", serial: "NPA-CRM-GH-00018", footRingSerial: "NPA-CRM-GH-00018", qrSerial: "NPA-CRM-GH-00018", district: "Damongo", region: "Savannah", lat: 9.08, lng: -1.82, sizeKg: 35, category: "COMMERCIAL", cell: "150kg", tare: 25.0, gross: 55.0, gasPpm: 980, smokePpm: 660, tempC: 91, flame: true, flameOn: true, burst: false, reading: "FIRE confirmed flame sensor active", floorBattery: 85, floorVolt: 3.9, floorRssi: -73, floorTemp: 91, ceilingSmoke: 660, ceilingGas: 980, kitchenTemp: 91, heatThreshold: 70, pir: "motion", pirMinAgo: 1, wifiRssi: -62, heartbeatMinAgo: 1, buzzer: "alarming", backupBatt: 90, avgDaily: 2.2, calibr: "2026-09-06", lastSeenMinAgo: 1 }),
  H({ id: "LV-019", minutesAgo: 74, priority: "P3", sensor: "COOK", unit: "W03", household: "Wa Municipal Home", digitalAddress: "UW-701-8842", npaCode: "GC-56789", serial: "GC-56789", footRingSerial: "GC-56789", qrSerial: "GC-56789", district: "Wa Municipal", region: "Upper West", lat: 10.06, lng: -2.5, sizeKg: 5, category: "HOME", cell: "50kg", tare: 5.3, gross: 7.0, gasPpm: 110, smokePpm: 75, tempC: 68, flame: true, flameOn: true, burst: false, flameMin: 33, reading: "Cooker left on? 33 min — check kitchen", floorBattery: 96, floorVolt: 4.1, floorRssi: -63, floorTemp: 68, ceilingSmoke: 75, ceilingGas: 110, kitchenTemp: 68, heatThreshold: 70, pir: "no motion", pirMinAgo: 33, wifiRssi: -55, heartbeatMinAgo: 1, buzzer: "alarming", backupBatt: 99, avgDaily: 0.33, calibr: "2026-09-29", lastSeenMinAgo: 1, oldSerial: "GC-56789" }),
  H({ id: "LV-020", minutesAgo: 79, priority: "P2", sensor: "SMOKE", unit: "O08", household: "Dambai Household", digitalAddress: "OT-555-0102", npaCode: "NPA-CRM-GH-00020", serial: "NPA-CRM-GH-00020", footRingSerial: "NPA-CRM-GH-00020", qrSerial: "NPA-CRM-GH-00020", district: "Dambai", region: "Oti", lat: 8.06, lng: 0.18, sizeKg: 15, category: "HOME", cell: "50kg", tare: 12.5, gross: 19.5, gasPpm: 350, smokePpm: 310, tempC: 50, flame: false, flameOn: false, burst: false, reading: "SMOKE detected smoke_ppm=310", floorBattery: 90, floorVolt: 3.98, floorRssi: -68, floorTemp: 50, ceilingSmoke: 310, ceilingGas: 350, kitchenTemp: 50, heatThreshold: 70, pir: "motion", pirMinAgo: 4, wifiRssi: -59, heartbeatMinAgo: 3, buzzer: "idle", backupBatt: 95, avgDaily: 0.52, calibr: "2026-09-08", lastSeenMinAgo: 3 }),
];

// ---- 90-row history / regional pool (deterministic, no RNG libs) ----
const SENSORS = ["FIRE", "SMOKE", "LEAK", "HEAT", "BURST", "COOK"];
const SIZES = [3, 5, 6, 12.5, 14.5, 15, 19, 19.5, 35, 45, 50, 52];
const TARE = { 3: 3.4, 5: 5.3, 6: 6.5, 12.5: 11.5, 14.5: 12.0, 15: 12.5, 19: 12.5, 19.5: 13.0, 35: 25.0, 45: 30.0, 50: 32.0, 52: 35.0 };
const PREFIX = { "Greater Accra": "GE", Ashanti: "AK", Western: "WS", Eastern: "EN", Central: "CR", Northern: "NR", "Upper East": "UE", "Upper West": "UW", Volta: "VR", Bono: "BR", "Bono East": "BE", Ahafo: "AH", Savannah: "SV", "North East": "NE", Oti: "OT", "Western North": "WN" };

function histRow(i) {
  const geo = ALL_DISTRICTS[i % ALL_DISTRICTS.length];
  const sensor = SENSORS[i % SENSORS.length];
  const sizeKg = SIZES[(i * 5) % SIZES.length];
  const commercial = [19, 19.5, 35, 45, 50, 52].includes(sizeKg);
  const n = 101 + i;
  const npa = i % 11 === 4 ? `GC-${10000 + n}` : `NPA-CRM-GH-${String(n).padStart(5, "0")}`;
  // Every 13th row is a kept-visible fraud case (QR invented, not copied).
  const fraud = i % 13 === 5;
  const qr = fraud ? (npa.startsWith("GC-") ? "GC-40000" : `NPA-CRM-GH-${String(n + 77).padStart(5, "0")}`) : npa;
  const gasPpm = sensor === "LEAK" ? 1200 + ((i * 37) % 900) : sensor === "BURST" ? 2000 + ((i * 41) % 800) : 120 + ((i * 23) % 500);
  const smokePpm = sensor === "SMOKE" ? 280 + ((i * 29) % 320) : sensor === "FIRE" ? 550 + ((i * 31) % 300) : 40 + ((i * 17) % 120);
  const tempC = sensor === "HEAT" ? 72 + ((i * 7) % 18) : sensor === "FIRE" ? 85 + ((i * 5) % 20) : 30 + ((i * 3) % 30);
  const gross = Math.round((TARE[sizeKg] + ((i * 13) % Math.max(1, Math.round((commercial ? 30 : 10) * 10))) / 10) * 10) / 10;
  return H({
    id: `HS-${String(i + 1).padStart(3, "0")}`,
    minutesAgo: 130 + i * 53,
    priority: sensor === "FIRE" || sensor === "BURST" || sensor === "LEAK" ? "P1" : sensor === "COOK" || sensor === "HEAT" ? "P3" : "P2",
    sensor,
    unit: `${"ABCDEFGH"[i % 8]}${String((i % 24) + 1).padStart(2, "0")}`,
    household: `${["Owusu", "Mensah", "Adu", "Boateng", "Danso", "Frimpong", "Asante", "Kwarteng"][i % 8]} Household ${i + 1}`,
    digitalAddress: `${PREFIX[geo.region]}-${String(100 + ((i * 7) % 800))}-${String(1000 + ((i * 37) % 8000))}`,
    npaCode: npa,
    serial: npa,
    footRingSerial: npa,
    qrSerial: qr,
    district: geo.district,
    region: geo.region,
    lat: 5.6 + ((i * 13) % 50) / 100,
    lng: -2.5 + ((i * 29) % 300) / 100,
    sizeKg,
    category: commercial ? "COMMERCIAL" : "HOME",
    cell: commercial ? "150kg" : "50kg",
    tare: TARE[sizeKg],
    gross,
    gasPpm,
    smokePpm,
    tempC,
    flame: sensor === "FIRE",
    flameOn: sensor === "FIRE" || sensor === "COOK",
    burst: sensor === "BURST",
    reading:
      sensor === "FIRE" ? "FIRE confirmed flame sensor active"
      : sensor === "SMOKE" ? `SMOKE detected smoke_ppm=${smokePpm}`
      : sensor === "LEAK" ? `LEAK detected gas_ppm=${gasPpm}`
      : sensor === "HEAT" ? `HEAT temp=${tempC}C cylinder`
      : sensor === "BURST" ? "BURST pipe continuous leak needs trolley + 2 officers"
      : "COOK flame + temp — cooker in use",
    floorBattery: 78 + ((i * 11) % 22),
    floorVolt: 3.8 + ((i * 3) % 30) / 100,
    floorRssi: -(63 + ((i * 7) % 15)),
    floorTemp: tempC,
    ceilingSmoke: smokePpm,
    ceilingGas: gasPpm,
    kitchenTemp: tempC,
    heatThreshold: 70,
    pir: i % 3 === 0 ? "no motion" : "motion",
    pirMinAgo: 2 + ((i * 5) % 50),
    wifiRssi: -(55 + ((i * 3) % 14)),
    heartbeatMinAgo: 1 + ((i * 2) % 6),
    buzzer: sensor === "FIRE" || sensor === "LEAK" || sensor === "BURST" ? "alarming" : "idle",
    backupBatt: 86 + ((i * 5) % 14),
    avgDaily: commercial ? 1.5 + ((i * 7) % 15) / 10 : 0.3 + ((i * 3) % 30) / 100,
    calibr: `2026-09-${String(1 + (i % 28)).padStart(2, "0")}`,
    lastSeenMinAgo: 1 + ((i * 3) % 8),
    status: ["DISPATCHED", "RESOLVED", "RESOLVED", "DISPATCHED", "RESOLVED"][i % 5],
  });
}

export const LIVE_ALERTS = LIVE_PINNED;
export const HISTORY_ALERTS = Array.from({ length: 90 }, (_, i) => histRow(i));
export const ALL_ALERTS = [...LIVE_ALERTS, ...HISTORY_ALERTS];

export const ANALYTICS = {
  totalHouses: 400,
  totalCylinders: 620,
  activeCylinders: 7,
  activeLeaks: 3,
  commercialCount: 3,
  homeCount: 4,
  atRisk: [
    { unit: "A12", kind: "LEAK", addr: "GE-321-1234" },
    { unit: "B02", kind: "BURST", addr: "GE-321-1182" },
    { unit: "C06", kind: "LEAK", addr: "GE-321-2006" },
  ],
  batteryLow: [{ unit: "A12", code: "NPA-CRM-GH-00001", pct: 82 }],
};

export function timeAgo(min) {
  if (min < 1) return "just now";
  if (min < 60) return `${Math.round(min)} mins ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  return `${Math.floor(h / 24)} day${Math.floor(h / 24) > 1 ? "s" : ""} ago`;
}

