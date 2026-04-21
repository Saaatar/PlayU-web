import type { KAPLAYCtx, Vec2 } from "kaplay";
import { createButton } from "../components/buttonGame";
import { createCard } from "../components/card";
import { createInput } from "../components/input";
import { room } from "./room";
import { createRoomService } from "../services/axios";

export function lobby(k: KAPLAYCtx) {
  k.scene("create-lobby", () => {
    k.setBackground(2, 6, 23);
    k.add([
      k.text("PLAYU", { size: 70, font: "Jersey" }),
      k.pos(k.width() * 0.5, k.height() * 0.2),
      k.color(139, 92, 246),
      k.anchor("center"),
    ]);

    room(k);
    const createCardd = createCard({
      k: k,
      title: "Crear Sala",
      description: "Inicia una sala para hasta 4 jugadores",
      position: k.vec2(k.width() * 0.28, k.height() * 0.6),
    });

    const unirCard = createCard({
      k: k,
      title: "Unirse Sala",
      description: "Introduce el codigo",
      position: k.vec2(k.width() * 0.72, k.height() * 0.6),
    });

    const altoTarjetaIzquierda = createCardd.height;

    const createRoomInput = createInput({
      k: k,
      parent: createCardd,
      position: k.vec2(0, altoTarjetaIzquierda * 0.05),
      placeholder: "Nombre...",
    });

    createButton({
      k: k,
      parent: createCardd,
      text: "Crear",
      position: k.vec2(0, altoTarjetaIzquierda * 0.3),
      onClick: async () => {
        const username = createRoomInput.getText().trim();

        if (username === "") {
          console.log("El nombre no puede estar vacío");
          k.shake(2);
          return;
        }

        try {
          const newRoom = await createRoomService();
          console.log("Room creado:", newRoom.code);

          k.go("create-room", {
            roomCode: newRoom.code,
            username: username,
          });
        } catch (error) {
          console.log("Error al crear la sala", error);
          k.shake(3);
        }
      },
      width: 150,
      height: 40,
    });

    const altoTarjetaDerecha = unirCard.height;

    const joinNameInput = createInput({
      k: k,
      parent: unirCard,
      position: k.vec2(0, altoTarjetaDerecha * 0),
      placeholder: "Nombre...",
    });

    const joinCodeInput = createInput({
      k: k,
      parent: unirCard,
      position: k.vec2(0, altoTarjetaDerecha * 0.17),
      placeholder: "Code...",
    });

    createButton({
      k: k,
      parent: unirCard,
      text: "Unir",
      position: k.vec2(0, altoTarjetaDerecha * 0.35),
      onClick: () => {
        const code = joinCodeInput.getText().trim().toUpperCase();
        const username = joinNameInput.getText().trim() || "Invitado";

        if (code === "") {
          console.log("Ingresa un codigo valido");
          k.shake(2);
          return;
        }

        k.go("create-room", {
          roomCode: code,
          username: username,
        });
      },
      width: 150,
      height: 40,
    });
  });
}
