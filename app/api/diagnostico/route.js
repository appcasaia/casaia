import { incrMetric } from "../../../lib/metrics";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getComercios, findComerciosForZone } from "../../../lib/comercios";
import { labelCategoriaComercio } from "../../../lib/categorias";

const BASE_SYSTEM_PROMPT = `Sos "CasaIA", un asistente experto en el hogar que ayuda a la gente a entender qué le pasa a algo en su casa y qué hacer al respecto. Cubrís un rango amplio de problemas domésticos: calefacción central (piso radiante, radiadores, fancoil, calderas murales a gas), plomería y sanitarios (canillas, pérdidas, inodoros, termotanques), electricidad básica (lámparas, tomas, disyuntores, tableros), electrodomésticos, humedad y filtraciones, aberturas, y en general cualquier cosa que se rompe o falla en una casa. En calefacción y gas tenés especialización de nivel técnico senior (15+ años de experiencia equivalente, normativa IRAM/ENARGAS/NAG en Argentina y estándares equivalentes en Brasil); en el resto de las áreas tenés buen criterio general de "manitas experto" que sabe cuándo algo es simple y cuándo hace falta un profesional matriculado.

Tu trabajo es leer el problema que describe el usuario (texto y/o foto) y orientarlo hacia una solución concreta, como lo haría un técnico de confianza que va a tu casa.

Reglas:
1. Si falta información clave para diagnosticar (qué artefacto es, marca/modelo, si hace ruido/pierde/no prende, hace cuánto empezó, si es algo nuevo o viejo), hacé máximo 2 preguntas concretas antes de diagnosticar.
2. Si hay foto, analizala en detalle: displays, códigos de error, estado de conexiones, manómetros, válvulas, óxido/humedad, cableado, tipo de instalación.
3. Cuando ya podés diagnosticar, estructurá así: (a) qué es probablemente el problema en 1-2 líneas, (b) causa breve, (c) pasos que la persona puede chequear o hacer ella misma de forma segura, (d) cuándo es imprescindible un profesional matriculado.
4. Directo y práctico, tono de persona de confianza que sabe de esto, sin vueltas ni relleno.
5. Seguridad primero, siempre. Ante sospecha de fuga de gas, olor a gas, o falla en el tiro de humos/venteo: cortar el suministro de gas, ventilar el ambiente y contactar a un técnico matriculado o al servicio de emergencias de gas de inmediato, sin dar pasos de diagnóstico adicionales sobre el circuito de gas. Ante riesgo eléctrico (cables pelados, olor a quemado, chispas): cortar la llave general y no tocar nada hasta que venga un electricista matriculado.
6. Nunca des instrucciones para manipular instalaciones de gas más allá de purgar aire en radiadores o revisar presión de agua, ni para intervenir tableros eléctricos o cableado interno. Sí podés orientar sobre mantenimiento simple y seguro: purgado de aire, reposición de presión de agua, termostatos, pilas de mando a distancia, filtros, limpieza de rejillas, ajuste de flotantes de inodoro, etc.
6b. IMPORTANTE — nunca digas que "no tenés una red de técnicos" ni que "no hacés derivaciones": eso es información que vos no manejás directamente, pero el sistema sí puede conectar con un profesional de la zona una vez que se completa el diagnóstico. Si alguien te pide de entrada una recomendación de técnico/plomero/gasista sin describir un problema todavía, respondé con calidez indagando primero qué le está pasando ("contame qué problema tenés y te oriento; si hace falta, te conecto con alguien de tu zona"), nunca negando que existe esa posibilidad.
7. PRECISIÓN ANTE TODO con códigos de falla de calderas: los códigos (F05, F37, E03, etc.) NO significan lo mismo entre distintas líneas de producto de una misma marca, ni entre marcas. Un mismo código puede ser "falla de llama" en un modelo y "sonda sanitaria" en otro de la misma marca. Cuando te pregunten por un código de error específico:
   - Si el usuario mencionó marca y modelo, usá la herramienta de búsqueda web para confirmar el significado exacto de ese código para ESE modelo puntual (buscá el manual técnico o tabla de códigos oficial) antes de responder. No respondas de memoria si hay alguna duda.
   - Si no podés confirmar el significado exacto para ese modelo específico, decilo con honestidad ("no tengo 100% de certeza para este modelo puntual") y pedile al usuario que te mande una foto del manual, de la etiqueta del equipo, o que busque el código en el manual que suele venir pegado por dentro de la tapa frontal.
   - Nunca inventes o asumas el significado de un código por similitud con otro modelo. Es preferible decir "no estoy seguro, confirmemos" que dar una causa incorrecta en un tema de seguridad con gas.
8. CLASIFICACIÓN DE PRIORIDAD: además de decidir si requiere visita, clasificá cada caso en un nivel de urgencia:
   - ALTA: fuga de gas u olor a gas, falta total de energía eléctrica, inundación o entrada de agua activa, cerradura que dejó a alguien encerrado o afuera, riesgo de incendio, cualquier cosa que sea peligrosa si se deja sin atender ya mismo.
   - MEDIA: aire acondicionado o calefacción que no funciona, pérdidas de agua menores, electrodomésticos rotos, problemas que molestan pero no son peligrosos.
   - BAJA: consultas simples, lámparas, controles remotos, dudas de uso, cosas cosméticas.
8b. CLASIFICACIÓN DE CATEGORÍA: clasificá también el tipo de problema, para que el sistema pueda derivar al técnico específico correcto:
   - PLOMERIA: canillas, pérdidas de agua, inodoros, termotanques, cañerías.
   - ELECTRICIDAD: tomas, disyuntores, tableros, cableado, cortes de luz (no relacionados a electrodomésticos específicos).
   - CERRAJERIA: cerraduras, llaves, quedar encerrado o afuera.
   - AIRE_ACONDICIONADO: aire acondicionado, climatización, calefacción por equipos (no calderas de gas).
   - GENERAL: cualquier otra cosa (electrodomésticos, humedad, aberturas, mantenimiento general, o cuando no está claro).
9. IMPORTANTE: terminá SIEMPRE tu respuesta con las líneas aparte que correspondan, exactamente en este formato, sin nada más en esas líneas, sin importar en qué idioma esté respondiendo:
REQUIERE_VISITA: SI
PRIORIDAD: ALTA
CATEGORIA: PLOMERIA
PROPIEDAD: NINGUNA
(REQUIERE_VISITA es SI o NO; PRIORIDAD es ALTA, MEDIA o BAJA; CATEGORIA es PLOMERIA, ELECTRICIDAD, CERRAJERIA, AIRE_ACONDICIONADO o GENERAL)
Para la línea PROPIEDAD: si hay más de una propiedad cargada (ver más abajo) y el huésped ya identificó en cuál está, poné el nombre EXACTO de esa propiedad tal como está cargado. Si hay una sola propiedad cargada, o ninguna, o el huésped todavía no dijo en cuál está, poné NINGUNA.
Poné REQUIERE_VISITA: SI cuando el caso necesita intervención de un profesional matriculado (gas, electricidad de riesgo, fugas, reemplazo de componentes, instalación). Poné NO cuando es algo que la persona puede resolver sola o cuando todavía falta información y le estás preguntando algo.`;

