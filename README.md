# Local-Cast

**A decentralized, browser-based peer-to-peer network for secure and ephemeral file sharing, gaming, and communication.**

Local-Cast transforms any modern browser into a secure, serverless networking hub. By leveraging WebRTC data channels and peer-to-peer architecture, Local-Cast enables hosts and guests to instantly transfer files, communicate securely, play real-time games, and stream media directly between devices on the same network—no backend servers or cloud storage required.

### 🚀 Core Features
* **Decentralized P2P & Swarm Routing:** All data transfers and WebRTC Comm-Links are strictly peer-to-peer. When multiple guests connect, Local-Cast forms a Swarm, automatically relaying messages so Guests can interact directly with each other without the Host needing to process everything!
* **Proximity Radar & Granular Permissions:** Visually track all connected peers orbiting the Host device in real-time. Click on any guest's radar blip to instantly toggle their specific upload, edit, and delete permissions on the fly, or open an encrypted 1-on-1 Whisper channel and secure Audio Call.
* **The Arcade:** Challenge any connected peer (Host or Guest) to a real-time game! Features low-latency **Cyber-Pong** (synced at 60 FPS), **Holo-Chess** (powered by chess.js with full FEN network syncing), and classic **Neon-Tac-Toe**. All games operate entirely P2P.
* **Live Scratchpad:** An ephemeral, collaborative text environment. Anyone can type in the Scratchpad and it instantly syncs across the entire Swarm in real-time, complete with neon visual sync indicators.
* **The Jukebox & P2P Media Streaming:** Upload MP3s or WAVs to the Jukebox to broadcast a shared audio stream to everyone in the room. You can also double-click regular media files (audio/video/images) in the filesystem to instantly stream them across the network without requiring a full download first.
* **E2E Encrypted Vaults:** Need absolute security? Create a Secure Vault. Files dropped into a Vault are encrypted locally using true Zero-Knowledge AES-GCM encryption before they are ever stored or transmitted. Without the password, the data is mathematically unrecoverable.
* **Dead Drops & Honey-Pots:** Hide files from guests using transparent Dead Drops, or set up explosive Honey-Pot traps that instantly sever an intruder's connection after 3 failed password attempts.
* **Aesthetic Protocols:** Customize the network's visual interface with 4 built-in cyberpunk themes (Synthwave, Matrix Terminal, Night City, Blood Moon).
* **Burn Notice Protocol:** A single click instantly obliterates all active peer connections, wipes all session data, and permanently shreds the encrypted local storage filesystem, leaving zero trace behind.

### 🛠 Tech Stack
* HTML5 / CSS3 / Vanilla JavaScript
* **PeerJS** (WebRTC Signaling & Data Channels)
* **LocalForage** (Encrypted IndexedDB Virtual Filesystem)
* **Chess.js** (Chess game logic engine)

### 💻 Installation & Usage
1. Clone the repository to your local machine.
2. Serve the directory using any local web server (e.g. `python3 -m http.server 8080`).
3. Open the application in your browser. The first device to connect becomes the **Host**.
4. Guests can join by navigating to the connection URL displayed on the Host's screen, or by scanning the generated QR code.

*Note: For peer-to-peer WebRTC connections to work securely across different devices, ensure you are testing over a secure context (localhost or HTTPS).*

### 🔒 Security & Privacy Transparency
* **Is the connection secure?** Yes. WebRTC mandates End-to-End Encryption (E2EE) using DTLS and SRTP protocols. No middleman (not even the signaling server) can intercept, read, or listen to your files or audio calls. The browser sandbox also prevents the app from accessing your hard drive or OS.
* **Can this be used with strangers?** Yes, BUT it is **NOT anonymous**. Because this is a Peer-to-Peer network, the browsers must exchange IP addresses to establish a connection. Anyone you connect with can see your public IP address using basic networking tools. If you need to stay completely anonymous, all parties must use a VPN before connecting.
