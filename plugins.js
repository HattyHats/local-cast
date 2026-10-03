// --- PLUGINS: 3D Cyberspace, Swarm Emulation, AirGap Offline ---

// 1. AirGap Offline
const btnAirgap = document.getElementById('btn-airgap');
const airgapModal = document.getElementById('airgap-modal');
const btnAirgapClose = document.getElementById('btn-airgap-close');
const btnAirgapGenerate = document.getElementById('btn-airgap-generate');
const btnAirgapScan = document.getElementById('btn-airgap-scan');
const airgapScannerContainer = document.getElementById('airgap-scanner-container');
const airgapQrDisplay = document.getElementById('airgap-qr-display');
let html5QrcodeScanner = null;

if (btnAirgap) {
    btnAirgap.addEventListener('click', () => {
        airgapModal.classList.remove('hidden');
    });

    if (btnAirgapClose) {
        btnAirgapClose.addEventListener('click', () => {
            if (airgapModal) airgapModal.classList.add('hidden');
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear();
                html5QrcodeScanner = null;
            }
            if (airgapScannerContainer) {
                airgapScannerContainer.innerHTML = '';
                airgapScannerContainer.style.display = 'none';
            }
            if (airgapQrDisplay) {
                airgapQrDisplay.style.display = 'none';
                airgapQrDisplay.innerHTML = '';
            }
        });
    }

    if (btnAirgapGenerate) {
        btnAirgapGenerate.addEventListener('click', () => {
            if (html5QrcodeScanner) { html5QrcodeScanner.clear(); html5QrcodeScanner = null; }
            if (airgapScannerContainer) {
                airgapScannerContainer.innerHTML = '';
                airgapScannerContainer.style.display = 'none';
            }
            if (airgapQrDisplay) {
                airgapQrDisplay.style.display = 'block';
                airgapQrDisplay.innerHTML = '';
            }
            
            // Use the Host ID or current peer ID
            const myId = (typeof peer !== 'undefined' && peer) ? peer.id : '';
            if (!myId) {
                alert('Peer not ready!');
                return;
            }
            
            const payload = JSON.stringify({ action: 'airgap_connect', peerId: myId });
            new QRCode(airgapQrDisplay, {
                text: payload,
                width: 250,
                height: 250,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.L
            });
        });
    }

    if (btnAirgapScan) {
        btnAirgapScan.addEventListener('click', () => {
            if (airgapQrDisplay) {
                airgapQrDisplay.style.display = 'none';
                airgapQrDisplay.innerHTML = '';
            }
            if (airgapScannerContainer) airgapScannerContainer.style.display = 'block';
            if (!html5QrcodeScanner) {
                html5QrcodeScanner = new Html5QrcodeScanner("airgap-scanner-container", { fps: 10, qrbox: {width: 200, height: 200} }, false);
                html5QrcodeScanner.render((decodedText, decodedResult) => {
                    try {
                        const data = JSON.parse(decodedText);
                        if (data.action === 'airgap_connect' && data.peerId) {
                            html5QrcodeScanner.clear();
                            airgapModal.classList.add('hidden');
                            if (typeof setupClientPeer !== 'undefined') {
                                window.location.href = window.location.origin + window.location.pathname + '?room=' + data.peerId;
                            }
                        }
                    } catch(e) {}
                }, (error) => {});
            }
        });
    }
}

// 2. Swarm Emulation (jsnes)
const emulatorContainer = document.getElementById('emulator-container');
const emulatorCanvas = document.getElementById('emulator-canvas');
const emulatorRomInput = document.getElementById('emulator-rom-input');
let nes, emuInterval, isEmulatorHost = false;

