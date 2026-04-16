// ============================================
// Saratex WhatsApp Bot — Cliente WhatsApp Cloud API
// ============================================
// Wrapper para enviar mensajes vía Meta WhatsApp Cloud API

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

/**
 * Enviar mensaje de texto simple
 */
async function sendText(to, text) {
  return sendMessage(to, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  });
}

/**
 * Enviar mensaje interactivo con lista (hasta 10 opciones)
 */
async function sendList(to, { header, body, footer, buttonText, sections }) {
  const interactive = {
    type: 'list',
    body: { text: body },
    action: {
      button: buttonText || 'Ver opciones',
      sections,
    },
  };
  if (header) interactive.header = { type: 'text', text: header };
  if (footer) interactive.footer = { text: footer };

  return sendMessage(to, {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive,
  });
}

/**
 * Enviar mensaje interactivo con botones (máximo 3 botones)
 */
async function sendButtons(to, { body, footer, buttons }) {
  const interactive = {
    type: 'button',
    body: { text: body },
    action: {
      buttons: buttons.map(btn => ({
        type: 'reply',
        reply: { id: btn.id, title: btn.title.substring(0, 20) },
      })),
    },
  };
  if (footer) interactive.footer = { text: footer };

  return sendMessage(to, {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive,
  });
}

/**
 * Marcar mensaje como leído
 */
async function markAsRead(messageId) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;
  const url = `${GRAPH_API_URL}/${phoneId}/messages`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  } catch (err) {
    console.error('Error marcando como leído:', err.message);
  }
}

/**
 * Enviar mensaje genérico a la API de WhatsApp
 */
async function sendMessage(to, payload) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;
  const url = `${GRAPH_API_URL}/${phoneId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error WhatsApp API:', JSON.stringify(data, null, 2));
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Error enviando mensaje:', err.message);
    return null;
  }
}

module.exports = {
  sendText,
  sendList,
  sendButtons,
  markAsRead,
};
