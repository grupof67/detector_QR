// =====================================================================
// lector-qr.js — Convierte una imagen con un código QR en texto.
// Usa la librería jsQR (archivo jsQR.js, en esta misma carpeta).
// IMPORTANTE: solo LEE el texto del QR. Nunca abre el enlace.
// =====================================================================

// Tamaños (en píxeles) con los que intentamos leer la imagen.
// Las fotos del celular son enormes; achicarlas hace la lectura más
// rápida y a veces más fácil. Si no funciona con un tamaño, probamos otro.
const TAMANOS_A_PROBAR = [1000, 600, 1600];

// Carga una imagen desde un archivo (foto elegida) o desde un texto
// con la imagen (como los ejemplos de casos-qr.js).
// Devuelve una "promesa": un resultado que llega un poquito después.
function cargarImagen(fuente) {
  return new Promise(function (resolver, rechazar) {
    const img = new Image();
    const esArchivo = fuente instanceof Blob;
    const direccion = esArchivo ? URL.createObjectURL(fuente) : fuente;
    img.onload = function () {
      if (esArchivo) URL.revokeObjectURL(direccion); // libera memoria
      resolver(img);
    };
    img.onerror = function () {
      if (esArchivo) URL.revokeObjectURL(direccion);
      rechazar(new Error("No se pudo leer la imagen"));
    };
    img.src = direccion;
  });
}

// Busca un QR dentro de una imagen ya cargada (o un cuadro de video).
// Devuelve el texto del QR, o null si no encontró ninguno.
// "tamanos" es opcional: la cámara usa uno solo y pequeño para ir rápido.
function leerQRDeImagen(img, tamanos) {
  const lienzo = document.createElement("canvas");
  const ctx = lienzo.getContext("2d", { willReadFrequently: true });

  // Las fotos dicen su tamaño en width/height; los videos en videoWidth/videoHeight.
  const ancho = img.videoWidth || img.naturalWidth || img.width;
  const alto = img.videoHeight || img.naturalHeight || img.height;
  if (!ancho || !alto) return null;

  for (const maximo of tamanos || TAMANOS_A_PROBAR) {
    // Calculamos el nuevo tamaño sin deformar la imagen.
    const escala = Math.min(1, maximo / Math.max(ancho, alto));
    lienzo.width = Math.round(ancho * escala);
    lienzo.height = Math.round(alto * escala);

    // Fondo blanco (por si la imagen es transparente) y luego la imagen.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);

    // Sacamos los colores de cada píxel y se los damos a jsQR.
    const pixeles = ctx.getImageData(0, 0, lienzo.width, lienzo.height);
    const codigo = jsQR(pixeles.data, lienzo.width, lienzo.height, {
      inversionAttempts: "attemptBoth", // también QR claros sobre fondo oscuro
    });

    if (codigo && codigo.data) return codigo.data;
  }
  return null;
}

// Función principal: recibe la foto, lee el QR y aplica las 5 reglas.
// Devuelve lo mismo que analizarEnlace, más "textoQR" (lo que decía el QR).
async function revisarImagenQR(fuente) {
  let texto = null;
  try {
    const img = await cargarImagen(fuente);
    texto = leerQRDeImagen(img);
  } catch (e) {
    texto = null;
  }

  if (texto === null) {
    return {
      estado: ESTADOS.INSUFICIENTE,
      dominio: null,
      motivos: [],
      textoQR: null,
      mensaje: "No se encontró un código QR en la imagen. Prueba con una foto más cercana, nítida y con buena luz.",
    };
  }

  return revisarTextoQR(texto);
}

// Recibe el texto que traía un QR (de una foto o de la cámara) y aplica
// las 5 reglas. Desde aquí es igual que pegar el enlace a mano.
function revisarTextoQR(texto) {
  const resultado = analizarEnlace(texto);
  resultado.textoQR = texto;
  if (resultado.estado === ESTADOS.INSUFICIENTE) {
    resultado.mensaje = "Se leyó el código QR, pero no contiene un enlace web.";
  }
  return resultado;
}
