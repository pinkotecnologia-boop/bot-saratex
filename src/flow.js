// ============================================
// Saratex WhatsApp Bot — Motor de Enrutamiento IA
// ============================================

const wa = require('./whatsapp');
const state = require('./state');
const agent = require('./agent');

/**
 * Procesar mensaje entrante y pasárselo a Gemini
 */
async function processMessage(phone, senderName, messageType, messageContent, messageId) {
  // Marcar como leído
  await wa.markAsRead(messageId);

  const conv = state.getConversation(phone);
  const input = extractInput(messageType, messageContent);

  if (!input) return;

  console.log(`📩 [${phone}] Input User: ${input}`);

  // Comando global para reiniciar si se traban
  if (['reiniciar', 'reset'].includes(input.toLowerCase())) {
    state.resetConversation(phone);
    return wa.sendText(phone, "🔄 Tu sesión ha sido reiniciada. ¡Hola de nuevo! ¿En qué te ayudo?");
  }

  // 1. Obtener la respuesta mágica de Gemini enviándole la historia de esta persona
  const botResponse = await agent.getChatResponse(conv.history, input);

  // 2. Revisar si Gemini usó el comando oculto para trasladar al humano
  const isFinished = botResponse.includes('[FINALIZAR_COTIZACION]');
  const cleanResponse = botResponse.replace('[FINALIZAR_COTIZACION]', '').trim();

  // 3. Guardar todo en el historial para memoria a corto plazo
  conv.history.push({ role: 'user', parts: [{ text: input }] });
  conv.history.push({ role: 'model', parts: [{ text: cleanResponse }] });

  // 4. Responder al cliente directamente en WhatsApp
  await wa.sendText(phone, cleanResponse);

  // 5. Si la etiqueta secreta apareció, el bot recolectó todo el requerimiento!
  if (isFinished) {
    console.log(`🎉 ¡Flujo coronado con el número ${phone}! Notificando al equipo humano...`);
    await notifyAdvisor(phone, conv.history);
    
    // Dejar la conversación lista (vacía) para la próxima vez que nos hablen mañana
    state.resetConversation(phone);
  }
}

/**
 * Extraer texto del mensaje (por si mandan un botón viejo por error)
 */
function extractInput(messageType, content) {
  switch (messageType) {
    case 'text':
      return content.body || '';
    case 'interactive':
      if (content.list_reply) return content.list_reply.title || content.list_reply.id;
      if (content.button_reply) return content.button_reply.title || content.button_reply.id;
      return '';
    case 'button':
      return content.payload || '';
    default:
      return '';
  }
}

/**
 * Notificar al asesor humano copiando el final de la charla
 */
async function notifyAdvisor(clientPhone, history) {
  const advisorPhone = process.env.ADVISOR_PHONE;
  if (!advisorPhone) return;

  let msg = '🔔 *NUEVO LEAD RECOLECTADO POR EL BOT*\n';
  msg += '━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  msg += `📱 *Cliente:* wa.me/${clientPhone}\n\n`;
  msg += `*Contexto de lo acordado:*\n`;
  
  // Muestra los últimos 6 intercambios
  const tail = history.slice(-6);
  tail.forEach(turno => {
    const isUser = turno.role === 'user';
    const ic = isUser ? '👤' : '🤖';
    msg += `\n${ic} ${isUser ? 'Cliente' : 'Bot'}: ${turno.parts[0].text}`;
  });

  msg += '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n☝️ _Revisa el chat de la empresa para ver el hilo completo._';

  return wa.sendText(advisorPhone, msg);
}

module.exports = { processMessage };
