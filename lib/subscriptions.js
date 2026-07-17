// lib/subscriptions.js
//
// Lógica compartida de suscripción para técnicos e inmobiliarias.
// El día que definas precios reales, el ÚNICO lugar que hay que tocar es
// PLAN_PRICES de acá abajo — todo lo demás (paneles, endpoints, emails)
// lee el precio desde este archivo.

export const PLAN_PRICES = {
  gratis: 0,
  profesional: 0, // TODO: definir precio real cuando arranque el cobro (ej: 4990)
  premium: 0,     // TODO: definir precio real cuando arranque el cobro (ej: 9990)
};

export const PLAN_LABELS = {
  gratis: "Gratis",
  profesional: "Profesional",
  premium: "Premium",
};

// Límites y prestaciones por plan, definidos el 17/07/2026.
// Un solo lugar para tocar si el día de mañana cambian los números.
export const AGENCY_PLAN_LIMITS = {
  gratis: { maxProperties: 5 },
  profesional: { maxProperties: 20 },
  premium: { maxProperties: Infinity },
};

export const TECHNICIAN_PLAN_LIMITS = {
  gratis: { maxZonas: 2, badge: false, priority: 1 },
  profesional: { maxZonas: 5, badge: true, priority: 2 },
  premium: { maxZonas: Infinity, badge: true, priority: 3 },
};

// Cuántas propiedades más puede cargar una inmobiliaria antes de llegar al límite de su plan.
// Devuelve Infinity si no tiene límite (premium).
export function propertiesRemaining(plan, currentCount) {
  const limit = AGENCY_PLAN_LIMITS[plan]?.maxProperties ?? AGENCY_PLAN_LIMITS.gratis.maxProperties;
  if (limit === Infinity) return Infinity;
  return Math.max(0, limit - currentCount);
}

// Cuántas zonas más puede declarar un técnico antes de llegar al límite de su plan.
export function zonasRemaining(plan, currentCount) {
  const limit = TECHNICIAN_PLAN_LIMITS[plan]?.maxZonas ?? TECHNICIAN_PLAN_LIMITS.gratis.maxZonas;
  if (limit === Infinity) return Infinity;
  return Math.max(0, limit - currentCount);
}

// Qué planes tiene habilitados un registro NUEVO por defecto: arranca solo con
// gratis. El admin decide caso por caso si le habilita profesional o premium
// (por ejemplo, para darle una prueba gratuita de premium a una inmobiliaria puntual).
export function defaultPlanesHabilitados() {
  return { gratis: true, profesional: false, premium: false };
}

// Los técnicos SIEMPRE tienen el plan gratis disponible — no se les puede quitar.
// Las inmobiliarias sí se pueden desactivar de cualquier plan, incluido gratis
// (para cuando arranque el cobro real y se les pida suscribirse).
export function puedeDesactivarsePlan(tipoUsuario, plan) {
  if (tipoUsuario === "tecnico" && plan === "gratis") return false;
  return true;
}

// Un registro está "bloqueado" cuando el plan que tiene asignado actualmente
// (record.plan) no está habilitado en su propio planesHabilitados.
export function estaBloqueadoPorPlan(record) {
  const plan = record?.plan || "gratis";
  const habilitados = record?.planesHabilitados;
  if (!habilitados) return false; // registros viejos sin el campo: se consideran no bloqueados
  return habilitados[plan] === false;
}

// Crea el objeto de suscripción inicial para un registro nuevo (técnico o inmobiliaria).
export function createSubscription(plan = "gratis") {
  const now = new Date().toISOString();
  return {
    plan,
    price: PLAN_PRICES[plan] ?? 0,
    status: "activo", // "activo" | "pausado" | "vencido" | "cancelado"
    billingCycle: "mensual",
    startDate: now,
    currentPeriodEnd: null, // se completa cuando arranque el cobro real
    notifiedPriceChange: false, // marcá true cuando le avises el cambio de precio con anticipación
  };
}

// Actualiza el plan de una suscripción existente, preservando la fecha de alta original.
export function updateSubscriptionPlan(subscription, newPlan) {
  const base = subscription || createSubscription(newPlan);
  return {
    ...base,
    plan: newPlan,
    price: PLAN_PRICES[newPlan] ?? 0,
  };
}

// Calcula cuántos días lleva un registro dado de alta (usa createdAt).
export function daysSince(dateString) {
  if (!dateString) return null;
  const diffMs = Date.now() - new Date(dateString).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
