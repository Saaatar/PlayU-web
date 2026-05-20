import kaplay from "kaplay";
import { registerCatchFaceGame } from "./games/catch-face";
import { registerMemocatGame } from "./games/memocat";
import { registerTuttiFruttiMix } from "./games/tuttiFruttiMix";
import { registerTicTacToe } from "./games/tic-tac-toe";
import { registerSecuenciaGame } from "./games/secuencia";
import { mainPage } from "./scenes/mainPage";
import { scoreBoard } from "./scenes/scoreBoard";
import { socket } from "./services/sockets";

const k = kaplay({
  global: false,
  touchToMouse: true,
});

k.loadRoot("./");

//games
registerCatchFaceGame(k);
registerMemocatGame(k);
registerTuttiFruttiMix(k);
registerTicTacToe(k);
registerSecuenciaGame(k);
mainPage(k);
scoreBoard(k);

socket.on("state:change", (data: { scene: string; params: any }) => {
  console.log("El backend ordena ir a:", data.scene, "con params:", data.params);
  k.go(data.scene, data.params);
});

k.go("menu");
export default k;

export const gameCatalog: string[] = ["tutti-frutti", "tic-tac-toe", "juego-secuencia", "memorama"];
