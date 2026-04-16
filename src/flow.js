// ============================================
// Saratex WhatsApp Bot — Motor de Flujo Conversacional
// ============================================
// Máquina de estados que gestiona el árbol de decisión completo

const wa = require('./whatsapp');
const state = require('./state');
const pricing = require('./pricing');

// ─── Información de la empresa ───
const INFO_EMPRESA = `🏭 *Saratex Sublimación Gran Formato SAS*

📍 Ubicación: Bogotá, Colombia
🕐 Horario: Lunes a Viernes 7:00am - 5:00pm | Sábados 8:00am - 1:00pm
📞 NIT: 901324678-2

🏦 *Datos bancarios:*
Bancolombia Ahorros: 89500000232
Saratex Sublimación Gran Formato SAS
Llave BRE-B: 0091040881

📝 Formulario nuevos clientes:
https://forms.gle/SRupthrGUTnjwZnC9

🚚 Envíos: Inter Rápidísimo o Servientrega (costo a cargo del cliente)

⏱️ *Tiempos de producción:*
• Hasta 40m → 2-3 días hábiles
• 41-200m → 3-5 días hábiles
• +200m → Cotización especial`;

// ─── Categorías de servicio ───
const CATEGORIAS = [
  { id: 'uniformes', title: 'Uniformes deportivos' },
  { id: 'hogar', title: 'Hogar y decoración' },
  { id: 'publicidad', title: 'Publicidad / POP' },
  { id: 'moda', title: 'Moda y prendas' },
  { id: 'otros', title: 'Otros' },
];

// ─── Productos terminados ───
const PRODUCTOS_TERMINADOS = [
  { id: 'camiseta', title: 'Camiseta' },
  { id: 'buso', title: 'Buso / Hoodie' },
  { id: 'pantaloneta', title: 'Pantaloneta' },
  { id: 'completo', title: 'Uniforme completo' },
  { id: 'edredon', title: 'Edredón' },
  { id: 'cortina', title: 'Cortina' },
  { id: 'cojin', title: 'Cojín' },
  { id: 'otro_prod', title: 'Otro producto' },
];

/**
 * Procesar mensaje entrante y generar respuesta
 */
async function processMessage(phone, senderName, messageType, messageContent, messageId) {
  // Marcar como leído
  await wa.markAsRead(messageId);

  const conv = state.getConversation(phone);
  const input = extractInput(messageType, messageContent);

  console.log(`📩 [${phone}] Estado: ${conv.state} | Input: ${input}`);

  // Comando global: reiniciar con "menu" o "inicio"
  if (['menu', 'inicio', 'hola', 'hi', 'hello', 'buenas'].includes(input.toLowerCase())) {
    state.resetConversation(phone);
    return handleWelcome(phone, senderName);
  }

  // Enrutar al handler según estado
  switch (conv.state) {
    case 'WELCOME':
      return handleWelcome(phone, senderName);

    case 'MAIN_MENU':
      return handleMainMenu(phone, input);

    case 'SELECT_CATEGORY':
      return handleSelectCategory(phone, input);

    case 'SELECT_MATERIAL':
      return handleSelectMaterial(phone, input);

    case 'SELECT_METROS':
      return handleSelectMetros(phone, input);

    case 'SELECT_DESIGN':
      return handleSelectDesign(phone, input);

    case 'SELECT_PRODUCT_TYPE':
      return handleSelectProductType(phone, input);

    case 'SELECT_PRODUCT_QTY':
      return handleSelectProductQty(phone, input);

    case 'LASER_SELECT_PIECES':
      return handleLaserPieces(phone, input);

    case 'LASER_ORGANIZED':
      return handleLaserOrganized(phone, input);

    case 'CLIENT_NAME':
      return handleClientName(phone, input);

    case 'CLIENT_TYPE':
      return handleClientType(phone, input);

    case 'CLIENT_CITY':
      return handleClientCity(phone, input);

    case 'CLIENT_EMAIL':
      return handleClientEmail(phone, input);

    case 'PQR_TYPE':
      return handlePQRType(phone, input);

    case 'PQR_MESSAGE':
      return handlePQRMessage(phone, input);

    case 'FINISHED':
      // Ya terminó, ofrecer reiniciar
      return wa.sendButtons(phone, {
        body: '¿Necesitas algo más? 😊',
        buttons: [
          { id: 'restart', title: 'Nuevo servicio' },
          { id: 'info', title: 'Información' },
        ],
      });

    default:
      state.resetConversation(phone);
      return handleWelcome(phone, senderName);
  }
}

