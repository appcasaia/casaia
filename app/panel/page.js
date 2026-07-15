"use client";

import React, { useState } from "react";
import { Lock, MessageSquare, Users, TrendingUp, Loader2 } from "lucide-react";

export default function PanelPage() {
  const [key, setKey] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!key.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/metrics?key=${encodeURIComponent(key.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al cargar métricas");
      setData(json);
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F3EDE2", padding: "40px 20px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#1F2D2B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M 45 105 L 100 55 L 155 105" fill="none" stroke="#F3EDE2" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 60 98 L 60 148 L 140 148 L 140 98" fill="none" stroke="#F3EDE2" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="88" y="118" width="24" height="30" rx="2" fill="#F3EDE2" />
              <circle cx="100" cy="55" r="9" fill="#C4622A" />
              <circle cx="128" cy="36" r="6" fill="#C4622A" />
              <circle cx="72" cy="36" r="6" fill="#C4622A" />
              <line x1="100" y1="55" x2="128" y2="36" stroke="#C4622A" strokeWidth="4" strokeLinecap="round" />
              <line x1="100" y1="55" x2="72" y2="36" stroke="#C4622A" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Roboto Slab', serif", fontSize: 20, fontWeight: 700, color: "#1F2D2B" }}>
              CasaIA — Panel
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8A7A5C" }}>
              Métricas de uso
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Lock size={14} color="#8A7A5C" style={{ position: "absolute", left: 12, top: 12 }} />
            <input
              type="password"
              placeholder="Clave de administrador"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px 10px 34px",
                borderRadius: 10,
                border: "1px solid #E0D8C7",
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <button
            onClick={load}
            disabled={loading || !key.trim()}
            style={{
              padding: "0 18px",
              borderRadius: 10,
              border: "none",
              background: "#C4622A",
              color: "#FFFFFF",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              opacity: loading || !key.trim() ? 0.5 : 1,
            }}
          >
            {loading ? <Loader2 size={16} className="spin" /> : "Ver"}
          </button>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "#FBE4DB", border: "1px solid #D94E2A", marginBottom: 20 }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#7A2A14" }}>{error}</span>
          </div>
        )}

        {data && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <MetricCard icon={<MessageSquare size={18} color="#C4622A" />} label="Consultas totales" value={data.messages} />
            <MetricCard icon={<Users size={18} color="#C4622A" />} label="Leads generados" value={data.leads} />
            <div style={{ gridColumn: "1 / -1" }}>
              <MetricCard icon={<TrendingUp size={18} color="#C4622A" />} label="Tasa de conversión a lead" value={`${data.conversion}%`} wide />
            </div>
          </div>
        )}

        {!data && !error && (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C" }}>
            Ingresá tu clave de administrador (la que configuraste como ADMIN_SECRET en Vercel) para ver las métricas.
          </p>
        )}
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function MetricCard({ icon, label, value, wide }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E9E2D2",
        borderRadius: 14,
        padding: "18px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {icon}
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8A7A5C" }}>{label}</span>
      </div>
      <div style={{ fontFamily: "'Roboto Slab', serif", fontSize: wide ? 32 : 28, fontWeight: 700, color: "#1F2D2B" }}>
        {value}
      </div>
    </div>
  );
}
