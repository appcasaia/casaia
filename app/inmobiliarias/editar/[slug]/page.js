"use client";

import React, { useEffect, useState } from "react";
import { Building2, Loader2, Plus, Trash2, Save, Check, KeyRound, AlertCircle, Sparkles } from "lucide-react";
import { AGENCY_PLAN_LIMITS, PLAN_LABELS, estaBloqueadoPorPlan } from "../../../../lib/subscriptions";

const smallInput = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #E0D8C7",
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle = {
  fontFamily: "Inter, sans-serif",
  fontSize: 12,
  color: "#8A7A5C",
  marginBottom: 4,
  display: "block",
  fontWeight: 600,
};

const dashedBtnStyle = {
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
  marginBottom: 20,
};

const emptyTecnico = () => ({ nombre: "", telefono: "", especialidad: "" });
const emptyPropiedad = () => ({ nombre: "", direccion: "", wifi: "", claveDepto: "", clavePorton: "", notas: "" });

export default function EditarInmobiliariaPage({ params, searchParams }) {
  const { slug } = params;
  const token = searchParams?.token;

  const [status, setStatus] = useState("loading"); // loading | ok | error
  const [agency, setAgency] = useState(null);
  const [form, setForm] = useState({ contacto: "", telefono: "", localidades: "" });
  const [tecnicos, setTecnicos] = useState([]);
  const [propiedades, setPropiedades] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Falta el token de acceso en el link. Usá el link privado que te enviamos por email. / Falta o token no link. Use o link privado que enviamos por e-mail.");
      return;
    }
    fetch(`/api/agencies/${slug}?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error("No autorizado");
        return res.json();
      })
      .then((data) => {
        const a = data.agency;
        setAgency(a);
        setForm({ contacto: a.contacto || "", telefono: a.telefono || "", localidades: a.localidades || "" });
        setTecnicos(a.tecnicos?.length ? a.tecnicos : [emptyTecnico()]);
        setPropiedades(a.propiedades?.length ? a.propiedades : [emptyPropiedad()]);
        setStatus("ok");
      })
      .catch(() => {
        setStatus("error");
        setError("Este link no es válido o ya no está activo. Revisá el email que te mandamos. / Este link não é válido ou não está mais ativo. Confira o e-mail que enviamos.");
      });
  }, [slug, token]);

  const updateTec = (i, field, value) =>
    setTecnicos((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  const addTec = () => setTecnicos((prev) => [...prev, emptyTecnico()]);
  const removeTec = (i) => setTecnicos((prev) => prev.filter((_, idx) => idx !== i));

  const updateProp = (i, field, value) =>
    setPropiedades((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  const propLimit = AGENCY_PLAN_LIMITS[agency?.plan || "gratis"]?.maxProperties ?? AGENCY_PLAN_LIMITS.gratis.maxProperties;
  const propCount = propiedades.filter((p) => p.nombre.trim()).length;
  const atLimit = propCount >= propLimit;
  const addProp = () => {
    if (atLimit) return;
    setPropiedades((prev) => [...prev, emptyPropiedad()]);
  };
  const removeProp = (i) => setPropiedades((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    setSavedOk(false);
    setError(null);
    try {
      const res = await fetch(`/api/agencies/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          updates: {
            ...form,
            tecnicos: tecnicos.filter((t) => t.nombre && t.telefono),
            propiedades: propiedades.filter((p) => p.nombre.trim()),
          },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.agency?.propiedades) setPropiedades(data.agency.propiedades.length ? data.agency.propiedades : [emptyPropiedad()]);
      if (data.agency?.tecnicos) setTecnicos(data.agency.tecnicos.length ? data.agency.tecnicos : [emptyTecnico()]);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (e) {
      setError("No se pudo guardar. Probá de nuevo. / Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3EDE2" }}>
        <Loader2 size={22} color="#5B7065" className="spin" />
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3EDE2", padding: 20 }}>
        <p style={{ fontFamily: "Inter, sans-serif", color: "#B5401F", textAlign: "center", maxWidth: 400 }}>{error}</p>
      </div>
    );
  }

  if (estaBloqueadoPorPlan(agency)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3EDE2", padding: 20 }}>
        <div style={{ maxWidth: 440, textAlign: "center", background: "#FFFFFF", border: "1px solid #E9E2D2", borderRadius: 16, padding: 32 }}>
          <Sparkles size={28} color="#C4622A" style={{ marginBottom: 12 }} />
          <h1 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 20, color: "#1F2D2B", marginBottom: 10 }}>
            {agency.nombre}
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#5B7065", lineHeight: 1.6, marginBottom: 8 }}>
            Tu plan actual ({PLAN_LABELS[agency.plan] || agency.plan}) no está activo en este momento.
            Escribinos para reactivar tu suscripción y seguir editando tus técnicos y propiedades.
          </p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#5B7065", lineHeight: 1.6, marginBottom: 20 }}>
            Seu plano atual ({PLAN_LABELS[agency.plan] || agency.plan}) não está ativo no momento.
            Entre em contato para reativar sua assinatura e continuar editando.
          </p>
          <a
            href={`mailto:casaia24h@gmail.com?subject=${encodeURIComponent("Quiero reactivar mi plan en CasaIA — " + agency.nombre)}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              background: "#C4622A",
              color: "#FFFFFF",
              textDecoration: "none",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Escribirnos / Fale conosco
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F3EDE2", padding: "40px 20px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Building2 size={20} color="#C4622A" />
          <h1 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 22, color: "#1F2D2B", margin: 0 }}>
            {agency.nombre}
          </h1>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C", marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
          <KeyRound size={13} /> Panel privado de edición / Painel privado de edição — nadie más puede acceder sin tu link.
        </p>

        <label style={labelStyle}>Persona de contacto / Pessoa de contato</label>
        <input style={{ ...smallInput, marginBottom: 12 }} value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} />

        <label style={labelStyle}>Teléfono / Telefone</label>
        <input style={{ ...smallInput, marginBottom: 12 }} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />

        <label style={labelStyle}>Localidades donde operás / Cidades onde atua</label>
        <input style={{ ...smallInput, marginBottom: 20 }} value={form.localidades} onChange={(e) => setForm({ ...form, localidades: e.target.value })} />

        {/* Técnicos */}
        <label style={{ ...labelStyle, marginTop: 8, fontSize: 13 }}>Técnicos de confianza / Técnicos de confiança</label>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: "#8A7A5C", marginTop: 2, marginBottom: 8 }}>
          Teléfono con código de país, sin "+", espacios ni guiones (ej: 5548999999999).
          <br />
          Telefone com código do país, sem "+", espaços ou traços (ex: 5548999999999).
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10, marginTop: 8 }}>
          {tecnicos.map((tec, i) => (
            <div key={i} style={{ background: "#FFFFFF", border: "1px solid #E9E2D2", borderRadius: 10, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                <button onClick={() => removeTec(i)} style={{ border: "none", background: "transparent" }} aria-label="Quitar">
                  <Trash2 size={14} color="#B5401F" />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <input style={smallInput} placeholder="Nombre / Nome" value={tec.nombre} onChange={(e) => updateTec(i, "nombre", e.target.value)} />
                <input style={smallInput} placeholder="Teléfono / Telefone" value={tec.telefono} onChange={(e) => updateTec(i, "telefono", e.target.value)} />
              </div>
              <input style={smallInput} placeholder="Especialidad / Especialidade" value={tec.especialidad} onChange={(e) => updateTec(i, "especialidad", e.target.value)} />
            </div>
          ))}
        </div>
        <button onClick={addTec} style={dashedBtnStyle}>
          <Plus size={14} /> Agregar técnico / Adicionar técnico
        </button>

        {/* Propiedades */}
        <label style={{ ...labelStyle, marginTop: 26, fontSize: 13 }}>Datos útiles de tus propiedades / Dados úteis das propriedades</label>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: "#8A7A5C", marginTop: 2, marginBottom: 8 }}>
          Cada propiedad guardada tiene su propio link y QR (aparece debajo de sus datos) para imprimir y pegar en la puerta.
          <br />
          Cada propriedade salva tem seu próprio link e QR (aparece abaixo dos dados) para imprimir e colar na porta.
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 8,
            background: atLimit ? "#FBE4DB" : "#EFEAE0",
            border: `1px solid ${atLimit ? "#D94E2A" : "#E0D8C7"}`,
            marginBottom: 8,
          }}
        >
          <AlertCircle size={14} color={atLimit ? "#B5401F" : "#8A7A5C"} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: atLimit ? "#7A2A14" : "#5B7065" }}>
            {atLimit
              ? `Llegaste al límite de tu plan ${PLAN_LABELS[agency?.plan || "gratis"]} (${propLimit} propiedades). Escribinos para pasar a un plan superior. / Você atingiu o limite do seu plano ${PLAN_LABELS[agency?.plan || "gratis"]} (${propLimit} propriedades). Fale conosco para mudar de plano.`
              : propLimit === Infinity
              ? "Tu plan permite propiedades ilimitadas. / Seu plano permite propriedades ilimitadas."
              : `${propCount} de ${propLimit} propiedades usadas en tu plan ${PLAN_LABELS[agency?.plan || "gratis"]}. / ${propCount} de ${propLimit} propriedades usadas no seu plano ${PLAN_LABELS[agency?.plan || "gratis"]}.`}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10, marginTop: 8 }}>
          {propiedades.map((prop, i) => (
            <div key={i} style={{ background: "#FFFFFF", border: "1px solid #E9E2D2", borderRadius: 10, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                <button onClick={() => removeProp(i)} style={{ border: "none", background: "transparent" }} aria-label="Quitar">
                  <Trash2 size={14} color="#B5401F" />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <input style={smallInput} placeholder="Nombre / Nome (ej/ex: Depto 203)" value={prop.nombre} onChange={(e) => updateProp(i, "nombre", e.target.value)} />
                <input style={smallInput} placeholder="Dirección / Endereço" value={prop.direccion} onChange={(e) => updateProp(i, "direccion", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <input style={smallInput} placeholder="Clave WiFi / Senha WiFi" value={prop.wifi} onChange={(e) => updateProp(i, "wifi", e.target.value)} />
                <input style={smallInput} placeholder="Clave puerta / Senha porta" value={prop.claveDepto} onChange={(e) => updateProp(i, "claveDepto", e.target.value)} />
              </div>
              <input style={{ ...smallInput, marginBottom: 8 }} placeholder="Clave portón / Senha portão" value={prop.clavePorton} onChange={(e) => updateProp(i, "clavePorton", e.target.value)} />
              <input style={smallInput} placeholder="Otras notas / Outras observações" value={prop.notas} onChange={(e) => updateProp(i, "notas", e.target.value)} />
              {prop.slug && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0EAD9" }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(`https://casaia.net/i/${slug}/${prop.slug}`)}`}
                    alt="QR"
                    width={64}
                    height={64}
                    style={{ borderRadius: 6, flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#8A7A5C", marginBottom: 3 }}>
                      LINK DE ESTA PROPIEDAD / DESTA PROPRIEDADE
                    </div>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#1F2D2B", wordBreak: "break-all" }}>
                      casaia.net/i/{slug}/{prop.slug}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addProp}
          disabled={atLimit}
          style={{ ...dashedBtnStyle, opacity: atLimit ? 0.4 : 1, cursor: atLimit ? "not-allowed" : "pointer" }}
        >
          <Plus size={14} /> Agregar propiedad / Adicionar propriedade
        </button>

        {error && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#B5401F", marginBottom: 12 }}>{error}</p>}

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
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
            Guardar cambios / Salvar alterações
          </button>
          {savedOk && (
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#2A5A3E", display: "flex", alignItems: "center", gap: 6 }}>
              <Check size={15} /> Guardado / Salvo
            </span>
          )}
        </div>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