// ═══════════════════════════════════════════
// HANDLERS POR ESTADO
// ═══════════════════════════════════════════

/**
 * WELCOME — Mensaje de bienvenida + menú principal
 */
async function handleWelcome(phone, name) {
  const greeting = name ? `¡Hola ${name}! 👋` : '¡Hola! 👋';

  await wa.sendText(phone,
    `${greeting} Bienvenido/a a *Saratex Sublimación Gran Formato* 🎨\n\n` +
    `Somos expertos en sublimación, impresión DTF y corte láser.\n` +
    `¿En qué podemos ayudarte hoy?`
  );

  state.updateState(phone, 'MAIN_MENU');

  return wa.sendList(phone, {
    header: '📋 Menú Principal',
    body: 'Selecciona el servicio que necesitas:',
    footer: 'Saratex — Calidad en cada impresión',
    buttonText: 'Ver servicios',
    sections: [{
      title: 'Servicios',
      rows: [
        { id: 'srv_sublimacion', title: '🎨 Sublimación', description: 'Sublimación en tela por metro' },
        { id: 'srv_dtf', title: '🖨️ Impresión DTF', description: 'Transferencia DTF textil' },
        { id: 'srv_producto', title: '👕 Producto terminado', description: 'Camisetas, busos, edredones...' },
        { id: 'srv_corte', title: '✂️ Corte Láser', description: 'Corte láser de piezas' },
        { id: 'srv_planchado', title: '🔥 Planchado', description: 'Servicio de planchado textil' },
        { id: 'srv_pedidos', title: '📦 Consulta de pedidos', description: 'Estado de tu pedido o envío' },
        { id: 'srv_info', title: 'ℹ️ Información general', description: 'Horarios, ubicación, datos' },
        { id: 'srv_pqr', title: '📝 PQR', description: 'Quejas, felicitaciones, consultas' },
      ],
    }],
  });
}

/**
 * MAIN_MENU — Procesar selección del menú principal
 */
async function handleMainMenu(phone, input) {
  switch (input) {
    case 'srv_sublimacion':
      state.updateState(phone, 'SELECT_CATEGORY', { servicio: 'Sublimación' });
      return sendCategoryMenu(phone);

    case 'srv_dtf':
      state.updateState(phone, 'SELECT_CATEGORY', { servicio: 'Impresión DTF' });
      return sendCategoryMenu(phone);

    case 'srv_producto':
      state.updateState(phone, 'SELECT_PRODUCT_TYPE', { servicio: 'Producto terminado' });
      return sendProductTypeMenu(phone);

    case 'srv_corte':
      state.updateState(phone, 'SELECT_CATEGORY', { servicio: 'Corte Láser' });
      return sendCategoryMenu(phone);

    case 'srv_planchado':
      state.updateState(phone, 'SELECT_CATEGORY', { servicio: 'Planchado' });
      return sendCategoryMenu(phone);

    case 'srv_pedidos':
      return handlePedidosConsulta(phone);

    case 'srv_info':
      await wa.sendText(phone, INFO_EMPRESA);
      state.updateState(phone, 'FINISHED');
      return wa.sendButtons(phone, {
        body: '¿Necesitas algo más?',
        buttons: [
          { id: 'restart', title: '🔄 Menú principal' },
        ],
      });

    case 'srv_pqr':
      state.updateState(phone, 'PQR_TYPE');
      return sendPQRMenu(phone);

    // Si el usuario responde "restart" desde cualquier estado FINISHED
    case 'restart':
      state.resetConversation(phone);
      return handleWelcome(phone, null);

    default:
      return wa.sendText(phone, '⚠️ No entendí tu selección. Por favor usa el menú de opciones. Escribe *menu* para volver al inicio.');
  }
}

/**
 * SELECT_CATEGORY — Selección de categoría de servicio
 */
async function sendCategoryMenu(phone) {
  return wa.sendList(phone, {
    header: '📂 Categoría',
    body: '¿Para qué tipo de producto necesitas el servicio?',
    buttonText: 'Ver categorías',
    sections: [{
      title: 'Categorías',
      rows: CATEGORIAS.map(c => ({ id: `cat_${c.id}`, title: c.title })),
    }],
  });
}

