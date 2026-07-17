"use client";

import React, { useState, useRef, useEffect } from "react";
import TurnstileWidget from "./TurnstileWidget";
import {
  Camera,
  Image as ImageIcon,
  Send,
  Loader2,
  X,
  Wrench,
  AlertTriangle,
  Phone,
  Mic,
  Square,
  History,
  PlusCircle,
  Mail,
  MapPinned,
  Building2,
  ChevronDown,
  Siren,
  BadgeCheck,
} from "lucide-react";

const T = {
  es: {
    subtitle: "Tu asistente para tu estadía y tu hogar",
    online: "EN LÍNEA",
    analyzing: "ANALIZANDO",
    greeting:
      "Contame qué necesitás —la clave del WiFi, un problema de la propiedad, calefacción, algo eléctrico— o mandame una foto y te ayudo al instante.",
    heroHint: "Escribí, grabá un audio, o mandá una foto para empezar",
    reviewing: "revisando el caso...",
    connectionError: "No se pudo obtener el diagnóstico. Revisá tu conexión e intentá de nuevo.",
    leadError: "No se pudo enviar tus datos. Probá de nuevo en un momento.",
    techLabel: "TÉCNICO IA",
    visitTitle: "ESTE CASO NECESITA VISITA TÉCNICA",
    visitDesc: "Dejá tus datos y te contactamos para coordinar.",
    namePh: "Nombre",
    phonePh: "Teléfono / WhatsApp",
    zonePh: "Zona / localidad",
    send: "Enviar datos",
    sending: "Enviando...",
    leadSent: "¡Listo! Ya registramos tu consulta. Te vamos a contactar a la brevedad.",
    referralTitle: "Podés comunicarte directo con este comercio",
    referralNoneTitle: "¡Listo! Ya tenemos tu consulta",
    inputPh: "Describí el problema...",
    listening: "escuchando...",
    micNotSupported: "Tu navegador no soporta grabación de voz. Probá desde Chrome.",
    takePhoto: "Tomar foto",
    gallery: "Elegir de galería",
    newChat: "Nueva consulta",
    history: "Historial",
    historyEmpty: "Todavía no hay consultas guardadas.",
    historyToday: "Hoy",
    bizTechBtn: "Soy técnico / empresa",
    bizAgencyBtn: "Soy inmobiliaria / administrador",
    emergencyHint: "Solo para emergencias reales — gas, agua, electricidad o encierro",
    supportLabel: "Soporte técnico de la app",
    emergencyBtn: "Emergencia",
    priorityAlta: "URGENTE",
    priorityMedia: "PRIORIDAD MEDIA",
    priorityBaja: "PRIORIDAD BAJA",
  },
  pt: {
    subtitle: "Seu assistente para sua estadia e sua casa",
    online: "ONLINE",
    analyzing: "ANALISANDO",
    greeting:
      "Me conta o que você precisa —a senha do WiFi, um problema no imóvel, aquecimento, algo elétrico— ou manda uma foto que eu te ajudo na hora.",
    heroHint: "Escreva, grave um áudio, ou mande uma foto para começar",
    reviewing: "avaliando o caso...",
    connectionError: "Não foi possível obter o diagnóstico. Verifique sua conexão e tente de novo.",
    leadError: "Não foi possível enviar seus dados. Tente de novo em um instante.",
    techLabel: "TÉCNICO IA",
    visitTitle: "ESTE CASO PRECISA DE VISITA TÉCNICA",
    visitDesc: "Deixe seus dados e entramos em contato para agendar.",
    namePh: "Nome",
    phonePh: "Telefone / WhatsApp",
    zonePh: "Bairro / cidade",
    send: "Enviar dados",
    sending: "Enviando...",
    leadSent: "Pronto! Já registramos sua consulta. Vamos te contatar em breve.",
    referralTitle: "Você pode falar direto com esta empresa",
    referralNoneTitle: "Pronto! Já temos sua consulta",
    inputPh: "Descreva o problema...",
    listening: "ouvindo...",
    micNotSupported: "Seu navegador não suporta gravação de voz. Tente pelo Chrome.",
    takePhoto: "Tirar foto",
    gallery: "Escolher da galeria",
    newChat: "Nova consulta",
    history: "Histórico",
    historyEmpty: "Ainda não há consultas salvas.",
    historyToday: "Hoje",
    bizTechBtn: "Sou técnico / empresa",
    bizAgencyBtn: "Sou imobiliária / administrador",
    emergencyHint: "Apenas para emergências reais — gás, água, elétrica ou trancado(a)",
    supportLabel: "Suporte técnico do app",
    emergencyBtn: "Emergência",
    priorityAlta: "URGENTE",
    priorityMedia: "PRIORIDADE MÉDIA",
    priorityBaja: "PRIORIDADE BAIXA",
  },
  en: {
    subtitle: "Your assistant for your stay and your home",
    online: "ONLINE",
    analyzing: "ANALYZING",
    greeting:
      "Tell me what you need —the WiFi password, an issue with the property, heating, something electrical— or send me a photo and I'll help right away.",
    heroHint: "Type, record audio, or send a photo to get started",
    reviewing: "reviewing the case...",
    connectionError: "Couldn't get a diagnosis. Check your connection and try again.",
    leadError: "Couldn't send your info. Try again in a moment.",
    techLabel: "AI TECHNICIAN",
    visitTitle: "THIS CASE NEEDS AN ON-SITE VISIT",
    visitDesc: "Leave your info and we'll contact you to coordinate.",
    namePh: "Name",
    phonePh: "Phone / WhatsApp",
    zonePh: "Area / city",
    send: "Send info",
    sending: "Sending...",
    leadSent: "Done! We've registered your request. We'll contact you shortly.",
    referralTitle: "You can contact this provider directly",
    referralNoneTitle: "Done! We have your request",
    inputPh: "Describe the problem...",
    listening: "listening...",
    micNotSupported: "Your browser doesn't support voice recording. Try Chrome.",
    takePhoto: "Take photo",
    gallery: "Choose from gallery",
    newChat: "New request",
    history: "History",
    historyEmpty: "No saved requests yet.",
    historyToday: "Today",
    bizTechBtn: "I'm a technician / business",
    bizAgencyBtn: "I'm a real estate agency / manager",
    emergencyHint: "Only for real emergencies — gas, water, electrical, or locked out",
    supportLabel: "App technical support",
    emergencyBtn: "Emergency",
    priorityAlta: "URGENT",
    priorityMedia: "MEDIUM PRIORITY",
    priorityBaja: "LOW PRIORITY",
  },
  fr: {
    subtitle: "Votre assistant pour votre séjour et votre logement",
    online: "EN LIGNE",
    analyzing: "ANALYSE EN COURS",
    greeting:
      "Dites-moi ce dont vous avez besoin —le mot de passe WiFi, un problème dans le logement, le chauffage, un souci électrique— ou envoyez-moi une photo et je vous aide tout de suite.",
    heroHint: "Écrivez, enregistrez un message vocal, ou envoyez une photo pour commencer",
    reviewing: "analyse du cas en cours...",
    connectionError: "Impossible d'obtenir un diagnostic. Vérifiez votre connexion et réessayez.",
    leadError: "Impossible d'envoyer vos informations. Réessayez dans un instant.",
    techLabel: "TECHNICIEN IA",
    visitTitle: "CE CAS NÉCESSITE UNE VISITE TECHNIQUE",
    visitDesc: "Laissez vos coordonnées, nous vous contacterons pour organiser cela.",
    namePh: "Nom",
    phonePh: "Téléphone / WhatsApp",
    zonePh: "Zone / ville",
    send: "Envoyer",
    sending: "Envoi...",
    leadSent: "C'est fait ! Votre demande est enregistrée. Nous vous contacterons bientôt.",
    referralTitle: "Vous pouvez contacter ce prestataire directement",
    referralNoneTitle: "C'est fait ! Nous avons votre demande",
    inputPh: "Décrivez le problème...",
    listening: "écoute en cours...",
    micNotSupported: "Votre navigateur ne prend pas en charge l'enregistrement vocal. Essayez avec Chrome.",
    takePhoto: "Prendre une photo",
    gallery: "Choisir dans la galerie",
    newChat: "Nouvelle demande",
    history: "Historique",
    historyEmpty: "Aucune demande enregistrée pour l'instant.",
    historyToday: "Aujourd'hui",
    bizTechBtn: "Je suis technicien / entreprise",
    bizAgencyBtn: "Je suis agence immobilière / gestionnaire",
    emergencyHint: "Uniquement pour les urgences réelles — gaz, eau, électricité ou porte bloquée",
    supportLabel: "Support technique de l'application",
    emergencyBtn: "Urgence",
    priorityAlta: "URGENT",
    priorityMedia: "PRIORITÉ MOYENNE",
    priorityBaja: "PRIORITÉ BASSE",
  },
  de: {
    subtitle: "Ihr Assistent für Ihren Aufenthalt und Ihr Zuhause",
    online: "ONLINE",
    analyzing: "WIRD ANALYSIERT",
    greeting:
      "Sagen Sie mir, was Sie brauchen —das WLAN-Passwort, ein Problem mit der Unterkunft, Heizung, etwas Elektrisches— oder schicken Sie mir ein Foto, und ich helfe sofort weiter.",
    heroHint: "Schreiben, Sprachnachricht aufnehmen oder Foto senden, um zu starten",
    reviewing: "Fall wird geprüft...",
    connectionError: "Diagnose konnte nicht abgerufen werden. Überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
    leadError: "Ihre Daten konnten nicht gesendet werden. Versuchen Sie es gleich noch einmal.",
    techLabel: "KI-TECHNIKER",
    visitTitle: "DIESER FALL BENÖTIGT EINEN VOR-ORT-BESUCH",
    visitDesc: "Hinterlassen Sie Ihre Daten, wir kontaktieren Sie zur Terminvereinbarung.",
    namePh: "Name",
    phonePh: "Telefon / WhatsApp",
    zonePh: "Gebiet / Ort",
    send: "Daten senden",
    sending: "Wird gesendet...",
    leadSent: "Fertig! Wir haben Ihre Anfrage registriert. Wir melden uns in Kürze.",
    referralTitle: "Sie können diesen Anbieter direkt kontaktieren",
    referralNoneTitle: "Fertig! Wir haben Ihre Anfrage",
    inputPh: "Beschreiben Sie das Problem...",
    listening: "wird aufgenommen...",
    micNotSupported: "Ihr Browser unterstützt keine Sprachaufnahme. Versuchen Sie es mit Chrome.",
    takePhoto: "Foto aufnehmen",
    gallery: "Aus Galerie wählen",
    newChat: "Neue Anfrage",
    history: "Verlauf",
    historyEmpty: "Noch keine gespeicherten Anfragen.",
    historyToday: "Heute",
    bizTechBtn: "Ich bin Techniker / Unternehmen",
    bizAgencyBtn: "Ich bin Immobilienverwaltung",
    emergencyHint: "Nur für echte Notfälle — Gas, Wasser, Strom oder ausgesperrt",
    supportLabel: "Technischer Support der App",
    emergencyBtn: "Notfall",
    priorityAlta: "DRINGEND",
    priorityMedia: "MITTLERE PRIORITÄT",
    priorityBaja: "NIEDRIGE PRIORITÄT",
  },
};

