"use client";

import React, { useState } from "react";
import { Building2, Loader2, CheckCircle2, Plus, Trash2, Copy, Check, KeyRound } from "lucide-react";
import TurnstileWidget from "../../../components/TurnstileWidget";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1px solid #E0D8C7",
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  outline: "none",
  marginBottom: 12,
};

const labelStyle = {
  fontFamily: "Inter, sans-serif",
  fontSize: 12,
  color: "#8A7A5C",
  marginBottom: 4,
  display: "block",
  fontWeight: 600,
};

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

const emptyTecnico = () => ({ nombre: "", telefono: "", especialidad: "" });
const emptyPropiedad = () => ({ nombre: "", direccion: "", wifi: "", claveDepto: "", clavePorton: "", notas: "" });

export default function InmobiliariasRegistroPage() {
  const [form, setForm] = useState({ nombre: "", contacto: "", email: "", telefono: "", localidades: "" });
  const [tecnicos, setTecnicos] = useState([emptyTecnico()]);
  const [propiedades, setPropiedades] = useState([emptyPropiedad()]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState(null);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const updateTec = (i, field, value) =>
    setTecnicos((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  const addTec = () => setTecnicos((prev) => [...prev, emptyTecnico()]);
  const removeTec = (i) => setTecnicos((prev) => prev.filter((_, idx) => idx !== i));

  const updateProp = (i, field, value) =>
    setPropiedades((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  const addProp = () => setPropiedades((prev) => [...prev, emptyPropiedad()]);
  const removeProp = (i) => setPropiedades((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!form.nombre.trim() || !form.contacto.trim() || !form.email.trim()) {
      setError("Completá al menos nombre, contacto y email. / Preencha ao menos nome, contato e e-mail.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tecnicos: tecnicos.filter((t) => t.nombre && t.telefono),
          propiedades: propiedades.filter((p) => p.nombre.trim()),
          turnstileToken,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError("No se pudo completar el registro. Probá de nuevo. / Não foi possível concluir o cadastro. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (result) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3EDE2", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 480, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <CheckCircle2 size={44} color="#2A5A3E" style={{ marginBottom: 14 }} />
            <h1 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 22, color: "#1F2D2B", marginBottom: 10 }}>
              ¡Listo, tu registro está completo! / Pronto, seu cadastro está completo!
            </h1>
          </div>

          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C", marginBottom: 6, fontWeight: 700 }}>
            1. LINK PARA TUS CLIENTES / LINK PARA SEUS CLIENTES — compartilo con huéspedes/inquilinos
          </p>
          <LinkBox text={result.link} onCopy={() => copyText(result.link, "link")} copied={copied === "link"} />

          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C", marginTop: 18, marginBottom: 6, fontWeight: 700 }}>
            2. LINK PRIVADO PARA EDITAR TUS DATOS / LINK PRIVADO PARA EDITAR SEUS DADOS
          </p>
          <LinkBox text={result.editLink} onCopy={() => copyText(result.editLink, "edit")} copied={copied === "edit"} highlight />
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#8A7A5C", marginTop: 6 }}>
            <KeyRound size={12} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
            Con este link podés volver cuando quieras a modificar tus técnicos o propiedades, sin contraseña.
            <br />
            Com esse link você pode voltar quando quiser para modificar seus técnicos ou propriedades, sem senha.
          </p>

          {result.properties?.length > 0 && (
            <>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C", marginTop: 26, marginBottom: 10, fontWeight: 700 }}>
                3. LINKS Y QR POR PROPIEDAD — pegá el QR en la puerta de cada una
                <br />
                LINKS E QR POR PROPRIEDADE — cole o QR na porta de cada uma
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {result.properties.map((p) => (
                  <div key={p.slug} style={{ background: "#FFFFFF", border: "1px solid #E9E2D2", borderRadius: 12, padding: 14, display: "flex", gap: 14, alignItems: "center" }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(p.link)}`}
                      alt={`QR ${p.nombre}`}
                      width={90}
                      height={90}
                      style={{ borderRadius: 8, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14, color: "#1F2D2B", marginBottom: 6 }}>
                        {p.nombre}
                      </div>
                      <LinkBox text={p.link} onCopy={() => copyText(p.link, p.slug)} copied={copied === p.slug} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <a href="/" style={{ display: "inline-block", marginTop: 24, color: "#C4622A", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14 }}>
            ← Volver a CasaIA / Voltar ao CasaIA
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
            Registrate como inmobiliaria / Cadastre-se como imobiliária
          </h1>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C", marginBottom: 24 }}>
          Vas a recibir un link exclusivo para compartir con tus huéspedes, y otro link privado para editar tus datos cuando quieras.
          <br />
          Você vai receber um link exclusivo para compartilhar com seus hóspedes, e outro link privado para editar seus dados.
        </p>

        <label style={labelStyle}>Nombre de la empresa / Nome da empresa *</label>
        <input style={inputStyle} value={form.nombre} onChange={update("nombre")} placeholder="Ej/Ex: Inmobiliaria del Sur" />

        <label style={labelStyle}>Persona de contacto / Pessoa de contato *</label>
        <input style={inputStyle} value={form.contacto} onChange={update("contacto")} placeholder="Nombre y apellido / Nome e sobrenome" />

        <label style={labelStyle}>Email / E-mail *</label>
        <input style={inputStyle} value={form.email} onChange={update("email")} placeholder="contacto@inmobiliaria.com" />

        <label style={labelStyle}>Teléfono / Telefone</label>
        <input style={inputStyle} value={form.telefono} onChange={update("telefono")} placeholder="Ej/Ex: 5548999999999" />

        <label style={labelStyle}>Localidades donde operás / Cidades onde atua</label>
        <input style={inputStyle} value={form.localidades} onChange={update("localidades")} placeholder="Ej/Ex: Florianópolis, Ingleses" />

        {/* Técnicos de confianza */}
        <label style={{ ...labelStyle, marginTop: 8, fontSize: 13 }}>Técnicos de confianza / Técnicos de confiança</label>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#8A7A5C", marginTop: -6, marginBottom: 10 }}>
          Los que ya trabajan con vos habitualmente. Cargá el teléfono con código de país, sin "+", espacios ni guiones (ej: 5548999999999).
          <br />
          Os que já trabalham com você. Cadastre o telefone com código do país, sem "+", espaços ou traços (ex: 5548999999999).
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
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
              <input style={smallInput} placeholder="Especialidad / Especialidade (ej/ex: gas/gás, plomería/encanamento)" value={tec.especialidad} onChange={(e) => updateTec(i, "especialidad", e.target.value)} />
            </div>
          ))}
        </div>
        <button onClick={addTec} style={dashedBtnStyle}>
          <Plus size={14} /> Agregar técnico / Adicionar técnico
        </button>

        {/* Propiedades / datos útiles */}
        <label style={{ ...labelStyle, marginTop: 26, fontSize: 13 }}>Datos útiles de tus propiedades / Dados úteis das propriedades</label>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#8A7A5C", marginTop: -6, marginBottom: 10 }}>
          WiFi, claves de acceso, etc. La IA responde estos datos automáticamente al huésped.
          <br />
          WiFi, senhas de acesso, etc. A IA responde esses dados automaticamente ao hóspede.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
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
              <input style={smallInput} placeholder="Otras notas / Outras observações (opcional)" value={prop.notas} onChange={(e) => updateProp(i, "notas", e.target.value)} />
            </div>
          ))}
        </div>
        <button onClick={addProp} style={dashedBtnStyle}>
          <Plus size={14} /> Agregar propiedad / Adicionar propriedade
        </button>

        <TurnstileWidget onVerify={setTurnstileToken} />

        {error && (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#B5401F", marginTop: 20, marginBottom: 4 }}>{error}</p>
        )}

        <button
          onClick={submit}
          disabled={sending}
          style={{
            width: "100%",
            marginTop: 24,
            padding: "12px 0",
            borderRadius: 10,
            border: "none",
            background: "#1F2D2B",
            color: "#F3EDE2",
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: sending ? 0.6 : 1,
          }}
        >
          {sending ? <Loader2 size={16} className="spin" /> : null}
          {sending ? "Generando link... / Gerando link..." : "Registrarme y generar mi link / Cadastrar e gerar meu link"}
        </button>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

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

function LinkBox({ text, onCopy, copied, highlight }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: highlight ? "#FBEAE4" : "#FFFFFF",
        border: `1px solid ${highlight ? "#E0B5A0" : "#E9E2D2"}`,
        borderRadius: 10,
        padding: "10px 14px",
      }}
    >
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#1F2D2B", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {text}
      </span>
      <button onClick={onCopy} style={{ border: "none", background: "transparent", cursor: "pointer", flexShrink: 0 }} aria-label="Copiar">
        {copied ? <Check size={16} color="#2A5A3E" /> : <Copy size={16} color="#5B7065" />}
      </button>
    </div>
  );
}
