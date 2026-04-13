import kaplay from "kaplay";
import { registerCatchFaceGame } from "./games/catch-face";
import { registerMemocatGame } from "./games/memocat";

const k = kaplay({
  global: false,
  touchToMouse: true,
});

k.loadRoot("./");

//games
registerCatchFaceGame(k);
registerMemocatGame(k);

//must be go to menu scene by default
k.go("catch-face");
export default k;
