"use client";

import React, { useState } from "react";
import { Lock, Loader2, Users, Download, Wrench, Building2 } from "lucide-react";

const PLAN_COLORS = { gratis: "#8A7A5C", profesional: "#5B7065", premium: "#C4622A" };

export default function ContactosPanelPage() {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [totals, setTotals] = useState({ tecnicos: 0, inmobiliarias: 0 });
  const [filter, setFilter] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!key.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contacts?key=${encodeURIComponent(key.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al cargar");
      setContacts(json.contacts);
      setTotals(json.totals);
      setUnlocked(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Tipo", "Nombre", "Contacto", "Email", "Zona/Localidad", "Fecha de alta", "Días de alta", "Plan", "Precio", "Estado suscripción", "Avisado", "Activo"];
    const rows = filtered.map((c) => [
      c.tipo,
      c.nombre,
      c.contacto,
      c.email,
      c.zona,
      c.createdAt ? new Date(c.createdAt).toLocaleDateString("es-AR") : "-",
      c.diasDeAlta ?? "-",
      c.plan,
      c.precio,
      c.estadoSuscripcion,
      c.avisado ? "Sí" : "No",
      c.activo ? "Sí" : "No",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `casaia-contactos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = filter === "todos" ? contacts : contacts.filter((c) => c.tipo === filter);

  if (!unlocked) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3EDE2", padding: "40px 20px" }}>
        <div style={{ maxWidth: 420, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Roboto Slab', serif", color: "#1F2D2B", fontSize: 22 }}>CasaIA — Contactos</h1>
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
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Users size={20} color="#C4622A" />
          <h1 style={{ fontFamily: "'Roboto Slab', serif", color: "#1F2D2B", fontSize: 22, margin: 0 }}>
            Contactos ({contacts.length})
          </h1>
        </div>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8A7A5C", marginBottom: 20 }}>
          {totals.tecnicos} técnicos · {totals.inmobiliarias} inmobiliarias
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
          {[
            { id: "todos", label: "Todos" },
            { id: "tecnico", label: "Técnicos" },
            { id: "inmobiliaria", label: "Inmobiliarias" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: `1px solid ${filter === f.id ? "#1F2D2B" : "#E0D8C7"}`,
                background: filter === f.id ? "#1F2D2B" : "transparent",
                color: filter === f.id ? "#FFFFFF" : "#8A7A5C",
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={exportCSV}
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 999,
              border: "none",
              background: "#C4622A",
              color: "#FFFFFF",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <Download size={14} /> Exportar CSV
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((c) => (
            <div key={`${c.tipo}-${c.id}`} style={{ background: "#FFFFFF", border: "1px solid #E9E2D2", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {c.tipo === "tecnico" ? <Wrench size={15} color="#5B7065" /> : <Building2 size={15} color="#5B7065" />}
                  <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "#1F2D2B" }}>
                    {c.nombre}
                  </div>
                  {!c.activo && (
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#B5401F", border: "1px solid #B5401F", borderRadius: 999, padding: "1px 8px" }}>
                      inactivo
                    </span>
                  )}
                </div>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 999,
                    border: `1px solid ${PLAN_COLORS[c.plan] || "#E0D8C7"}`,
                    color: PLAN_COLORS[c.plan] || "#8A7A5C",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    textTransform: "uppercase",
                  }}
                >
                  {c.plan}
                </span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8A7A5C", marginTop: 4 }}>
                {c.contacto || "sin teléfono"} · {c.email || "sin email"}
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#5B7065", marginTop: 6 }}>
                Zona/localidad: {c.zona || "-"} · Alta:{" "}
                {c.createdAt ? new Date(c.createdAt).toLocaleDateString("es-AR") : "-"}
                {c.diasDeAlta !== null && ` (${c.diasDeAlta} días)`}
                {c.avisado && " · ya avisado del cambio de precio"}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C" }}>No hay contactos para este filtro.</p>
          )}
        </div>
      </div>
    </div>
  );
}
