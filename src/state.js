// ============================================
// Saratex WhatsApp Bot — Gestión de Estado
// ============================================
// Estado de conversación en memoria por número de teléfono

/**
 * Almacén de estados de conversación en memoria
 * Clave: número de teléfono (string)
 * Valor: objeto de estado de la conversación
 */
const conversations = new Map();

/**
 * Tiempo de expiración de conversación (30 minutos)
 */
const EXPIRATION_MS = 30 * 60 * 1000;

/**
 * Obtener o crear estado de conversación
 */
function getConversation(phone) {
  const existing = conversations.get(phone);

  // Si existe y no ha expirado, retornar
  if (existing && (Date.now() - existing.lastActivity) < EXPIRATION_MS) {
    existing.lastActivity = Date.now();
    return existing;
  }

  // Crear nueva conversación
  const newConv = createFreshConversation(phone);
  conversations.set(phone, newConv);
  return newConv;
}

/**
 * Crear conversación nueva con estado inicial
 */
function createFreshConversation(phone) {
  return {
    phone,
    state: 'WELCOME',
    lastActivity: Date.now(),
    data: {
      servicio: null,        // sublimacion, dtf, producto, corte_laser, planchado
      categoria: null,       // uniformes, hogar, publicidad, etc.
      material: null,        // pluton, orion, etc.
      metros: null,          // cantidad de metros
      rangoMetros: null,     // rango seleccionado
      tieneDiseno: null,     // true/false
      tipoProducto: null,    // camiseta, buso, edredon, etc.
      cantidad: null,        // cantidad de unidades/piezas
      piezasOrdenadas: null, // true/false (para corte láser)
      // Datos del cliente
      nombre: null,
      tipoPersona: null,     // natural, juridica
      ciudad: null,
      correo: null,
      // PQR
      tipoPQR: null,         // queja, felicitacion, consulta
      mensajePQR: null,
    },
  };
}

/**
 * Reiniciar conversación
 */
function resetConversation(phone) {
  const newConv = createFreshConversation(phone);
  conversations.set(phone, newConv);
  return newConv;
}

/**
 * Actualizar estado de conversación
 */
function updateState(phone, newState, dataUpdates = {}) {
  const conv = getConversation(phone);
  conv.state = newState;
  conv.lastActivity = Date.now();
  Object.assign(conv.data, dataUpdates);
  return conv;
}

/**
 * Limpiar conversaciones expiradas (ejecutar periódicamente)
 */
function cleanExpired() {
  const now = Date.now();
  for (const [phone, conv] of conversations) {
    if ((now - conv.lastActivity) > EXPIRATION_MS) {
      conversations.delete(phone);
    }
  }
}

// Limpiar cada 10 minutos
setInterval(cleanExpired, 10 * 60 * 1000);

module.exports = {
  getConversation,
  resetConversation,
  updateState,
};
