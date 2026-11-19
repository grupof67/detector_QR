// =====================================================================
// reglas.js — Las 5 reglas del detector y la función que las aplica.
// IMPORTANTE: nada de este archivo abre, visita ni descarga el enlace.
// Solo se lee el TEXTO del enlace.
// =====================================================================

// ----- Listas que puedes editar --------------------------------------

// Servicios que acortan enlaces (ocultan el destino real).
const ACORTADORES = ["bit.ly", "tinyurl.com", "t.co", "cutt.ly"];

// Terminaciones poco habituales para comercios.
const TERMINACIONES_POCO_COMUNES = [".xyz", ".top", ".click", ".link"];

// Sitios reales que los estafadores suelen imitar.
// Agrega aquí los bancos y tiendas que se usan en tu país.
const DOMINIOS_REFERENCIA = [
  "google.com",
  "facebook.com",
  "instagram.com",
  "whatsapp.com",
  "paypal.com",
  "mercadolibre.com",
  "amazon.com",
  "netflix.com",
  "microsoft.com",
  "bancoestado.cl",
  "santander.cl",
  "bancolombia.com",
];

// Los 3 estados posibles del resultado.
const ESTADOS = {
  RIESGO: "Señal de riesgo",
  SIN_SENALES: "Sin señales",
  INSUFICIENTE: "Información insuficiente",
};

// ----- Funciones de ayuda --------------------------------------------

// ¿"dominio" es exactamente "base" o un subdominio suyo?
// Ej.: "m.facebook.com" es subdominio de "facebook.com".
function esIgualOSubdominio(dominio, base) {
  return dominio === base || dominio.endsWith("." + base);
}

// ¿El dominio es el sitio oficial de una referencia?
// Acepta también versiones por país, como "mercadolibre.com.ar".
function esSitioOficial(dominio, referencia) {
  if (esIgualOSubdominio(dominio, referencia)) return true;
  const partes = dominio.split(".");
  const paisFinal = partes[partes.length - 1];
  const sinPais = partes.slice(0, -1).join(".");
  return paisFinal.length === 2 && esIgualOSubdominio(sinPais, referencia);
}

// Cuenta cuántos cambios (letras agregadas, quitadas o cambiadas) hacen
// falta para convertir el texto "a" en el texto "b".
// Ej.: "paypa1.com" → "paypal.com" = 1 cambio.
function distancia(a, b) {
  const filaAnterior = [];
  for (let j = 0; j <= b.length; j++) filaAnterior[j] = j;
  for (let i = 1; i <= a.length; i++) {
    const filaActual = [i];
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      filaActual[j] = Math.min(
        filaAnterior[j] + 1,        // quitar una letra
        filaActual[j - 1] + 1,      // agregar una letra
        filaAnterior[j - 1] + costo // cambiar una letra
      );
    }
    filaAnterior.splice(0, filaAnterior.length, ...filaActual);
  }
  return filaAnterior[b.length];
}

// ----- Las 5 reglas ---------------------------------------------------
// Cada regla recibe los datos del enlace y devuelve:
//   - un mensaje (texto) si encontró una señal de riesgo, o
//   - null si no encontró nada.

// Regla 1: URL acortada
function reglaAcortada(datos) {
  const esAcortador = ACORTADORES.some((a) => esIgualOSubdominio(datos.dominio, a));
  return esAcortador
    ? "El enlace está acortado: no muestra a dónde lleva realmente."
    : null;
}

// Regla 2: sin https
function reglaSinHttps(datos) {
  return datos.protocolo === "http:"
    ? "La conexión no es segura (no usa https)."
    : null;
}

// Regla 3: dirección IP en vez de nombre
function reglaDireccionIP(datos) {
  const esIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(datos.dominio);
  const esIPv6 = datos.dominio.startsWith("[");
  return esIPv4 || esIPv6
    ? "Usa una dirección numérica en vez de un nombre de sitio."
    : null;
}

