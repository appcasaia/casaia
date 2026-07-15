"use client";

import React, { useState } from "react";
import { Lock, Plus, Trash2, Save, Loader2, MapPin } from "lucide-react";

const emptyRow = () => ({ zona: "", nombre: "", telefono: "", email: "", direccion: "" });

export default function ReferidosPage() {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedOk, setSavedOk] = useState(false);

  const load = async () => {
    if (!key.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/referrals?key=${encodeURIComponent(key.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al cargar");
      setReferrals(json.referrals.length ? json.referrals : [emptyRow()]);
      setUnlocked(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (i, field, value) => {
    setReferrals((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setReferrals((prev) => [...prev, emptyRow()]);
  const removeRow = (i) => setReferrals((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    setError(null);
    setSavedOk(false);
    try {
      const clean = referrals.filter((r) => r.zona.trim() && r.nombre.trim());
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim(), referrals: clean }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      setReferrals(clean.length ? clean : [emptyRow()]);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!unlocked) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3EDE2", padding: "40px 20px" }}>
        <div style={{ maxWidth: 420, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Roboto Slab', serif", color: "#1F2D2B", fontSize: 22 }}>
            CasaIA — Comercios referidos
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C", marginBottom: 20 }}>
            Ingresá tu clave de administrador para gestionar la lista.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
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
              {loading ? <Loader2 size={16} className="spin" /> : "Entrar"}
            </button>
          </div>
          {error && (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#B5401F", marginTop: 12 }}>
              {error}
            </p>
          )}
        </div>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F3EDE2", padding: "40px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <MapPin size={20} color="#C4622A" />
          <h1 style={{ fontFamily: "'Roboto Slab', serif", color: "#1F2D2B", fontSize: 22, margin: 0 }}>
            Comercios referidos por zona
          </h1>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C", marginBottom: 20 }}>
          Cuando un cliente escriba una zona que coincida con alguna de acá, el
          lead se le va a mandar directo también a ese comercio (además de a
          vos). Ej: zona "Florianópolis" agrupa cualquier texto que contenga
          esa palabra, como "Florianópolis centro".
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {referrals.map((r, i) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E9E2D2",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                <button
                  onClick={() => removeRow(i)}
                  aria-label="Eliminar"
                  style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4 }}
                >
                  <Trash2 size={16} color="#B5401F" />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <input
                  placeholder="Zona (ej: Florianópolis)"
                  value={r.zona}
                  onChange={(e) => updateRow(i, "zona", e.target.value)}
                  style={cellStyle}
                />
                <input
                  placeholder="Nombre del comercio"
                  value={r.nombre}
                  onChange={(e) => updateRow(i, "nombre", e.target.value)}
                  style={cellStyle}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <input
                  placeholder="Teléfono (ej: 5548999999999)"
                  value={r.telefono}
                  onChange={(e) => updateRow(i, "telefono", e.target.value)}
                  style={cellStyle}
                />
                <input
                  placeholder="Email (opcional)"
                  value={r.email}
                  onChange={(e) => updateRow(i, "email", e.target.value)}
                  style={cellStyle}
                />
              </div>
              <input
                placeholder="Dirección postal (opcional)"
                value={r.direccion || ""}
                onChange={(e) => updateRow(i, "direccion", e.target.value)}
                style={{ ...cellStyle, width: "100%" }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "1px dashed #C4622A",
            background: "transparent",
            color: "#C4622A",
            borderRadius: 10,
            padding: "8px 14px",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Plus size={14} /> Agregar comercio
        </button>

        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={save}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: "#1F2D2B",
              color: "#F3EDE2",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            Guardar cambios
          </button>
          {savedOk && (
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#2A5A3E" }}>
              Guardado ✓
            </span>
          )}
          {error && (
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#B5401F" }}>{error}</span>
          )}
        </div>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const cellStyle = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #E0D8C7",
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
