# Mythos Shrine CODEX

A combined map + codex for every file and folder in this repo.

## 📁 mythos-shrine
├─ **.env**  
   • API_PORT=3000, UI_PORT=8080, DATA_DIR=Shrine, DATA_FILE=Pulses.md  
   • Centralizes ports and paths for both dev and CI.  

├─ **Shrine/**  
│  └─ **Pulses.md**  
│     • Markdown log of every pulse: `- [isoTimestamp] text`  

├─ **shrinedaemon/**  
│  ├─ **package.json**  
│  │  • `start` (runs `node src/index.js`),  
│  │  • `test` (runs Jest integration suite).  
│  ├─ **Dockerfile**  
│  │  • Builds a Node 16 container for the daemon, copies `.env`, exposes 3000.  
│  └─ **src/**  
│     ├─ **index.js**  
│     │   • Express REST API (`POST /pulse`), WebSocketServer on `/pulse`,  
│     │   • fs.promises writes to `Shrine/Pulses.md`, broadcasts to WS clients.  
│     └─ **index.test.js**  
│         • Jest + Supertest + ws tests:  
│         • 400 on missing text, 200 + WS broadcast + file append on valid text.  

└─ **ui/**  
   ├─ **package.json**  
   │  • `serve` (Python HTTP server on 8080),  
   │  • `cy:run` & `cy:open` (Cypress E2E).  
   ├─ **Dockerfile**  
   │  • Nginx static server serving `index.html`, `style.css`, `app.js`.  
   ├─ **cypress/**  
   │  ├─ **integration/pulse.spec.js**  
   │  │  • Full-stack E2E: spins up daemon+UI, logs a pulse, asserts UI & file update.  
   │  └─ **plugins/index.js**  
   │     • Cypress tasks to start/stop backend & UI processes.  
   ├─ **index.html**  
   │  • Static page: “Log Pulse” button, list of pulses.  
   ├─ **style.css**  
   │  • Basic layout & theming for the shrine UI.  
   └─ **app.js**  
      • Front-end logic:  
      • Opens a WebSocket to `/pulse`, POSTs via fetch,  
      • Renders incoming pulses into the DOM.  

## 🚢 Orchestration & CI

- **docker-compose.yml**  
  • Builds and links `shrinedaemon` & `ui` containers,  
  • Exposes 3000→3000 (API) and 8080→80 (UI).  

- **.github/workflows/ci.yml**  
  • On every push/PR:
    1. Installs & tests the daemon (Jest).  
    2. Builds both Docker images.  
    3. Brings up containers.  
    4. Runs Cypress E2E against `http://localhost:8080`.  
    5. Tears down.

---

With this `CODEX.md` in place, newcomers instantly see your entire map and understand the role each file plays.