window.handleEmulatorStream = function(remoteStream) {
    document.getElementById('arcade-lobby-modal').classList.add('hidden');
    document.getElementById('arcade-modal').classList.remove('hidden');
    document.getElementById('arcade-game-title').textContent = 'SWARM EMULATOR (GUEST)';
    document.getElementById('tic-tac-toe-board').style.display = 'none';
    if(document.getElementById('pong-canvas')) document.getElementById('pong-canvas').classList.add('hidden');
    if(document.getElementById('chess-board')) document.getElementById('chess-board').classList.add('hidden');
    
    emulatorContainer.classList.remove('hidden');
    
    let video = document.getElementById('emu-guest-video');
    if (!video) {
        video = document.createElement('video');
        video.id = 'emu-guest-video';
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.style.width = '512px';
        video.style.maxWidth = '100%';
        video.style.border = '2px solid #ff00ff';
        emulatorContainer.insertBefore(video, emulatorContainer.firstChild);
        emulatorCanvas.style.display = 'none';
        
        const controlsHint = document.createElement('p');
        controlsHint.style.color = '#ff00ff';
        controlsHint.style.textAlign = 'center';
        controlsHint.style.marginTop = '10px';
        controlsHint.innerText = 'Controls: Arrows/WASD to Move | Z/J/Space to Jump | X/K/Ctrl to Shoot | Enter to Start';
        emulatorContainer.appendChild(controlsHint);
    }
    video.srcObject = remoteStream;
    video.play().catch(e => console.warn("Emulator video play error:", e));

    // Guest sends inputs to Host
    document.addEventListener('keydown', (e) => {
        if (emulatorContainer.classList.contains('hidden')) return;
        const btn = mapKeyToNes(e.key);
        if (btn !== null && connections[0]) {
            e.preventDefault();
            connections[0].send({ type: 'EMU_INPUT', event: 'down', button: btn });
        }
    });
    document.addEventListener('keyup', (e) => {
        if (emulatorContainer.classList.contains('hidden')) return;
        const btn = mapKeyToNes(e.key);
        if (btn !== null && connections[0]) {
            e.preventDefault();
            connections[0].send({ type: 'EMU_INPUT', event: 'up', button: btn });
        }
    });
};

window.handlePluginMessage = function(data) {
    if (data.type === 'EMU_INPUT' && isEmulatorHost && nes) {
        if (data.event === 'down') {
            nes.buttonDown(2, data.button); // Guest as Player 2
        } else {
            nes.buttonUp(2, data.button);
        }
    }
};

document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-emulator-game')) {
        const btn = e.target.closest('.btn-emulator-game');
        if (btn.dataset.game === 'emulator') {
            document.getElementById('arcade-lobby-modal').classList.add('hidden');
            document.getElementById('arcade-modal').classList.remove('hidden');
            document.getElementById('arcade-game-title').textContent = 'SWARM EMULATOR';
            document.getElementById('tic-tac-toe-board').style.display = 'none';
            if(document.getElementById('pong-canvas')) document.getElementById('pong-canvas').classList.add('hidden');
            if(document.getElementById('chess-board')) document.getElementById('chess-board').classList.add('hidden');
            
            emulatorContainer.classList.remove('hidden');
            if (isHost) {
                emulatorRomInput.style.display = 'block';
                isEmulatorHost = true;
                
                if (!document.getElementById('emu-host-controls-hint')) {
                    const controlsHint = document.createElement('p');
                    controlsHint.id = 'emu-host-controls-hint';
                    controlsHint.style.color = '#ff00ff';
                    controlsHint.style.textAlign = 'center';
                    controlsHint.style.marginTop = '10px';
                    controlsHint.innerText = 'Controls: Arrows/WASD to Move | Z/J/Space to Jump | X/K/Ctrl to Shoot | Enter to Start';
                    emulatorContainer.appendChild(controlsHint);
                    
                    const btnResync = document.createElement('button');
                    btnResync.className = 'custom-btn';
                    btnResync.style.borderColor = '#00ffff';
                    btnResync.style.color = '#00ffff';
                    btnResync.style.marginTop = '10px';
                    btnResync.innerText = 'RE-SYNC LATE GUESTS';
                    btnResync.onclick = broadcastEmulatorStream;
                    emulatorContainer.appendChild(btnResync);
                }
            } else {
                emulatorRomInput.style.display = 'none';
                document.getElementById('arcade-game-title').textContent = 'WAITING FOR HOST TO START GAME';
            }
        }
    }
});

if (emulatorRomInput) {
    emulatorRomInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        emulatorRomInput.style.display = 'none';
        emulatorRomInput.blur(); // Remove focus so Space/Enter don't trigger it again
        const reader = new FileReader();
        reader.onload = function(evt) {
            initEmulator(evt.target.result);
            setTimeout(() => {
                broadcastEmulatorStream();
            }, 500); // Give canvas time to draw first frame
        };
        reader.readAsBinaryString(file);
    });
}

