// =====================================================================
// camara.js — Modo cámara: enciende la cámara, mira el video varias
// veces por segundo y, cuando encuentra un código QR, se detiene.
// IMPORTANTE: solo LEE el texto del QR. Nunca abre el enlace.
//
// Los navegadores solo permiten usar la cámara si la página está
// publicada con https (por ejemplo en GitHub Pages) o en "localhost".
// Abriendo index.html con doble clic puede no funcionar (depende del navegador).
// =====================================================================

// Cada cuántos milisegundos revisamos el video (200 = 5 veces por segundo).
const INTERVALO_ESCANEO = 200;

// Tamaño al que achicamos cada cuadro del video antes de buscar el QR.
// Más pequeño = más rápido; más grande = lee QR más lejanos.
const TAMANO_CUADRO = [720];

// Lo que necesitamos recordar mientras la cámara está encendida.
const camara = {
  flujo: null,        // la señal de video que entrega la cámara
  temporizador: null, // la próxima revisión programada
  pedido: 0,          // número que cambia cada vez que se enciende o apaga
};

// ¿Este navegador permite usar la cámara en esta página?
function camaraDisponible() {
  return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Enciende la cámara y empieza a buscar QR.
//   video       → el elemento <video> donde se ve la cámara
//   alEncontrar → función que recibe el texto del QR
//   alFallar    → función que recibe un mensaje de error
async function iniciarCamara(video, alEncontrar, alFallar) {
  if (!camaraDisponible()) {
    alFallar(
      "La cámara solo funciona cuando la página está publicada con https " +
      "(por ejemplo, en GitHub Pages). Si abriste el archivo con doble clic, " +
      "usa el botón \"Subir foto del QR\"."
    );
    return;
  }

  const miPedido = ++camara.pedido;

  try {
    // Pide permiso y prefiere la cámara trasera ("environment").
    const flujo = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });

    // Si la persona apretó "Cancelar" mientras esperábamos el permiso,
    // apagamos esta cámara de inmediato.
    if (miPedido !== camara.pedido) {
      flujo.getTracks().forEach((pista) => pista.stop());
      return;
    }

    camara.flujo = flujo;
    video.srcObject = flujo;
    await video.play();
  } catch (error) {
    if (miPedido === camara.pedido) {
      detenerCamara(video);
      alFallar(explicarErrorCamara(error));
    }
    return;
  }

  // Revisa un cuadro del video; si no hay QR, vuelve a intentar en un rato.
  function revisar() {
    if (miPedido !== camara.pedido) return; // la cámara ya se apagó
    // readyState >= 2 significa que el video ya tiene una imagen para mirar.
    if (video.readyState >= 2) {
      const texto = leerQRDeImagen(video, TAMANO_CUADRO);
      if (texto) {
        detenerCamara(video);
        alEncontrar(texto);
        return;
      }
    }
    camara.temporizador = setTimeout(revisar, INTERVALO_ESCANEO);
  }
  revisar();
}

// Apaga la cámara (se apaga también la lucecita del celular o computador).
function detenerCamara(video) {
  camara.pedido++; // así cualquier revisión pendiente sabe que debe parar
  clearTimeout(camara.temporizador);
  if (camara.flujo) {
    camara.flujo.getTracks().forEach((pista) => pista.stop());
    camara.flujo = null;
  }
  if (video) video.srcObject = null;
}

// Convierte los errores técnicos del navegador en mensajes simples.
function explicarErrorCamara(error) {
  switch (error && error.name) {
    case "NotAllowedError":
    case "SecurityError":
      return "No se dio permiso para usar la cámara. Puedes activarlo tocando " +
             "el ícono que está junto a la dirección de la página.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No se encontró una cámara en este equipo.";
    case "NotReadableError":
    case "AbortError":
      return "La cámara está siendo usada por otra app. Ciérrala e intenta de nuevo.";
    default:
      return "No se pudo encender la cámara. Puedes usar \"Subir foto del QR\".";
  }
}
