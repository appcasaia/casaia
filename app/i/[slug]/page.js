"use client";

import React, { useEffect, useState } from "react";
import CasaIAChat from "../../../components/CasaIAChat";
import { Loader2 } from "lucide-react";

export default function AgencyLandingPage({ params }) {
  const { slug } = params;
  const [status, setStatus] = useState("loading"); // loading | ok | notfound
  const [agency, setAgency] = useState(null);

  useEffect(() => {
    fetch(`/api/agencies/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        setAgency(data);
        setStatus("ok");
      })
      .catch(() => setStatus("notfound"));
  }, [slug]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3EDE2" }}>
        <Loader2 size={22} color="#5B7065" className="spin" />
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3EDE2", padding: 20 }}>
        <p style={{ fontFamily: "Inter, sans-serif", color: "#5B7065", textAlign: "center" }}>
          Este link no existe o ya no está activo.
        </p>
      </div>
    );
  }

  return (
    <CasaIAChat
      agencySlug={agency.slug}
      agencyName={agency.nombre}
      agencyTecnicos={agency.tecnicos}
      agencyProperties={agency.propiedades}
      agencyLocalidades={agency.localidades}
    />
  );
}