function initEmulator(romBinaryData) {
    if (emuInterval) cancelAnimationFrame(emuInterval);
    const ctx = emulatorCanvas.getContext('2d');
    const imageData = ctx.createImageData(256, 240);
    const buf = new ArrayBuffer(imageData.data.length);
    const buf8 = new Uint8ClampedArray(buf);
    const buf32 = new Uint32Array(buf);
    
    if (typeof jsnes === 'undefined') {
        alert("jsnes library not loaded!");
        return;
    }

    nes = new jsnes.NES({
        onFrame: function(frameBuffer) {
            for (let i = 0; i < 61440; i++) {
                buf32[i] = 0xFF000000 | frameBuffer[i];
            }
            imageData.data.set(buf8);
            ctx.putImageData(imageData, 0, 0);
        },
        onAudioSample: function(left, right) { }
    });

    nes.loadROM(romBinaryData);

    let lastTime = 0;
    const fpsInterval = 1000 / 60; // NES strict 60 FPS

    function frameLoop(timestamp) {
        emuInterval = requestAnimationFrame(frameLoop);
        
        if (emulatorContainer.classList.contains('hidden')) return;

        if (!lastTime) lastTime = timestamp;
        const elapsed = timestamp - lastTime;

        // Only draw a frame if enough time has passed (syncs 60fps on 120hz/144hz monitors)
        if (elapsed > fpsInterval) {
            // Adjust lastTime to account for slight delays
            lastTime = timestamp - (elapsed % fpsInterval);
            nes.frame();
        }
    }
    emuInterval = requestAnimationFrame(frameLoop);

    // Host listens to its own keys
    document.addEventListener('keydown', (e) => {
        if (!isEmulatorHost || emulatorContainer.classList.contains('hidden')) return;
        const btn = mapKeyToNes(e.key);
        if (btn !== null) {
            e.preventDefault();
            nes.buttonDown(1, btn);
        }
    });
    document.addEventListener('keyup', (e) => {
        if (!isEmulatorHost || emulatorContainer.classList.contains('hidden')) return;
        const btn = mapKeyToNes(e.key);
        if (btn !== null) {
            e.preventDefault();
            nes.buttonUp(1, btn);
        }
    });
}

function mapKeyToNes(key) {
    switch (key.toLowerCase()) {
        case 'arrowup':
        case 'w': return jsnes.Controller.BUTTON_UP;
        case 'arrowdown':
        case 's': return jsnes.Controller.BUTTON_DOWN;
        case 'arrowleft':
        case 'a': return jsnes.Controller.BUTTON_LEFT;
        case 'arrowright':
        case 'd': return jsnes.Controller.BUTTON_RIGHT;
        case 'z': 
        case 'j':
        case ' ': return jsnes.Controller.BUTTON_A;
        case 'x': 
        case 'k':
        case 'control':
        case 'alt': return jsnes.Controller.BUTTON_B;
        case 'enter': return jsnes.Controller.BUTTON_START;
        case 'shift': return jsnes.Controller.BUTTON_SELECT;
        default: return null;
    }
}

function broadcastEmulatorStream() {
    if (!isEmulatorHost || !peer) return;
    const stream = emulatorCanvas.captureStream(30);
    connections.forEach(conn => {
        if (conn.open) {
            peer.call(conn.peer, stream, { metadata: { type: 'EMULATOR' } });
        }
    });
}


// 3. 3D Cyberspace
const cyberspaceOverlay = document.getElementById('cyberspace-overlay');
const cyberspaceContainer = document.getElementById('cyberspace-container');
const btnCyberspace = document.getElementById('btn-cyberspace');
const btnExitCyberspace = document.getElementById('btn-exit-cyberspace');
const btnPauseCyberspace = document.getElementById('btn-pause-cyberspace');

let scene, camera, renderer, animationId;
let peerMeshes = {};
let hostPlanet = null;
let hostMesh = null;
let raycaster, mouse;
let cyberspaceLabelsContainer = null;
let isCyberspacePaused = false;

