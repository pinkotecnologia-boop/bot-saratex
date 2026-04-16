require('dotenv').config();
const readline = require('readline');
const flow = require('./src/flow');
const wa = require('./src/whatsapp');

// Sobreescribir envío de WhatsApp para imprimir en la consola de colores
wa.sendText = async (to, text) => {
  console.log(`\n🤖 \x1b[32m[BOT]\x1b[0m\n${text}\n`);
  return { messages: [{ id: 'mock_id' }] };
};

wa.sendList = async (to, listData) => {
  console.log(`\n🤖 \x1b[32m[BOT - MENÚ DE LISTA]\x1b[0m\n${listData.body}\n`);
  listData.sections.forEach(sec => {
    console.log(`\x1b[33m--- ${sec.title} ---\x1b[0m`);
    sec.rows.forEach(row => {
      console.log(` 👉 Escribe \x1b[36m"${row.id}"\x1b[0m para: ${row.title} ${row.description ? '('+row.description+')' : ''}`);
    });
  });
  console.log('');
  return { messages: [{ id: 'mock_id' }] };
};

wa.sendButtons = async (to, btnData) => {
  console.log(`\n🤖 \x1b[32m[BOT - BOTONES]\x1b[0m\n${btnData.body}\n`);
  btnData.buttons.forEach(btn => {
    console.log(` 👉 Escribe \x1b[36m"${btn.id}"\x1b[0m para elegir: [${btn.title}]`);
  });
  console.log('');
  return { messages: [{ id: 'mock_id' }] };
};

wa.markAsRead = async () => {}; // Desactivar lectura

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const DEMO_PHONE = '57300TEST00';

console.log('='.repeat(50));
console.log(' SIMULADOR LOCAL - SARATEX BOT');
console.log(' Escribe "hola" o "menu" para arrancar el flujo');
console.log('='.repeat(50));

function ask() {
  rl.question('\n👤 TÚ: ', async (input) => {
    input = input.trim();
    
    // Tratamos de simular si el usuario escribió un ID interno (botones o listas)
    let messageType = 'text';
    let content = { body: input };
    
    const interactiveIds = ['design_yes', 'design_no', 'org_yes', 'org_no', 'type_natural', 'type_juridica', 'pqr_queja', 'pqr_felicitacion', 'pqr_consulta', 'restart', 'srv_info'];
    
    if (input.startsWith('srv_') || input.startsWith('cat_') || input.startsWith('mat_') || input.startsWith('rango_') || input.startsWith('prod_')) {
      messageType = 'interactive';
      content = { list_reply: { id: input } };
    } else if (interactiveIds.includes(input)) {
       messageType = 'button';
       content = { payload: input };
    }

    try {
      await flow.processMessage(DEMO_PHONE, 'Usuario de Pruebas', messageType, content, 'msg_' + Date.now());
    } catch (err) {
      console.error('❌ Error Interno:', err);
    }
    
    ask(); // Volver a preguntar
  });
}

ask();
