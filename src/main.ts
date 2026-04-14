import kaplay from "kaplay";
import { registerCatchFaceGame } from "./games/catch-face";
import { registerMemocatGame } from "./games/memocat";
import { registerTuttiFruttiMix } from "./games/tuttiFruttiMix";

const k = kaplay({
  global: false,
  touchToMouse: true,
});

k.loadRoot("./");

//games
registerCatchFaceGame(k);
registerMemocatGame(k);
registerTuttiFruttiMix(k);

//must be go to menu scene by default
k.go("start-tutifruti");
export default k;
