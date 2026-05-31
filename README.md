# Local-Cast

**A decentralized, browser-based peer-to-peer network for secure and ephemeral file sharing.**

Local-Cast transforms any modern browser into a secure, serverless networking hub. By leveraging WebRTC data channels and peer-to-peer architecture, Local-Cast enables hosts and guests to instantly transfer files, communicate securely, and stream media directly between devices on the same network—no backend servers or cloud storage required.

### 🚀 Core Features
* **Zero-Server Architecture:** All data transfers and WebRTC Audio Comm-Links are strictly peer-to-peer. Your files never touch a central server.
* **Proximity Radar:** Visually track all connected peers orbiting the Host device in real-time.
* **P2P Media Streaming:** Double-click media files (audio/video/images) to instantly stream them across the network without requiring a full download first.
* **Dead Drops & Honey-Pots:** Hide files from guests using transparent Dead Drops, or set up explosive Honey-Pot traps that instantly sever an intruder's connection after 3 failed password attempts.
* **Aesthetic Protocols:** Customize the network's visual interface with 4 built-in cyberpunk themes (Synthwave, Matrix Terminal, Night City, Blood Moon).
* **Burn Notice Protocol:** A single click instantly obliterates all active peer connections, wipes all session data, and permanently shreds the encrypted local storage filesystem, leaving zero trace behind.

### 🛠 Tech Stack
* HTML5 / CSS3 / Vanilla JavaScript
* **PeerJS** (WebRTC Signaling & Data Channels)
* **LocalForage** (Encrypted IndexedDB Virtual Filesystem)

### 💻 Installation & Usage
1. Clone the repository to your local machine.
2. Serve the directory using any local web server (e.g. `python3 -m http.server 8080`).
3. Open the application in your browser. The first device to connect becomes the **Host**.
4. Guests can join by navigating to the connection URL displayed on the Host's screen, or by scanning the generated QR code.

*Note: For peer-to-peer WebRTC connections to work securely across different devices, ensure you are testing over a secure context (localhost or HTTPS).*

### 🔒 Security & Privacy Transparency
* **Is the connection secure?** Yes. WebRTC mandates End-to-End Encryption (E2EE) using DTLS and SRTP protocols. No middleman (not even the signaling server) can intercept, read, or listen to your files or audio calls. The browser sandbox also prevents the app from accessing your hard drive or OS.
* **Can this be used with strangers?** Yes, BUT it is **NOT anonymous**. Because this is a Peer-to-Peer network, the browsers must exchange IP addresses to establish a connection. Anyone you connect with can see your public IP address using basic networking tools. If you need to stay completely anonymous, all parties must use a VPN before connecting.
