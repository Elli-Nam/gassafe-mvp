/* GNFS Field Officer assignments — dispatches from the GNFS Dashboard.
 * District ⊂ Region ⊂ National. National = Ghana (16 regions).
 * CORE LOCKED RULE on every row: serial == footRingSerial == qrSerial,
 * except kept-visible fraud rows (Bottom ring != QR -> suspected fraud). */

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

export const OFFICER = {
  id: "GNFS-014",
  name: "A. Mensah",
  rank: "Leading Fireman",
  phone: "+233 24 000 1014",
  station: "East Legon Hills",
};

const A = (o) => ({
  national: NATIONAL,
  status: "PENDING",
  dispatch: null,
  gateway: { wifi: "CONNECTED", cellular: "CONNECTED", lora: "LINKED", twin: "SYNCED", sim: "MTN" },
  photoProof: "combined-frame-required",
  oldSerial: "",
  ...o,
});

export const ASSIGNMENTS = [
  A({ id: "FO-001", minutesAgo: 20, priority: "P1", sensor: "LEAK", unit: "A12", household: "Kwame Asante Family", category: "HOME", cell: "50kg", sizeKg: 6, tare: 6.5, gross: 9.1, digitalAddress: "GE-321-1234", npaCode: "NPA-CRM-GH-00001", serial: "NPA-CRM-GH-00001", footRingSerial: "NPA-CRM-GH-00001", qrSerial: "NPA-CRM-GH-00001", district: "East Legon Hills", region: "Greater Accra", lat: 5.85, lng: -0.196, gasPpm: 1450, smokePpm: 40, tempC: 34, flame: false, flameOn: false, burst: false, reading: "LEAK detected gas_ppm=1450", floorBattery: 82, floorVolt: 3.9, floorRssi: -71, floorTemp: 34, ceilingSmoke: 40, ceilingGas: 1450, kitchenTemp: 34, heatThreshold: 70, pir: "no motion", pirMinAgo: 42, wifiRssi: -58, heartbeatMinAgo: 1, buzzer: "alarming", backupBatt: 96, avgDaily: 0.45, calibr: "2026-09-14", lastSeenMinAgo: 1 }),
  A({ id: "FO-002", minutesAgo: 25, priority: "P1", sensor: "BURST", unit: "B02", household: "Ama Serwaa Household", category: "COMMERCIAL", cell: "150kg", sizeKg: 19.5, tare: 13.0, gross: 32.5, digitalAddress: "GE-321-1182", npaCode: "NPA-CRM-GH-00002", serial: "NPA-CRM-GH-00002", footRingSerial: "NPA-CRM-GH-00002", qrSerial: "NPA-CRM-GH-00002", district: "East Legon Hills", region: "Greater Accra", lat: 5.852, lng: -0.198, gasPpm: 2100, smokePpm: 120, tempC: 41, flame: false, flameOn: false, burst: true, reading: "BURST pipe continuous leak needs trolley + 2 officers", floorBattery: 91, floorVolt: 4.0, floorRssi: -68, floorTemp: 41, ceilingSmoke: 120, ceilingGas: 2100, kitchenTemp: 41, heatThreshold: 70, pir: "motion", pirMinAgo: 2, wifiRssi: -61, heartbeatMinAgo: 1, buzzer: "alarming", backupBatt: 98, avgDaily: 1.6, calibr: "2026-09-20", lastSeenMinAgo: 0 }),
  A({ id: "FO-003", minutesAgo: 32, priority: "P1", sensor: "FIRE", unit: "A10", household: "Owusu Family", category: "HOME", cell: "50kg", sizeKg: 14.5, tare: 12.0, gross: 22.4, digitalAddress: "GA-123-4567", npaCode: "GC-12345", serial: "GC-12345", footRingSerial: "GC-12345", qrSerial: "GC-12345", district: "Abossey", region: "Greater Accra", lat: 5.845, lng: -0.21, gasPpm: 900, smokePpm: 610, tempC: 88, flame: true, flameOn: true, burst: false, reading: "FIRE confirmed flame sensor active", floorBattery: 88, floorVolt: 3.95, floorRssi: -73, floorTemp: 88, ceilingSmoke: 610, ceilingGas: 900, kitchenTemp: 88, heatThreshold: 70, pir: "motion", pirMinAgo: 1, wifiRssi: -55, heartbeatMinAgo: 0, buzzer: "alarming", backupBatt: 93, avgDaily: 0.6, calibr: "2026-08-30", lastSeenMinAgo: 0, oldSerial: "GC-12345" }),
  A({ id: "FO-004", minutesAgo: 36, priority: "P1", sensor: "HEAT", unit: "A15", household: "Boateng Household", category: "HOME", cell: "50kg", sizeKg: 15, tare: 12.5, gross: 24.0, digitalAddress: "GE-321-1400", npaCode: "NPA-CRM-GH-00004", serial: "NPA-CRM-GH-00004", footRingSerial: "NPA-CRM-GH-00004", qrSerial: "NPA-CRM-GH-00004", district: "East Legon Hills", region: "Greater Accra", lat: 5.851, lng: -0.195, gasPpm: 320, smokePpm: 90, tempC: 78, flame: false, flameOn: false, burst: false, reading: "HEAT temp=78C cylinder", floorBattery: 79, floorVolt: 3.85, floorRssi: -75, floorTemp: 78, ceilingSmoke: 90, ceilingGas: 320, kitchenTemp: 78, heatThreshold: 70, pir: "no motion", pirMinAgo: 55, wifiRssi: -66, heartbeatMinAgo: 2, buzzer: "idle", backupBatt: 90, avgDaily: 0.5, calibr: "2026-09-02", lastSeenMinAgo: 2 }),
  A({ id: "FO-005", minutesAgo: 40, priority: "P2", sensor: "SMOKE", unit: "D04", household: "Abossey Estate D04", category: "HOME", cell: "50kg", sizeKg: 12.5, tare: 11.5, gross: 18.2, digitalAddress: "GA-123-4521", npaCode: "GC-23456", serial: "GC-23456", footRingSerial: "GC-23456", qrSerial: "GC-23456", district: "Abossey", region: "Greater Accra", lat: 5.84, lng: -0.212, gasPpm: 410, smokePpm: 300, tempC: 52, flame: true, flameOn: true, burst: false, reading: "SMOKE detected smoke_ppm=300", floorBattery: 94, floorVolt: 4.05, floorRssi: -69, floorTemp: 52, ceilingSmoke: 300, ceilingGas: 410, kitchenTemp: 52, heatThreshold: 70, pir: "motion", pirMinAgo: 4, wifiRssi: -60, heartbeatMinAgo: 1, buzzer: "idle", backupBatt: 97, avgDaily: 0.55, calibr: "2026-09-11", lastSeenMinAgo: 1, oldSerial: "GC-23456" }),
  A({ id: "FO-006", minutesAgo: 44, priority: "P1", sensor: "LEAK", unit: "C06", household: "Mensah Chop Bar", category: "COMMERCIAL", cell: "150kg", sizeKg: 52, tare: 35.0, gross: 87.0, digitalAddress: "GE-321-2006", npaCode: "NPA-CRM-GH-00006", serial: "NPA-CRM-GH-00006", footRingSerial: "NPA-CRM-GH-00006", qrSerial: "NPA-CRM-GH-00006", district: "Community 20", region: "Greater Accra", lat: 5.848, lng: -0.19, gasPpm: 1650, smokePpm: 60, tempC: 36, flame: false, flameOn: false, burst: false, reading: "LEAK detected gas_ppm=1650 · 52kg=87kg gross", floorBattery: 87, floorVolt: 3.92, floorRssi: -70, floorTemp: 36, ceilingSmoke: 60, ceilingGas: 1650, kitchenTemp: 36, heatThreshold: 70, pir: "motion", pirMinAgo: 6, wifiRssi: -62, heartbeatMinAgo: 1, buzzer: "alarming", backupBatt: 95, avgDaily: 2.4, calibr: "2026-09-18", lastSeenMinAgo: 1 }),
  A({ id: "FO-007", minutesAgo: 47, priority: "P2", sensor: "COOK", unit: "C08", household: "Danso Family", category: "HOME", cell: "50kg", sizeKg: 6, tare: 6.5, gross: 11.8, digitalAddress: "GE-321-1190", npaCode: "NPA-CRM-GH-00007", serial: "NPA-CRM-GH-00007", footRingSerial: "NPA-CRM-GH-00007", qrSerial: "NPA-CRM-GH-00007", district: "Community 20", region: "Greater Accra", lat: 5.849, lng: -0.191, gasPpm: 120, smokePpm: 80, tempC: 70, flame: true, flameOn: true, burst: false, flameMin: 38, reading: "COOK flame + temp 70C · left-on 38 min, no PIR", floorBattery: 90, floorVolt: 4.0, floorRssi: -72, floorTemp: 70, ceilingSmoke: 80, ceilingGas: 120, kitchenTemp: 70, heatThreshold: 70, pir: "no motion", pirMinAgo: 38, wifiRssi: -59, heartbeatMinAgo: 2, buzzer: "alarming", backupBatt: 94, avgDaily: 0.4, calibr: "2026-09-05", lastSeenMinAgo: 2 }),
  A({ id: "FO-008", minutesAgo: 51, priority: "P1", sensor: "LEAK", unit: "E11", household: "Kumasi Eatery", category: "COMMERCIAL", cell: "150kg", sizeKg: 19, tare: 12.5, gross: 28.0, digitalAddress: "AK-044-8812", npaCode: "NPA-CRM-GH-00008", serial: "NPA-CRM-GH-00008", footRingSerial: "NPA-CRM-GH-00008", qrSerial: "NPA-CRM-GH-00099", district: "Kumasi Metro", region: "Ashanti", lat: 6.69, lng: -1.62, gasPpm: 1520, smokePpm: 55, tempC: 35, flame: false, flameOn: false, burst: false, reading: "LEAK detected gas_ppm=1520 · 19kg Commercial — suspected fraud", floorBattery: 84, floorVolt: 3.88, floorRssi: -74, floorTemp: 35, ceilingSmoke: 55, ceilingGas: 1520, kitchenTemp: 35, heatThreshold: 70, pir: "motion", pirMinAgo: 3, wifiRssi: -64, heartbeatMinAgo: 3, buzzer: "alarming", backupBatt: 89, avgDaily: 1.8, calibr: "2026-08-22", lastSeenMinAgo: 3, gateway: { wifi: "CONNECTED", cellular: "CONNECTED", lora: "LINKED", twin: "SYNCED", sim: "Telecel" } }),
  A({ id: "FO-009", minutesAgo: 55, priority: "P2", sensor: "SMOKE", unit: "B07", household: "Adu Household", category: "HOME", cell: "50kg", sizeKg: 5, tare: 5.3, gross: 8.4, digitalAddress: "GE-321-1301", npaCode: "NPA-CRM-GH-00009", serial: "NPA-CRM-GH-00009", footRingSerial: "NPA-CRM-GH-00009", qrSerial: "NPA-CRM-GH-00009", district: "East Legon Hills", region: "Greater Accra", lat: 5.853, lng: -0.197, gasPpm: 300, smokePpm: 340, tempC: 48, flame: true, flameOn: true, burst: false, reading: "Food burning! smoke rising + flame ON", floorBattery: 93, floorVolt: 4.02, floorRssi: -66, floorTemp: 48, ceilingSmoke: 340, ceilingGas: 300, kitchenTemp: 48, heatThreshold: 70, pir: "motion", pirMinAgo: 2, wifiRssi: -57, heartbeatMinAgo: 1, buzzer: "alarming", backupBatt: 99, avgDaily: 0.35, calibr: "2026-09-25", lastSeenMinAgo: 1 }),
  A({ id: "FO-010", minutesAgo: 60, priority: "P2", sensor: "HEAT", unit: "F03", household: "Takoradi Canteen", category: "COMMERCIAL", cell: "150kg", sizeKg: 35, tare: 25.0, gross: 52.0, digitalAddress: "WS-114-0207", npaCode: "NPA-CRM-GH-00010", serial: "NPA-CRM-GH-00010", footRingSerial: "NPA-CRM-GH-00010", qrSerial: "NPA-CRM-GH-00010", district: "Sekondi-Takoradi", region: "Western", lat: 4.9, lng: -1.76, gasPpm: 500, smokePpm: 110, tempC: 74, flame: false, flameOn: false, burst: false, reading: "HEAT temp=74C cylinder", floorBattery: 86, floorVolt: 3.9, floorRssi: -71, floorTemp: 74, ceilingSmoke: 110, ceilingGas: 500, kitchenTemp: 74, heatThreshold: 70, pir: "motion", pirMinAgo: 20, wifiRssi: -63, heartbeatMinAgo: 2, buzzer: "idle", backupBatt: 92, avgDaily: 2.0, calibr: "2026-09-09", lastSeenMinAgo: 2 }),
  A({ id: "FO-011", minutesAgo: 66, priority: "P1", sensor: "FIRE", unit: "G02", household: "Koforidua Bakery", category: "COMMERCIAL", cell: "150kg", sizeKg: 45, tare: 30.0, gross: 68.0, digitalAddress: "EN-009-1134", npaCode: "GC-34567", serial: "GC-34567", footRingSerial: "GC-34567", qrSerial: "GC-34567", district: "Koforidua", region: "Eastern", lat: 6.09, lng: -0.26, gasPpm: 1100, smokePpm: 700, tempC: 95, flame: true, flameOn: true, burst: false, reading: "FIRE confirmed flame sensor active", floorBattery: 89, floorVolt: 3.97, floorRssi: -69, floorTemp: 95, ceilingSmoke: 700, ceilingGas: 1100, kitchenTemp: 95, heatThreshold: 70, pir: "motion", pirMinAgo: 1, wifiRssi: -58, heartbeatMinAgo: 0, buzzer: "alarming", backupBatt: 91, avgDaily: 2.8, calibr: "2026-08-28", lastSeenMinAgo: 0, oldSerial: "GC-34567" }),
  A({ id: "FO-012", minutesAgo: 71, priority: "P3", sensor: "COOK", unit: "A22", household: "Frimpong Family", category: "HOME", cell: "50kg", sizeKg: 3, tare: 3.4, gross: 5.9, digitalAddress: "GE-321-1555", npaCode: "NPA-CRM-GH-00012", serial: "NPA-CRM-GH-00012", footRingSerial: "NPA-CRM-GH-00012", qrSerial: "NPA-CRM-GH-00012", district: "Ga East", region: "Greater Accra", lat: 5.855, lng: -0.193, gasPpm: 90, smokePpm: 60, tempC: 66, flame: true, flameOn: true, burst: false, flameMin: 44, reading: "Cooker left on? 44 min, no motion, no weight change", floorBattery: 95, floorVolt: 4.08, floorRssi: -64, floorTemp: 66, ceilingSmoke: 60, ceilingGas: 90, kitchenTemp: 66, heatThreshold: 70, pir: "no motion", pirMinAgo: 44, wifiRssi: -56, heartbeatMinAgo: 1, buzzer: "alarming", backupBatt: 98, avgDaily: 0.3, calibr: "2026-09-27", lastSeenMinAgo: 1 }),
  A({ id: "FO-013", minutesAgo: 78, priority: "P2", sensor: "SMOKE", unit: "V06", household: "Ho Family Kitchen", category: "HOME", cell: "50kg", sizeKg: 6, tare: 6.5, gross: 10.2, digitalAddress: "VR-312-0098", npaCode: "GC-45678", serial: "GC-45678", footRingSerial: "GC-45678", qrSerial: "GC-40000", district: "Ho Municipal", region: "Volta", lat: 6.61, lng: 0.47, gasPpm: 380, smokePpm: 420, tempC: 55, flame: false, flameOn: false, burst: false, reading: "SMOKE detected smoke_ppm=420 — suspected fraud", floorBattery: 92, floorVolt: 4.01, floorRssi: -67, floorTemp: 55, ceilingSmoke: 420, ceilingGas: 380, kitchenTemp: 55, heatThreshold: 70, pir: "motion", pirMinAgo: 5, wifiRssi: -60, heartbeatMinAgo: 2, buzzer: "idle", backupBatt: 96, avgDaily: 0.42, calibr: "2026-09-16", lastSeenMinAgo: 2, oldSerial: "GC-45678" }),
  A({ id: "FO-014", minutesAgo: 85, priority: "P1", sensor: "BURST", unit: "K04", household: "Tamale Grill House", category: "COMMERCIAL", cell: "150kg", sizeKg: 50, tare: 32.0, gross: 77.5, digitalAddress: "NR-077-3091", npaCode: "NPA-CRM-GH-00014", serial: "NPA-CRM-GH-00014", footRingSerial: "NPA-CRM-GH-00014", qrSerial: "NPA-CRM-GH-00014", district: "Tamale Metro", region: "Northern", lat: 9.4, lng: -0.84, gasPpm: 2400, smokePpm: 200, tempC: 39, flame: false, flameOn: false, burst: true, reading: "BURST pipe continuous leak needs trolley + 2 officers", floorBattery: 83, floorVolt: 3.87, floorRssi: -72, floorTemp: 39, ceilingSmoke: 200, ceilingGas: 2400, kitchenTemp: 39, heatThreshold: 70, pir: "motion", pirMinAgo: 2, wifiRssi: -65, heartbeatMinAgo: 2, buzzer: "alarming", backupBatt: 90, avgDaily: 3.0, calibr: "2026-09-01", lastSeenMinAgo: 2 }),
];

export function timeAgo(min) {
  if (min < 1) return "just now";
  if (min < 60) return `${Math.round(min)} mins ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  return `${Math.floor(h / 24)} day${Math.floor(h / 24) > 1 ? "s" : ""} ago`;
}

export function mapsUrl(a) {
  const q = `${a.lat},${a.lng} (${a.digitalAddress})`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
