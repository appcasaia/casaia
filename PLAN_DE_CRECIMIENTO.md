# CasaIA — Plan de crecimiento por etapas

Este documento es la hoja de ruta: qué hay hoy, qué disparadores (cantidad de
usuarios, técnicos, consultas) marcan el momento de sumar cada cosa nueva, y
qué deuda técnica hay que resolver en el camino para que la base aguante el
crecimiento sin romperse.

La lógica es simple: **no construir algo antes de necesitarlo**. Cada etapa
se dispara con un número concreto, no con una fecha del calendario.

---

## Etapa 0 — Lo que ya existe (hoy)

- Chat con IA (texto, foto, audio) para diagnóstico del hogar.
- Historial de conversación por dispositivo (localStorage).
- Derivación automática a: técnicos auto-registrados por zona → comercios
  referidos cargados a mano → nada (queda como lead para vos).
- Registro self-service de técnicos y de inmobiliarias, sin paneles para
  ellos — solo formulario y confirmación.
- Link exclusivo por inmobiliaria (`/i/[slug]`), que deriva solo a sus
  técnicos de confianza.
- Panel admin (`/panel`) con métricas básicas, gestión de referidos,
  técnicos e inmobiliarias — todo protegido con una clave.
- Base de datos: Upstash Redis (pares clave-valor simples).
- Pagos: **no existen todavía**. Todo lo que se registra es gratis.

---

## Etapa 1 — Validación (0 a ~50 técnicos registrados)

**Objetivo de esta etapa**: confirmar que el modelo funciona antes de meterle
más ingeniería. No sumar funciones nuevas todavía — enfocarse en conseguir
que gente real lo use.

**Qué hacer:**
- Compartir el link con tu conocido viajante y con contactos de Pro
  Calefacción para conseguir los primeros técnicos registrados.
- Cargar 5-10 comercios referidos reales en las zonas donde más te mueves.
- Mirar el panel de métricas cada semana: consultas totales, leads,
  conversión.
- Anotar a mano qué técnicos generan más consultas — esa info va a servir
  para decidir el precio de los planes pagos más adelante.

**No hacer todavía:** cobrar, construir el panel completo de admin,
integrar Mercado Pago, ni WhatsApp Business API. Es prematuro sin datos de
uso real.

---

## Etapa 2 — Primeros pagos (≈50 técnicos o ≈300 consultas/mes)

**Disparador:** cuando tengas ~50 técnicos registrados O ~300 consultas
mensuales — lo que llegue primero. En ese punto ya hay suficiente demanda
para justificar cobrar.

**Qué construir:**
1. **Integración de pago real con Mercado Pago** (suscripciones
   recurrentes) para los planes Profesional y Premium Zona.
2. **Página de planes** con precio y beneficios, configurable desde el
   panel admin (hoy el plan se asigna a mano desde `/panel/tecnicos`; en
   esta etapa se vuelve autoservicio con cobro automático).
3. **Webhook de Mercado Pago** para activar/desactivar el plan
   automáticamente según el estado del pago (aprobado, rechazado, vencido).
4. Ampliar el algoritmo de derivación para que respete la prioridad real de
   plan pago (ya está el campo `plan` en cada técnico, falta que el cobro
   lo actualice solo).

**Deuda técnica a resolver en esta etapa:**
- Redis (Upstash) empieza a quedar chico para manejar transacciones de pago
  con integridad. Es el momento de migrar a una base de datos relacional
  real — **Postgres** (Vercel Postgres o Supabase, ambos con plan gratis
  para este volumen). Esto no es opcional una vez que hay dinero de por
  medio: necesitás poder auditar cada pago sin dudas.

---

## Etapa 3 — Escala e inmobiliarias en serio (≈150-300 técnicos, o primeras 10 inmobiliarias activas)

**Disparador:** cuando el link exclusivo de inmobiliarias empieza a
generar volumen real, o cuando hay más de ~150 técnicos en la plataforma.

**Qué construir:**
1. **WhatsApp Business API real** (360dialog o similar) para que el
   sistema le mande el mensaje al técnico automáticamente, sin depender de
   que el cliente toque un link. Esto es lo que hoy resolvimos con un
   botón — acá se vuelve 100% automático de los dos lados.
2. **Recordatorio mensual automático a inmobiliarias** ("¿Querés actualizar
   tus técnicos?") vía cron job (tarea programada) + email, con un link
   que les permite editar su lista sin que vos intervengas.
3. **Plan Empresa/Red**: soporte para que una empresa cargue varios
   técnicos bajo un mismo pago, con reportes propios.
4. **Sistema de reputación simple**: que el cliente pueda calificar al
   técnico después de la consulta (1-5 estrellas). Esto empieza a ser el
   activo más valioso de la plataforma — mejor material de venta a
   fabricantes que las métricas de uso solas.

**Deuda técnica:**
- Con más usuarios, el panel admin actual (una sola clave para todo)
  empieza a quedar corto. Migrar a un login real (con roles: admin,
  soporte) si sumás gente ayudándote a operar.

---

## Etapa 4 — Negociación con fabricantes/marca blanca (≈500 técnicos o 3.000+ consultas/mes)

**Disparador:** cuando los números ya son sólidos y consistentes durante
varios meses seguidos — este es el punto donde el pitch a Vaillant, BGH,
Eskabe, Rinnai, aseguradoras de hogar, etc. deja de ser una idea y pasa a
ser "mostrame los números".

**Qué construir:**
1. **Modo marca blanca**: que un fabricante pueda tener su propia versión
   de CasaIA con su logo y colores, corriendo sobre la misma base de
   técnicos y lógica (similar a como ya armamos el link de inmobiliaria,
   pero a nivel marca completa).
2. **Informes automáticos para fabricantes**: qué modelos fallan más, en
   qué zona, en qué época — el "producto de datos" del que hablamos antes.
3. **Multi-país**: adaptar textos/normativa para Brasil de forma más
   robusta que el simple selector de idioma actual (ya tenés experiencia
   ahí con tus otros proyectos de Florianópolis).

---

## Resumen visual de disparadores

| Etapa | Disparador | Qué se agrega |
|---|---|---|
| 1 | Ahora | Validar con uso real, sin nuevas funciones |
| 2 | ~50 técnicos / ~300 consultas mes | Mercado Pago, planes pagos, migrar a Postgres |
| 3 | ~150 técnicos / 10 inmobiliarias activas | WhatsApp Business API real, recordatorio mensual, reputación |
| 4 | ~500 técnicos / 3.000 consultas mes | Marca blanca para fabricantes, informes de datos, multi-país |

---

## Principio para todas las etapas

Cada vez que se suma algo nuevo, hay que preguntarse: **¿esto lo necesito
porque tengo el problema hoy, o porque "estaría bueno tenerlo"?** Construir
antes de necesitarlo es el error más común en este tipo de proyectos — se
termina con mucho código sin usar y ningún usuario real. Mejor ir un paso
atrás de la demanda real, no varios adelante.
