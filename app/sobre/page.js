import Image from "next/image";
import { headers } from "next/headers";
import { Building2, Wrench, Store, Home, MessageCircle, Zap, Mail, Globe2, Check, FileText, QrCode } from "lucide-react";
import "./sobre.css";

// Detecta el idioma preferido del navegador/celular (header Accept-Language)
// del lado del servidor, para que la página ya llegue en el idioma correcto
// sin parpadeo ni depender de la traducción automática del navegador.
// Solo dos versiones reales: español (para quien tenga el dispositivo en
// español) y portugués (para todo el resto — es el mercado principal).
function getLang() {
  const acceptLanguage = headers().get("accept-language") || "";
  const primaryLang = acceptLanguage.split(",")[0]?.trim().toLowerCase() || "";
  return primaryLang.startsWith("es") ? "es" : "pt";
}

const content = {
  es: {
    metaTitle: "CasaIA — Tu propiedad respondiendo sola",
    metaDescription:
      "CasaIA atiende a huéspedes e inquilinos las 24 horas, en 5 idiomas. Registrá tu inmobiliaria, tu servicio técnico o tu comercio.",
    heroEyebrow: "Florianópolis · SC",
    heroTitle: ["Tu propiedad,", "respondiendo sola."],
    heroBody:
      "CasaIA atiende a huéspedes e inquilinos las 24 horas, en 5 idiomas. Responde dudas sobre la propiedad, orienta problemas del día a día y deriva automáticamente al técnico o comercio correcto cuando hace falta.",
    ctaPrimary: "Quiero registrar mi negocio",
    ctaSecondary: "Probar el asistente",
    languagesAlt: "Atención automática 24/7 en 5 idiomas: español, portugués, inglés, francés y alemán",
    howItWorksTitle: "Cómo funciona",
    steps: [
      { title: "Un QR en cada puerta", body: "Cada propiedad tiene un link y QR exclusivo." },
      { title: "El huésped pregunta", body: "Texto, foto o audio, en 5 idiomas." },
      { title: "Respuesta inmediata", body: "La IA responde o deriva automáticamente." },
    ],
    joinTitle: "Sumate a la red CasaIA",
    cards: {
      agencies: {
        title: "Inmobiliarias",
        body: ["Menos preguntas repetidas por WhatsApp.", "Huéspedes atendidos las 24h.", "Técnicos convocados automáticamente."],
        cta: "Registrar inmobiliaria",
        manualLabel: "Descargar manual de registro (PDF)",
        manualHref: "/CasaIA-Manual-Registro-Espanol.pdf",
      },
      technicians: {
        title: "Técnicos",
        body: ["Recibí pedidos de tu zona.", "Sin intermediarios.", "Registro gratuito."],
        cta: "Registrarme como técnico",
      },
      businesses: {
        title: "Comercios",
        body: ["Aparecé ante huéspedes cercanos justo cuando deciden adónde ir."],
        cta: "Registrar comercio",
      },
    },
    benefitsTitle: "Beneficios",
    benefits: ["Atención 24/7", "5 idiomas", "QR por propiedad", "Menos mensajes", "Técnicos de confianza", "Mejor experiencia para huéspedes"],
    ctaTitle: "¿Listo para empezar?",
    ctaBody: "El registro es gratuito y lleva solo unos minutos.",
    ctaButton: "Registrarme ahora",
  },
  pt: {
    metaTitle: "CasaIA — Sua propriedade respondendo sozinha",
    metaDescription:
      "O CasaIA atende hóspedes e inquilinos 24 horas por dia, em 5 idiomas. Cadastre sua imobiliária, seu serviço técnico ou seu comércio.",
    heroEyebrow: "Florianópolis · SC",
    heroTitle: ["Sua propriedade,", "respondendo sozinha."],
    heroBody:
      "O CasaIA atende hóspedes e inquilinos 24 horas por dia, em 5 idiomas. Responde dúvidas sobre a propriedade, orienta problemas do dia a dia e aciona automaticamente o técnico ou comércio correto quando necessário.",
    ctaPrimary: "Quero cadastrar meu negócio",
    ctaSecondary: "Testar o assistente",
    languagesAlt: "Atendimento automático 24/7 em 5 idiomas: espanhol, português, inglês, francês e alemão",
    howItWorksTitle: "Como funciona",
    steps: [
      { title: "Um QR em cada porta", body: "Cada propriedade possui um link e QR exclusivo." },
      { title: "O hóspede pergunta", body: "Texto, foto ou áudio, em 5 idiomas." },
      { title: "Resposta imediata", body: "A IA responde ou encaminha automaticamente." },
    ],
    joinTitle: "Faça parte da rede CasaIA",
    cards: {
      agencies: {
        title: "Imobiliárias",
        body: ["Menos perguntas repetidas no WhatsApp.", "Hóspedes atendidos 24h.", "Técnicos acionados automaticamente."],
        cta: "Cadastrar imobiliária",
        manualLabel: "Baixar manual de cadastro (PDF)",
        manualHref: "/CasaIA-Manual-Cadastro-Imobiliarias.pdf",
      },
      technicians: {
        title: "Técnicos",
        body: ["Receba chamados da sua região.", "Sem intermediários.", "Cadastro gratuito."],
        cta: "Cadastrar como técnico",
      },
      businesses: {
        title: "Comércios",
        body: ["Apareça para hóspedes próximos no momento em que eles decidem onde ir."],
        cta: "Cadastrar comércio",
      },
    },
    benefitsTitle: "Benefícios",
    benefits: ["Atendimento 24/7", "5 idiomas", "QR por propriedade", "Menos mensagens", "Técnicos de confiança", "Melhor experiência para hóspedes"],
    ctaTitle: "Pronto para começar?",
    ctaBody: "O cadastro é gratuito e leva apenas alguns minutos.",
    ctaButton: "Cadastrar agora",
  },
};

