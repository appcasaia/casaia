"use client";

import React, { useState } from "react";
import { Lock, Loader2, Wrench, ToggleLeft, ToggleRight } from "lucide-react";

const PLAN_COLORS = { gratis: "#8A7A5C", profesional: "#5B7065", premium: "#C4622A" };

export default function TecnicosPanelPage() {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!key.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/technicians?key=${encodeURIComponent(key.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al cargar");
      setTechnicians(json.technicians.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setUnlocked(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTech = async (id, updates) => {
    const res = await fetch("/api/technicians", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key.trim(), id, updates }),
    });
    if (res.ok) {
      setTechnicians((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    }
  };

  if (!unlocked) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3EDE2", padding: "40px 20px" }}>
        <div style={{ maxWidth: 420, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Roboto Slab', serif", color: "#1F2D2B", fontSize: 22 }}>CasaIA — Técnicos</h1>
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
          <Wrench size={20} color="#C4622A" />
          <h1 style={{ fontFamily: "'Roboto Slab', serif", color: "#1F2D2B", fontSize: 22, margin: 0 }}>
            Técnicos registrados ({technicians.length})
          </h1>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C", marginBottom: 20 }}>
          Podés activar/desactivar cada uno o cambiarle el plan manualmente.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {technicians.map((tech) => (
            <div key={tech.id} style={{ background: "#FFFFFF", border: "1px solid #E9E2D2", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "#1F2D2B" }}>
                    {tech.nombre} {tech.empresa && `— ${tech.empresa}`}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8A7A5C", marginTop: 2 }}>
                    {tech.telefono} · {tech.email || "sin email"}
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#5B7065", marginTop: 6 }}>
                    Zonas: {(tech.zonas || []).join(", ") || "-"}
                  </div>
                  {tech.especialidades && (
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#5B7065" }}>
                      Especialidades: {tech.especialidades}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => updateTech(tech.id, { activo: !tech.activo })}
                  style={{ border: "none", background: "transparent" }}
                  title={tech.activo ? "Activo" : "Inactivo"}
                >
                  {tech.activo ? <ToggleRight size={26} color="#2A5A3E" /> : <ToggleLeft size={26} color="#B5401F" />}
                </button>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                {["gratis", "profesional", "premium"].map((plan) => (
                  <button
                    key={plan}
                    onClick={() => updateTech(tech.id, { plan })}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      border: `1px solid ${tech.plan === plan ? PLAN_COLORS[plan] : "#E0D8C7"}`,
                      background: tech.plan === plan ? PLAN_COLORS[plan] : "transparent",
                      color: tech.plan === plan ? "#FFFFFF" : "#8A7A5C",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      textTransform: "uppercase",
                    }}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {technicians.length === 0 && (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C" }}>Todavía no hay técnicos registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}
