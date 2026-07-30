"use client";

import React, { useState } from "react";
import { Lock, Loader2, Building2, Copy, Check, Trash2, LockOpen, ChevronDown, ChevronUp, Wrench, Phone, Home, MapPin } from "lucide-react";
import { labelCategoria } from "../../../lib/categorias";

const PLAN_COLORS = { gratis: "#8A7A5C", profesional: "#5B7065", premium: "#C4622A" };

export default function InmobiliariasPanelPage() {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedPropId, setExpandedPropId] = useState(null);

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

  const updateAgency = async (id, updates) => {
    const res = await fetch("/api/agencies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key.trim(), id, updates }),
    });
    if (res.ok) {
      setAgencies((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const merged = { ...a, ...updates };
          if (updates.planesHabilitados) {
            merged.planesHabilitados = { ...a.planesHabilitados, ...updates.planesHabilitados };
          }
          return merged;
        })
      );
    }
  };

  const togglePlanHabilitado = async (agency, plan) => {
    const actual = agency.planesHabilitados?.[plan] !== false;
    await updateAgency(agency.id, { planesHabilitados: { [plan]: !actual } });
  };

  const deleteAgency = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar a "${nombre}" y todos sus datos (técnicos, propiedades, links)? Esta acción no se puede deshacer.`)) return;
    const res = await fetch("/api/agencies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key.trim(), id }),
    });
    if (res.ok) {
      setAgencies((prev) => prev.filter((a) => a.id !== id));
    }
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "#1F2D2B" }}>{ag.nombre}</div>
                <button
                  onClick={() => deleteAgency(ag.id, ag.nombre)}
                  style={{ border: "none", background: "transparent" }}
                  title="Eliminar"
                >
                  <Trash2 size={18} color="#B5401F" />
                </button>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8A7A5C", marginTop: 2 }}>
                {ag.contacto} · {ag.email} {ag.telefono && `· ${ag.telefono}`}
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#5B7065", marginTop: 6 }}>
                Localidades: {ag.localidades || "-"}
              </div>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                <TecnicosToggle
                  agency={ag}
                  expanded={expandedId === ag.id}
                  onToggle={() => setExpandedId((prev) => (prev === ag.id ? null : ag.id))}
                />
                <PropiedadesToggle
                  agency={ag}
                  expanded={expandedPropId === ag.id}
                  onToggle={() => setExpandedPropId((prev) => (prev === ag.id ? null : ag.id))}
                />
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
              <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
                {["gratis", "profesional", "premium"].map((plan) => {
                  const habilitado = ag.planesHabilitados?.[plan] !== false;
                  return (
                    <div key={plan} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <button
                        onClick={() => habilitado && updateAgency(ag.id, { plan })}
                        disabled={!habilitado}
                        title={!habilitado ? "Plan deshabilitado para esta inmobiliaria" : undefined}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "999px 0 0 999px",
                          border: `1px solid ${(ag.plan || "gratis") === plan ? PLAN_COLORS[plan] : "#E0D8C7"}`,
                          borderRight: "none",
                          background: (ag.plan || "gratis") === plan ? PLAN_COLORS[plan] : "transparent",
                          color: (ag.plan || "gratis") === plan ? "#FFFFFF" : "#8A7A5C",
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 10,
                          textTransform: "uppercase",
                          opacity: habilitado ? 1 : 0.35,
                          cursor: habilitado ? "pointer" : "not-allowed",
                        }}
                      >
                        {plan}
                      </button>
                      <button
                        onClick={() => togglePlanHabilitado(ag, plan)}
                        title={habilitado ? "Deshabilitar este plan para esta inmobiliaria" : "Habilitar este plan para esta inmobiliaria"}
                        style={{
                          padding: "4px 6px",
                          borderRadius: "0 999px 999px 0",
                          border: `1px solid ${(ag.plan || "gratis") === plan ? PLAN_COLORS[plan] : "#E0D8C7"}`,
                          background: (ag.plan || "gratis") === plan ? PLAN_COLORS[plan] : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        {habilitado ? (
                          <LockOpen size={10} color={(ag.plan || "gratis") === plan ? "#FFFFFF" : "#5B7065"} />
                        ) : (
                          <Lock size={10} color={(ag.plan || "gratis") === plan ? "#FFFFFF" : "#B5401F"} />
                        )}
                      </button>
                    </div>
                  );
                })}
                {ag.planesHabilitados?.[ag.plan || "gratis"] === false && (
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#B5401F", border: "1px solid #B5401F", borderRadius: 999, padding: "2px 8px" }}>
                    bloqueada — su panel muestra invitación a suscribirse
                  </span>
                )}
                {ag.subscription && (
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#8A7A5C", marginLeft: 4 }}>
                    de alta desde {new Date(ag.subscription.startDate).toLocaleDateString("es-AR")}
                  </span>
                )}
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

function TecnicoRow({ nombre, telefono, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
      <Wrench size={13} color="#8A7A5C" style={{ flexShrink: 0 }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, fontWeight: 600, color: "#1F2D2B" }}>
          {nombre}
          {sub && (
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, color: "#8A7A5C" }}> — {sub}</span>
          )}
        </div>
        {telefono && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#5B7065" }}>
            <Phone size={10} /> {telefono}
          </div>
        )}
      </div>
    </div>
  );
}

function PropiedadRow({ prop, agencySlug }) {
  const [copied, setCopied] = useState(false);
  const link = prop.slug ? `casaia.net/i/${agencySlug}/${prop.slug}` : null;

  const copyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(`https://${link}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "8px 0", borderBottom: "1px solid #E9E2D2" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Home size={13} color="#8A7A5C" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, fontWeight: 600, color: "#1F2D2B" }}>
            {prop.nombre}
          </div>
          {prop.direccion && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "Inter, sans-serif", fontSize: 11, color: "#5B7065", marginTop: 1 }}>
              <MapPin size={10} /> {prop.direccion}
            </div>
          )}
          {(prop.checkIn || prop.checkOut) && (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#8A7A5C", marginTop: 2 }}>
              Check-in {prop.checkIn || "-"} · Check-out {prop.checkOut || "-"}
            </div>
          )}
          {link && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "#1F2D2B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {link}
              </span>
              <button onClick={copyLink} style={{ border: "none", background: "transparent", cursor: "pointer", flexShrink: 0 }}>
                {copied ? <Check size={11} color="#2A5A3E" /> : <Copy size={11} color="#5B7065" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PropiedadesToggle({ agency, expanded, onToggle }) {
  const propiedades = (agency.propiedades || []).filter((p) => p.nombre?.trim());
  const total = propiedades.length;

  return (
    <div>
      <button
        onClick={onToggle}
        disabled={total === 0}
        style={{
          display: "flex", alignItems: "center", gap: 4, marginTop: 4,
          border: "none", background: "transparent", padding: 0,
          fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
          color: total === 0 ? "#B9AF97" : "#C4622A",
          cursor: total === 0 ? "default" : "pointer",
        }}
      >
        {total} propiedad{total === 1 ? "" : "es"} registrada{total === 1 ? "" : "s"}
        {total > 0 && (expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
      </button>

      {expanded && total > 0 && (
        <div style={{ marginTop: 8, background: "#F3EDE2", borderRadius: 10, padding: "4px 12px", minWidth: 260 }}>
          {propiedades.map((p, i) => (
            <PropiedadRow key={p.slug || i} prop={p} agencySlug={agency.slug} />
          ))}
        </div>
      )}
    </div>
  );
}

function TecnicosToggle({ agency, expanded, onToggle }) {
  const generales = agency.tecnicos || [];

  // Técnicos específicos por propiedad: recorremos cada propiedad y sus
  // categorías, y nos quedamos solo con los slots que tienen datos cargados.
  const porPropiedad = (agency.propiedades || []).flatMap((prop) => {
    const map = prop.tecnicosPropiedad || {};
    return Object.entries(map)
      .filter(([, t]) => t?.nombre && t?.telefono)
      .map(([categoriaId, t]) => ({
        propiedad: prop.nombre,
        categoriaId,
        nombre: t.nombre,
        telefono: t.telefono,
      }));
  });

  const total = generales.length + porPropiedad.length;

  return (
    <div>
      <button
        onClick={onToggle}
        disabled={total === 0}
        style={{
          display: "flex", alignItems: "center", gap: 4, marginTop: 4,
          border: "none", background: "transparent", padding: 0,
          fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
          color: total === 0 ? "#B9AF97" : "#C4622A",
          cursor: total === 0 ? "default" : "pointer",
        }}
      >
        {total} técnico{total === 1 ? "" : "s"} declarado{total === 1 ? "" : "s"}
        {total > 0 && (expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
      </button>

      {expanded && total > 0 && (
        <div style={{ marginTop: 8, background: "#F3EDE2", borderRadius: 10, padding: "8px 12px" }}>
          {generales.length > 0 && (
            <>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#8A7A5C", textTransform: "uppercase", marginBottom: 2 }}>
                Técnicos generales
              </div>
              {generales.map((t, i) => (
                <TecnicoRow key={`g-${i}`} nombre={t.nombre} telefono={t.telefono} sub={t.especialidad || labelCategoria(t.categoria)} />
              ))}
            </>
          )}
          {porPropiedad.length > 0 && (
            <>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#8A7A5C", textTransform: "uppercase", marginTop: generales.length ? 10 : 0, marginBottom: 2 }}>
                Técnicos por propiedad
              </div>
              {porPropiedad.map((t, i) => (
                <TecnicoRow
                  key={`p-${i}`}
                  nombre={t.nombre}
                  telefono={t.telefono}
                  sub={`${t.propiedad} · ${labelCategoria(t.categoriaId)}`}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
