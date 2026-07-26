import Image from "next/image";
import { Building2, Wrench, Store, Home, MessageCircle, Zap, Mail, Globe2, Check, FileText } from "lucide-react";
import "./sobre.css";

export const metadata = {
  title: "CasaIA — Sua propriedade respondendo sozinha",
  description:
    "O CasaIA atende hóspedes e inquilinos 24 horas por dia, em 5 idiomas. Cadastre sua imobiliária, seu serviço técnico ou seu comércio.",
};

const benefits = [
  "Atendimento 24/7",
  "5 idiomas",
  "QR por propriedade",
  "Menos mensagens",
  "Técnicos de confiança",
  "Melhor experiência para hóspedes",
];

export default function SobrePage() {
  return (
    <div className="sobre">
      <header>
        <div className="container header-content">
          <div className="logo" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image src="/images/logo-casaia.png" alt="CasaIA" width={34} height={38} />
            Casa<span>IA</span>
          </div>
          <a href="/" className="btn btn-primary">
            Testar o assistente
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="badge">📍 Florianópolis • SC</div>
            <h1>
              Sua propriedade,
              <br />
              <span>respondendo sozinha.</span>
            </h1>
            <p>
              O CasaIA atende hóspedes e inquilinos 24 horas por dia, em 5 idiomas. Responde
              dúvidas sobre a propriedade, orienta problemas do dia a dia e aciona
              automaticamente o técnico ou comércio correto quando necessário.
            </p>
            <div className="hero-buttons">
              <a href="#cadastro" className="btn btn-primary">
                Quero cadastrar meu negócio
              </a>
              <a href="/" className="btn btn-outline">
                Testar o assistente
              </a>
            </div>
          </div>

          <div className="hero-image">
            <Image
              src="/images/hero-casaia.jpg"
              alt="QR code de CasaIA na porta e chat no celular"
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
            <Image
              src="/images/banner-idiomas.png"
              alt="Atendimento automático 24/7 em 5 idiomas: espanhol, português, inglês, francês e alemão"
              width={515}
              height={296}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Como funciona</h2>
          <div className="steps">
            <div className="step">
              <div className="step-icon">
                <Home size={36} color="#082B52" />
              </div>
              <h3>Um QR em cada porta</h3>
              <p>Cada propriedade possui um link e QR exclusivo.</p>
            </div>
            <div className="step">
              <div className="step-icon">
                <MessageCircle size={36} color="#082B52" />
              </div>
              <h3>O hóspede pergunta</h3>
              <p>Texto, foto ou áudio em 5 idiomas.</p>
            </div>
            <div className="step">
              <div className="step-icon">
                <Zap size={36} color="#082B52" />
              </div>
              <h3>Resposta imediata</h3>
              <p>A IA responde ou encaminha automaticamente.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="cadastro" className="section">
        <div className="container">
          <h2 className="section-title">Faz parte da rede CasaIA</h2>
          <div className="cards">
            <div className="card">
              <h3>
                <Building2 size={24} style={{ display: "inline", verticalAlign: -4, marginRight: 8 }} color="#F58220" />
                Imobiliárias
              </h3>
              <p>
                Menos perguntas repetidas no WhatsApp.
                <br />
                Hóspedes atendidos 24h.
                <br />
                Técnicos acionados automaticamente.
              </p>
              <a href="/inmobiliarias/registro" className="btn btn-primary">
                Cadastrar imobiliária
              </a>
              <a href="/CasaIA-Manual-Cadastro-Imobiliarias.pdf" target="_blank" rel="noopener noreferrer" className="manual-link">
                <FileText size={13} style={{ display: "inline", verticalAlign: -2, marginRight: 4 }} />
                Baixar manual de cadastro (PDF)
              </a>
            </div>

            <div className="card">
              <h3>
                <Wrench size={24} style={{ display: "inline", verticalAlign: -4, marginRight: 8 }} color="#F58220" />
                Técnicos
              </h3>
              <p>
                Receba chamados da sua região.
                <br />
                Sem intermediários.
                <br />
                Cadastro gratuito.
              </p>
              <a href="/tecnicos/registro" className="btn btn-primary">
                Cadastrar como técnico
              </a>
            </div>

            <div className="card">
              <h3>
                <Store size={24} style={{ display: "inline", verticalAlign: -4, marginRight: 8 }} color="#F58220" />
                Comércios
              </h3>
              <p>Apareça para hóspedes próximos no momento em que eles decidem onde ir.</p>
              <a href="/comercios/registro" className="btn btn-primary">
                Cadastrar comércio
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section benefits">
        <div className="container">
          <h2 className="section-title" style={{ color: "white" }}>
            Benefícios
          </h2>
          <div className="benefits-grid">
            {benefits.map((b) => (
              <div className="benefit" key={b}>
                <Check size={16} style={{ display: "inline", verticalAlign: -3, marginRight: 8 }} color="#F58220" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Pronto para começar?</h2>
          <p>O cadastro é gratuito e leva apenas alguns minutos.</p>
          <a href="#cadastro" className="btn btn-outline">
            Cadastrar agora
          </a>
        </div>
      </section>

      <footer>
        <p>
          <Globe2 size={14} style={{ display: "inline", verticalAlign: -2, marginRight: 4 }} />
          <a href="https://casaia.net" style={{ color: "white", textDecoration: "none" }}>casaia.net</a>
        </p>
        <p>
          <Mail size={14} style={{ display: "inline", verticalAlign: -2, marginRight: 4 }} />
          <a href="mailto:casaia24h@gmail.com" style={{ color: "white", textDecoration: "none" }}>casaia24h@gmail.com</a>
        </p>
      </footer>
    </div>
  );
}
