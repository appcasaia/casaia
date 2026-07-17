// scripts/migrate-subscriptions.js
//
// Corré esto UNA sola vez para agregarle el objeto `subscription` (y `plan`
// en el caso de inmobiliarias, que no lo tenían) a los registros que ya
// estaban dados de alta antes de este cambio.
//
// Uso:
//   node scripts/migrate-subscriptions.mjs
//
// Necesita las mismas env vars que usa la app en producción:
//   KV_REST_API_URL, KV_REST_API_TOKEN
// Si las tenés en .env.local, cargalas primero, por ejemplo con:
//   node --env-file=.env.local scripts/migrate-subscriptions.mjs
// (--env-file requiere Node 20.6+; si tenés una versión anterior, usá
//  `npm install dotenv` y agregá `import "dotenv/config";` como primera línea)

import { getTechnicians, saveTechnicians } from "../lib/technicians.js";
import { getAgencies, saveAgencies } from "../lib/agencies.js";
import { createSubscription } from "../lib/subscriptions.js";

async function migrate() {
  console.log("Migrando técnicos...");
  const technicians = await getTechnicians();
  let techCount = 0;

  const updatedTechnicians = technicians.map((t) => {
    if (t.subscription) return t;
    techCount++;
    return {
      ...t,
      subscription: { ...createSubscription(t.plan || "gratis"), startDate: t.createdAt || new Date().toISOString() },
    };
  });

  if (techCount > 0) await saveTechnicians(updatedTechnicians);
  console.log(`Técnicos migrados: ${techCount} de ${technicians.length}`);

  console.log("Migrando inmobiliarias...");
  const agencies = await getAgencies();
  let agencyCount = 0;

  const updatedAgencies = agencies.map((a) => {
    if (a.subscription) return a;
    agencyCount++;
    return {
      ...a,
      plan: a.plan || "gratis",
      subscription: { ...createSubscription(a.plan || "gratis"), startDate: a.createdAt || new Date().toISOString() },
    };
  });

  if (agencyCount > 0) await saveAgencies(updatedAgencies);
  console.log(`Inmobiliarias migradas: ${agencyCount} de ${agencies.length}`);

  console.log("Listo.");
}

migrate().catch((err) => {
  console.error("Error en migración:", err);
  process.exit(1);
});
