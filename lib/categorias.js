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

// Categorías de comercios referidos (restaurantes, farmácias, etc.) que la IA
// recomienda al huésped cuando pregunta cosas como "onde posso comer" ou "farmácia perto".
export const CATEGORIAS_COMERCIO = [
  { id: "restaurante", label: "Restaurante / Comida", labelPt: "Restaurante / Comida" },
  { id: "farmacia", label: "Farmacia", labelPt: "Farmácia" },
  { id: "mercado", label: "Mercado / Supermercado", labelPt: "Mercado / Supermercado" },
  { id: "padaria", label: "Panadería", labelPt: "Padaria" },
  { id: "lavanderia", label: "Lavandería", labelPt: "Lavanderia" },
  { id: "transporte", label: "Transporte / Taxi", labelPt: "Transporte / Táxi" },
  { id: "outro", label: "Otro", labelPt: "Outro" },
];

export function labelCategoriaComercio(id) {
  return CATEGORIAS_COMERCIO.find((c) => c.id === id)?.label || "Otro";
}