const avatarCanvasCache = {};

function getAvatarTexture(avatarSrc, alias, colorHex, onReady) {
    const cleanAlias = (alias || 'Peer').trim();
    const cleanColor = colorHex || '#00f0ff';
    const cacheKey = (avatarSrc || 'no_src') + '_' + cleanAlias + '_' + cleanColor;
    if (avatarCanvasCache[cacheKey]) {
        onReady(avatarCanvasCache[cacheKey]);
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    function renderFallback() {
        ctx.clearRect(0, 0, 256, 256);

        // Circular clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(128, 128, 116, 0, Math.PI * 2);
        ctx.clip();

        // Dark gradient base
        const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
        grad.addColorStop(0, 'rgba(15, 22, 45, 0.98)');
        grad.addColorStop(1, 'rgba(5, 7, 18, 0.98)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        // Subtle cyber grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        for (let i = 32; i < 240; i += 28) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
        }

        // Monogram initial
        const initial = cleanAlias.length > 0 ? cleanAlias.charAt(0).toUpperCase() : '?';
        ctx.font = '900 115px "Courier New", monospace, sans-serif';
        ctx.fillStyle = cleanColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = cleanColor;
        ctx.shadowBlur = 18;
        ctx.fillText(initial, 128, 134);
        ctx.restore();

        // Glowing outer neon border
        ctx.save();
        ctx.beginPath();
        ctx.arc(128, 128, 116, 0, Math.PI * 2);
        ctx.lineWidth = 8;
        ctx.strokeStyle = cleanColor;
        ctx.shadowColor = cleanColor;
        ctx.shadowBlur = 20;
        ctx.stroke();

        // Inner dashed cyber ring
        ctx.beginPath();
        ctx.arc(128, 128, 104, 0, Math.PI * 2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.setLineDash([8, 10]);
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        avatarCanvasCache[cacheKey] = texture;
        onReady(texture);
    }

    if (avatarSrc) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            ctx.clearRect(0, 0, 256, 256);

            // Circular clip for avatar
            ctx.save();
            ctx.beginPath();
            ctx.arc(128, 128, 116, 0, Math.PI * 2);
            ctx.clip();

            // Dark base behind image
            ctx.fillStyle = '#050712';
            ctx.fillRect(0, 0, 256, 256);

            // Cover aspect-ratio scaling
            const sw = img.width;
            const sh = img.height;
            const minDim = Math.min(sw, sh);
            const sx = (sw - minDim) / 2;
            const sy = (sh - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, 12, 12, 232, 232);
            ctx.restore();

            // Glowing neon circular ring
            ctx.save();
            ctx.beginPath();
            ctx.arc(128, 128, 116, 0, Math.PI * 2);
            ctx.lineWidth = 8;
            ctx.strokeStyle = cleanColor;
            ctx.shadowColor = cleanColor;
            ctx.shadowBlur = 20;
            ctx.stroke();

            // Inner cyber dashed ring
            ctx.beginPath();
            ctx.arc(128, 128, 108, 0, Math.PI * 2);
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.setLineDash([6, 8]);
            ctx.shadowBlur = 0;
            ctx.stroke();
            ctx.restore();

            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            avatarCanvasCache[cacheKey] = texture;
            onReady(texture);
        };
        img.onerror = () => {
            renderFallback();
        };
        img.src = avatarSrc;
    } else {
        renderFallback();
    }
}