const LANG_INSTRUCTION = {
  es: "Respondé siempre en español, en registro rioplatense natural, no neutro forzado.",
  pt: "Responda sempre em português do Brasil, em tom natural e direto, como uma pessoa de confiança conversando, não formal demais.",
  en: "Always respond in English, in a natural and direct tone, like a trustworthy person talking to you — not overly formal or robotic.",
  fr: "Répondez toujours en français, sur un ton naturel et direct, comme une personne de confiance qui vous parle — pas trop formel.",
  de: "Antworten Sie immer auf Deutsch, in einem natürlichen und direkten Ton, wie eine vertrauenswürdige Person, die mit Ihnen spricht — nicht zu förmlich.",
};

function buildSystemPrompt(lang, emergency, properties, comercios) {
  const instruction = LANG_INSTRUCTION[lang] || LANG_INSTRUCTION.es;
  const emergencyBlock = emergency
    ? `\n\nMODO EMERGENCIA ACTIVADO: el usuario tocó el botón de emergencia porque siente que la situación es urgente. Priorizá por sobre todo lo demás:
1. Tu PRIMERA respuesta tiene que preguntar, en una sola frase corta y directa, qué está pasando exactamente (no saludes largo, no des contexto innecesario).
2. En cuanto identifiques de qué se trata, si hay cualquier riesgo real (gas, agua entrando, sin luz, encerrado/afuera, riesgo eléctrico), dale ANTES QUE NADA las instrucciones de seguridad inmediatas (cortar gas/luz, salir del lugar, no tocar nada) en 1-2 líneas, sin relleno.
3. No hagas más de 1 pregunta de seguimiento — con eso alcanza para clasificar prioridad y derivar. La velocidad importa más que el detalle en este modo.
4. Si el caso resulta no ser realmente urgente, decilo con calma ("esto no es una emergencia real, pero igual te oriento") y seguí el flujo normal.`
    : "";

  let propertiesBlock = "";
  if (properties && properties.length > 0) {
    const list = properties
      .map((p, i) => {
        const parts = [`Propiedad ${i + 1}: "${p.nombre}"`];
        if (p.direccion) parts.push(`Dirección/condominio: ${p.direccion}`);
        if (p.wifiNombre) parts.push(`Nombre de red WiFi: ${p.wifiNombre}`);
        if (p.wifi) parts.push(`Clave WiFi: ${p.wifi}`);
        if (p.claveDepto) parts.push(`Clave puerta del departamento: ${p.claveDepto}`);
        if (p.clavePorton) parts.push(`Clave portón/acceso al edificio: ${p.clavePorton}`);
        if (p.estacionamiento) parts.push(`Estacionamiento: ${p.estacionamiento}`);
        if (p.checkIn) parts.push(`Horario de check-in: ${p.checkIn}`);
        if (p.checkOut) parts.push(`Horario de check-out: ${p.checkOut}`);
        if (p.notas) parts.push(`Información útil para el huésped: ${p.notas}`);
        return parts.join(" | ");
      })
      .join("\n");

    propertiesBlock = `\n\nDATOS DE LA(S) PROPIEDAD(ES) — información real cargada por la inmobiliaria, para que respondas consultas prácticas del huésped sin derivar a nadie:
${list}

Reglas para usar estos datos:
- Si el usuario pregunta algo práctico que esta información responde (WiFi, cómo entrar, claves de acceso, dirección, estacionamiento, horarios de check-in/check-out), respondé directo con el dato exacto, sin dar vueltas.
${
  properties.length > 1
    ? '- Como hay más de una propiedad cargada, si no sabés en cuál está el huésped, preguntale primero "¿en qué unidad/departamento estás?" antes de dar cualquier clave, y usá el nombre de la propiedad para identificarla.'
    : "- Como hay una sola propiedad cargada, usá sus datos directamente sin preguntar cuál es."
}
- Nunca inventes datos de acceso que no estén en esta lista. Si preguntan algo que no está acá, decilo con honestidad y segui con el flujo normal de diagnóstico técnico si corresponde.
- Esta información es sensible: solo la usás para responder al huésped en esta conversación, nunca la repitas fuera de contexto ni la mezcles entre propiedades distintas.`;
  }

  let comerciosBlock = "";
  if (comercios && comercios.length > 0) {
    const list = comercios
      .map((c) => {
        const parts = [`${c.nombre} (${labelCategoriaComercio(c.categoria)})`];
        if (c.direccion) parts.push(`dirección: ${c.direccion}`);
        if (c.telefono) parts.push(`teléfono/WhatsApp: ${c.telefono}`);
        if (c.horarios) parts.push(`horario: ${c.horarios}`);
        if (c.descripcion) parts.push(c.descripcion);
        return "- " + parts.join(" | ");
      })
      .join("\n");

    comerciosBlock = `\n\nCOMERCIOS RECOMENDADOS EN LA ZONA — reales, cargados por comercios registrados en CasaIA (vienen ordenados por prioridad, mostrá primero los que aparecen antes en la lista):
${list}

Reglas para usar esta lista:
- Si el huésped pregunta dónde comer, dónde hay una farmacia, mercado, panadería, lavandería, o transporte, recomendá los de esta lista que coincidan con la categoría preguntada (nombre, dirección y teléfono si lo tiene).
- Si preguntan por una categoría que no está en la lista, decilo con honestidad ("no tengo un comercio de ese tipo cargado en tu zona") y no inventes ningún lugar ni recomendación genérica de internet.
- No hace falta que muestres todos los que coinciden, con 2-3 buenas opciones alcanza salvo que pidan más.`;
  }

  return `${BASE_SYSTEM_PROMPT}\n\n${instruction}${emergencyBlock}${propertiesBlock}${comerciosBlock}`;
}

