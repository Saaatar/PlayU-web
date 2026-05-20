import type { KAPLAYCtx } from "kaplay";
import { socket } from "../services/sockets";

export function registerSecuenciaGame(k: KAPLAYCtx) {
  // --- 1. ESTADO GLOBAL DEL MINIJUEGO ---
  let secuenciaMaestra: string[] = [];
  let miTurnoActual = false;
  let estoyEliminado = false;
  let mensajeTurno = "Esperando inicio...";
  let mensajeAccion = "Presta atención";

  // LÓGICA DEL CLIENTE PARA LA VICTORIA
  let jugadoresActivos = 4;
  let juegoTerminado = false;

  // Limpiamos oídos viejos por si se reinicia la partida
  socket.off("actualizar_estado");
  socket.off("jugador_eliminado");

  socket.on("actualizar_estado", (data: any) => {
    // Si el juego ya terminó, ignoramos nuevos turnos
    if (juegoTerminado) return;

    if (data.ultimoProducto) {
      mensajeAccion = `Se añadió: ${data.ultimoProducto}`;
      secuenciaMaestra = data.secuenciaOficial;
    }

    // Validamos que sea nuestro turno y que no estemos eliminados
    if (data.turnoDe === socket.id && !estoyEliminado) {
      miTurnoActual = true;
      mensajeTurno = "¡ES TU TURNO!";
    } else {
      miTurnoActual = false;
      mensajeTurno = "Espera el turno...";
    }
  });

  // Escuchamos cuando el servidor avisa que alguien cayó
  socket.on("jugador_eliminado", () => {
    jugadoresActivos--;

    // Si solo queda 1 jugador, el juego termina
    if (jugadoresActivos <= 1) {
      juegoTerminado = true;
      miTurnoActual = false;

      if (!estoyEliminado) {
        mensajeTurno = "¡FIN DEL JUEGO!";
        mensajeAccion = "🏆 ¡ERES EL GANADOR ABSOLUTO! 🏆";
        // NOTA PARA TU EQUIPO: Aquí pueden emitir el evento para sumar puntos
        // socket.emit("sumar_puntos", { puntos: 100 });
      } else {
        mensajeTurno = "¡FIN DEL JUEGO!";
        mensajeAccion = "🏆 Alguien más ha ganado 🏆";
      }
    }
  });

  const catalogoProductos = [
    { nombre: "Manzana", color: k.rgb(255, 50, 50), posX: k.width() * 0.25 },
    { nombre: "Plátano", color: k.rgb(255, 255, 50), posX: k.width() * 0.5 },
    { nombre: "Uva", color: k.rgb(150, 50, 200), posX: k.width() * 0.75 },
  ];

  // --- 2. LA ESCENA VISUAL ---
  k.scene("juego-secuencia", () => {
    let miSecuenciaLocal: string[] = [];

    // Textos de Interfaz
    const turnoUi = k.add([
      k.text(mensajeTurno, { size: 24 }),
      k.pos(k.width() / 2, 40),
      k.anchor("center"),
    ]);
    const accionUi = k.add([
      k.text(mensajeAccion, { size: 20 }),
      k.pos(k.width() / 2, 80),
      k.anchor("center"),
      k.color(255, 255, 0),
    ]);
    const secuenciaUi = k.add([
      k.text("Tu cadena: ", { size: 20 }),
      k.pos(20, 150),
      k.color(255, 255, 255),
    ]);

    // Dibujar los productos
    catalogoProductos.forEach((prod) => {
      k.add([
        k.rect(100, 100, { radius: 10 }),
        k.color(prod.color),
        k.pos(prod.posX, 300),
        k.anchor("center"),
        k.area(),
        "producto",
        { nombreItem: prod.nombre },
      ]);
      k.add([k.text(prod.nombre, { size: 16 }), k.pos(prod.posX, 370), k.anchor("center")]);
    });

    k.onClick("producto", (item) => {
      if (!miTurnoActual || estoyEliminado || juegoTerminado) return;

      const indiceActual = miSecuenciaLocal.length;
      const productoSeleccionado = item.nombreItem;

      if (indiceActual < secuenciaMaestra.length) {
        if (productoSeleccionado !== secuenciaMaestra[indiceActual]) {
          k.shake(5);
          estoyEliminado = true;
          miTurnoActual = false;
          mensajeAccion = "¡TE EQUIVOCASTE!";
          socket.emit("jugador_pierde", { motivo: "Fallo de memoria" });
          return;
        }
      }

      miSecuenciaLocal.push(productoSeleccionado);
      secuenciaUi.text = "Tu cadena: " + miSecuenciaLocal.join(" -> ");
    });

    // Botón de Enviar
    k.add([
      k.rect(150, 50, { radius: 5 }),
      k.color(50, 255, 50),
      k.pos(k.width() / 2, 500),
      k.anchor("center"),
      k.area(),
      "boton_enviar",
    ]);
    k.add([
      k.text("Terminar Turno", { size: 20 }),
      k.color(0, 0, 0),
      k.pos(k.width() / 2, 500),
      k.anchor("center"),
    ]);

    k.onClick("boton_enviar", () => {
      if (!miTurnoActual || estoyEliminado || juegoTerminado) return;

      if (miSecuenciaLocal.length !== secuenciaMaestra.length + 1) {
        mensajeAccion = "Debes agregar 1 producto nuevo";
        return;
      }

      miTurnoActual = false;
      const productoNuevo = miSecuenciaLocal[miSecuenciaLocal.length - 1];

      socket.emit("turno_completado", {
        nuevoProducto: productoNuevo,
        secuenciaCompleta: miSecuenciaLocal,
      });

      miSecuenciaLocal = [];
      secuenciaUi.text = "Tu cadena: ";
    });

    // --- MAGIA DE ACTUALIZACIÓN VISUAL ---
    k.onUpdate(() => {
      turnoUi.text = mensajeTurno;
      accionUi.text = mensajeAccion;

      if (miTurnoActual) {
        secuenciaUi.color = k.rgb(0, 255, 0);
      } else {
        secuenciaUi.color = k.rgb(255, 255, 255);
      }
    });
  });
}
