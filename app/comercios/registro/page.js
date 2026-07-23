"use client";

import React, { useState } from "react";
import { Store, Loader2, CheckCircle2 } from "lucide-react";
import TurnstileWidget from "../../../components/TurnstileWidget";
import { CATEGORIAS_COMERCIO } from "../../../lib/categorias";

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

export default function ComerciosRegistroPage() {
  const [form, setForm] = useState({
    nombre: "",
    categoria: "restaurante",
    telefono: "",
    email: "",
    direccion: "",
    zonas: "",
    horarios: "",
    descripcion: "",
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState(null);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async () => {
    if (!form.nombre.trim() || !form.telefono.trim() || !form.zonas.trim()) {
      setError("Completá al menos nombre, teléfono y zonas de cobertura. / Preencha ao menos nome, telefone e áreas de atendimento.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/comercios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDone(true);
    } catch (e) {
      setError("No se pudo completar el registro. Probá de nuevo. / Não foi possível concluir o cadastro. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3EDE2", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <CheckCircle2 size={44} color="#2A5A3E" style={{ marginBottom: 14 }} />
          <h1 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 22, color: "#1F2D2B", marginBottom: 10 }}>
            ¡Listo, quedaste registrado! / Pronto, você está cadastrado!
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#5B7065" }}>
            A partir de ahora CasaIA va a recomendar tu comercio a los huéspedes de tu zona
            cuando pregunten por algo relacionado. Por el momento tu plan es <strong>Gratis</strong> —
            pronto vamos a sumar el plan Premium con mayor prioridad de aparición.
            <br /><br />
            A partir de agora o CasaIA vai recomendar seu comércio aos hóspedes da sua região
            quando perguntarem sobre algo relacionado. Por enquanto seu plano é <strong>Grátis</strong> —
            em breve teremos o plano Premium com mais prioridade.
          </p>
          <a href="/" style={{ display: "inline-block", marginTop: 20, color: "#C4622A", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14 }}>
            ← Volver a CasaIA / Voltar ao CasaIA
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F3EDE2", padding: "40px 20px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Store size={20} color="#C4622A" />
          <h1 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 22, color: "#1F2D2B", margin: 0 }}>
            Registrá tu comercio / Cadastre seu comércio
          </h1>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C", marginBottom: 24 }}>
          Cargá tu comercio para que CasaIA lo recomiende a huéspedes que preguntan dónde comer,
          farmacias cercanas, mercados, etc. Es gratis para arrancar.
          <br />
          Cadastre seu comércio para o CasaIA recomendar a hóspedes que perguntam onde comer,
          farmácias próximas, mercados, etc. É grátis.
        </p>

        <label style={labelStyle}>Nombre del comercio / Nome do comércio *</label>
        <input style={inputStyle} value={form.nombre} onChange={update("nombre")} placeholder="Ej/Ex: Restaurante do Zé" />

        <label style={labelStyle}>Categoría / Categoria *</label>
        <select style={inputStyle} value={form.categoria} onChange={update("categoria")}>
          {CATEGORIAS_COMERCIO.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} / {c.labelPt}
            </option>
          ))}
        </select>

        <label style={labelStyle}>Teléfono / Telefone (WhatsApp) *</label>
        <input style={inputStyle} value={form.telefono} onChange={update("telefono")} placeholder="Ej/Ex: 5548999999999" />
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: "#8A7A5C", marginTop: -8, marginBottom: 12 }}>
          Con código de país, sin "+", espacios ni guiones.
          <br />
          Com código do país, sem "+", espaços ou traços.
        </p>

        <label style={labelStyle}>Email / E-mail</label>
        <input style={inputStyle} value={form.email} onChange={update("email")} placeholder="tu@email.com" />

        <label style={labelStyle}>Dirección / Endereço</label>
        <input style={inputStyle} value={form.direccion} onChange={update("direccion")} placeholder="Ej/Ex: Av. das Nações, 123" />

        <label style={labelStyle}>Zonas donde recomendar / Áreas de atendimento * (separadas por coma / vírgula)</label>
        <input style={inputStyle} value={form.zonas} onChange={update("zonas")} placeholder="Ej/Ex: Canasvieiras, Jurerê" />

        <label style={labelStyle}>Horarios de atención / Horário de atendimento</label>
        <input style={inputStyle} value={form.horarios} onChange={update("horarios")} placeholder="Ej/Ex: Todos los días 11 a 23hs / Todos os dias 11h às 23h" />

        <label style={labelStyle}>Descripción breve (opcional) / Descrição breve (opcional)</label>
        <input style={inputStyle} value={form.descripcion} onChange={update("descripcion")} placeholder="Ej/Ex: Comida caseira, delivery disponível" />

        <TurnstileWidget onVerify={setTurnstileToken} />

        {error && (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#B5401F", marginBottom: 12 }}>{error}</p>
        )}

        <button
          onClick={submit}
          disabled={sending}
          style={{
            width: "100%",
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
          {sending ? "Registrando... / Cadastrando..." : "Registrar gratis / Cadastrar grátis"}
        </button>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
