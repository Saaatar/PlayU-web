import type { KAPLAYCtx } from "kaplay";
import { Player } from "../types/Player";
import { socket } from "../services/sockets";
import { createTurnBanner } from "../components/turnBanner";
import { createTimerDisplay } from "../components/timerDisplay";
import { SocketEvents } from "../types/Socketevents";

export function registerSecuenciaGame(k: KAPLAYCtx) {
  k.scene(
    "juego-secuencia",
    ({
      roomPlayers,
      seed,
      firstTurnId,
    }: {
      roomPlayers: Player[];
      seed: number;
      firstTurnId: string;
    }) => {
      // --- ESTADO GLOBAL DEL JUEGO ---
      const players = roomPlayers.map((p) => ({ id: p.id, username: p.username, score: 0 }));
      const eliminatedIds = new Set<string>();

      let currentTurnPlayerId = "";
      let localTimeLeft = 15;
      let isMyTurn = false;
      let locked = false;

      let secuenciaMaestra: string[] = [];
      let miSecuenciaLocal: string[] = [];
      let estoyEliminado = false;
      let juegoTerminado = false;

      const catalogoProductos = [
        { nombre: "Manzana", color: k.rgb(255, 50, 50), posX: k.width() * 0.25 },
        { nombre: "Plátano", color: k.rgb(255, 255, 50), posX: k.width() * 0.5 },
        { nombre: "Uva", color: k.rgb(150, 50, 200), posX: k.width() * 0.75 },
      ];

      // --- COMPONENTES MULTIJUGADOR (UI) ---
      const playerInfoUI = k.add([k.pos(20, 10), "ui"]);
      const turnBannerComponent = createTurnBanner(k, players, socket.id);
      const timerComponent = createTimerDisplay(k, localTimeLeft);

      const updatePlayerInfoUI = () => {
        playerInfoUI.children.forEach((c) => c.destroy());
        let xPos = 20;

        players.forEach((p) => {
          const isActive = p.id === currentTurnPlayerId ? "→ " : "  ";
          const isEliminated = eliminatedIds.has(p.id);
          const textColor = isEliminated
            ? k.rgb(100, 100, 100) // Gris si está eliminado
            : p.id === currentTurnPlayerId
              ? k.rgb(255, 255, 255)
              : k.rgb(180, 180, 180);

          const text = k.make([
            k.text(`${isActive}${p.username}: ${p.score} pts ${isEliminated ? "(X)" : ""}`, {
              size: 14,
            }),
            k.pos(xPos, 10),
            k.color(textColor),
          ]);
          playerInfoUI.add(text);
          xPos += 200;
        });
      };

      const applyTurn = (playerId: string, timeout: number) => {
        currentTurnPlayerId = playerId;
        localTimeLeft = timeout;
        isMyTurn = socket.id === currentTurnPlayerId;
        locked = false;

        turnBannerComponent.update(currentTurnPlayerId);
        timerComponent.updateTime(localTimeLeft);
        updatePlayerInfoUI();

        // LÓGICA DE AUTO-SKIP: Si es mi turno pero estoy eliminado, paso el turno automáticamente
        if (isMyTurn && estoyEliminado && !juegoTerminado) {
          locked = true;
          socket.emit("game:end_turn", { passTurn: true });
        }
      };

      // Reloj visual local
      k.onUpdate(() => {
        if (localTimeLeft > 0 && !locked && !juegoTerminado) {
          localTimeLeft -= k.dt();
          timerComponent.updateTime(localTimeLeft);
        }
      });

      // --- TEXTOS DINÁMICOS DE LA ESCENA ---
      const accionUi = k.add([
        k.text("Presta atención a la secuencia", { size: 24 }),
        k.pos(k.width() / 2, k.height() * 0.15),
        k.anchor("center"),
        k.color(255, 200, 50),
      ]);

      const secuenciaUi = k.add([
        k.text("Tu cadena: ", { size: 20 }),
        k.pos(k.width() / 2, k.height() * 0.25),
        k.anchor("center"),
        k.color(255, 255, 255),
      ]);

      // --- DIBUJAR LOS BOTONES DE PRODUCTOS ---
      catalogoProductos.forEach((prod) => {
        const prodBtn = k.add([
          k.rect(100, 100, { radius: 10 }),
          k.color(prod.color),
          k.pos(prod.posX, k.height() * 0.5),
          k.anchor("center"),
          k.area(),
          "producto",
          { nombreItem: prod.nombre },
        ]);

        k.add([
          k.text(prod.nombre, { size: 16 }),
          k.pos(prod.posX, k.height() * 0.5 + 70),
          k.anchor("center"),
        ]);

        // Efecto visual al presionar
        prodBtn.onHoverUpdate(() => {
          prodBtn.scale = k.vec2(1.1);
        });
        prodBtn.onHoverEnd(() => {
          prodBtn.scale = k.vec2(1);
        });
      });

      // --- BOTÓN DE ENVIAR TURNO ---
      const btnEnviar = k.add([
        k.rect(200, 50, { radius: 5 }),
        k.color(50, 255, 50),
        k.pos(k.width() / 2, k.height() * 0.8),
        k.anchor("center"),
        k.area(),
        "boton_enviar",
      ]);
      k.add([
        k.text("Terminar Turno", { size: 20 }),
        k.color(0, 0, 0),
        k.pos(k.width() / 2, k.height() * 0.8),
        k.anchor("center"),
      ]);

      // --- FUNCIONES AUXILIARES ---
      const triggerGameOver = () => {
        juegoTerminado = true;
        locked = true;
        accionUi.text = "🏆 ¡FIN DEL JUEGO! 🏆";
        accionUi.color = k.rgb(50, 255, 50);

        // Si soy el último jugador o el creador de la sala, emito los puntajes
        if (isMyTurn || socket.id === players[0].id) {
          k.wait(2.5, () => {
            const finalScores: Record<string, number> = {};
            players.forEach((p) => {
              finalScores[p.id] = p.score;
            });
            socket.emit(SocketEvents.GAME_END_MINI, { scores: finalScores });
          });
        }
      };

      const handleElimination = (playerId: string) => {
        eliminatedIds.add(playerId);
        updatePlayerInfoUI();

        // Verificar si solo queda 1 jugador activo
        if (players.length - eliminatedIds.size <= 1) {
          triggerGameOver();
        }
      };

      // --- INTERACCIONES LOCALES ---
      applyTurn(firstTurnId, 15);

      k.onClick("producto", (item) => {
        if (!isMyTurn || estoyEliminado || locked || juegoTerminado) return;

        const indiceActual = miSecuenciaLocal.length;
        const productoSeleccionado = item.nombreItem;

        // 1. Fase de recordar: Validar contra la secuencia maestra
        if (indiceActual < secuenciaMaestra.length) {
          if (productoSeleccionado !== secuenciaMaestra[indiceActual]) {
            // ERROR
            k.shake(5);
            estoyEliminado = true;
            locked = true;
            accionUi.text = "¡TE EQUIVOCASTE!";
            accionUi.color = k.rgb(255, 50, 50);

            // Emitimos que perdimos a los demás
            socket.emit("game:action", { action: "ELIMINATED", playerId: socket.id });
            // Pasamos el turno
            socket.emit("game:end_turn", { passTurn: true });
            return;
          }
        }

        // 2. Fase de añadir: Solo se puede añadir UN producto nuevo
        if (indiceActual >= secuenciaMaestra.length + 1) {
          return; // Ya añadió el nuevo, que presione "Terminar Turno"
        }

        miSecuenciaLocal.push(productoSeleccionado);
        secuenciaUi.text = "Tu cadena: " + miSecuenciaLocal.join(" -> ");
      });

      k.onClick("boton_enviar", () => {
        if (!isMyTurn || estoyEliminado || locked || juegoTerminado) return;

        if (miSecuenciaLocal.length !== secuenciaMaestra.length + 1) {
          k.shake(2);
          accionUi.text = "¡Falta agregar 1 producto nuevo!";
          return;
        }

        locked = true;
        const productoNuevo = miSecuenciaLocal[miSecuenciaLocal.length - 1];

        // Emitimos la actualización de la secuencia a todos
        socket.emit("game:action", {
          action: "ADD_SEQUENCE",
          playerId: socket.id,
          newSequence: miSecuenciaLocal,
          addedItem: productoNuevo,
        });

        miSecuenciaLocal = [];
        secuenciaUi.text = "Tu cadena: ";
      });

      // --- SINCRONIZACIÓN CON EL SERVIDOR ---
      socket.on("game:turn_sync", (data: { activePlayerId: string; timeoutSeconds: number }) => {
        miSecuenciaLocal = [];
        secuenciaUi.text = "Tu cadena: ";
        applyTurn(data.activePlayerId, data.timeoutSeconds);
      });

      socket.on("game:action", (data: any) => {
        // Alguien añadió a la secuencia con éxito
        if (data.action === "ADD_SEQUENCE") {
          secuenciaMaestra = data.newSequence;
          accionUi.text = `Se añadió: ${data.addedItem}`;
          accionUi.color = k.rgb(255, 255, 255);

          // Otorgamos puntos al jugador que acertó la ronda
          const playerIndex = players.findIndex((p) => p.id === data.playerId);
          if (playerIndex !== -1) {
            players[playerIndex].score += 10; // +10 puntos por alargar la cadena
            updatePlayerInfoUI();
          }

          // Pasa el turno al siguiente si fui yo quien emitió esto
          if (isMyTurn && data.playerId === socket.id) {
            socket.emit("game:end_turn", { passTurn: true });
          }
        }

        // Alguien se equivocó
        if (data.action === "ELIMINATED") {
          handleElimination(data.playerId);
        }

        // Si se acaba el tiempo del servidor
        if (data.action === "TIMEOUT") {
          if (data.playerId === socket.id && !estoyEliminado) {
            estoyEliminado = true;
            socket.emit("game:action", { action: "ELIMINATED", playerId: socket.id });
            socket.emit("game:end_turn", { passTurn: true });
          }
        }
      });

      // --- LIMPIEZA AL SALIR ---
      k.onSceneLeave(() => {
        socket.off("game:turn_sync");
        socket.off("game:action");

        turnBannerComponent.destroy();
        timerComponent.destroy();
      });
    }
  );
}
