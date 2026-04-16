// ============================================
// Saratex WhatsApp Bot — Servidor Principal
// ============================================
// Express server con webhook para Meta WhatsApp Cloud API

require('dotenv').config();
const express = require('express');
const flow = require('./flow');
const { transcribeAudio } = require('./transcribe');
const wa = require('./whatsapp');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ─── Health check ───
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Saratex WhatsApp Bot',
    timestamp: new Date().toISOString(),
  });
});

// ═══════════════════════════════════════════
// WEBHOOK — Verificación (GET)
// ═══════════════════════════════════════════
// Meta envía un GET para verificar el webhook al configurarlo
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook verificado correctamente');
    return res.status(200).send(challenge);
  }

  console.warn('❌ Verificación de webhook fallida');
  return res.sendStatus(403);
});

// ═══════════════════════════════════════════
// WEBHOOK — Mensajes entrantes (POST)
// ═══════════════════════════════════════════
app.post('/webhook', async (req, res) => {
  // Responder 200 inmediatamente para evitar reintentos de Meta
  res.sendStatus(200);

  try {
    const body = req.body;

    // Verificar que es un evento de WhatsApp
    if (body.object !== 'whatsapp_business_account') return;

    const entries = body.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        const messages = value.messages || [];

        for (const message of messages) {
          const phone = message.from;
          const messageId = message.id;
          const messageType = message.type;

          // Obtener nombre del contacto
          const contacts = value.contacts || [];
          const senderName = contacts[0]?.profile?.name || null;

          // Extraer contenido según tipo de mensaje
          let content = {};
          let effectiveMessageType = messageType;
          
          switch (messageType) {
            case 'text':
              content = message.text || {};
              break;
            case 'interactive':
              content = message.interactive || {};
              break;
            case 'button':
              content = message.button || {};
              break;
            case 'audio':
              console.log(`🎙️ Recibiendo nota de voz de ${phone}... procesando con IA`);
              const mediaId = message.audio?.id;
              
              if (!process.env.GEMINI_API_KEY) {
                console.log('⚠️ GEMINI_API_KEY no configurada. Audio ignorado.');
                continue;
              }
              
              if (mediaId) {
                const mediaObj = await wa.downloadMedia(mediaId);
                if (mediaObj && mediaObj.buffer) {
                  const texto = await transcribeAudio(mediaObj.buffer, mediaObj.mimeType);
                  if (texto) {
                    console.log(`📝 Transcripción: "${texto}"`);
                    effectiveMessageType = 'text'; // Engañamos al motor
                    content = { body: texto };
                  } else {
                    console.log('❌ Falló la transcripción.');
                    continue;
                  }
                } else {
                  console.log('❌ Falló la descarga del audio.');
                  continue;
                }
              } else {
                continue;
              }
              break;
            default:
              // Tipos no soportados (imagen, sticker, etc.)
              console.log(`📎 Mensaje tipo '${messageType}' de ${phone} — no procesado`);
              continue;
          }

          if (messageType !== 'audio') {
            console.log(`\n📨 Mensaje de ${phone} (${senderName || 'desconocido'}) — tipo: ${messageType}`);
          }

          // Procesar mensaje a través del flujo conversacional
          await flow.processMessage(phone, senderName, effectiveMessageType, content, messageId);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error procesando webhook:', err);
  }
});

// ─── Iniciar servidor ───
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🎨 Saratex WhatsApp Bot — Activo      ║
  ║                                          ║
  ║   Puerto: ${String(PORT).padEnd(30)}║
  ║   Webhook: /webhook                      ║
  ║   Health:  /                             ║
  ╚══════════════════════════════════════════╝
  `);

  // Validar variables de entorno
  const required = ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_VERIFY_TOKEN'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`\n⚠️  Variables de entorno faltantes: ${missing.join(', ')}`);
    console.warn('   Copia .env.example como .env y completa los valores.\n');
  } else {
    console.log('✅ Todas las variables de entorno configuradas');
  }

  if (!process.env.ADVISOR_PHONE) {
    console.warn('⚠️  ADVISOR_PHONE no configurado — las notificaciones al asesor no se enviarán');
  }
});
