// ============================================
// Saratex WhatsApp Bot — Tablas de Precios
// ============================================
// Fuente: Manual de precios Saratex + Plan de implementación

/**
 * Materiales disponibles con su ancho de tela
 */
const MATERIALES = [
  { id: 'cerro_sport', nombre: 'Cerro Sport', ancho: '1.50m' },
  { id: 'orion', nombre: 'Orión', ancho: '1.50m' },
  { id: 'suavetina', nombre: 'Suavetina', ancho: '1.60m' },
  { id: 'lino_flex', nombre: 'Lino Flex', ancho: '1.50m' },
  { id: 'pluton', nombre: 'Plutón', ancho: '1.60m' },
  { id: 'piel_durazno', nombre: 'Piel de Durazno', ancho: '1.60m' },
];

/**
 * Tabla de uniformes — Tela Plutón, manga corta, ancho 1.60m
 * Precios en COP
 */
const UNIFORMES_PLUTON = [
  { talla: 'S',        metros: 0.87, camiseta: 6960,  pantaloneta: 6960,  completo: 11200 },
  { talla: 'M',        metros: 0.90, camiseta: 7200,  pantaloneta: 7200,  completo: 11520 },
  { talla: 'L',        metros: 1.10, camiseta: 8800,  pantaloneta: 8800,  completo: 14000 },
  { talla: 'XL',       metros: 1.20, camiseta: 9600,  pantaloneta: 9600,  completo: 15440 },
  { talla: 'XXL',      metros: 1.35, camiseta: 10800, pantaloneta: 10800, completo: 17840 },
  { talla: 'Niños 6',  metros: 0.65, camiseta: 5200,  pantaloneta: 4240,  completo: 8640 },
  { talla: 'Niños 8',  metros: 0.68, camiseta: 5440,  pantaloneta: 4400,  completo: 9040 },
  { talla: 'Niños 10', metros: 0.73, camiseta: 5840,  pantaloneta: 4640,  completo: 9680 },
  { talla: 'Niños 12', metros: 0.77, camiseta: 6160,  pantaloneta: 4800,  completo: 10000 },
  { talla: 'Niños 14', metros: 0.81, camiseta: 6480,  pantaloneta: 4960,  completo: 10640 },
  { talla: 'Niños 16', metros: 0.82, camiseta: 6560,  pantaloneta: 5200,  completo: 10960 },
];

/**
 * Precios de sublimación por rango de metreaje (COP por metro)
 */
const PRECIOS_SUBLIMACION = [
  { min: 1,    max: 10,   precioMetro: 17600 },
  { min: 11,   max: 20,   precioMetro: 15000 },
  { min: 21,   max: 30,   precioMetro: 14500 },
  { min: 31,   max: 50,   precioMetro: 14000 },
  { min: 51,   max: 100,  precioMetro: 11000 },
  { min: 101,  max: 200,  precioMetro: 10000 },
  { min: 201,  max: 300,  precioMetro: 9500 },
  { min: 301,  max: 400,  precioMetro: 9000 },
  { min: 401,  max: 500,  precioMetro: 8500 },
  { min: 501,  max: 999,  precioMetro: 8000 },
  { min: 1000, max: 99999, precioMetro: 7500 },
];

/**
 * Tarifas de diseño por nivel de complejidad (COP)
 */
const TARIFAS_DISENO = [
  { nivel: 1, valor: 10000, descripcion: 'Backing fiesta, banderas sencillas' },
  { nivel: 2, valor: 20000, descripcion: 'Patrones' },
  { nivel: 3, valor: 40000, descripcion: 'Uniformes (montaje $500/camiseta+pantaloneta)' },
  { nivel: 4, valor: 50000, descripcion: 'Diseños complejos (montaje $500)' },
];

/**
 * Rangos de metros para el menú de selección
 */
const RANGOS_METROS = [
  { id: 'rango_1_10',    label: '1 - 10 metros',    min: 1,    max: 10 },
  { id: 'rango_11_20',   label: '11 - 20 metros',   min: 11,   max: 20 },
  { id: 'rango_21_30',   label: '21 - 30 metros',   min: 21,   max: 30 },
  { id: 'rango_31_50',   label: '31 - 50 metros',   min: 31,   max: 50 },
  { id: 'rango_51_100',  label: '51 - 100 metros',  min: 51,   max: 100 },
  { id: 'rango_101_200', label: '101 - 200 metros',  min: 101,  max: 200 },
  { id: 'rango_201_300', label: '201 - 300 metros',  min: 201,  max: 300 },
  { id: 'rango_301_500', label: '301 - 500 metros',  min: 301,  max: 500 },
  { id: 'rango_501_999', label: '501 - 999 metros',  min: 501,  max: 999 },
  { id: 'rango_1000',    label: '1.000+ metros',     min: 1000, max: 99999 },
];

/**
 * Obtener precio por metro según cantidad
 */
function getPrecioSublimacion(metros) {
  const rango = PRECIOS_SUBLIMACION.find(r => metros >= r.min && metros <= r.max);
  return rango ? rango.precioMetro : PRECIOS_SUBLIMACION[PRECIOS_SUBLIMACION.length - 1].precioMetro;
}

/**
 * Calcular cotización de sublimación
 */
function calcularCotizacionSublimacion(metros) {
  const precioMetro = getPrecioSublimacion(metros);
  return {
    metros,
    precioMetro,
    subtotal: metros * precioMetro,
    precioFormateado: formatCOP(precioMetro),
    subtotalFormateado: formatCOP(metros * precioMetro),
  };
}

/**
 * Obtener precios de uniforme por talla
 */
function getPrecioUniforme(talla) {
  return UNIFORMES_PLUTON.find(u => u.talla === talla) || null;
}

/**
 * Formatear valor en COP
 */
function formatCOP(valor) {
  return '$' + valor.toLocaleString('es-CO');
}

/**
 * Generar texto de tabla de precios de uniformes
 */
function getTablaUniformesTexto() {
  let texto = '📋 *Tabla de precios — Uniformes Plutón (manga corta)*\n\n';
  texto += '```\n';
  texto += 'Talla     | Camiseta  | Pantalon. | Completo\n';
  texto += '----------|-----------|-----------|----------\n';
  for (const u of UNIFORMES_PLUTON) {
    const talla = u.talla.padEnd(9);
    const cam = formatCOP(u.camiseta).padEnd(9);
    const pant = formatCOP(u.pantaloneta).padEnd(9);
    const comp = formatCOP(u.completo);
    texto += `${talla} | ${cam} | ${pant} | ${comp}\n`;
  }
  texto += '```';
  return texto;
}

module.exports = {
  MATERIALES,
  UNIFORMES_PLUTON,
  PRECIOS_SUBLIMACION,
  TARIFAS_DISENO,
  RANGOS_METROS,
  getPrecioSublimacion,
  calcularCotizacionSublimacion,
  getPrecioUniforme,
  formatCOP,
  getTablaUniformesTexto,
};
