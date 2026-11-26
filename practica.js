// =====================================================================
// practica.js — Ejercicios del modo práctica.
// Cada ejercicio es un enlace como el que mostraría la cámara al leer
// un QR, el lugar donde estaba el código y la respuesta correcta.
// Las explicaciones salen de las mismas 5 reglas de reglas.js, y
// pruebas.html revisa que cada "esperado" coincida con las reglas.
// =====================================================================

const PREGUNTAS_POR_RONDA = 10;

const EJERCICIOS_PRACTICA = [
  // ----- Sin señales -----
  { lugar: "Cartel dentro de una sucursal bancaria", enlace: "https://www.bancoestado.cl/personas", esperado: "Sin señales" },
  { lugar: "Mesa de una cafetería", enlace: "https://m.facebook.com/cafeteria.luna", esperado: "Sin señales" },
  { lugar: "Afiche de una feria artesanal", enlace: "https://www.instagram.com/feria.artesanal", esperado: "Sin señales" },
  { lugar: "Folleto de promociones de un banco", enlace: "https://www.santander.cl/promociones", esperado: "Sin señales" },
  { lugar: "Folleto turístico", enlace: "https://www.google.com/maps?q=museo", esperado: "Sin señales" },
  { lugar: "Publicidad en el metro", enlace: "https://www.netflix.com/cl/", esperado: "Sin señales" },
  { lugar: "Placa en un museo", enlace: "https://es.wikipedia.org/wiki/Codigo_QR", esperado: "Sin señales" },
  { lugar: "Caja de un producto", enlace: "https://www.amazon.com/gp/help", esperado: "Sin señales" },
  { lugar: "Comprobante de una compra en línea", enlace: "https://www.paypal.com/cl/home", esperado: "Sin señales" },
  { lugar: "Manual de un celular", enlace: "https://www.whatsapp.com/download", esperado: "Sin señales" },
  { lugar: "Caja de un computador", enlace: "https://www.microsoft.com/es-cl", esperado: "Sin señales" },
  { lugar: "Vitrina de una tienda", enlace: "https://www.mercadolibre.com/tienda-oficial", esperado: "Sin señales" },

  // ----- Señal de riesgo -----
  { lugar: "Sticker pegado sobre un parquímetro", enlace: "https://bit.ly/pago-estacionamiento", esperado: "Señal de riesgo" },
  { lugar: "Menú de un restaurante", enlace: "http://192.168.10.24/menu", esperado: "Señal de riesgo" },
  { lugar: "Correo que dice \"tu cuenta será bloqueada\"", enlace: "https://bancoestad0.cl/clave", esperado: "Señal de riesgo" },
  { lugar: "Mensaje de texto de un supuesto banco", enlace: "https://santander.cl-verificacion.com", esperado: "Señal de riesgo" },
  { lugar: "Correo de un supuesto reembolso", enlace: "https://paypal.com.reembolso-seguro.xyz", esperado: "Señal de riesgo" },
  { lugar: "Afiche de ofertas en la calle", enlace: "https://mercadolibre-ofertas.top", esperado: "Señal de riesgo" },
  { lugar: "Volante de cupones de descuento", enlace: "http://cupones-gratis.com", esperado: "Señal de riesgo" },
  { lugar: "Mensaje en redes sociales", enlace: "https://faceb00k.com/login", esperado: "Señal de riesgo" },
  { lugar: "Sticker de \"ganaste un premio\"", enlace: "https://tinyurl.com/premio-sorteo", esperado: "Señal de riesgo" },
  { lugar: "Correo de \"pago rechazado\"", enlace: "https://netflix-pagos.click/renovar", esperado: "Señal de riesgo" },
  { lugar: "Volante de un sorteo", enlace: "https://www.gooogle.com/premio", esperado: "Señal de riesgo" },
  { lugar: "Sticker en un paradero", enlace: "https://t.co/regalo", esperado: "Señal de riesgo" },
  { lugar: "Anuncio de \"seguidores gratis\"", enlace: "https://instagram.com.seguidores.link", esperado: "Señal de riesgo" },
];

// Elige "cantidad" ejercicios al azar, sin repetir, mezclando
// enlaces con y sin señales.
function elegirEjercicios(cantidad) {
  const copia = EJERCICIOS_PRACTICA.slice();
  // Mezcla de Fisher-Yates: como barajar cartas.
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, Math.min(cantidad, copia.length));
}
