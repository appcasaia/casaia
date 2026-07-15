# CasaIA — Informe de Auditoría de Seguridad

Auditoría hecha sobre el código real de la app (no en abstracto). Una
corrección importante antes de arrancar: **CasaIA no usa Supabase**, usa
**Upstash Redis** como base de datos — el punto 7 del pedido original no
aplica tal cual, lo adapté a la tecnología real que tenemos.

---

## ✅ Lo que ya está bien (confirmado revisando el código, no supuesto)

### 1. Ninguna clave sensible puede llegar al navegador
Confirmé tres cosas de forma concreta, no como buena práctica genérica:

- `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `KV_REST_API_TOKEN` y `ADMIN_SECRET`
  **solo aparecen dentro de archivos `route.js`** (o de `/lib/`, que a su vez
  solo importan esos `route.js`). En Next.js, los archivos `route.js` del
  App Router **nunca se envían al navegador** — corren exclusivamente en el
  servidor de Vercel. No es una convención que alguien pueda romper sin
  querer; es una garantía estructural del framework.
- **Cero variables `NEXT_PUBLIC_`** en todo el proyecto. Esas son las únicas
  que Next.js expone al cliente — no usamos ninguna, así que no hay forma de
  que una clave termine ahí por error de tipeo.
- El endpoint que llama a Claude (`/api/diagnostico`) le devuelve al
  navegador únicamente `{ text: "..." }` — la respuesta de la IA en texto
  plano. Nunca el system prompt, nunca las claves, nunca datos internos.

### 2. Las llamadas a Claude son 100% desde el backend
El navegador nunca habla directo con `api.anthropic.com`. Siempre pasa por
tu propio endpoint `/api/diagnostico`, que es el único que tiene la clave.

### 3. El panel de administrador no expone datos sin la clave correcta
Los cuatro paneles (`/panel`, `/panel/referidos`, `/panel/tecnicos`,
`/panel/inmobiliarias`) muestran una pantalla vacía hasta que se ingresa el
`ADMIN_SECRET` correcto — y esa verificación pasa siempre por el servidor
(`route.js`), nunca se hace en el navegador. Aunque alguien adivine la URL
del panel, no ve ni un dato sin la clave real.

### 4. Cada inmobiliaria solo ve y edita sus propios datos
El link privado de edición usa un token aleatorio único por inmobiliaria
(`editToken`), y el servidor lo verifica antes de devolver o modificar
cualquier dato — una inmobiliaria no tiene forma de ver ni tocar los datos
de otra con solo cambiar la URL.

---

## 🛠️ Lo que corregí en esta revisión

### Sin límite de uso — este era el riesgo real y ya lo mencionabas vos
No había **ningún** límite de consultas. Cualquiera podía mandar pedidos sin
parar al endpoint que llama a Claude y generarte costo real de forma
indefinida — este era el hallazgo más importante de todo el pedido, y era
cierto. Ya lo resolví:

- **`/api/diagnostico`** (el que cuesta dinero real): máximo 20 consultas
  cada 5 minutos por IP.
- **`/api/lead`**: máximo 10 envíos por hora por IP (evita spam de leads
  falsos y bombardeo de emails).
- **`/api/technicians`** y **`/api/agencies`** (registro público): máximo 5
  registros por hora por IP (evita que alguien llene la base con datos
  falsos).

Está armado con la misma base Redis que ya tenías (Upstash) — no agrega
infraestructura nueva ni costo extra. Si alguien se pasa del límite, recibe
un mensaje claro pidiendo que espere, en vez de que la app se rompa o
silenciosamente te siga costando plata.

También agregué una validación básica de tamaño en `/api/diagnostico` (si
alguien manda una "conversación" con cientos de mensajes de golpe, se
rechaza antes de llegar a Claude).

---

## ⚠️ Riesgos que quedan — para las próximas etapas

### 1. No hay CAPTCHA / protección anti-bots todavía
El rate limiting que agregué frena el *abuso automatizado repetido*, pero no
distingue un humano real de un bot que hace pocos pedidos por vez desde
muchas IPs distintas (por ejemplo, con proxies rotativos). Para eso hace
falta **Cloudflare Turnstile** (gratis, y más liviano para el usuario que
reCAPTCHA) en los formularios públicos de registro y, opcionalmente, antes
del primer mensaje del chat.

**Esto no lo puedo activar solo** — necesita que crees una cuenta en
Cloudflare y generes un "site key" para el dominio `casaia.net`, igual que
hicimos con Anthropic o Resend. Cuando quieras, lo hacemos juntos y yo
conecto el código.

### 2. El límite de 20 consultas/5min es por IP, no por persona
Si muchos huéspedes reales usan la misma red WiFi de un edificio o
coworking, comparten IP pública y podrían chocar contra el límite entre
todos. No es grave hoy con el volumen que tenés, pero es algo para afinar
cuando haya más uso real — se puede combinar con un identificador de sesión
además de la IP.

### 3. Sin sistema de cuentas de usuario todavía
Hoy no existe un "usuario" real con login — los técnicos e inmobiliarias se
registran sin cuenta, protegidos solo por tokens en la URL. Funciona bien
para el volumen y la etapa actual, pero un token que se filtra (por ejemplo,
si alguien reenvía el link privado de edición por error) da acceso completo
a esos datos sin poder revocarlo fácilmente. Esto ya estaba anotado en el
plan de crecimiento como algo para resolver con un login real más adelante
(etapa de ~150 técnicos), no es nuevo.

### 4. Estructura de conteo de uso por usuario (no solo por IP)
Lo que pedías en el punto 5 del documento (contar consultas/imágenes/audio
por usuario, no solo un contador global) todavía no existe — hoy `/panel`
muestra el total agregado de toda la app, no discriminado por inmobiliaria
ni por técnico. Es una buena base para monetización futura (planes con
límites distintos), pero es una funcionalidad nueva, no una corrección de
seguridad — la dejaría para cuando definamos los planes pagos reales.

---

## Recomendaciones — orden de prioridad

**Ahora, antes de salir a vender en serio:**
1. ✅ Ya resuelto — rate limiting por IP en los 4 endpoints públicos.
2. Activar Cloudflare Turnstile en los formularios de registro (requiere que
   crees la cuenta).

**Cuando haya más volumen real (no urgente hoy):**
3. Sistema de login real para técnicos e inmobiliarias, en vez de solo
   tokens en la URL.
4. Contador de uso por usuario/inmobiliaria (no solo total agregado) —
   directamente ligado a cuando definas los planes pagos.
5. Límite de gasto mensual configurable en la cuenta de Anthropic (esto lo
   podés hacer vos mismo ya, sin tocar código — en console.anthropic.com,
   sección "Limits").

---

## Conclusión

La arquitectura de base está bien planteada: las claves nunca pudieron
filtrarse por diseño (no por buena suerte), y el único riesgo real y
concreto que encontré — la falta de límite de uso — ya está corregido en
este mismo paquete. Lo que queda (CAPTCHA, login real, conteo por usuario)
son mejoras de robustez para cuando la app tenga más tráfico, no huecos
urgentes que bloqueen salir a vender ahora.