const FLAG_STYLE = { display: "block", borderRadius: 3, flexShrink: 0 };

function FlagAR({ size = 20 }) {
  const h = size * 0.7;
  return (
    <svg width={size} height={h} viewBox="0 0 30 20" style={FLAG_STYLE}>
      <rect width="30" height="20" fill="#75AADB" />
      <rect y="6.6" width="30" height="6.6" fill="#FFFFFF" />
      <circle cx="15" cy="10" r="2.2" fill="#F6B40E" stroke="#85340A" strokeWidth="0.3" />
    </svg>
  );
}
function FlagBR({ size = 20 }) {
  const h = size * 0.7;
  return (
    <svg width={size} height={h} viewBox="0 0 30 20" style={FLAG_STYLE}>
      <rect width="30" height="20" fill="#009B3A" />
      <polygon points="15,3 27,10 15,17 3,10" fill="#FEDD00" />
      <circle cx="15" cy="10" r="4.2" fill="#002776" />
    </svg>
  );
}
function FlagUS({ size = 20 }) {
  const h = size * 0.7;
  return (
    <svg width={size} height={h} viewBox="0 0 30 20" style={FLAG_STYLE}>
      <rect width="30" height="20" fill="#FFFFFF" />
      {[0, 2, 4, 6, 8].map((i) => (
        <rect key={i} y={i * 2.22} width="30" height="2.22" fill="#B22234" />
      ))}
      <rect width="13" height="10.8" fill="#3C3B6E" />
    </svg>
  );
}
function FlagFR({ size = 20 }) {
  const h = size * 0.7;
  return (
    <svg width={size} height={h} viewBox="0 0 30 20" style={FLAG_STYLE}>
      <rect width="10" height="20" fill="#0055A4" />
      <rect x="10" width="10" height="20" fill="#FFFFFF" />
      <rect x="20" width="10" height="20" fill="#EF4135" />
    </svg>
  );
}
function FlagDE({ size = 20 }) {
  const h = size * 0.7;
  return (
    <svg width={size} height={h} viewBox="0 0 30 20" style={FLAG_STYLE}>
      <rect width="30" height="6.66" fill="#000000" />
      <rect y="6.66" width="30" height="6.66" fill="#DD0000" />
      <rect y="13.32" width="30" height="6.68" fill="#FFCE00" />
    </svg>
  );
}

