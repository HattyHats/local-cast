# Local-Cast

**A decentralized, browser-based peer-to-peer network for secure and ephemeral file sharing, gaming, and communication.**

Local-Cast transforms any modern browser into a secure, serverless networking hub. By leveraging WebRTC data channels and peer-to-peer architecture, Local-Cast enables hosts and guests to instantly transfer files, communicate securely, play real-time games, and stream media directly between devices on the same network—no backend servers or cloud storage required.

### 🚀 Core Features
* **Multi-Source Swarm Torrenting (BitTorrent in the Browser):** Guests don't just pull files from the host—connected peers exchange pieces directly with one another over decentralized WebRTC data channels. As chunks arrive, peers announce piece availability (`SWARM_HAVE`) to distribute load, multiplying transfer speeds across the entire mesh.
* **End-to-End Ephemeral Encryption (E2EE with WebCrypto ECDH):** Mathematically verified Zero-Knowledge security. Upon connection, peers exchange raw ECDH (Elliptic Curve Diffie-Hellman P-256) public keys and derive an ephemeral 256-bit AES-GCM symmetric session key in memory. The glowing `E2EE LOCKED` badge confirms zero intermediate visibility.
* **Resumable File Transfers via IndexedDB Chunk Cache:** WebRTC drops or network interruptions no longer restart large downloads from scratch. Incoming pieces are stored persistently in IndexedDB (`localforage`), seamlessly resuming downloads from the exact missing chunk offset.
* **Streaming Video & Audio Torrent Player:** Near-instant multimedia playback. Streaming mode prioritizes sequential chunk delivery (chunks 0, 1, 2, 3...) so 4K video or audio streams begin playing within seconds while remaining chunks buffer smoothly in the background with live progress visualization.
* **Decentralized P2P Mesh Routing:** All data transfers and WebRTC Comm-Links are strictly peer-to-peer. When multiple guests connect, Local-Cast forms a Swarm, automatically relaying messages so Guests can interact directly with each other without the Host needing to process everything!
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
1. Serve the directory using any local web server (e.g. `python3 server.py` or `python3 -m http.server 8080`).
2. Open `http://localhost:8080` in your browser. The first device to connect becomes the **Host**.
3. Guests can join by navigating to the connection URL displayed on the Host's screen, or by scanning the generated QR code.

*Note: For peer-to-peer WebRTC connections to work securely across different devices, ensure you are testing over a secure context (localhost or HTTPS).*

### 🔒 Security & Privacy Transparency
* **Is the connection secure?** Yes, absolutely. Local-Cast enforces **Zero-Knowledge End-to-End Encryption (E2EE)** using hardware-accelerated WebCrypto Elliptic Curve Diffie-Hellman (ECDH P-256) and AES-GCM-256. Cryptographic session keys are ephemeral and generated exclusively in volatile browser RAM. Neither intermediate signaling brokers, Cloudflare, ISPs, nor eavesdroppers can read, inspect, or intercept your files, chat, or voice streams.
* **Can this be used with strangers?** Yes, but keep in mind the difference between **Content Privacy** and **Network Anonymity**:
  * **Content is 100% Zero-Knowledge:** Strangers cannot see your files without permission, cannot decrypt locked folders or hidden dead drops, and cannot snoop on your transfers.
  * **Network Layer is NOT IP-Anonymous:** Because WebRTC creates direct, decentralized device-to-device connections (without centralized proxy relays storing or routing your data), browsers must directly exchange network packets. Any peer you directly connect with can see your public IP address using standard networking tools, exactly like BitTorrent or direct VoIP calls. If you require complete IP address masking when connecting with strangers, use a **VPN** before joining.
