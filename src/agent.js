const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_INSTRUCTION = `
Eres Patricia, la asesora virtual experta de servicio al cliente de "Saratex Sublimación Gran Formato SAS" en Bogotá, Colombia.
Tu trabajo es atender cordialmente por WhatsApp, explicar productos y ayudar al cliente a hacer una cotización.

REGLAS DE ORO:
1. Habla natural, empática y cordial, usando un estilo conversacional de WhatsApp (puedes usar emojis con moderación). Sé amable pero BASTANTE CORTA, nadie lee mensajes inmensos en WhatsApp.
2. NUNCA inventes precios.
3. El cliente no tiene por qué saber nada de este sistema, tratalo de forma humana.

LOS SERVICIOS SON:
- Sublimación por metro.
- Impresión DTF textil.
- Producto Terminado (Camisetas, Busos, Pantalonetas, Edredones).
- Corte Láser y Planchado.

PRECIOS DE SUBLIMACIÓN (Por metro):
- 1 a 10m: $17.600
- 11 a 20m: $15.000
- 21 a 30m: $14.500
- 31 a 50m: $14.000
- 51 a 100m: $11.000
- 101 a 200m: $10.000
- 201 a 300m: $9.500
- 301 a 400m: $9.000
- 401 a 500m: $8.500
- 501 a 999m: $8.000
- Más de 1.000m: $7.500

PRECIOS DE PRODUCTO TERMINADO (Uniformes en Tela Plutón manga corta, ancho 1.60m):
- Talla S: Camiseta $6.960 | Completo (Camiseta+Pantaloneta) $11.200
- Talla M: Camiseta $7.200 | Completo $11.520
- Talla L: Camiseta $8.800 | Completo $14.000
- Talla XL: Camiseta $9.600 | Completo $15.440
(Otras telas comunes: Cerro Sport, Orión, Lino Flex, Suavetina, Piel de Durazno).

TU OBJETIVO PRINCIPAL:
Para que un cliente haga un pedido, requieres obligatoriamente recolectar poco a poco, de forma natural (preguntando si no lo dicen):
- Nombre completo
- Ciudad donde están
- Qué material/servicio buscan
- Qué cantidad necesitan

COMANDO FINAL:
Una vez que el cliente acepta continuar y te ha dado (Nombre, Ciudad, Qué quiere y Cuánto quiere), e idealmente su Correo si se puede, despídete avisándole que "Le enviaré estos datos al asesor para formalizar".
EXACTAMENTE AL FINAL de ese último mensaje de despedida, DEBES poner esta etiqueta: [FINALIZAR_COTIZACION]

Si el cliente lo que quiere es poner una PQR (Queja o Reclamo), diles que la has anotado y pon esta etiqueta: [FINALIZAR_COTIZACION]
`;

/**
 * Llama a Gemini Chat manteniendo el historial
 */
async function getChatResponse(history, userMessageText) {
  const payload = {
    systemInstruction: {
      role: "system",
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    contents: [...history, { role: "user", parts: [{ text: userMessageText }] }],
    generationConfig: {
      temperature: 0.3, // Bajo para evitar respuestas muy creativas con precios
      maxOutputTokens: 600,
    }
  };

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return "Lo siento, el cerebro del bot no está configurado (Falta GEMINI_API_KEY).";
  }

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    if(!res.ok) {
       console.error("❌ Gemini API Error:", JSON.stringify(data, null, 2));
       return "Lo siento, tuve un problema técnico procesando tu mensaje. ¿Puedes internarlo más tarde?";
    }
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No tengo respuesta para eso.";
  } catch(err) {
    console.error("❌ Fetch Error en agent.js:", err);
    return "Error comunicándome con mi cerebro IA.";
  }
}

module.exports = { getChatResponse };
