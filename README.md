# PlayU: Distributed Real-Time Minigame Platform

> "Playing with friends should be as easy as sending a link, but as robust as a console." — Benito "la pistola" Garcia

**PlayU** is a platform designed to eliminate gaming frictionForget 100GB downloads; our proposal focuses on instant access via the browser for frantic, simultaneous competition between 2 to 4 players.

## 🛠️ Tech Stack

* **Runtime:** Node.js 24 (LTS)
* **Language:** TypeScript / JavaScript (Fullstack)
* **Game Engine:** KAPLAY.js
* **Real-Time Communication:** Socket.io (WebSockets)
* **Frameworks:** React and Express

## 🏗️ System Architecture

We implement an **Authoritative Server** model to act as the Single Source of Truth for every match.

### Hybrid Communication
* **REST API:** Manages persistence, user metadata, and gaming rooms.
* **WebSockets:** Handles high-frequency real-time game state data.

### Why is this a Distributed System? 
* **Autonomous Nodes:** Each player acts as a separate node running its own environment.
* **Message Passing:** Nodes communicate exclusively over the network without sharing memory.
* **Concurrency & Arbitration:** The server must order and validate simultaneous events from multiple locations.
* **Partial Fault Tolerance:** If one node disconnects, the rest of the system remains operational.
* **Clock Synchronization:** Logic implemented to handle the lack of a global clock across nodes.

## 🎮 Game Dynamics

1. **Connection:** Private rooms created via invitation codes or public matchmaking.
2. **Distributed Democracy:** A voting phase where players choose the sequence and number ($N$) of minigames.
3. **Real-Time Competition:** Frantic action with server-side validation for hits, collisions, and timing.
4. **The Grand Finale:** Once $N$ rounds are finished, points are consolidated via the REST API to crown a winner in the Global Ranking.

## ⚡ Technical Challenges

* **Consistency:** Using *State Snapshots* to prevent desync between players.
* **Latency Management:** Server-side validation strategies to ensure fair play despite network lag.
* **Zombie States:** Robust management of disconnections and clearing orphaned session data.

## 👥 Development Team

* **Carlos Coronado Silva** 
* **Jazmin Dzib Ake** 
* **Jhonatan Solis Mezeta**
* **Elias Rodriguez Gallegos** 

---
*This project was developed for the Distributed Systems course at UADY.*