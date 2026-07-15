"use client";

import React, { useState } from "react";
import { Lock, Loader2, Building2, Copy, Check } from "lucide-react";

export default function InmobiliariasPanelPage() {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);

  const load = async () => {
    if (!key.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agencies?key=${encodeURIComponent(key.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al cargar");
      setAgencies(json.agencies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setUnlocked(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`https://casaia.net/i/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (!unlocked) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3EDE2", padding: "40px 20px" }}>
        <div style={{ maxWidth: 420, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Roboto Slab', serif", color: "#1F2D2B", fontSize: 22 }}>CasaIA — Inmobiliarias</h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C", marginBottom: 20 }}>
            Ingresá tu clave de administrador.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Lock size={14} color="#8A7A5C" style={{ position: "absolute", left: 12, top: 12 }} />
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px 10px 34px", borderRadius: 10, border: "1px solid #E0D8C7", fontFamily: "Inter, sans-serif", fontSize: 14, outline: "none" }}
                placeholder="Clave de administrador"
              />
            </div>
            <button onClick={load} disabled={loading || !key.trim()} style={{ padding: "0 18px", borderRadius: 10, border: "none", background: "#C4622A", color: "#FFFFFF", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, opacity: loading || !key.trim() ? 0.5 : 1 }}>
              {loading ? <Loader2 size={16} className="spin" /> : "Entrar"}
            </button>
          </div>
          {error && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#B5401F", marginTop: 12 }}>{error}</p>}
        </div>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F3EDE2", padding: "40px 20px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Building2 size={20} color="#C4622A" />
          <h1 style={{ fontFamily: "'Roboto Slab', serif", color: "#1F2D2B", fontSize: 22, margin: 0 }}>
            Inmobiliarias registradas ({agencies.length})
          </h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          {agencies.map((ag) => (
            <div key={ag.id} style={{ background: "#FFFFFF", border: "1px solid #E9E2D2", borderRadius: 12, padding: 14 }}>
              <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "#1F2D2B" }}>{ag.nombre}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8A7A5C", marginTop: 2 }}>
                {ag.contacto} · {ag.email} {ag.telefono && `· ${ag.telefono}`}
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#5B7065", marginTop: 6 }}>
                Localidades: {ag.localidades || "-"} · {ag.tecnicos?.length || 0} técnicos declarados
              </div>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 8, background: "#F3EDE2", borderRadius: 8,
                  padding: "6px 10px", marginTop: 10, maxWidth: 380,
                }}
              >
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#1F2D2B", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  casaia.net/i/{ag.slug}
                </span>
                <button onClick={() => copyLink(ag.slug)} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                  {copiedSlug === ag.slug ? <Check size={14} color="#2A5A3E" /> : <Copy size={14} color="#5B7065" />}
                </button>
              </div>
            </div>
          ))}
          {agencies.length === 0 && (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C" }}>Todavía no hay inmobiliarias registradas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
