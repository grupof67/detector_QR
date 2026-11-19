// =====================================================================
// casos.js — Casos de prueba: un enlace y el estado que DEBERÍA dar.
// pruebas.html los revisa todos automáticamente.
// =====================================================================

const CASOS = [
  // --- Sin señales: sitios normales ---
  { enlace: "https://www.google.com", esperado: "Sin señales" },
  { enlace: "https://m.facebook.com/perfil", esperado: "Sin señales" },
  { enlace: "https://www.bancoestado.cl/personas", esperado: "Sin señales" },
  { enlace: "mercadolibre.com.ar", esperado: "Sin señales" },
  { enlace: "https://www.wikipedia.org", esperado: "Sin señales" },
  { enlace: "HTTPS://WWW.NETFLIX.COM", esperado: "Sin señales" },

  // --- Regla 1: acortadores ---
  { enlace: "https://bit.ly/3xYzAbC", esperado: "Señal de riesgo" },
  { enlace: "https://t.co/abc123", esperado: "Señal de riesgo" },
  { enlace: "https://cutt.ly/promo", esperado: "Señal de riesgo" },
  { enlace: "http://tinyurl.com/pago", esperado: "Señal de riesgo" },

  // --- Regla 2: sin https ---
  { enlace: "http://ejemplo.com/menu", esperado: "Señal de riesgo" },

  // --- Regla 3: dirección IP ---
  { enlace: "http://192.168.10.24/pago", esperado: "Señal de riesgo" },
  { enlace: "https://10.0.0.5", esperado: "Señal de riesgo" },

  // --- Regla 4: imitación ---
  { enlace: "https://paypa1.com/login", esperado: "Señal de riesgo" },
  { enlace: "https://gooogle.com", esperado: "Señal de riesgo" },
  { enlace: "https://faceb00k.com", esperado: "Señal de riesgo" },
  { enlace: "https://paypal.com.verificar-cuenta.net", esperado: "Señal de riesgo" },
  { enlace: "https://santander.cl-clientes.com", esperado: "Señal de riesgo" },
  { enlace: "https://login.paypa1.com.xyz", esperado: "Señal de riesgo" },

  // --- Regla 5: terminación poco común ---
  { enlace: "https://ofertas.xyz", esperado: "Señal de riesgo" },
  { enlace: "https://tienda-barata.top/promo", esperado: "Señal de riesgo" },

  // --- Trampa con "@": el sitio real es sitio-raro.click ---
  { enlace: "https://paypal.com@sitio-raro.click", esperado: "Señal de riesgo" },

  // --- Información insuficiente: no son enlaces web válidos ---
  { enlace: "", esperado: "Información insuficiente" },
  { enlace: "hola, esto no es un enlace", esperado: "Información insuficiente" },
  { enlace: "https://", esperado: "Información insuficiente" },
  { enlace: "javascript:alert(1)", esperado: "Información insuficiente" },
  { enlace: "mailto:ana@correo.com", esperado: "Información insuficiente" },
  { enlace: "ftp://archivos.com", esperado: "Información insuficiente" },
  { enlace: "solotexto", esperado: "Información insuficiente" },
];