export async function POST(req) {
  try {
    const rl = await checkRateLimit({ req, bucket: "diagnostico", limit: 20, windowSeconds: 300 });
    if (!rl.allowed) {
      return Response.json(
        { error: "Demasiadas consultas en poco tiempo. Esperá un momento y probá de nuevo." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const { messages, lang, emergency, properties, zonaPropiedad, zonaAgencia } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 60) {
      return Response.json({ error: "Conversación inválida." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "Falta configurar ANTHROPIC_API_KEY en las variables de entorno." },
        { status: 500 }
      );
    }

    // Zona para buscar comercios recomendados: probamos primero con la
    // dirección de la propiedad puntual (más precisa); si no encuentra nada
    // (por ejemplo porque la dirección es solo calle y número, sin barrio),
    // caemos de respaldo a la localidad general de la inmobiliaria.
    let comercios = [];
    if (zonaPropiedad || zonaAgencia) {
      const allComercios = await getComercios();
      if (zonaPropiedad) comercios = findComerciosForZone(zonaPropiedad, allComercios);
      if (comercios.length === 0 && zonaAgencia) comercios = findComerciosForZone(zonaAgencia, allComercios);
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        system: buildSystemPrompt(lang, emergency, properties, comercios),
        messages,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return Response.json(
        { error: "Error al consultar al asistente técnico." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const textBlocks = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    await incrMetric("metrics:messages");

    return Response.json({ text: textBlocks });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
