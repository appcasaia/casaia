// Categorías de técnicos por propiedad. Un solo lugar para no desincronizar
// el formulario, el prompt de la IA y la lógica de derivación en /api/lead.
export const CATEGORIAS_TECNICO = [
  { id: "plomeria", label: "Plomero", labelPt: "Encanador" },
  { id: "electricidad", label: "Electricista", labelPt: "Eletricista" },
  { id: "cerrajeria", label: "Cerrajero", labelPt: "Chaveiro" },
  { id: "aire_acondicionado", label: "Aire acondicionado", labelPt: "Ar-condicionado" },
  { id: "general", label: "General / mantenimiento", labelPt: "Geral / manutenção" },
];

export function emptyTecnicoContacto() {
  return { nombre: "", telefono: "" };
}

// Objeto con un slot por categoría para los técnicos específicos de una propiedad.
export function emptyTecnicosPropiedad() {
  return CATEGORIAS_TECNICO.reduce((acc, c) => {
    acc[c.id] = emptyTecnicoContacto();
    return acc;
  }, {});
}

export function labelCategoria(id) {
  return CATEGORIAS_TECNICO.find((c) => c.id === id)?.label || "General";
}