async function handleSelectCategory(phone, input) {
  const catId = input.replace('cat_', '');
  const cat = CATEGORIAS.find(c => c.id === catId);

  if (!cat) {
    return wa.sendText(phone, '⚠️ Selección no válida. Por favor elige una categoría del menú.');
  }

  state.updateState(phone, 'SELECT_MATERIAL', { categoria: cat.title });
  return sendMaterialMenu(phone);
}

/**
 * SELECT_MATERIAL — Selección de material/tela
 */
async function sendMaterialMenu(phone) {
  return wa.sendList(phone, {
    header: '🧵 Material / Tela',
    body: 'Selecciona el tipo de tela:',
    footer: 'Plutón 1.60m es la más usada para uniformes',
    buttonText: 'Ver materiales',
    sections: [{
      title: 'Materiales disponibles',
      rows: pricing.MATERIALES.map(m => ({
        id: `mat_${m.id}`,
        title: m.nombre,
        description: `Ancho: ${m.ancho}`,
      })),
    }],
  });
}

async function handleSelectMaterial(phone, input) {
  const matId = input.replace('mat_', '');
  const mat = pricing.MATERIALES.find(m => m.id === matId);

  if (!mat) {
    return wa.sendText(phone, '⚠️ Material no válido. Por favor selecciona del menú.');
  }

  state.updateState(phone, 'SELECT_METROS', { material: `${mat.nombre} (${mat.ancho})` });
  return sendMetrosMenu(phone);
}

/**
 * SELECT_METROS — Selección de cantidad de metros
 */
async function sendMetrosMenu(phone) {
  return wa.sendList(phone, {
    header: '📏 Cantidad de Metros',
    body: '¿Cuántos metros necesitas?',
    footer: 'Los precios varían según la cantidad',
    buttonText: 'Ver rangos',
    sections: [{
      title: 'Rangos de metros',
      rows: pricing.RANGOS_METROS.map(r => ({
        id: r.id,
        title: r.label,
      })),
    }],
  });
}

async function handleSelectMetros(phone, input) {
  const rango = pricing.RANGOS_METROS.find(r => r.id === input);

  if (!rango) {
    // Intentar interpretar como número directo
    const num = parseInt(input);
    if (!isNaN(num) && num > 0) {
      const cotizacion = pricing.calcularCotizacionSublimacion(num);
      state.updateState(phone, 'SELECT_DESIGN', {
        metros: num,
        rangoMetros: `${num} metros`,
      });

      await wa.sendText(phone,
        `📊 *Referencia de precio:*\n` +
        `${num} metros × ${cotizacion.precioFormateado}/metro = *${cotizacion.subtotalFormateado}*\n\n` +
        `_(Precio de sublimación, sin incluir tela ni diseño)_`
      );

      return sendDesignMenu(phone);
    }

    return wa.sendText(phone, '⚠️ Selecciona un rango del menú o escribe la cantidad exacta de metros.');
  }

  // Calcular precio con el mínimo del rango como referencia
  const cotizacion = pricing.calcularCotizacionSublimacion(rango.min);
  state.updateState(phone, 'SELECT_DESIGN', {
    metros: rango.min,
    rangoMetros: rango.label,
  });

  await wa.sendText(phone,
    `📊 *Referencia de precio (${rango.label}):*\n` +
    `Precio por metro: *${cotizacion.precioFormateado}*\n\n` +
    `_(El precio exacto depende de la cantidad final de metros)_`
  );

  return sendDesignMenu(phone);
}

/**
 * SELECT_DESIGN — ¿Tiene diseño propio?
 */
async function sendDesignMenu(phone) {
  return wa.sendButtons(phone, {
    body: '🎨 ¿Ya tienes tu diseño listo para imprimir?',
    footer: 'Si no tienes diseño, podemos crearlo por ti',
    buttons: [
      { id: 'design_yes', title: '✅ Sí, tengo diseño' },
      { id: 'design_no', title: '❌ No, necesito uno' },
    ],
  });
}