export async function generateMetadata() {
  const lang = getLang();
  const c = content[lang];
  return { title: c.metaTitle, description: c.metaDescription };
}

export default function SobrePage() {
  const lang = getLang();
  const c = content[lang];

  return (
    <div className="sobre" lang={lang}>
      <header>
        <div className="container header-content">
          <div className="logo">
            <Image src="/images/logo-casaia.png" alt="CasaIA" width={72} height={80} />
            Casa<span>IA</span>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg-dots" aria-hidden="true" />
        <div className="container hero-grid">
          <div>
            <div className="tag">
              <QrCode size={13} />
              {c.heroEyebrow}
            </div>
            <h1>
              {c.heroTitle[0]}
              <br />
              <span>{c.heroTitle[1]}</span>
            </h1>
            <p>{c.heroBody}</p>
            <div className="hero-buttons">
              <a href="#cadastro" className="btn btn-primary">
                {c.ctaPrimary}
              </a>
              <a href="/" className="btn btn-outline">
                {c.ctaSecondary}
              </a>
            </div>
          </div>

          <div className="hero-image">
            <Image
              src="/images/hero-casaia.jpg"
              alt={c.languagesAlt}
              width={510}
              height={1158}
              priority
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </section>

      <section className="languages">
        <div className="container">
          <div className="languages-img-wrap">
            <Image src="/images/banner-idiomas.png" alt={c.languagesAlt} width={515} height={296} style={{ width: "100%", height: "auto" }} />
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container">
          <h2 className="section-title">{c.howItWorksTitle}</h2>
          <div className="steps">
            <div className="step">
              <div className="step-icon step-icon-tag">
                <Home size={30} color="#082B52" />
              </div>
              <h3>{c.steps[0].title}</h3>
              <p>{c.steps[0].body}</p>
            </div>
            <div className="step">
              <div className="step-icon">
                <MessageCircle size={30} color="#082B52" />
              </div>
              <h3>{c.steps[1].title}</h3>
              <p>{c.steps[1].body}</p>
            </div>
            <div className="step">
              <div className="step-icon">
                <Zap size={30} color="#082B52" />
              </div>
              <h3>{c.steps[2].title}</h3>
              <p>{c.steps[2].body}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="cadastro" className="section">
        <div className="container">
          <h2 className="section-title">{c.joinTitle}</h2>
          <div className="cards">
            <div className="card">
              <h3>
                <Building2 size={22} className="card-icon" />
                {c.cards.agencies.title}
              </h3>
              <p>
                {c.cards.agencies.body.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < c.cards.agencies.body.length - 1 && <br />}
                  </span>
                ))}
              </p>
              <a href="/inmobiliarias/registro" className="btn btn-primary">
                {c.cards.agencies.cta}
              </a>
              <a href={c.cards.agencies.manualHref} target="_blank" rel="noopener noreferrer" className="manual-link">
                <FileText size={13} />
                {c.cards.agencies.manualLabel}
              </a>
            </div>

            <div className="card">
              <h3>
                <Wrench size={22} className="card-icon" />
                {c.cards.technicians.title}
              </h3>
              <p>
                {c.cards.technicians.body.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < c.cards.technicians.body.length - 1 && <br />}
                  </span>
                ))}
              </p>
              <a href="/tecnicos/registro" className="btn btn-primary">
                {c.cards.technicians.cta}
              </a>
            </div>

            <div className="card">
              <h3>
                <Store size={22} className="card-icon" />
                {c.cards.businesses.title}
              </h3>
              <p>{c.cards.businesses.body[0]}</p>
              <a href="/comercios/registro" className="btn btn-primary">
                {c.cards.businesses.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section benefits">
        <div className="benefits-bg-dots" aria-hidden="true" />
        <div className="container">
          <h2 className="section-title" style={{ color: "white" }}>
            {c.benefitsTitle}
          </h2>
          <div className="benefits-grid">
            {c.benefits.map((b) => (
              <div className="benefit" key={b}>
                <Check size={16} className="benefit-check" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>{c.ctaTitle}</h2>
          <p>{c.ctaBody}</p>
          <a href="#cadastro" className="btn btn-outline">
            {c.ctaButton}
          </a>
        </div>
      </section>

      <footer>
        <p>
          <Globe2 size={14} className="footer-icon" />
          <a href="https://casaia.net">casaia.net</a>
        </p>
        <p>
          <Mail size={14} className="footer-icon" />
          <a href="mailto:casaia24h@gmail.com">casaia24h@gmail.com</a>
        </p>
      </footer>
    </div>
  );
}
