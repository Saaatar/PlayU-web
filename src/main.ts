import kaplay from "kaplay";
import { registerCatchFaceGame } from "./games/catch-face";
import { registerMemocatGame } from "./games/memocat";
import { registerTuttiFruttiMix } from "./games/tuttiFruttiMix";
import { registerTicTacToe } from "./games/tic-tac-toe";
import { mainPage } from "./scenes/mainPage";

const k = kaplay({
  global: false,
  touchToMouse: true,
});

k.loadRoot("./");

export const gameCatalog: string[] = ["memorama", "start-tutifruti", "Tic-tac-toe"];
//games
registerCatchFaceGame(k);
registerMemocatGame(k);
registerTuttiFruttiMix(k);
registerTicTacToe(k);
mainPage(k);

//must be go to menu scene by default
k.go("menu");
export default k;