const LANGS = [
  { code: "es", name: "Español", Flag: FlagAR },
  { code: "pt", name: "Português", Flag: FlagBR },
  { code: "en", name: "English", Flag: FlagUS },
  { code: "fr", name: "Français", Flag: FlagFR },
  { code: "de", name: "Deutsch", Flag: FlagDE },
];

function useAutoScroll(dep) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [dep]);
  return ref;
}

function parseRequiereVisita(rawText) {
  const lines = rawText.trim().split("\n");
  let requiereVisita = false;
  let priority = null;
  let contentLines = [...lines];

  // Busca las últimas 1-2 líneas de marcadores (PRIORIDAD y REQUIERE_VISITA)
  while (contentLines.length > 0) {
    const last = contentLines[contentLines.length - 1].trim();
    const priorityMatch = last.match(/^PRIORIDAD:\s*(ALTA|MEDIA|BAJA)$/i);
    const visitaMatch = last.match(/^REQUIERE_VISITA:\s*(SI|NO)$/i);
    if (priorityMatch) {
      priority = priorityMatch[1].toUpperCase();
      contentLines = contentLines.slice(0, -1);
    } else if (visitaMatch) {
      requiereVisita = visitaMatch[1].toUpperCase() === "SI";
      contentLines = contentLines.slice(0, -1);
    } else {
      break;
    }
  }

  return { text: contentLines.join("\n").trim(), requiereVisita, priority };
}

