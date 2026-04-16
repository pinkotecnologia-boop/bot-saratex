// ============================================
// Saratex WhatsApp Bot — Gestión de Estado (Historial AI)
// ============================================

const conversations = new Map();
const EXPIRATION_MS = 30 * 60 * 1000; // 30 minutos

function getConversation(phone) {
  const existing = conversations.get(phone);

  if (existing && (Date.now() - existing.lastActivity) < EXPIRATION_MS) {
    existing.lastActivity = Date.now();
    return existing;
  }

  const newConv = createFreshConversation(phone);
  conversations.set(phone, newConv);
  return newConv;
}

function createFreshConversation(phone) {
  return {
    phone,
    lastActivity: Date.now(),
    history: [], // Historial de mensajes en formato de Gemini API
    summaryData: null // Opcional, por si la IA devuelve un JSON estructurado
  };
}

function resetConversation(phone) {
  const newConv = createFreshConversation(phone);
  conversations.set(phone, newConv);
  return newConv;
}

function cleanExpired() {
  const now = Date.now();
  for (const [phone, conv] of conversations) {
    if ((now - conv.lastActivity) > EXPIRATION_MS) {
      conversations.delete(phone);
    }
  }
}

setInterval(cleanExpired, 10 * 60 * 1000);

module.exports = {
  getConversation,
  resetConversation
};