async function handleSelectDesign(phone, input) {
  if (input === 'design_yes') {
    state.updateState(phone, 'CLIENT_NAME', { tieneDiseno: true });
    return wa.sendText(phone,
      '¡Perfecto! 👍 Podrás enviar tu diseño al asesor.\n\n' +
      'Ahora necesitamos algunos datos para tu cotización.\n\n' +
      '📝 *¿Cuál es tu nombre completo o razón social?*'
    );
  } else if (input === 'design_no') {
    state.updateState(phone, 'CLIENT_NAME', { tieneDiseno: false });

    // Mostrar tarifas de diseño
    let tarifas = '🎨 *Tarifas de diseño:*\n\n';
    for (const t of pricing.TARIFAS_DISENO) {
      tarifas += `• Complejidad ${t.nivel}: *${pricing.formatCOP(t.valor)}* — ${t.descripcion}\n`;
    }
    tarifas += '\n_El asesor te guiará con el diseño._\n\n📝 *¿Cuál es tu nombre completo o razón social?*';

    return wa.sendText(phone, tarifas);
  }

  return wa.sendText(phone, '⚠️ Por favor selecciona una de las opciones.');
}

/**
 * SELECT_PRODUCT_TYPE — Tipo de producto terminado
 */
async function sendProductTypeMenu(phone) {
  return wa.sendList(phone, {
    header: '👕 Producto Terminado',
    body: '¿Qué tipo de producto necesitas?',
    buttonText: 'Ver productos',
    sections: [{
      title: 'Productos',
      rows: PRODUCTOS_TERMINADOS.map(p => ({ id: `prod_${p.id}`, title: p.title })),
    }],
  });
}

async function handleSelectProductType(phone, input) {
  const prodId = input.replace('prod_', '');
  const prod = PRODUCTOS_TERMINADOS.find(p => p.id === prodId);

  if (!prod) {
    return wa.sendText(phone, '⚠️ Producto no válido. Por favor selecciona del menú.');
  }

  state.updateState(phone, 'SELECT_PRODUCT_QTY', { tipoProducto: prod.title });

  // Si es uniforme, mostrar tabla de precios
  if (['camiseta', 'pantaloneta', 'completo'].includes(prodId)) {
    await wa.sendText(phone, pricing.getTablaUniformesTexto());
  }

  return wa.sendText(phone, '📦 *¿Cuántas unidades necesitas?*\n\nEscribe la cantidad (ejemplo: 50)');
}

async function handleSelectProductQty(phone, input) {
  const qty = parseInt(input);
  if (isNaN(qty) || qty <= 0) {
    return wa.sendText(phone, '⚠️ Por favor escribe un número válido de unidades (ejemplo: 50)');
  }

  state.updateState(phone, 'CLIENT_NAME', { cantidad: qty });
  return wa.sendText(phone,
    `✅ *${qty} unidades* registradas.\n\n` +
    'Ahora necesitamos algunos datos para tu cotización.\n\n' +
    '📝 *¿Cuál es tu nombre completo o razón social?*'
  );
}

/**
 * LASER — Cantidad de piezas y estado de organización
 */
async function handleLaserPieces(phone, input) {
  const qty = parseInt(input);
  if (isNaN(qty) || qty <= 0) {
    return wa.sendText(phone, '⚠️ Por favor escribe un número válido de piezas.');
  }

  state.updateState(phone, 'LASER_ORGANIZED', { cantidad: qty });
  return wa.sendButtons(phone, {
    body: `✅ ${qty} piezas registradas.\n\n¿Las piezas están ordenadas y contadas?`,
    buttons: [
      { id: 'org_yes', title: '✅ Sí, organizadas' },
      { id: 'org_no', title: '❌ No' },
    ],
  });
}

async function handleLaserOrganized(phone, input) {
  if (input === 'org_yes') {
    state.updateState(phone, 'CLIENT_NAME', { piezasOrdenadas: true });
  } else if (input === 'org_no') {
    state.updateState(phone, 'CLIENT_NAME', { piezasOrdenadas: false });
  } else {
    return wa.sendText(phone, '⚠️ Por favor selecciona una opción.');
  }

  return wa.sendText(phone,
    '📝 Ahora necesitamos algunos datos para tu cotización.\n\n' +
    '*¿Cuál es tu nombre completo o razón social?*'
  );
}

// ═══════════════════════════════════════════
// CAPTURA DE DATOS DEL CLIENTE
// ═══════════════════════════════════════════

async function handleClientName(phone, input) {
  if (!input || input.length < 2) {
    return wa.sendText(phone, '⚠️ Por favor escribe tu nombre completo.');
  }

  state.updateState(phone, 'CLIENT_TYPE', { nombre: input });
  return wa.sendButtons(phone, {
    body: `Gracias, *${input}* 👋\n\n¿Eres persona natural o jurídica?`,
    buttons: [
      { id: 'type_natural', title: '👤 Natural' },
      { id: 'type_juridica', title: '🏢 Jurídica' },
    ],
  });
}

