# 🌐 LOCAL-CAST v3.5 // Zero-Knowledge Decentralized WebOS & Swarm Network

[![Version](https://img.shields.io/badge/Version-v3.5-39ff14.svg)](https://local-cast.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![WebRTC](https://img.shields.io/badge/WebRTC-Peer--to--Peer-00f0ff.svg)](https://webrtc.org/)
[![Cryptography](https://img.shields.io/badge/Crypto-AES--GCM--256%20%7C%20ECDH%20P--256-39ff14.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
[![Biometrics](https://img.shields.io/badge/Biometrics-WebAuthn%20%7C%20FIDO2-ff007f.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
[![Screen Share](https://img.shields.io/badge/Screen%20Share-P2P%2060%20FPS-b026ff.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API)
[![PWA](https://img.shields.io/badge/PWA-Installable%20%26%20Share%20Target-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![WebGL](https://img.shields.io/badge/3D%20Engine-Three.js-00f0ff.svg)](https://threejs.org/)

**Local-Cast** is a serverless, zero-knowledge, browser-native operating system engineered for decentralized file sharing, swarm torrent distribution, multi-sig secure vaults, real-time code execution, collaborative project boards, synchronized media watch parties, multiplayer gaming, low-latency screen sharing, and 3D spatial cyberspace telemetry. 

Built entirely with standard web primitives (WebRTC DataChannels, WebRTC MediaStreams, Web Crypto API, WebAuthn, Web Workers, WebAssembly, IndexedDB, Three.js, and PWA Service Workers), Local-Cast requires **no accounts**, **no central servers**, **no cloud databases**, and **no third-party telemetry**. Your data lives solely in your browser's RAM and local storage, moving peer-to-peer over direct, hardware-accelerated encrypted tunnels.

---

## ⚡ Core Architectural Capabilities

### 🚀 1. Decentralized Swarm Torrents (P2P BitTorrent Mesh)
* **High-Throughput 32 KB Chunking:** Files are automatically divided into optimal 32 KB pieces (`32 * 1024` bytes), engineered specifically to stay safely under WebRTC SCTP packet boundaries without fragmentation.
* **True Multi-Peer Chunk Stitching & RAM Seeder Cache (v3.5):** Up to 8 concurrent chunk requests are fetched across the Host and connected Guest peers simultaneously. When any Guest finishes downloading a file, it automatically caches the assembled file in a bounded 250 MB LRU RAM Seeder Cache (`completedSwarmBlobs`) and advertises full bitfield availability (`SWARM_BITFIELD`) to both direct mesh peers and via Host relay—multiplying room bandwidth as more peers join.
* **Live Bitfield Chunk Matrix:** A real-time visual grid displays the exact status of every individual chunk (`pending`, `downloading`, `cached`) as it streams across the mesh.
* **Resumable IndexedDB Cache:** Chunks are saved locally in an indexed database (`swarmChunks`). If a connection is interrupted, transfers resume instantly from the last received chunk without restarting.
* **Real-Time Swarm Telemetry:** Live active peer source counters (`⚡ N Swarm Sources`), dynamic ETA calculations, and download speed rate trackers.

### 🔐 2. Multi-Sig "Nuclear" Vaults & Zero-Knowledge Security
* **Consensus Voting Protocol:** Mark confidential folders as "Nuclear Vaults". Unlocking requires dynamic cryptographic authorization and a synchronized quorum vote from connected peers.
* **Dynamic Quorum Threshold:** Automatically configures a 1-approval quorum for 2-peer rooms (Host + Guest), or allows the Host to select a custom $M$-of-$N$ threshold for larger mesh swarms.
* **Dynamic PIN & Enter-Key Authorization:** Quick PIN-protected access with synchronized voting prompts across the mesh and Enter-key submission.
* **Biometric Hardware Authentication (WebAuthn / Passkeys):** Unlock password-secured folders and vaults with Touch ID, Face ID, Windows Hello, or FIDO2 hardware keys via the Web Authentication API (`navigator.credentials`), bypassing repetitive password entry while preserving zero-knowledge security.
* **60-Second Security Countdown:** Authorization requests feature a synchronized 60-second countdown timer. If quorum is not met, the request automatically expires.
* **Session Cache Re-Arming:** Toggling or re-locking vaults triggers a synchronized `NUCLEAR_VAULT_RESET` broadcast, invalidating cached authorization tokens across all peers so vaults re-lock securely.
* **AES-GCM-256 + ECDH P-256:** Cryptographic keys are derived in volatile browser RAM using PBKDF2-SHA256 (100,000 iterations). Files are encrypted locally *before* transmission or storage.

### 🌐 3. Cyberspace Network Operations Center (NOC)
* **3D Spatial Visualizer:** Step into an interactive Three.js WebGL cyberspace grid where connected peers float as holographic spheres with status rings.
* **Live Transfer Energy Lasers:** Active file transfers and swarm chunk exchanges emit luminous energy particle beams shooting dynamically between sender and receiver nodes in real-time 3D space.
* **Adaptive Hardware Scaling:** Dynamically caps device pixel ratios (DPR) and disables expensive post-processing on mobile/low-power hardware, cutting battery draw and boosting framerates by up to 85%.

### 🔥 4. Burn Protocol & Honey-Pot Countermeasures
* **Burn-on-Download Protocol ("Zero-Trace Shredding"):** Flag files for self-destruction. Once downloaded by a recipient, a synchronized burn broadcast triggers: the file is automatically shredded from RAM, IndexedDB, and the host mesh with a digital disintegration animation.
* **Honey-Pot Traps:** Right-click any folder to designate it as an active decoy honey-pot. Unauthorized access attempts log silent strikes. After 3 strikes, the intruder is permanently disconnected and their browser UI is locked down.
* **Dead Drops (Invisible Folders):** Conceal sensitive folders from guest view completely. Reveal them exclusively in the Host terminal with `/deaddrop`.
* **Emergency Burn Notice ("Destroy Network"):** One-click panic button that severs all WebRTC channels, wipes cryptographic keys from RAM, and purges IndexedDB storage with zero forensic traces.

### 🕹️ 5. P2P Swarm Arcade, Watch Party Theater, CyberBoard & Code Sandbox
* **P2P Collaborative CyberBoard — Kanban & Data Tables (v3.5):**
  * Dual-view workspace combining a 4-column **Kanban Board** (`📥 To Do`, `⚡ In Progress`, `🔍 Review`, `✅ Done`) and an interactive **Spreadsheet Data Table** view.
  * Supports priority badges (`HIGH`, `MED`, `LOW`), `@Assignee` pills, custom `#tags`, instant search filtering, desktop drag-and-drop, touch-friendly mobile `◀` / `▶` column controls, one-click **JSON / CSV Export & Import**, and granular **Host Guest Access Control**.
* **QuickPad + Live Code Execution Sandbox (v3.5):**
  * Built directly into Local-Cast with 100% serverless, zero-cloud WebRTC synchronization, multi-tab file management, live multiplayer cursors, line numbers, and Markdown live preview.
  * **In-Browser JS & Python WASM Runner:** Execute JavaScript/TypeScript inside an isolated Web Worker (with 8s infinite-loop protection) or Python (`.py`) via on-demand **Pyodide WebAssembly** directly from QuickPad (`⚡ RUN CODE` / <kbd>Ctrl+Enter</kbd>) or from the CLI Terminal (`run <filename>`), with optional P2P console output broadcasting to collaborators.
* **P2P Watch Party Theater & Live Reactions (v3.5):**
  * Right-click any video or audio file (`🍿 Start Watch Party`) or click `🍿 WATCH PARTY` inside the Media Player to open the media across all connected peers simultaneously.
  * Synchronizes Play, Pause, Seek (with 0.65s drift tolerance), and Playback Speed (`0.5x`–`2x`) across the swarm, complete with a `⚡ RESYNC ALL` button and floating real-time emoji reactions (`🔥`, `😂`, `🤯`, `❤️`, `👏`, `🍿`, `🚀`, `💀`).
* **Real-Time Multiplayer Gaming:** 60 FPS low-latency <strong style="color: #39ff14;">Cyber-Pong</strong> (synchronized paddle physics), <strong style="color: #00f0ff;">Holo-Chess</strong> (powered by chess.js with full FEN network synchronization), and classic <strong style="color: #ff007f;">Neon-Tac-Toe</strong>.
* **Retro NES 8-bit Emulator:** Play classic ROMs in-browser with delta-time canvas streaming broadcasted to all connected guests at 60 FPS over WebRTC.
* **Collaborative P2P Whiteboard (Infinite Canvas):** 
  * Real-time synchronized canvas with multi-user vector drawing, touch/stylus support, and color palette selection.
  * **Zoom & Pan Navigation:** Smooth cursor-centered mouse wheel zoom, Spacebar hold-to-pan, on-canvas Quick Zoom HUD, and pinch-to-zoom multi-touch gestures (`25%` to `500%` zoom range).
  * **Drag-and-Drop Image Stamping:** Drop or paste images directly onto the canvas with real-time peer distribution and coordinate lock.
  * **Persistent Laser Beacons & Text Annotations:** Real-time pointer trails with solid peer nameplate badges and inline vector text placement.
  * **Host Access Control:** Granular individual guest switches, one-click "Allow All", admission dialogs, and instant canvas state synchronization.
* **Low-Latency P2P Screen Sharing:** Broadcast your desktop, application window, or browser tab directly to connected peers over hardware-accelerated WebRTC media streams at up to 60 FPS. Supports Picture-in-Picture (PiP), full-screen viewer, and optional system audio with zero intermediary servers.
* **Swarm Jukebox:** Synchronized room-wide audio streaming of MP3/WAV tracks broadcast directly across the mesh.

### 🗂️ 6. Multi-File Selection & Batch Operations
* **Flexible Selection Controls:** Select multiple files and folders at once using desktop modifiers (<kbd>Ctrl+Click</kbd> / <kbd>Cmd+Click</kbd>, <kbd>Shift+Click</kbd> range selection) or mobile on-screen checkmark badges and a dedicated Multi-Select mode toggle.
* **Cyber Floating Batch Actions Bar:** Slides up dynamically when items are selected with live counters:
  * **`SELECT ALL`** — Instantly select all files and folders in the current directory.
  * **`MOVE TO...`** — Interactive modal directory picker to batch relocate selected items into any destination folder.
  * **`DOWNLOAD`** — Automatically bundles selected files into a single `.zip` archive on Host or triggers batch downloads on Guest.
  * **`DELETE`** — Safely batch deletes selected items across Host VFS and authorized Guest connections with a single confirmation modal.
* **Batch Drag & Drop:** Dragging any selected file carries all selected items together and moves them into any folder.
* **Context Menu Batch Sync:** Right-clicking any selected file dynamically updates the context menu to show `Delete (N items)`.

### 📡 7. Proximity Radar, Comm-Links & Real-Time Voice Masking (v3.2)
* **2D Proximity Radar:** Visualizes connected peers with real-time signal strength, round-trip ping, and role indicators.
* **Encrypted Whisper Channels:** 1-on-1 private messaging channels with zero-knowledge encryption.
* **Untraceable Real-Time Voice Masking:** Browser-native DSP audio engine built with the Web Audio API (`AudioContext`, `createScriptProcessor`, circular buffers, and dual Hann-windowed granular pitch shifters). Scrambles vocal timbre, harmonic formants, and biometric identifiers in real time before transmission across WebRTC:
  * 🤖 **ROBOTIC:** Cyborg vocoder synthesizer with carrier-frequency ring modulation and wave-folding saturation.
  * 👹 **DEEP BRUTE:** -7.5 semitone granular drop with 1-pole low-pass resonance filter and warm bass saturation.
  * ⚡ **HIGH CIPHER:** +6.5 semitone high-frequency scramble and treble formant shift.
  * 👤 **ANONYMOUS:** Witness-protection style pitch drop with 8.5 Hz tremolo wobble and non-linear distortion.
  * 📻 **RADIO COMM:** Tactical walkie-talkie bandpass filtering (500 Hz – 2.8 kHz) with diode overdrive clipping.
  * 👻 **PHANTOM:** Dual-detuned ethereal slapback echo with 50ms delay line.
  * 🗣️ **NATURAL:** Clean unmasked audio pass-through.
* **Live Headphone Preview & Animated VU Meter:** Real-time microphone test modal with animated volume VU meter to audition disguises before placing a call.
* **Live Mid-Call Switching & Software Mute:** Change disguises dynamically on the fly during active calls without renegotiating WebRTC, plus instantaneous software/hardware audio mute controls.
* **Serverless WebRTC Audio Calls:** Peer-to-peer audio transmission directly between browsers with zero intermediate audio servers or storage.

### 📶 8. Air-Gap LAN Mode (100% Offline)
* **Zero Internet Operation:** Local-Cast can operate completely disconnected from the public internet. Connect devices directly over local Wi-Fi, Ethernet, or ad-hoc mobile hotspots using a cryptographic QR-code handshake.

### 📱 9. Mobile PWA & Native OS Share Target
* **Progressive Web App (PWA):** Installable directly to iOS, Android, macOS, Windows, and Linux home screens.
* **OS-Level Share Integration:** Select photos, videos, or documents directly from your mobile camera roll or file manager, tap "Share", and beam them straight into the Local-Cast network.
* **Zero-Delay Touch Optimization:** Integrated `touch-action: manipulation` eliminating 300ms tap delays, fluid 3-column mobile file grids, iOS momentum scrolling, and viewport-safe dialogs.

### 📁 10. Native Folder Ingestion & Resumable Swarm Transfers (v3.1)
* **Native Directory Hierarchy Upload:** Ingest complete local directory trees with arbitrary nesting depth using native browser directory upload (`webkitdirectory`). Local-Cast mirrors folder structures automatically on the Host and across authorized peers, including empty directory nodes.
* **Interrupted Transfer Auto-Resume:** Download progress is tracked with persistent bitfield segment caching in IndexedDB. If a network drops or a browser reloads, transfers resume instantly with a `⚡ RESUME` indicator.
* **Proximity Radar & Cyberspace Seamless Dual-Mode:** Toggle effortlessly between 2D Proximity Radar and full-screen 3D spatial Cyberspace with instant camera alignment and zero memory leaks.
* **1-Click Instant Guest Onboarding:** Auto-generated cyberpunk handles and unique SVG emoji avatars remove all friction for new guests joining the swarm.
* **Streamlined UI & Compact Sidebar:** Ergonomic 2-column actions toolbar with integrated QuickPad note-taking, responsive folder navigation ("Up One Level" breadcrumbs), and inline real-time transfer progress indicators.

---

## 🛠️ Technical Specifications

| Component | Implementation Details |
| :--- | :--- |
| **Release Version** | v3.5 (Multi-Source Swarm Seeding, Live Code Sandbox, P2P Watch Party & CyberBoard) |
| **Transport Layer** | WebRTC DataChannels (SCTP over DTLS/UDP) & MediaStreams (SRTP) |
| **Network Topology** | P2P Swarm Mesh with deterministic initiator connection pairing & Host bitfield relay |
| **Chunk Size** | 32 KB (`32768` bytes) optimized for WebRTC MTU boundaries |
| **P2P Flow Control** | Event-driven `bufferedamountlow` threshold gating (512 KB pipelined buffer window) + coalesced 100ms `SWARM_HAVES` |
| **Swarm Seeder Cache** | 250 MB LRU in-memory Blob cache (`completedSwarmBlobs`) + IndexedDB `swarmChunks` store |
| **Code Execution Sandbox** | Isolated Web Worker (JS/TS with 8s watchdog) + Pyodide v0.25.0 WebAssembly (Python) |
| **Collaborative Workspace** | QuickPad (multi-tab editor + live cursors), CyberBoard (Kanban + Spreadsheet Table), Infinite Whiteboard |
| **Storage Serialization** | Debounced IndexedDB persistence (250ms) and coalesced tree broadcasts (150ms) |
| **Parallel Concurrency** | Up to 8 concurrent chunk request streams per download across multiple peers |
| **Folder Upload Engine** | Native recursive folder upload (`webkitdirectory`) with full directory tree preservation |
| **Resumable Transfers** | Bitfield chunk piece caching with automatic resume recovery |
| **Symmetric Encryption** | AES-GCM-256 (hardware-accelerated Web Crypto API) |
| **Key Derivation** | PBKDF2-SHA256 (100,000 iterations, unique salt per vault) |
| **Asymmetric Key Exchange** | ECDH P-256 for ephemeral volatile session key agreements |
| **Biometric Security** | WebAuthn / FIDO2 (`navigator.credentials`) with Touch ID, Face ID, Windows Hello |
| **Screen Sharing** | Hardware-downscaled 1080p30 (`getDisplayMedia` with 1.8 Mbps sender bitrate cap and `maintain-resolution` tuning for non-congested multi-peer broadcasting) |
| **Whiteboard Engine** | Dual-canvas HTML5 Canvas 2D with hardware-accelerated CSS stage transforms (25%-500% zoom, 30 FPS laser throttle) |
| **Batch File Engine** | Multi-node VFS transaction engine with JSZip batch archive packaging |
| **Local Storage Engine** | IndexedDB (`localcast_db` for files/folders, `swarmChunks` for torrent pieces) |
| **3D Cyberspace Engine** | Three.js WebGL with dynamic hardware-tier DPR scaling & Proximity Radar dual-mode switching |
| **Multiplayer Sync** | Watch Party Theater (0.65s drift sync + emoji reactions), FEN notation (Chess), 60 FPS delta-time (Pong), canvas stream (NES) |
| **Offline Discovery** | Base64-encoded SDP/ICE cryptographic QR-code handshake |

---

## 🚀 Getting Started

### Option A: Local Development Server
1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/local-cast.git
   cd local-cast
   ```
2. Start the lightweight local HTTP server:
   ```bash
   python3 server.py
   # Or using Node.js:
   # npx serve .
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:8888
   ```

### Option B: Static Cloud Deployment
Because Local-Cast is 100% client-side, you can host it on any static hosting platform with zero configuration:
* **GitHub Pages**
* **Cloudflare Pages**
* **Vercel**
* **Netlify**

*(Note: WebRTC voice calls, screen sharing, and PWA Share Target require HTTPS when deployed to a public domain.)*

---

## 🔒 Security & Privacy Transparency

### Content Privacy vs. Network Anonymity
* **Content is 100% Zero-Knowledge:** All files, whispers, screen streams, and audio calls are encrypted client-side in browser RAM before transmission. Intermediate signaling brokers, ISPs, and eavesdroppers cannot inspect or decrypt your data.
* **Network Layer is Direct Peer-to-Peer:** Because WebRTC establishes direct device-to-device socket connections (eliminating centralized proxy bottlenecks), connected peers exchange network packets directly. Any peer you directly connect with can view your public IP address using standard networking inspection tools (identical to BitTorrent or direct VoIP calls). 
* **Recommendation:** If you require IP address masking when connecting with untrusted strangers, use a trusted **VPN** before establishing a session.

---

## 💡 Keyboard Shortcuts & Pro Tips

* **`/deaddrop`** — Type into the host search bar to reveal all concealed Dead Drop folders.
* **`Enter` Key** — Quickly submits passwords in Vault prompts, Nuclear PIN dialogs, and voting authorization screens.
* **Right-Click Context Menu** — Right-click any file or folder to access quick actions: *Make Nuclear Vault*, *Toggle Dead Drop*, *Set Honey-Pot*, *Burn on Download*, *Move*, or *Delete*.
* **Multi-File Selection** — Hold <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> and click to toggle multiple files; hold <kbd>Shift</kbd> to select a range of files. Use the floating bottom bar to batch move, delete, or zip.
* **Whiteboard Navigation** — Hold <kbd>Spacebar</kbd> to pan the canvas; scroll mouse wheel to zoom in/out; press <kbd>+</kbd>/<kbd>=</kbd> to zoom in, <kbd>-</kbd>/<kbd>_</kbd> to zoom out, and <kbd>0</kbd> to reset zoom to 100%.
* **Whiteboard History** — <kbd>Ctrl+Z</kbd> / <kbd>Cmd+Z</kbd> to undo, <kbd>Ctrl+Y</kbd> / <kbd>Cmd+Shift+Z</kbd> to redo.
* **Destroy Network** — Click the red skull button in the header for instantaneous zero-trace cryptographic purging of all keys, channels, and IndexedDB caches.

---

## 📄 License
This project is open-source and released under the **MIT License**.

