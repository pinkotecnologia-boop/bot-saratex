// ============================================
// Saratex WhatsApp Bot — Motor de Transcripción de Audio
// ============================================
// Integra Google Gemini REST API para convertir notas de voz a texto

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Transcribe un buffer de audio a texto utilizando Gemini 1.5 Flash
 * @param {Buffer} audioBuffer - Archivo binario de audio
 * @param {string} mimeType - Tipo MIME (e.g., 'audio/ogg')
 * @returns {Promise<string|null>} - Texto transcrito o null si falla
 */
async function transcribeAudio(audioBuffer, mimeType = 'audio/ogg') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('⚠️ GEMINI_API_KEY no detectada. No se puede transcribir el audio.');
    return null;
  }

  // Convertir a Base64 para Gemini
  const base64Audio = audioBuffer.toString('base64');
  
  const payload = {
    contents: [
      {
        parts: [
          {
            text: "Transcribe el siguiente mensaje de voz a texto exacto en español colombiano. El usuario podría estar pidiendo una cotización para productos como camisetas, busos, uniformes o impresión, usando metros (tela pluton, lino). Manten la intención original. Responde UNICAMENTE con la transcripción directa, sin saludos ni comentarios agregados de tu parte, como si tú fueras la nota de voz textual."
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          }
        ]
      }
    ],
    // Configuramos para minimizar "alucinaciones"
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 256
    }
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error API Gemini:', JSON.stringify(data, null, 2));
      return null;
    }

    // Extraer texto de la respuesta
    const transcribedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (transcribedText) {
      return transcribedText.trim();
    }
    
    return null;

  } catch (err) {
    console.error('❌ Error de red transcribiendo audio:', err.message);
    return null;
  }
}

module.exports = {
  transcribeAudio
};