function createPlanetNode(id, alias, colorHex, avatarSrc, isHostPlanet = false) {
    const group = new THREE.Group();
    group.userData = { id, name: alias, color: colorHex };

    const radius = isHostPlanet ? 3.4 : 2.2;

    // 1. Central Billboard Avatar Disc (Profile photo / logo)
    const discGeo = new THREE.CircleGeometry(radius * 0.95, 32);
    const discMat = new THREE.MeshBasicMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const avatarDisc = new THREE.Mesh(discGeo, discMat);
    avatarDisc.userData = group.userData;
    group.add(avatarDisc);

    // 2. Translucent wireframe atmospheric shell
    const shellGeo = new THREE.SphereGeometry(radius, 20, 20);
    const shellMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex),
        wireframe: true,
        transparent: true,
        opacity: isHostPlanet ? 0.45 : 0.35
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.userData = group.userData;
    group.add(shellMesh);

    let currentAvatarKey = null;

    function applyTexture(src, name, col) {
        const key = (src || '') + '_' + (name || '') + '_' + (col || '');
        if (key === currentAvatarKey) return;
        currentAvatarKey = key;
        getAvatarTexture(src, name, col, (texture) => {
            discMat.map = texture;
            discMat.needsUpdate = true;
        });
    }

    applyTexture(avatarSrc, alias, colorHex);

    return {
        group,
        shellMesh,
        avatarDisc,
        applyTexture,
        getAvatarKey: () => currentAvatarKey,
        dispose: () => {
            discGeo.dispose();
            discMat.dispose();
            shellGeo.dispose();
            shellMat.dispose();
        }
    };
}

function getPeerAvatar(id) {
    if (id === 'host') {
        const hostInfo = (typeof window !== 'undefined' && window.hostPeerInfo) || null;
        return (typeof isHost !== 'undefined' && isHost) ? (localStorage.getItem('localcast_avatar') || 'hat-logo.png') : (hostInfo ? hostInfo.avatar : 'hat-logo.png');
    }
    if (typeof activePeers !== 'undefined' && activePeers[id] && activePeers[id].avatar) {
        return activePeers[id].avatar;
    }
    if (typeof connections !== 'undefined' && Array.isArray(connections)) {
        const conn = connections.find(c => c.peer === id);
        if (conn && conn.profile && conn.profile.avatar) return conn.profile.avatar;
    }
    return null;
}

if (btnCyberspace) {
    btnCyberspace.addEventListener('click', () => {
        cyberspaceOverlay.classList.remove('hidden');
        initCyberspace();
    });

    btnExitCyberspace.addEventListener('click', () => {
        cyberspaceOverlay.classList.add('hidden');
        if (animationId) cancelAnimationFrame(animationId);
        if (hostPlanet) {
            hostPlanet.dispose();
            hostPlanet = null;
        }
        Object.values(peerMeshes).forEach(p => {
            if (p.node) p.node.dispose();
        });
        peerMeshes = {};
        if (renderer) {
            renderer.dispose();
            cyberspaceContainer.innerHTML = '';
        }
        if (cyberspaceLabelsContainer) {
            cyberspaceLabelsContainer.remove();
            cyberspaceLabelsContainer = null;
        }
    });

    if (btnPauseCyberspace) {
        btnPauseCyberspace.addEventListener('click', () => {
            isCyberspacePaused = !isCyberspacePaused;
            btnPauseCyberspace.innerText = isCyberspacePaused ? 'RESUME ORBIT' : 'PAUSE ORBIT';
            btnPauseCyberspace.style.borderColor = isCyberspacePaused ? '#fcee0a' : '#00ffff';
            btnPauseCyberspace.style.color = isCyberspacePaused ? '#fcee0a' : '#00ffff';
        });
    }
}

