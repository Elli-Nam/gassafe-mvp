import { useState } from "react";

export default function App() {
  const [activeOrder, setActiveOrder] = useState(null);
  const [status, setStatus] = useState("Pending");

  const orders = [
    { id: "ORD-101", house: "HOUSE-GE-321-1234", address: "GE-321-1234 Tema", resident: "Ama K.", phone: "0244123456", lat: 5.6037, lng: -0.1870, distance: "2.3 km", gas: "26.5kg gross" },
    { id: "ORD-102", house: "HOUSE-GE-321-1235", address: "GE-321-1235 Tema", resident: "Kwame B.", phone: "0244123457", lat: 5.608, lng: -0.19, distance: "1.1 km", gas: "26.5kg gross" },
  ];

  const openMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
  };

  return (
    <div style={{ fontFamily: "Inter", background: "#F8FAFC", minHeight: "100vh" }}>
      <header style={{ background: "#10302F", color: "white", padding: "16px 20px" }}>
        <h1 style={{ margin: 0, fontSize: "18px" }}>GasSafe Rider - RIDER-006</h1>
        <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.8 }}>Tema Metro • Online • 3 trips today</p>
      </header>

      <div style={{ padding: "16px" }}>
        {!activeOrder ? (
          <>
            <h2 style={{ fontSize: "16px" }}>New Refill Requests</h2>
            {orders.map(o => (
              <div key={o.id} style={{ background: "white", padding: "14px", borderRadius: "12px", marginBottom: "12px", border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{o.id}</strong><span style={{ fontSize: "12px", background: "#DCFCE7", padding: "2px 8px", borderRadius: "10px" }}>{o.distance}</span>
                </div>
                <div style={{ fontSize: "13px", marginTop: "6px" }}>{o.house} - {o.address}</div>
                <div style={{ fontSize: "12px", color: "#64748B" }}>{o.resident} • {o.gas}</div>
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button onClick={() => { setActiveOrder(o); setStatus("En route"); }} style={{ flex: 1, background: "#10302F", color: "white", padding: "10px", borderRadius: "8px", border: "none" }}>Accept</button>
                  <button onClick={() => openMaps(o.lat, o.lng)} style={{ flex: 1, background: "white", border: "1px solid #10302F", padding: "10px", borderRadius: "8px" }}>Navigate</button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <button onClick={() => setActiveOrder(null)} style={{ background: "none", border: "none", color: "#0E7C86", marginBottom: "10px" }}>← Back to orders</button>
            <div style={{ background: "white", padding: "16px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
              <h3 style={{ margin: "0 0 8px" }}>{activeOrder.id} - En route</h3>
              <p style={{ fontSize: "13px" }}>{activeOrder.house} - {activeOrder.address}</p>
              <p style={{ fontSize: "12px" }}>GPS: {activeOrder.lat}, {activeOrder.lng} - GhanaPost Verified ✓</p>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button onClick={() => openMaps(activeOrder.lat, activeOrder.lng)} style={{ flex: 1, background: "#0E7C86", color: "white", padding: "10px", borderRadius: "8px", border: "none" }}>Navigate with MAPS</button>
                <a href={`tel:${activeOrder.phone}`} style={{ flex: 1, textAlign: "center", background: "white", border: "1px solid #0E7C86", padding: "10px", borderRadius: "8px", textDecoration: "none", color: "#0E7C86" }}>Call Resident</a>
              </div>
              <div style={{ marginTop: "16px", borderTop: "1px solid #E2E8F0", paddingTop: "12px" }}>
                <p style={{ fontSize: "13px" }}>QR Scan: GH-H-OLD-00321 → GH-H-NEW-45210</p>
                <p style={{ fontSize: "12px" }}>Status: {status}</p>
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button onClick={() => setStatus("Arrived at house")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>Arrived</button>
                  <button onClick={() => setStatus("Scan QR")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>Scan QR</button>
                  <button onClick={() => setStatus("Delivered & Logged ✓")} style={{ flex: 1, background: "#10302F", color: "white", padding: "10px", borderRadius: "8px", border: "none" }}>Delivered</button>
                </div>
                {status.includes("Delivered") && <p style={{ fontSize: "12px", color: "green", marginTop: "10px" }}>Proof: 26.5kg gross PASS • RIDER-006 • GhanaPost + Google Maps Verified</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}