# PlayU: Distributed Web Game Client

> "Playing with friends should be as easy as sending a link, but as robust as a console." — Benito "la pistola" Garcia

**PlayU** Frontend is the client-side application of our distributed minigame platform. Forget 100GB downloads; this lightweight web client focuses on instant access via the mobile browser, delivering frantic, simultaneous competition for 2 to 4 players by rendering real-time data received from our authoritative server.

## 🛠️ Tech Stack

- **Runtime:** Node.js 24 (LTS)
- **Language:** TypeScript
- **Game Engine:** KAPLAY.js
- **Real-Time Communication:** Socket.io (WebSockets)

## 🏗️ System Architecture

We implement a **Thin Client (Dumb Client)** pattern. The frontend does not make critical game decisions or validate rules; it acts strictly as a high-performance visualizer and input capturer.

### Communication Flow

- **REST API Consumption:** Fetches user metadata, handles initial matchmaking UI, and queries the Global Ranking.

- **WebSocket Streaming:** Continuously streams player inputs (touches/virtual joysticks) to the backend and listens for high-frequency game state updates to render on the screen.

### Why is the Client part of a Distributed System?

- **Independent Node:** Each mobile browser acts as an autonomous node processing its own rendering loop and UI state.

- **State Interpolation:** The client must smoothly interpret and render discrete state snapshots sent by the server to create the illusion of continuous, fluid movement.

- **Network Resilience:** Responsible for handling micro-disconnections, displaying network latency metrics (ping), and executing graceful reconnections without freezing the UI.

- **Input Broadcasting:** Efficiently packaging and transmitting local user actions without overwhelming the network constraints of mobile devices.

## 🎮 Game Dynamics

1. **Seamless Connection:** A mobile-first interface designed to enter or share private room invitation codes with zero friction.
2. **Distributed Democracy:** An interactive voting lobby where players select the sequence and number ($N$) of minigames.
3. **Responsive Rendering:** Drawing the frantic action at 60 FPS over the Canvas API based strictly on the server's truth, providing immediate visual and audio feedback.
4. **The Grand Finale:** Dynamic scoreboards and victory screens displayed after the final server consolidation.

## ⚡ Technical Challenges

- **Consistency:** Using _State Snapshots_ to prevent desync between players.
- **Latency Management:** Server-side validation strategies to ensure fair play despite network lag.
- **Zombie States:** Robust management of disconnections and clearing orphaned session data.

## 👥 Development Team

- **Carlos Coronado Silva**
- **Jazmin Dzib Ake**
- **Jhonatan Solis Mezeta**
- **Elias Rodriguez Gallegos**

---

_This project was developed for the Distributed Systems course at UADY._
