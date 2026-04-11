import kaplay from "kaplay";
import { registerCatchFaceGame } from "./games/catch-face";

const k = kaplay({
    global: false, 
    touchToMouse: true
});

k.loadRoot("./");

//games
registerCatchFaceGame(k);

//must be go to menu scene by default
k.go("catch-face"); 
export default k;