async function handleClientType(phone, input) {
  if (input === 'type_natural') {
    state.updateState(phone, 'CLIENT_CITY', { tipoPersona: 'Natural' });
  } else if (input === 'type_juridica') {
    state.updateState(phone, 'CLIENT_CITY', { tipoPersona: 'Jurídica' });
  } else {
    return wa.sendText(phone, '⚠️ Por favor selecciona una opción.');
  }

  return wa.sendText(phone, '🏙️ *¿En qué ciudad te encuentras?*');
}

async function handleClientCity(phone, input) {
  if (!input || input.length < 2) {
    return wa.sendText(phone, '⚠️ Por favor escribe tu ciudad.');
  }

  state.updateState(phone, 'CLIENT_EMAIL', { ciudad: input });
  return wa.sendText(phone, '📧 *¿Cuál es tu correo electrónico?*\n\n_(Escribe "no" si no deseas compartirlo)_');
}

async function handleClientEmail(phone, input) {
  const correo = input.toLowerCase() === 'no' ? 'No proporcionado' : input;
  state.updateState(phone, 'FINISHED', { correo });

  // Generar resumen y notificar asesor
  const conv = state.getConversation(phone);
  await sendSummary(phone, conv);
  await notifyAdvisor(conv);

  return wa.sendButtons(phone, {
    body: '✅ *¡Listo!* Tu solicitud ha sido enviada a nuestro equipo.\n\n' +
          'Un asesor te contactará pronto para finalizar tu cotización.\n\n' +
          '⏱️ Tiempo de respuesta: máximo 30 minutos en horario laboral.',
    buttons: [
      { id: 'restart', title: '🔄 Nuevo servicio' },
      { id: 'srv_info', title: 'ℹ️ Información' },
    ],
  });
}

// ═══════════════════════════════════════════
// PQR
// ═══════════════════════════════════════════

async function sendPQRMenu(phone) {
  return wa.sendButtons(phone, {
    body: '📝 *PQR — Peticiones, Quejas y Reclamos*\n\n¿Qué tipo de solicitud deseas realizar?',
    buttons: [
      { id: 'pqr_queja', title: '😞 Queja/Reclamo' },
      { id: 'pqr_felicitacion', title: '😊 Felicitación' },
      { id: 'pqr_consulta', title: '❓ Consulta' },
    ],
  });
}

async function handlePQRType(phone, input) {
  const tipos = {
    pqr_queja: 'Queja/Reclamo',
    pqr_felicitacion: 'Felicitación',
    pqr_consulta: 'Consulta',
  };

  if (!tipos[input]) {
    return wa.sendText(phone, '⚠️ Por favor selecciona un tipo de PQR.');
  }

  state.updateState(phone, 'PQR_MESSAGE', { tipoPQR: tipos[input] });
  return wa.sendText(phone, `📝 Por favor escribe tu *${tipos[input].toLowerCase()}* a continuación:`);
}

async function handlePQRMessage(phone, input) {
  if (!input || input.length < 5) {
    return wa.sendText(phone, '⚠️ Por favor escribe un mensaje más detallado.');
  }

  state.updateState(phone, 'FINISHED', { mensajePQR: input });

  // Notificar asesor sobre PQR
  const conv = state.getConversation(phone);
  await notifyAdvisorPQR(conv);

  return wa.sendButtons(phone, {
    body: `✅ Tu *${conv.data.tipoPQR}* ha sido registrada y enviada al equipo.\n\nGracias por tu retroalimentación. 🙏`,
    buttons: [
      { id: 'restart', title: '🔄 Menú principal' },
    ],
  });
}

// ═══════════════════════════════════════════
// CONSULTA DE PEDIDOS
// ═══════════════════════════════════════════

async function handlePedidosConsulta(phone) {
  state.updateState(phone, 'FINISHED');
  return wa.sendText(phone,
    '📦 *Consulta de Pedidos y Envíos*\n\n' +
    'Para consultar el estado de tu pedido, por favor comunícate directamente con nuestro asesor de logística.\n\n' +
    'Un asesor se comunicará contigo en breve. 🕐\n\n' +
    'Escribe *menu* para volver al inicio.'
  );
}

// ═══════════════════════════════════════════
// RESUMEN Y NOTIFICACIONES
// ═══════════════════════════════════════════

/**
 * Enviar resumen de cotización al cliente
 */
