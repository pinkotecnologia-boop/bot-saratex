# 🎨 Saratex WhatsApp Bot

Agente automatizado de atención al cliente por WhatsApp para **Saratex Sublimación Gran Formato SAS**.

## ¿Qué hace?

- ✅ Menú interactivo con 8 servicios (Sublimación, DTF, Producto terminado, Corte Láser, etc.)
- ✅ Flujo guiado de cotización: categoría → material → metros → diseño
- ✅ Precios automáticos según tabla de metreaje y uniformes
- ✅ Captura de datos del cliente (nombre, tipo persona, ciudad, correo)
- ✅ Notificación automática al asesor con resumen completo
- ✅ Sistema de PQR (quejas, felicitaciones, consultas)
- ✅ Información de la empresa (horarios, ubicación, datos bancarios)

## Stack Tecnológico

| Componente | Tecnología | Costo |
|------------|-----------|-------|
| Servidor | Node.js + Express | $0 |
| Canal | Meta WhatsApp Cloud API | $0 (1,000 conv/mes gratis) |
| Hosting | Render.com free tier | $0 |
| IA (opcional) | Gemini 1.5 Flash | $0 (cuota gratuita) |

---

## 🚀 Configuración Paso a Paso

### Paso 1: Configurar Meta WhatsApp Cloud API

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Crea una nueva App → tipo **Business**
3. Agrega el producto **WhatsApp**
4. En **WhatsApp > API Setup** encontrarás:
   - **Phone Number ID** (cópialo)
   - **Temporary Access Token** (cópialo, dura 24h)
5. Para token permanente: ve a **Business Settings > System Users > Generate Token**

### Paso 2: Configurar variables de entorno

```bash
# Copiar template
cp .env.example .env

# Editar con tus datos
notepad .env
```

Completa estos valores en `.env`:
```
WHATSAPP_TOKEN=tu_token_de_meta
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_VERIFY_TOKEN=saratex_webhook_2024
ADVISOR_PHONE=573001234567
```

### Paso 3: Instalar y ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en producción
npm start
```

### Paso 4: Exponer webhook (desarrollo local)

Para pruebas locales, necesitas exponer tu servidor al internet:

```bash
# Opción A: ngrok (recomendado para pruebas)
ngrok http 3000

# Opción B: localtunnel
npx localtunnel --port 3000
```

Copia la URL generada (ejemplo: `https://xxxx.ngrok-free.app`)

### Paso 5: Configurar webhook en Meta

1. Ve a **WhatsApp > Configuration** en tu app de Meta
2. En **Webhook URL** pon: `https://tu-url.ngrok-free.app/webhook`
3. En **Verify Token** pon: `saratex_webhook_2024` (o el que pusiste en .env)
4. Click en **Verify and Save**
5. Suscríbete al campo: `messages`

### Paso 6: Probar

Envía un mensaje de WhatsApp al número de prueba de tu app de Meta y el bot debería responder automáticamente.

---

## 🌐 Deploy en Render.com (Producción — Gratis)

1. Sube el código a un repositorio de GitHub
2. Ve a [render.com](https://render.com) y crea un **Web Service**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. En **Environment Variables** agrega todas las variables del `.env`
6. Render te dará una URL tipo `https://saratex-bot.onrender.com`
7. Actualiza el webhook en Meta con: `https://saratex-bot.onrender.com/webhook`

### ⚠️ Cold Start en Free Tier

El free tier de Render se "duerme" tras 15 min de inactividad. Para mantenerlo activo:

1. Ve a [uptimerobot.com](https://uptimerobot.com) (gratis)
2. Crea un monitor HTTP(s) que haga ping a `https://tu-app.onrender.com/` cada 5 minutos
3. Esto mantiene el servidor activo 24/7

---

## 📁 Estructura del Proyecto

```
saratex-whatsapp-bot/
├── package.json          # Dependencias y scripts
├── .env.example          # Template de variables de entorno
├── .gitignore            # Archivos excluidos de git
├── README.md             # Esta documentación
└── src/
    ├── index.js          # Servidor Express + webhook
    ├── whatsapp.js       # Cliente WhatsApp Cloud API
    ├── flow.js           # Motor de flujo conversacional
    ├── pricing.js        # Tablas de precios y cálculos
    └── state.js          # Estado de conversación en memoria
```

## 📊 Flujo del Bot

```
Cliente envía mensaje
       ↓
   BIENVENIDA
       ↓
  MENÚ PRINCIPAL (8 opciones)
       ↓
  ┌────┴─────────────────────────────┐
  │                                  │
Sublimación/DTF/            Producto terminado
Corte/Planchado                      │
  │                           Tipo → Cantidad
  ↓                                  │
Categoría → Material                 │
  → Metros → Diseño                  │
  │                                  │
  └──────────┬───────────────────────┘
             ↓
    DATOS DEL CLIENTE
  Nombre → Tipo → Ciudad → Email
             ↓
    RESUMEN DE COTIZACIÓN
             ↓
  NOTIFICACIÓN AL ASESOR
```

## 🔧 Comandos Globales

El cliente puede escribir en cualquier momento:
- `menu`, `inicio`, `hola` → Volver al menú principal
- Las conversaciones expiran después de 30 minutos de inactividad

---

## 📝 Notas

- **Precios actuales:** Embebidos en `src/pricing.js`. Actualizar cuando cambien las tablas.
- **Producción:** Solo inicia tras confirmar pago (50% abono) y aprobación de diseño.
- **Tiempos:** Hasta 40m → 2-3 días | 41-200m → 3-5 días | +200m → cotización especial.
- **Envíos:** Inter Rápidísimo o Servientrega, costo a cargo del cliente.