function initCyberspace() {
    if (typeof THREE === 'undefined') {
        alert("THREE.js not loaded!");
        return;
    }

    cyberspaceContainer.innerHTML = '';
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 40;
    camera.position.y = 15;

    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25)); // Cap resolution to save GPU
    renderer.setSize(window.innerWidth, window.innerHeight);
    cyberspaceContainer.appendChild(renderer.domElement);

    // Labels container
    cyberspaceLabelsContainer = document.createElement('div');
    cyberspaceLabelsContainer.style.position = 'absolute';
    cyberspaceLabelsContainer.style.top = '0';
    cyberspaceLabelsContainer.style.left = '0';
    cyberspaceLabelsContainer.style.pointerEvents = 'none';
    cyberspaceOverlay.appendChild(cyberspaceLabelsContainer);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    const gridHelper = new THREE.GridHelper(100, 50, 0xff00ff, 0x00ffff);
    scene.add(gridHelper);

    // Host Celestial Body (Prime Station)
    const hostInfo = (typeof window !== 'undefined' && window.hostPeerInfo) || null;
    const hAlias = (typeof isHost !== 'undefined' && isHost) ? "root // HOST" : (hostInfo ? hostInfo.alias : "HOST");
    const hColor = (typeof isHost !== 'undefined' && isHost) ? "#39ff14" : (hostInfo ? hostInfo.color : "#39ff14");
    const hAvatar = getPeerAvatar('host');

    hostPlanet = createPlanetNode('host', hAlias, hColor, hAvatar, true);
    hostMesh = hostPlanet.group;
    hostMesh.position.set(0, 5, 0);
    scene.add(hostMesh);

    // Particle Stars
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 500;
    const posArray = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 200;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMat = new THREE.PointsMaterial({ size: 0.2, color: 0xff00ff });
    const starsMesh = new THREE.Points(starsGeo, starsMat);
    scene.add(starsMesh);

    window.cyberspaceBeams = [];
    window.triggerCyberspaceBeam = function(fromId, toId, color = '#00f0ff') {
        if (typeof scene === 'undefined' || !scene || cyberspaceOverlay.classList.contains('hidden') || isCyberspacePaused) return;
        
        // Throttle beams to prevent memory leaks / extreme lag during torrents
        if (window.cyberspaceBeams.length > 50) return; 

        let p1, p2;
        if (fromId === 'host') p1 = hostMesh.position;
        else if (peerMeshes[fromId]) p1 = peerMeshes[fromId].mesh.position;
        else p1 = hostMesh.position; // fallback

        if (toId === 'host') p2 = hostMesh.position;
        else if (peerMeshes[toId]) p2 = peerMeshes[toId].mesh.position;
        else p2 = hostMesh.position; // fallback

        if (!p1 || !p2) return;

        const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
        // Create an elongated diamond/laser shape
        const geo = new THREE.CylinderGeometry(0, 0.4, 2, 4);
        geo.rotateX(Math.PI / 2); // Point along Z axis
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(p1);
        mesh.lookAt(p2);
        
        scene.add(mesh);
        window.cyberspaceBeams.push({
            mesh: mesh,
            start: p1.clone(),
            end: p2.clone(),
            progress: 0,
            speed: 0.03 + (Math.random() * 0.02)
        });
    };

    let angle = 0;
    peerMeshes = {};

    function getGuestAlias(id) {
        if (typeof activePeers !== 'undefined' && activePeers[id]) return activePeers[id].alias;
        return id.substring(0, 6);
    }
    function getGuestColor(id) {
        if (typeof activePeers !== 'undefined' && activePeers[id]) return activePeers[id].color;
        return '#00ffff';
    }

    // Interactivity: Click to open Radar Guest Menu
    cyberspaceContainer.addEventListener('click', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        
        const interactables = [];
        if (hostPlanet) {
            interactables.push(hostPlanet.shellMesh, hostPlanet.avatarDisc);
        }
        Object.values(peerMeshes).forEach(p => {
            if (p.node) interactables.push(p.node.shellMesh, p.node.avatarDisc);
        });

        const intersects = raycaster.intersectObjects(interactables);
        
        if (intersects.length > 0) {
            const hitObj = intersects[0].object;
            const data = hitObj.userData || (hitObj.parent && hitObj.parent.userData);
            if (data && data.id && data.id !== 'host') {
                if (typeof openRadarGuestModal === 'function') {
                    const pAvatar = getPeerAvatar(data.id);
                    openRadarGuestModal(data.id, data.name || data.alias, data.color, pAvatar);
                }
            } else if (data && data.id === 'host') {
                showToast("System Root: Host Prime Station", "info");
            }
        }
    });

    function animate() {
        animationId = requestAnimationFrame(animate);
        
        if (!isCyberspacePaused) {
            angle += 0.003;
            starsMesh.rotation.y += 0.0005;
        }

        camera.position.x = 50 * Math.cos(angle);
        camera.position.z = 50 * Math.sin(angle);
        camera.lookAt(0, 5, 0);

        // Animate Host Planet
        if (hostPlanet) {
            if (!isCyberspacePaused) {
                hostPlanet.shellMesh.rotation.y += 0.008;
                hostPlanet.shellMesh.rotation.x += 0.004;
            }
            hostPlanet.avatarDisc.quaternion.copy(camera.quaternion);
            updateLabel(hostMesh, hAlias, hColor);
        }

        // Resolve current peers
        let peerList = [];
        if (typeof isHost !== 'undefined' && isHost) {
            if (typeof connections !== 'undefined' && Array.isArray(connections)) {
                peerList = connections.filter(c => c.open && c.isAuthenticated).map(c => ({
                    id: c.peer,
                    alias: (c.profile && c.profile.name) || (activePeers[c.peer] && activePeers[c.peer].alias) || ('Guest ' + c.peer.substring(0, 5)),
                    color: (c.profile && c.profile.color) || (activePeers[c.peer] && activePeers[c.peer].color) || '#00ffff',
                    avatar: (c.profile && c.profile.avatar) || (activePeers[c.peer] && activePeers[c.peer].avatar) || null
                }));
            }
        } else {
            const myId = (typeof peer !== 'undefined' && peer) ? peer.id : null;
            peerList = Object.values(activePeers || {}).filter(p => p.id !== myId).map(p => ({
                id: p.id,
                alias: p.alias || ('Peer ' + p.id.substring(0, 5)),
                color: p.color || '#00ffff',
                avatar: p.avatar || null
            }));
        }

        // Clean up disconnected peers
        const currentPeerIds = peerList.map(p => p.id);
        Object.keys(peerMeshes).forEach(peerId => {
            if (!currentPeerIds.includes(peerId)) {
                scene.remove(peerMeshes[peerId].mesh);
                if (peerMeshes[peerId].node) peerMeshes[peerId].node.dispose();
                if (peerMeshes[peerId].label) peerMeshes[peerId].label.remove();
                delete peerMeshes[peerId];
            }
        });

        // Update and animate each peer planet
        peerList.forEach((peerData, index) => {
            const peerId = peerData.id;
            const alias = peerData.alias;
            const colorHex = peerData.color;
            const avatarSrc = peerData.avatar || getPeerAvatar(peerId);

            if (!peerMeshes[peerId]) {
                const pNode = createPlanetNode(peerId, alias, colorHex, avatarSrc, false);
                scene.add(pNode.group);

                const label = document.createElement('div');
                label.style.position = 'absolute';
                label.style.color = colorHex;
                label.style.fontFamily = 'monospace';
                label.style.fontSize = '12px';
                label.style.fontWeight = 'bold';
                label.style.letterSpacing = '1px';
                label.style.textShadow = '0 0 8px ' + colorHex;
                label.style.background = 'rgba(5, 8, 20, 0.75)';
                label.style.padding = '3px 8px';
                label.style.border = '1px solid ' + colorHex;
                label.style.borderRadius = '4px';
                label.style.backdropFilter = 'blur(4px)';
                label.style.cursor = 'pointer';
                label.style.pointerEvents = 'auto';
                label.style.display = 'flex';
                label.style.alignItems = 'center';
                label.style.gap = '5px';
                const safeColor = (typeof sanitizeCssColor === 'function') ? sanitizeCssColor(colorHex) : colorHex;
                const safeAlias = (typeof escapeHtml === 'function') ? escapeHtml(alias) : String(alias).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                label.innerHTML = `<span style="width:6px; height:6px; border-radius:50%; background:${safeColor}; box-shadow:0 0 6px ${safeColor};"></span><span>${safeAlias}</span>`;
                
                label.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof openRadarGuestModal === 'function') {
                        const curAvatar = getPeerAvatar(peerId);
                        openRadarGuestModal(peerId, alias, colorHex, curAvatar);
                    }
                });

                cyberspaceLabelsContainer.appendChild(label);

                peerMeshes[peerId] = {
                    mesh: pNode.group,
                    node: pNode,
                    label: label,
                    color: colorHex,
                    alias: alias,
                    avatar: avatarSrc
                };
            }

            const p = peerMeshes[peerId];
            
            // Check if profile details changed
            if (p.alias !== alias || p.color !== colorHex || p.avatar !== avatarSrc) {
                p.node.applyTexture(avatarSrc, alias, colorHex);
                p.node.shellMesh.material.color.set(colorHex);
                p.color = colorHex;
                p.alias = alias;
                p.avatar = avatarSrc;
                const safeColor = (typeof sanitizeCssColor === 'function') ? sanitizeCssColor(colorHex) : colorHex;
                const safeAlias = (typeof escapeHtml === 'function') ? escapeHtml(alias) : String(alias).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                p.label.style.color = safeColor;
                p.label.style.borderColor = safeColor;
                p.label.innerHTML = `<span style="width:6px; height:6px; border-radius:50%; background:${safeColor}; box-shadow:0 0 6px ${safeColor};"></span><span>${safeAlias}</span>`;
            }

            // Orbital movement
            const gAngle = angle * 2 + (index * (Math.PI * 2 / Math.max(1, peerList.length)));
            p.mesh.position.set(22 * Math.cos(gAngle), 5 + Math.sin(gAngle * 3) * 3, 22 * Math.sin(gAngle));

            if (!isCyberspacePaused) {
                p.node.shellMesh.rotation.y += 0.012;
                p.node.shellMesh.rotation.x += 0.006;
            }

            // Billboard avatar disc to face camera perfectly
            p.node.avatarDisc.quaternion.copy(camera.quaternion);

            updateLabel(p.mesh, alias, colorHex, p.label);
        });

        if (window.cyberspaceBeams) {
            for (let i = window.cyberspaceBeams.length - 1; i >= 0; i--) {
                const b = window.cyberspaceBeams[i];
                if (!isCyberspacePaused) b.progress += b.speed;
                if (b.progress >= 1) {
                    scene.remove(b.mesh);
                    if (b.mesh.geometry) b.mesh.geometry.dispose();
                    if (b.mesh.material) b.mesh.material.dispose();
                    window.cyberspaceBeams.splice(i, 1);
                } else {
                    b.mesh.position.lerpVectors(b.start, b.end, b.progress);
                }
            }
        }

        renderer.render(scene, camera);
    }
    
    function updateLabel(mesh, text, color, existingLabel) {
        let label = existingLabel;
        if (!label) {
            if (!mesh.userData.labelEl) {
                mesh.userData.labelEl = document.createElement('div');
                mesh.userData.labelEl.style.position = 'absolute';
                mesh.userData.labelEl.style.color = color;
                mesh.userData.labelEl.style.fontFamily = 'monospace';
                mesh.userData.labelEl.style.fontSize = '12px';
                mesh.userData.labelEl.style.fontWeight = 'bold';
                mesh.userData.labelEl.style.letterSpacing = '1px';
                mesh.userData.labelEl.style.textShadow = '0 0 8px ' + color;
                mesh.userData.labelEl.style.background = 'rgba(5, 8, 20, 0.75)';
                mesh.userData.labelEl.style.padding = '3px 8px';
                mesh.userData.labelEl.style.border = '1px solid ' + color;
                mesh.userData.labelEl.style.borderRadius = '4px';
                mesh.userData.labelEl.style.backdropFilter = 'blur(4px)';
                mesh.userData.labelEl.style.cursor = 'pointer';
                mesh.userData.labelEl.style.pointerEvents = 'auto';
                mesh.userData.labelEl.style.display = 'flex';
                mesh.userData.labelEl.style.alignItems = 'center';
                mesh.userData.labelEl.style.gap = '5px';
                const safeColor = (typeof sanitizeCssColor === 'function') ? sanitizeCssColor(color) : color;
                const safeText = (typeof escapeHtml === 'function') ? escapeHtml(text) : String(text).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                mesh.userData.labelEl.innerHTML = `<span style="width:6px; height:6px; border-radius:50%; background:${safeColor}; box-shadow:0 0 6px ${safeColor};"></span><span>${safeText}</span>`;
                cyberspaceLabelsContainer.appendChild(mesh.userData.labelEl);
            }
            label = mesh.userData.labelEl;
        }
        
        const vector = new THREE.Vector3();
        vector.setFromMatrixPosition(mesh.matrixWorld);
        vector.project(camera);
        
        if (vector.z > 1) { // Behind camera
            label.style.display = 'none';
            return;
        }
        label.style.display = 'flex';
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
        label.style.transform = `translate(-50%, -100%) translate(${x}px, ${y - 42}px)`;
    }

    animate();
}

window.addEventListener('resize', () => {
    if (camera && renderer && !cyberspaceOverlay.classList.contains('hidden')) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