async function sendSummary(phone, conv) {
  const d = conv.data;
  let summary = '📋 *RESUMEN DE TU SOLICITUD*\n';
  summary += '━━━━━━━━━━━━━━━━━━━━━━\n\n';

  if (d.servicio) summary += `🔹 *Servicio:* ${d.servicio}\n`;
  if (d.categoria) summary += `🔹 *Categoría:* ${d.categoria}\n`;
  if (d.material) summary += `🔹 *Material:* ${d.material}\n`;
  if (d.rangoMetros) summary += `🔹 *Metros:* ${d.rangoMetros}\n`;
  if (d.tipoProducto) summary += `🔹 *Producto:* ${d.tipoProducto}\n`;
  if (d.cantidad) summary += `🔹 *Cantidad:* ${d.cantidad} unidades\n`;
  if (d.tieneDiseno !== null) summary += `🔹 *Diseño propio:* ${d.tieneDiseno ? 'Sí' : 'No (requiere diseño)'}\n`;
  if (d.piezasOrdenadas !== null) summary += `🔹 *Piezas organizadas:* ${d.piezasOrdenadas ? 'Sí' : 'No'}\n`;

  summary += '\n👤 *DATOS DEL CLIENTE*\n';
  summary += '━━━━━━━━━━━━━━━━━━━━━━\n';
  if (d.nombre) summary += `🔹 *Nombre:* ${d.nombre}\n`;
  if (d.tipoPersona) summary += `🔹 *Tipo:* Persona ${d.tipoPersona}\n`;
  if (d.ciudad) summary += `🔹 *Ciudad:* ${d.ciudad}\n`;
  if (d.correo) summary += `🔹 *Correo:* ${d.correo}\n`;
  summary += `🔹 *WhatsApp:* ${phone}\n`;

  return wa.sendText(phone, summary);
}

/**
 * Notificar al asesor humano sobre nueva cotización
 */
async function notifyAdvisor(conv) {
  const advisorPhone = process.env.ADVISOR_PHONE;
  if (!advisorPhone) {
    console.warn('⚠️ ADVISOR_PHONE no configurado. No se envió notificación.');
    return;
  }

  const d = conv.data;
  let msg = '🔔 *NUEVA SOLICITUD DE COTIZACIÓN*\n';
  msg += '━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  msg += `📅 ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}\n\n`;

  if (d.servicio) msg += `🔹 Servicio: ${d.servicio}\n`;
  if (d.categoria) msg += `🔹 Categoría: ${d.categoria}\n`;
  if (d.material) msg += `🔹 Material: ${d.material}\n`;
  if (d.rangoMetros) msg += `🔹 Metros: ${d.rangoMetros}\n`;
  if (d.tipoProducto) msg += `🔹 Producto: ${d.tipoProducto}\n`;
  if (d.cantidad) msg += `🔹 Cantidad: ${d.cantidad}\n`;
  if (d.tieneDiseno !== null) msg += `🔹 Diseño propio: ${d.tieneDiseno ? 'Sí' : 'No'}\n`;

  msg += '\n👤 *Cliente:*\n';
  msg += `• ${d.nombre || 'N/A'}\n`;
  msg += `• ${d.tipoPersona || 'N/A'}\n`;
  msg += `• ${d.ciudad || 'N/A'}\n`;
  msg += `• ${d.correo || 'N/A'}\n`;
  msg += `• wa.me/${conv.phone}\n`;

  return wa.sendText(advisorPhone, msg);
}

/**
 * Notificar al asesor sobre PQR
 */
async function notifyAdvisorPQR(conv) {
  const advisorPhone = process.env.ADVISOR_PHONE;
  if (!advisorPhone) return;

  const d = conv.data;
  const msg = `🔔 *NUEVA PQR — ${d.tipoPQR}*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📅 ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}\n` +
    `📱 Cliente: wa.me/${conv.phone}\n\n` +
    `📝 *Mensaje:*\n${d.mensajePQR}`;

  return wa.sendText(advisorPhone, msg);
}

// ═══════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════

/**
 * Extraer texto/ID del mensaje según tipo
 */
function extractInput(messageType, content) {
  switch (messageType) {
    case 'text':
      return content.body || '';
    case 'interactive':
      if (content.list_reply) return content.list_reply.id;
      if (content.button_reply) return content.button_reply.id;
      return '';
    case 'button':
      return content.payload || '';
    default:
      return '';
  }
}

module.exports = { processMessage };