// Regla 4: imitación de un dominio conocido
function reglaImitacion(datos) {
  const dominio = datos.dominio;

  // Si es el sitio oficial (o un subdominio suyo), no es imitación.
  if (DOMINIOS_REFERENCIA.some((ref) => esSitioOficial(dominio, ref))) return null;

  // Pares de partes seguidas del dominio, para encontrar la imitación
  // aunque esté rodeada de otras partes:
  // "login.paypa1.com.xyz" → ["login.paypa1", "paypa1.com", "com.xyz"]
  const partes = dominio.split(".");
  const pares = [dominio];
  for (let i = 0; i < partes.length - 1; i++) {
    pares.push(partes[i] + "." + partes[i + 1]);
  }

  for (const ref of DOMINIOS_REFERENCIA) {
    // a) Contiene el dominio real seguido de otro: "paypal.com.cuenta.net"
    const contieneYSigue = dominio.includes(ref + ".") || dominio.includes(ref + "-");

    // b) Difiere en 1 o 2 caracteres: "paypa1.com", "gooogle.com"
    const d = Math.min(...pares.map((p) => distancia(p, ref)));
    const casiIgual = d >= 1 && d <= 2;

    if (contieneYSigue || casiIgual) {
      return "Se parece a " + ref + ", pero no es igual.";
    }
  }
  return null;
}

// Regla 5: terminación poco común
function reglaTerminacion(datos) {
  const rara = TERMINACIONES_POCO_COMUNES.some((t) => datos.dominio.endsWith(t));
  return rara ? "Usa una terminación poco habitual para comercios." : null;
}

// Lista con todas las reglas, en orden. Para agregar una regla nueva,
// escribe su función y súmala aquí.
const REGLAS = [
  reglaAcortada,
  reglaSinHttps,
  reglaDireccionIP,
  reglaImitacion,
  reglaTerminacion,
];

// ----- Función principal ---------------------------------------------
// Recibe el texto que pegó la persona y devuelve:
//   { estado, dominio, motivos }
function analizarEnlace(texto) {
  const insuficiente = { estado: ESTADOS.INSUFICIENTE, dominio: null, motivos: [] };

  let limpio = String(texto || "").trim();
  if (limpio === "" || /\s/.test(limpio)) return insuficiente;

  // Si no trae "http://" ni "https://", suponemos "https://"
  // (así "www.google.com" también se puede revisar).
  const traiaEsquema = limpio.includes("://");
  if (!traiaEsquema) limpio = "https://" + limpio;

  // "new URL" solo DESARMA el texto en partes; no se conecta a nada.
  let url;
  try {
    url = new URL(limpio);
  } catch (e) {
    return insuficiente;
  }

  // Solo aceptamos enlaces web (descarta "ftp:", "javascript:", etc.).
  if (url.protocol !== "http:" && url.protocol !== "https:") return insuficiente;
  // Descarta cosas como "mailto:ana@correo.com" escritas sin "://".
  if (!traiaEsquema && (url.username || url.password)) return insuficiente;

  // Dominio en minúsculas, sin punto final ni "www." al inicio.
  const dominio = url.hostname.toLowerCase().replace(/\.$/, "").replace(/^www\./, "");

  // Debe parecer un nombre de sitio real: "algo.algo", o una IPv6.
  const pareceDominio = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(dominio) || dominio.startsWith("[");
  if (!pareceDominio) return insuficiente;

  const datos = { protocolo: url.protocol, dominio: dominio };

  // Aplicamos cada regla y nos quedamos con los mensajes que no son null.
  const motivos = REGLAS.map((regla) => regla(datos)).filter((m) => m !== null);

  return {
    estado: motivos.length > 0 ? ESTADOS.RIESGO : ESTADOS.SIN_SENALES,
    dominio: url.hostname.replace(/\.$/, ""),
    motivos: motivos,
  };
}
