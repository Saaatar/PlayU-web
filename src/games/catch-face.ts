import { KAPLAYCtx } from "kaplay";
import { useVirtualGamepad } from "../components/VirtualGamepad";


export function registerCatchFaceGame(k: KAPLAYCtx) {

    k.scene("catch-face", () => {
    
        loadSprites(k);

        useVirtualGamepad(k, {
            targetTag: "jugador",
            showDPad: true, 
            showPrimary: true, 
            showSecondary: true
        });
        
        //game data
        const VELOCIDAD = 1000;
        var scoreCounter: number = 0;
        var remainTime: number = 30;

        const score = k.add([
            k.text("Score: 0"),
            k.pos(90, 24),    
            k.anchor("center"),
            { value: 0 },
        ])

        const timerLabel = k.add([
            k.text(`Tiempo restante: ${remainTime}`),
            k.pos(k.width() - 200, 24),
            k.anchor("center"),
            k.fixed()
        ]);

        const btnPause = k.add([
            k.rect(100, 40, {radius: 8}), 
            k.pos(k.width()/2, 40),
            k.anchor("center"), 
            k.color(k.RED),
            k.area(),
            "ui"
        ]);

        const txtPause = btnPause.add([
            k.text("PAUSE", {size: 20}), 
            k.anchor("center"),
            k.color(k.BLACK)
        ])

        btnPause.onClick(() => {
            k.debug.paused = !k.debug.paused; 
            txtPause.text = k.debug.paused ? "PLAY" : "PAUSE";
            btnPause.color = k.debug.paused ? k.GREEN : k.WHITE;
        });

        k.onUpdate(() => {
            // Solo restamos tiempo si NO está pausado y queda tiempo
            if (!k.debug.paused && remainTime > 0) {
                remainTime -= k.dt(); // Restamos el tiempo real transcurrido
                timerLabel.text = `Time: ${Math.ceil(remainTime)}`;

                if (remainTime <= 0) {
                    k.debug.paused = !k.debug.paused; // Ir a una escena de fin (puedes crearla después)
                }
            }
        });

        //Creamos un jugador o lo que es lo mismo, la canasta
        const jugador = k.add([
            k.rect(100, 20),
            k.pos(k.center().x, k.height()-40),
            k.anchor("center"),
            k.color(k.BLUE),
            k.area(),
            "jugador"
        ]);

        k.on("move_left", "jugador", () => {
            if(jugador.pos.x > 100){
                jugador.move(-VELOCIDAD, 0)
            }
        }); 

        k.on("move_right", "jugador", () => {
            if (jugador.pos.x < k.width() - 100) {
                jugador.move(VELOCIDAD, 0);
            }
        });

        k.on("move_up", "jugador", () => {
            k.debug.log("move_up");
        }); 

        k.on("move_down", "jugador", () => {
            k.debug.log("move_down");
        });

        k.on("primary_action", "jugador", () => {
            k.debug.log("primary_action");
        }); 

        k.on("secondary_action", "jugador", () => {
            k.debug.log("secondary_action");
        });


        //Lluvia de caritas jajaj
        k.loop(1, () => {
            k.add([
                k.sprite("happyf"),
                k.scale(0.05),
                k.pos(k.rand(0, k.width()), 0),
                k.anchor("center"),
                k.area(),
                k.move(k.DOWN, 200),
                "carita"
            ]);
        });

        jugador.onCollide("carita", (caritaAtrapada) => {
            score.value += 1;
            score.text = `Score ${score.value}`
            k.destroy(caritaAtrapada);
            k.debug.log("Atrapada");
        });

    });
}

function loadSprites(k: KAPLAYCtx) {
    k.loadSprite("happyf", "/sprites/happy-face.png");
}