const LogoMark = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M 45 105 L 100 55 L 155 105" fill="none" stroke="#F3EDE2" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 60 98 L 60 148 L 140 148 L 140 98" fill="none" stroke="#F3EDE2" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="88" y="118" width="24" height="30" rx="2" fill="#F3EDE2" />
    <circle cx="100" cy="55" r="9" fill="#C4622A" />
    <circle cx="128" cy="36" r="6" fill="#C4622A" />
    <circle cx="72" cy="36" r="6" fill="#C4622A" />
    <line x1="100" y1="55" x2="128" y2="36" stroke="#C4622A" strokeWidth="4" strokeLinecap="round" />
    <line x1="100" y1="55" x2="72" y2="36" stroke="#C4622A" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export default function CasaIAChat({ agencySlug = null, agencyName = null, agencyTecnicos = null, agencyProperties = null }) {
  const [lang, setLang] = useState("es");
  const t = T[lang];
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [leadResult, setLeadResult] = useState(null); // { referral: {...} | null }
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [casePriority, setCasePriority] = useState(null); // ALTA | MEDIA | BAJA | null
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [lead, setLead] = useState({ name: "", phone: "", zone: "" });
  const [sendingLead, setSendingLead] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const activeConvIdRef = useRef(null);
  const scrollRef = useAutoScroll(messages.length + (loading ? 1 : 0));

  const hasStarted = messages.length > 0;

  // Cargar historial guardado en este dispositivo al iniciar
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("casaia_conversations");
      if (raw) setConversations(JSON.parse(raw));
    } catch (e) {
      console.error("No se pudo leer el historial:", e);
    }
  }, []);

  // Detectar idioma del navegador (si es portugués, arrancar en PT)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("casaia_lang");
      if (saved === "es" || saved === "pt") {
        setLang(saved);
        return;
      }
      const nav = (navigator.language || navigator.userLanguage || "").toLowerCase();
      if (nav.startsWith("pt")) setLang("pt");
      else if (nav.startsWith("en")) setLang("en");
      else if (nav.startsWith("fr")) setLang("fr");
      else if (nav.startsWith("de")) setLang("de");
    } catch (e) {
      // si falla la detección, se queda en español por defecto
    }
  }, []);

  const changeLang = (newLang) => {
    setLang(newLang);
    try {
      window.localStorage.setItem("casaia_lang", newLang);
    } catch (e) {}
  };

  const persistConversation = (msgs) => {
    if (!msgs.length) return;
    if (!activeConvIdRef.current) {
      activeConvIdRef.current = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }
    const id = activeConvIdRef.current;
    const firstUser = msgs.find((m) => m.role === "user");
    const preview = firstUser
      ? firstUser.text || (firstUser.image ? "📷 Foto enviada" : "Consulta")
      : "Consulta";
    const lightweight = msgs.map((m) => ({
      role: m.role,
      text: m.text || (m.image ? "📷 Se envió una foto" : ""),
    }));

    setConversations((prev) => {
      const others = prev.filter((c) => c.id !== id);
      const updated = [
        { id, date: new Date().toISOString(), preview: preview.slice(0, 70), messages: lightweight },
        ...others,
      ].slice(0, 30);
      try {
        window.localStorage.setItem("casaia_conversations", JSON.stringify(updated));
      } catch (e) {
        console.error("No se pudo guardar el historial:", e);
      }
      return updated;
    });
  };

  const startNewConversation = () => {
    setMessages([]);
    setInput("");
    setImage(null);
    setShowLeadForm(false);
    setLeadSent(false);
    setLeadResult(null);
    setLead({ name: "", phone: "", zone: "" });
    setError(null);
    setEmergencyMode(false);
    setCasePriority(null);
    setTurnstileToken(null);
    activeConvIdRef.current = null;
    setShowHistory(false);
  };

  const openConversation = (conv) => {
    setMessages(conv.messages.map((m) => ({ role: m.role, text: m.text, image: null })));
    activeConvIdRef.current = conv.id;
    setShowLeadForm(false);
    setLeadSent(false);
    setLeadResult(null);
    setError(null);
    setEmergencyMode(false);
    setCasePriority(null);
    setShowHistory(false);
  };

  const formatHistoryDate = (iso) => {
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return t.historyToday + " · " + d.toLocaleTimeString(lang === "pt" ? "pt-BR" : "es-AR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString(lang === "pt" ? "pt-BR" : "es-AR", { day: "2-digit", month: "2-digit" });
  };

  const handleFile = (file) => {
    if (!file) return;

    const MAX_DIMENSION = 1280;
    const JPEG_QUALITY = 0.75;

    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result;
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        const base64 = compressedDataUrl.split(",")[1];
        setImage({ dataUrl: compressedDataUrl, mediaType: "image/jpeg", base64 });
      };
      img.onerror = () => {
        // Si algo falla al comprimir, se usa la imagen original como respaldo.
        const base64 = rawDataUrl.split(",")[1];
        setImage({ dataUrl: rawDataUrl, mediaType: file.type || "image/jpeg", base64 });
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => setImage(null);

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(t.micNotSupported);
      return;
    }

    if (recording) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    const speechLangMap = { es: "es-AR", pt: "pt-BR", en: "en-US", fr: "fr-FR", de: "de-DE" };
    recognition.lang = speechLangMap[lang] || "es-AR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecording(true);
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const buildApiMessages = (history, newUserText, newImage) => {
    const apiMessages = history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: m.image
          ? [
              {
                type: "image",
                source: { type: "base64", media_type: m.image.mediaType, data: m.image.base64 },
              },
              { type: "text", text: m.text || "(foto adjunta)" },
            ]
          : m.text,
      }));

    const content = [];
    if (newImage) {
      content.push({
        type: "image",
        source: { type: "base64", media_type: newImage.mediaType, data: newImage.base64 },
      });
    }
    content.push({ type: "text", text: newUserText || "(foto adjunta, analizala)" });
    apiMessages.push({ role: "user", content });
    return apiMessages;
  };

  const send = async (overrideText) => {
    const text = (overrideText !== undefined ? overrideText : input).trim();
    if (!text && !image) return;

    const userMsg = { role: "user", text, image: image || null };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    persistConversation(nextHistory);
    setInput("");
    const usedImage = image;
    setImage(null);
    setLoading(true);
    setError(null);

    try {
      const apiMessages = buildApiMessages(messages, text, usedImage);
      const response = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, lang, emergency: emergencyMode, properties: agencyProperties }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Error de conexión");
      if (data.error) throw new Error(data.error);

      const { text: cleanText, requiereVisita, priority } = parseRequiereVisita(data.text || "");
      const withAssistant = [...nextHistory, { role: "assistant", text: cleanText }];
      setMessages(withAssistant);
      persistConversation(withAssistant);
      if (priority) setCasePriority(priority);
      if (requiereVisita) setShowLeadForm(true);
    } catch (e) {
      setError(e.message || t.connectionError);
    } finally {
      setLoading(false);
    }
  };

  const startEmergency = () => {
    setEmergencyMode(true);
    const emergencyMsg = {
      es: "🚨 Tengo una emergencia",
      pt: "🚨 Tenho uma emergência",
      en: "🚨 I have an emergency",
      fr: "🚨 J'ai une urgence",
      de: "🚨 Ich habe einen Notfall",
    }[lang] || "🚨 Emergencia";
    send(emergencyMsg);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const sendLead = async () => {
    if (!lead.name.trim() || !lead.phone.trim()) return;
    setSendingLead(true);
    try {
      const summary = messages
        .map((m) => `${m.role === "user" ? "Cliente" : "Técnico IA"}: ${m.text || "(foto)"}`)
        .join("\n");

      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          summary,
          agencySlug,
          propertyName: agencyProperties?.length === 1 ? agencyProperties[0].nombre : null,
          priority: casePriority,
          emergency: emergencyMode,
          turnstileToken,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setLeadResult({ referrals: data.referrals || [] });
      setLeadSent(true);
      setShowLeadForm(false);
    } catch (e) {
      setError(t.leadError);
    } finally {
      setSendingLead(false);
    }
  };

  const langSwitcher = <LangDropdown lang={lang} changeLang={changeLang} langMenuOpen={langMenuOpen} setLangMenuOpen={setLangMenuOpen} />;



  const historyButton = (
    <button
      onClick={() => setShowHistory(true)}
      aria-label={t.history}
      title={t.history}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: "#2A3A36",
        border: "none",
        flexShrink: 0,
      }}
    >
      <History size={15} color="#7FA893" />
    </button>
  );

  const newChatButton = (
    <button
      onClick={startNewConversation}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 999,
        background: "#2A3A36",
        border: "none",
        color: "#CFE0D6",
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <PlusCircle size={14} /> {t.newChat}
    </button>
  );

  const historyDrawer = showHistory && (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}
      onClick={() => setShowHistory(false)}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(18,26,24,0.5)" }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(320px, 84vw)",
          height: "100%",
          background: "#F3EDE2",
          padding: "20px 16px",
          overflowY: "auto",
          boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Roboto Slab', serif", fontSize: 17, fontWeight: 700, color: "#1F2D2B" }}>
            {t.history}
          </span>
          <button onClick={() => setShowHistory(false)} aria-label="Cerrar" style={{ border: "none", background: "transparent" }}>
            <X size={18} color="#5B7065" />
          </button>
        </div>

        <button
          onClick={startNewConversation}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            background: "#C4622A",
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 13,
            marginBottom: 18,
          }}
        >
          <PlusCircle size={16} /> {t.newChat}
        </button>

        {conversations.length === 0 && (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A7A5C" }}>{t.historyEmpty}</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => openConversation(conv)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 10,
                border: conv.id === activeConvIdRef.current ? "1px solid #C4622A" : "1px solid #E9E2D2",
                background: "#FFFFFF",
                cursor: "pointer",
              }}
            >
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#2A332F", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {conv.preview}
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#8A7A5C" }}>
                {formatHistoryDate(conv.date)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const composer = (
    <div style={{ maxWidth: 640, width: "100%", margin: "0 auto" }}>
      {image && (
        <div style={{ marginBottom: 8, position: "relative", display: "inline-block" }}>
          <img
            src={image.dataUrl}
            alt="adjunto"
            style={{ height: 64, width: 64, objectFit: "cover", borderRadius: 10, border: "1px solid #E0D8C7" }}
          />
          <button
            onClick={removeImage}
            aria-label="Quitar foto"
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 20,
              height: 20,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1F2D2B",
              border: "none",
            }}
          >
            <X size={12} color="#F3EDE2" />
          </button>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
        <button
          onClick={() => cameraInputRef.current?.click()}
          aria-label={t.takePhoto}
          title={t.takePhoto}
          style={iconBtnStyle}
        >
          <Camera size={17} color="#5B7065" />
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          onClick={() => galleryInputRef.current?.click()}
          aria-label={t.gallery}
          title={t.gallery}
          style={iconBtnStyle}
        >
          <ImageIcon size={17} color="#5B7065" />
        </button>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          onClick={toggleMic}
          aria-label="Grabar audio"
          title="Grabar audio"
          style={{
            ...iconBtnStyle,
            background: recording ? "#C4622A" : "#F3EDE2",
          }}
        >
          {recording ? <Square size={15} color="#FFFFFF" /> : <Mic size={17} color="#5B7065" />}
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={(e) => {
            setTimeout(() => {
              e.target.scrollIntoView({ block: "center", behavior: "smooth" });
            }, 300);
          }}
          rows={1}
          placeholder={recording ? t.listening : t.inputPh}
          style={{
            flex: 1,
            resize: "none",
            borderRadius: 16,
            padding: "10px 16px",
            outline: "none",
            background: "#F8F5EE",
            border: recording ? "1px solid #C4622A" : "1px solid #E0D8C7",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: "#1F2D2B",
            maxHeight: 96,
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading || (!input.trim() && !image)}
          aria-label="Enviar"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: "#C4622A",
            border: "none",
            opacity: loading || (!input.trim() && !image) ? 0.4 : 1,
          }}
        >
          <Send size={16} color="#FFFFFF" />
        </button>
      </div>
    </div>
  );

  // ---------- Pantalla de bienvenida (antes del primer mensaje) ----------
  if (!hasStarted) {
    return (
      <div style={{ height: "100dvh", width: "100%", display: "flex", flexDirection: "column", background: "#F3EDE2", overflowY: "auto" }}>
        {historyDrawer}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "16px 20px" }}>
          {conversations.length > 0 ? historyButton : <div />}
          {langSwitcher}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "#1F2D2B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <LogoMark size={64} />
          </div>
          <h1 style={{ fontFamily: "'Roboto Slab', serif", color: "#1F2D2B", fontSize: 40, fontWeight: 700, margin: 0, textAlign: "center" }}>
            CasaIA
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", color: "#5B7065", fontSize: 16, marginTop: 8, marginBottom: 4, textAlign: "center" }}>
            {agencyName ? (lang === "pt" ? `Recomendado por ${agencyName}` : `Recomendado por ${agencyName}`) : t.subtitle}
          </p>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8A7A5C", fontSize: 12, marginBottom: 36, textAlign: "center" }}>
            {t.heroHint}
          </p>

          {error && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "12px 16px", borderRadius: 12, background: "#FBE4DB", border: "1px solid #D94E2A", marginBottom: 16, maxWidth: 500 }}>
              <AlertTriangle size={16} color="#B5401F" style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontFamily: "Inter, sans-serif", color: "#7A2A14", fontSize: 13 }}>{error}</span>
            </div>
          )}

          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8A7A5C", marginBottom: 8, textAlign: "center", maxWidth: 400 }}>
            {t.emergencyHint}
          </p>
          <button
            onClick={startEmergency}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 24px",
              borderRadius: 999,
              border: "none",
              background: "#B5401F",
              color: "#FFFFFF",
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 20,
              boxShadow: "0 4px 14px rgba(181,64,31,0.35)",
            }}
          >
            <Siren size={17} /> {t.emergencyBtn}
          </button>

          <div style={{ width: "100%", maxWidth: 640 }}>{composer}</div>

          {!agencySlug && (
            <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap", justifyContent: "center" }}>
              <a
                href="/tecnicos/registro"
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 999,
                  border: "1px solid #C4B896", background: "transparent", color: "#5B7065",
                  fontFamily: "Inter, sans-serif", fontSize: 12.5, fontWeight: 600, textDecoration: "none",
                }}
              >
                <Wrench size={13} /> {t.bizTechBtn}
              </a>
              <a
                href="/inmobiliarias/registro"
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 999,
                  border: "1px solid #C4B896", background: "transparent", color: "#5B7065",
                  fontFamily: "Inter, sans-serif", fontSize: 12.5, fontWeight: 600, textDecoration: "none",
                }}
              >
                <Building2 size={13} /> {t.bizAgencyBtn}
              </a>
            </div>
          )}

          <a
            href="mailto:casaia24h@gmail.com"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 18,
              color: "#8A7A5C",
              fontFamily: "Inter, sans-serif",
              fontSize: 11.5,
              textDecoration: "none",
            }}
          >
            <Mail size={12} /> {t.supportLabel}
          </a>
        </div>

        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ---------- Vista de conversación ----------
  return (
    <div style={{ height: "100dvh", width: "100%", display: "flex", flexDirection: "column", background: "#F3EDE2", overflow: "hidden" }}>
      {historyDrawer}
      <header
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          rowGap: 10,
          padding: "14px 20px",
          background: "#1F2D2B",
          borderBottom: "1px solid #12201D",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1F2D2B",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <LogoMark size={32} />
          </div>
          <div>
            <div style={{ fontFamily: "'Roboto Slab', serif", color: "#F3EDE2", fontSize: 20, fontWeight: 700 }}>
              CasaIA
            </div>
            <div className="casaia-header-sub" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#9FB3A9", fontSize: 11 }}>
              {agencyName ? `Recomendado por ${agencyName}` : t.subtitle}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", gap: 8, rowGap: 8 }}>
          {!emergencyMode && (
            <button
              onClick={startEmergency}
              aria-label={t.emergencyBtn}
              title={t.emergencyBtn}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "none",
                background: "#B5401F",
                flexShrink: 0,
              }}
            >
              <Siren size={16} color="#FFFFFF" />
            </button>
          )}
          {langSwitcher}
          {historyButton}
          {newChatButton}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "#2A3A36" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: loading ? "#C4622A" : "#7FA893" }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#CFE0D6", fontSize: 10 }}>
              {loading ? t.analyzing : t.online}
            </span>
          </div>
        </div>
      </header>

      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <Bubble key={i} msg={m} techLabel={t.techLabel} />
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start", padding: "12px 16px", borderRadius: 16, background: "#E6DFCF" }}>
              <Loader2 size={14} className="spin" color="#5B7065" />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#5B7065", fontSize: 12 }}>
                {t.reviewing}
              </span>
            </div>
          )}

          {error && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "12px 16px", borderRadius: 12, background: "#FBE4DB", border: "1px solid #D94E2A", alignSelf: "flex-start" }}>
              <AlertTriangle size={16} color="#B5401F" style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontFamily: "Inter, sans-serif", color: "#7A2A14", fontSize: 13 }}>{error}</span>
            </div>
          )}

          {showLeadForm && !leadSent && (
            <div style={{ alignSelf: "flex-start", maxWidth: "90%", padding: 16, borderRadius: 16, background: casePriority === "ALTA" ? "#FBEAE4" : "#FFFFFF", border: casePriority === "ALTA" ? "1px solid #B5401F" : "1px solid #E9E2D2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                {casePriority === "ALTA" ? <Siren size={14} color="#B5401F" /> : <Phone size={14} color="#C4622A" />}
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: casePriority === "ALTA" ? "#B5401F" : "#C4622A", fontWeight: casePriority === "ALTA" ? 700 : 400 }}>
                  {casePriority === "ALTA" ? t.priorityAlta + " — " + t.visitTitle : t.visitTitle}
                </span>
              </div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#2A332F", marginTop: 0 }}>
                {t.visitDesc}
              </p>
              <input
                placeholder={t.namePh}
                value={lead.name}
                onChange={(e) => setLead({ ...lead, name: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder={t.phonePh}
                value={lead.phone}
                onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder={t.zonePh}
                value={lead.zone}
                onChange={(e) => setLead({ ...lead, zone: e.target.value })}
                style={inputStyle}
              />
              <TurnstileWidget onVerify={setTurnstileToken} />
              <button
                onClick={sendLead}
                disabled={sendingLead || !lead.name.trim() || !lead.phone.trim()}
                style={{
                  marginTop: 6,
                  width: "100%",
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "none",
                  background: "#C4622A",
                  color: "#FFFFFF",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  opacity: sendingLead ? 0.6 : 1,
                }}
              >
                {sendingLead ? t.sending : t.send}
              </button>
            </div>
          )}

          {leadSent && leadResult && (
            <div
              style={{
                alignSelf: "stretch",
                width: "100%",
                maxWidth: "94%",
                padding: 22,
                borderRadius: 18,
                background: leadResult.referrals?.length ? (casePriority === "ALTA" ? "#B5401F" : "#1F2D2B") : "#E5EFE8",
                border: leadResult.referrals?.length ? "none" : "1px solid #7FA893",
              }}
            >
              {leadResult.referrals?.length ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    {casePriority === "ALTA" ? <Siren size={18} color="#FFD9CC" /> : <Phone size={18} color="#C4622A" />}
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: casePriority === "ALTA" ? "#FFD9CC" : "#C4622A", letterSpacing: 0.3, fontWeight: casePriority === "ALTA" ? 700 : 400 }}>
                      {casePriority === "ALTA" ? t.priorityAlta + " — " + t.referralTitle : t.referralTitle}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {leadResult.referrals.map((ref, i) => (
                      <div key={i} style={{ paddingTop: i > 0 ? 16 : 0, borderTop: i > 0 ? "1px solid #2A3A36" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                          <div style={{ fontFamily: "'Roboto Slab', serif", fontSize: 22, fontWeight: 700, color: "#F3EDE2" }}>
                            {ref.nombre}
                          </div>
                          {ref.verificado && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 10px",
                                borderRadius: 999,
                                background: ref.destacado ? "#C4622A" : "#2A3A36",
                                border: ref.destacado ? "none" : "1px solid #7FA893",
                              }}
                            >
                              <BadgeCheck size={13} color={ref.destacado ? "#FFFFFF" : "#7FA893"} />
                              <span
                                style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                  fontSize: 10,
                                  color: ref.destacado ? "#FFFFFF" : "#7FA893",
                                  textTransform: "uppercase",
                                }}
                              >
                                {ref.destacado ? "Técnico destacado" : "Técnico verificado"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                            <a
                              href={`tel:${ref.telefono}`}
                              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "#2A3A36", padding: "8px 14px", borderRadius: 999 }}
                            >
                              <Phone size={14} color="#7FA893" />
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#F3EDE2", fontWeight: 600 }}>
                                {ref.telefono}
                              </span>
                            </a>
                            <a
                              href={`https://wa.me/${ref.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
                                ({ es: "¡Hola! Vengo de CasaIA. ", pt: "Olá! Vim do CasaIA. ", en: "Hi! I came from CasaIA. ", fr: "Bonjour ! Je viens de CasaIA. ", de: "Hallo! Ich komme von CasaIA. " }[lang] || "Hi! I came from CasaIA. ") +
                                  (messages.find((m) => m.role === "user")?.text || "")
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "#C4622A", padding: "8px 14px", borderRadius: 999 }}
                            >
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#FFFFFF", fontWeight: 600 }}>
                                WhatsApp
                              </span>
                            </a>
                          </div>
                          {ref.direccion && (
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <MapPinned size={14} color="#7FA893" />
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#CFE0D6" }}>{ref.direccion}</span>
                            </div>
                          )}
                          {ref.email && (
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <Mail size={14} color="#7FA893" />
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#CFE0D6" }}>{ref.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#2A5A3E" }}>
                  {t.leadSent}
                </span>
              )}
            </div>
          )}

          {leadSent && (
            <button
              onClick={startNewConversation}
              style={{
                alignSelf: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 999,
                border: "1px solid #C4622A",
                background: "transparent",
                color: "#C4622A",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <PlusCircle size={15} /> {t.newChat}
            </button>
          )}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #E0D8C7", padding: "12px 16px", background: "#FFFFFF" }}>
        {composer}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          .casaia-header-sub { display: none; }
        }
      `}</style>
    </div>
  );
}

function LangDropdown({ lang, changeLang, langMenuOpen, setLangMenuOpen }) {
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];
  const btnRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null);
  const DROPDOWN_W = 190;

  const openMenu = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const margin = 16;
      let left = rect.right - DROPDOWN_W;
      left = Math.max(margin, Math.min(left, window.innerWidth - DROPDOWN_W - margin));
      setMenuPos({ top: rect.bottom + 8, left });
    }
    setLangMenuOpen((v) => !v);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={btnRef}
        onClick={openMenu}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "none",
          cursor: "pointer",
          padding: "6px 12px",
          borderRadius: 999,
          background: "#2A3A36",
        }}
      >
        <current.Flag size={20} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#CFE0D6", fontWeight: 700 }}>
          {current.code.toUpperCase()}
        </span>
        <ChevronDown size={13} color="#9FB3A9" />
      </button>

      {langMenuOpen && menuPos && (
        <>
          <div
            onClick={() => setLangMenuOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
          />
          <div
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              width: DROPDOWN_W,
              background: "#FFFFFF",
              borderRadius: 14,
              boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
              overflow: "hidden",
              zIndex: 41,
            }}
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  changeLang(l.code);
                  setLangMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 14px",
                  border: "none",
                  background: l.code === lang ? "#F3EDE2" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <l.Flag size={20} />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#1F2D2B", fontWeight: l.code === lang ? 700 : 500 }}>
                  {l.name}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const iconBtnStyle = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  background: "#F3EDE2",
  border: "1px solid #E0D8C7",
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  marginBottom: 8,
  borderRadius: 8,
  border: "1px solid #E0D8C7",
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

function Bubble({ msg, techLabel }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "85%",
      }}
    >
      {!isUser && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, paddingLeft: 4 }}>
          <Wrench size={11} color="#8A7A5C" />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#8A7A5C" }}>{techLabel}</span>
        </div>
      )}
      {msg.image && (
        <img
          src={msg.image.dataUrl}
          alt="foto enviada"
          style={{ borderRadius: 12, marginBottom: 6, maxHeight: 208, objectFit: "cover", border: "1px solid #E0D8C7" }}
        />
      )}
      {msg.text && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 16,
            whiteSpace: "pre-wrap",
            lineHeight: 1.5,
            background: isUser ? "#1F2D2B" : "#FFFFFF",
            color: isUser ? "#F3EDE2" : "#2A332F",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            border: isUser ? "none" : "1px solid #E9E2D2",
            borderTopRightRadius: isUser ? 4 : 16,
            borderTopLeftRadius: isUser ? 16 : 4,
          }}
        >
          {formatText(msg.text)}
        </div>
      )}
    </div>
  );
}

function formatText(text) {
  const lines = text.split("\n");
  const elements = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (/^(---|\*\*\*)$/.test(trimmed)) {
      elements.push(<hr key={i} style={{ border: "none", borderTop: "1px solid #E9E2D2", margin: "10px 0" }} />);
      return;
    }

    const headerMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const fontSize = level === 1 ? 18 : level === 2 ? 16 : 15;
      elements.push(
        <div key={i} style={{ fontWeight: 700, fontSize, marginTop: i === 0 ? 0 : 10, marginBottom: 2 }}>
          {formatInline(headerMatch[2])}
        </div>
      );
      return;
    }

    elements.push(
      <React.Fragment key={i}>
        {formatInline(line)}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });

  return elements;
}

function formatInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
