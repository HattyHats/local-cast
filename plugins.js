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

    btnAirgapClose.addEventListener('click', () => {
        airgapModal.classList.add('hidden');
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
        }
        airgapScannerContainer.innerHTML = '';
        airgapScannerContainer.style.display = 'none';
        airgapQrDisplay.style.display = 'none';
        airgapQrDisplay.innerHTML = '';
    });

    btnAirgapGenerate.addEventListener('click', () => {
        if (html5QrcodeScanner) { html5QrcodeScanner.clear(); html5QrcodeScanner = null; }
        airgapScannerContainer.innerHTML = '';
        airgapScannerContainer.style.display = 'none';
        airgapQrDisplay.style.display = 'block';
        airgapQrDisplay.innerHTML = '';
        
        // Use the Host ID or current peer ID
        const myId = peer ? peer.id : '';
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

    btnAirgapScan.addEventListener('click', () => {
        airgapQrDisplay.style.display = 'none';
        airgapQrDisplay.innerHTML = '';
        airgapScannerContainer.style.display = 'block';
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
        video.style.width = '512px';
        video.style.maxWidth = '100%';
        video.style.border = '2px solid #ff00ff';
        emulatorContainer.insertBefore(video, emulatorContainer.firstChild);
        emulatorCanvas.style.display = 'none';
    }
    video.srcObject = remoteStream;

    // Guest sends inputs to Host
    document.addEventListener('keydown', (e) => {
        const btn = mapKeyToNes(e.key);
        if (btn !== null && connections[0]) {
            connections[0].send({ type: 'EMU_INPUT', event: 'down', button: btn });
        }
    });
    document.addEventListener('keyup', (e) => {
        const btn = mapKeyToNes(e.key);
        if (btn !== null && connections[0]) {
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
        const reader = new FileReader();
        reader.onload = function(evt) {
            initEmulator(evt.target.result);
            broadcastEmulatorStream();
        };
        reader.readAsBinaryString(file);
    });
}

function initEmulator(romBinaryData) {
    if (emuInterval) clearInterval(emuInterval);
    const ctx = emulatorCanvas.getContext('2d');
    const imageData = ctx.createImageData(256, 240);
    
    if (typeof jsnes === 'undefined') {
        alert("jsnes library not loaded!");
        return;
    }

    nes = new jsnes.NES({
        onFrame: function(frameBuffer) {
            for (let i = 0; i < 256 * 240; i++) {
                const pixel = frameBuffer[i];
                imageData.data[i * 4] = pixel & 0xFF;
                imageData.data[i * 4 + 1] = (pixel >> 8) & 0xFF;
                imageData.data[i * 4 + 2] = (pixel >> 16) & 0xFF;
                imageData.data[i * 4 + 3] = 255;
            }
            ctx.putImageData(imageData, 0, 0);
        },
        onAudioSample: function(left, right) { }
    });

    nes.loadROM(romBinaryData);

    emuInterval = setInterval(() => {
        nes.frame();
    }, 1000 / 60);

    // Host listens to its own keys
    document.addEventListener('keydown', (e) => {
        if (!isEmulatorHost) return;
        const btn = mapKeyToNes(e.key);
        if (btn !== null) nes.buttonDown(1, btn);
    });
    document.addEventListener('keyup', (e) => {
        if (!isEmulatorHost) return;
        const btn = mapKeyToNes(e.key);
        if (btn !== null) nes.buttonUp(1, btn);
    });
}

function mapKeyToNes(key) {
    switch (key.toLowerCase()) {
        case 'arrowup': return jsnes.Controller.BUTTON_UP;
        case 'arrowdown': return jsnes.Controller.BUTTON_DOWN;
        case 'arrowleft': return jsnes.Controller.BUTTON_LEFT;
        case 'arrowright': return jsnes.Controller.BUTTON_RIGHT;
        case 'z': return jsnes.Controller.BUTTON_A;
        case 'x': return jsnes.Controller.BUTTON_B;
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
let raycaster, mouse;
let cyberspaceLabelsContainer = null;
let isCyberspacePaused = false;

if (typeof isHost !== 'undefined' && !isHost && btnCyberspace) {
    btnCyberspace.style.display = 'none';
}

if (btnCyberspace) {
    btnCyberspace.addEventListener('click', () => {
        cyberspaceOverlay.classList.remove('hidden');
        initCyberspace();
    });

    btnExitCyberspace.addEventListener('click', () => {
        cyberspaceOverlay.classList.add('hidden');
        if (animationId) cancelAnimationFrame(animationId);
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

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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

    // Host Geometry
    const hostGeometry = new THREE.SphereGeometry(3, 32, 32);
    const hostMaterial = new THREE.MeshBasicMaterial({ color: 0x39ff14, wireframe: true });
    const hostMesh = new THREE.Mesh(hostGeometry, hostMaterial);
    hostMesh.position.set(0, 5, 0);
    hostMesh.userData = { id: 'host', name: 'HOST', color: '#39ff14' };
    scene.add(hostMesh);

    // Particle Stars
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 500;
    const posArray = new Float32Array(starsCount * 3);
    for(let i = 0; i < starsCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 200;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMat = new THREE.PointsMaterial({ size: 0.2, color: 0xff00ff });
    const starsMesh = new THREE.Points(starsGeo, starsMat);
    scene.add(starsMesh);

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
        
        const interactable = [hostMesh, ...Object.values(peerMeshes).map(obj => obj.mesh)];
        const intersects = raycaster.intersectObjects(interactable);
        
        if (intersects.length > 0) {
            const data = intersects[0].object.userData;
            if (data.id !== 'host' && typeof openRadarGuestModal === 'function' && typeof isHost !== 'undefined' && isHost) {
                openRadarGuestModal(data.id, data.name, data.color);
            } else if (data.id === 'host' && typeof openRadarGuestModal === 'function' && typeof isHost !== 'undefined' && !isHost) {
                alert("This is the Host.");
            }
        }
    });

    function animate() {
        animationId = requestAnimationFrame(animate);
        
        if (!isCyberspacePaused) {
            angle += 0.003;
            hostMesh.rotation.y += 0.01;
            starsMesh.rotation.y += 0.0005;
        }

        camera.position.x = 50 * Math.cos(angle);
        camera.position.z = 50 * Math.sin(angle);
        camera.lookAt(0, 5, 0);

        // Render HTML Label for Host
        updateLabel(hostMesh, "root // HOST", "#39ff14");

        if (typeof connections !== 'undefined') {
            const currentPeerIds = connections.map(c => c.peer);
            Object.keys(peerMeshes).forEach(peerId => {
                if (!currentPeerIds.includes(peerId)) {
                    scene.remove(peerMeshes[peerId].mesh);
                    if (peerMeshes[peerId].label) peerMeshes[peerId].label.remove();
                    delete peerMeshes[peerId];
                }
            });

            connections.forEach((conn, index) => {
                const alias = getGuestAlias(conn.peer);
                const colorHex = getGuestColor(conn.peer);
                
                if (!peerMeshes[conn.peer]) {
                    const guestGeo = new THREE.SphereGeometry(2, 16, 16);
                    const guestMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(colorHex), wireframe: true });
                    const guestMesh = new THREE.Mesh(guestGeo, guestMat);
                    guestMesh.userData = { id: conn.peer, name: alias, color: colorHex };
                    scene.add(guestMesh);
                    
                    const label = document.createElement('div');
                    label.style.position = 'absolute';
                    label.style.color = colorHex;
                    label.style.fontFamily = 'monospace';
                    label.style.fontSize = '12px';
                    label.style.textShadow = '0 0 5px ' + colorHex;
                    label.style.background = 'rgba(0,0,0,0.5)';
                    label.style.padding = '2px 5px';
                    label.style.border = '1px solid ' + colorHex;
                    label.style.borderRadius = '3px';
                    label.style.cursor = 'pointer';
                    label.innerText = alias;
                    cyberspaceLabelsContainer.appendChild(label);
                    
                    peerMeshes[conn.peer] = { mesh: guestMesh, label: label, color: colorHex };
                }
                
                const p = peerMeshes[conn.peer];
                if (p.label.innerText !== alias) {
                    p.label.innerText = alias;
                    p.label.style.color = colorHex;
                    p.label.style.borderColor = colorHex;
                    p.mesh.material.color.set(colorHex);
                    p.mesh.userData.name = alias;
                    p.mesh.userData.color = colorHex;
                }

                const gAngle = angle * 2 + (index * (Math.PI * 2 / connections.length));
                p.mesh.position.set(20 * Math.cos(gAngle), 5 + Math.sin(gAngle*3)*3, 20 * Math.sin(gAngle));
                
                if (!isCyberspacePaused) {
                    p.mesh.rotation.y += 0.02;
                    p.mesh.rotation.x += 0.01;
                }
                
                updateLabel(p.mesh, alias, colorHex, p.label);
            });
        }

        renderer.render(scene, camera);
    }
    
    function updateLabel(mesh, text, color, existingLabel) {
        let label = existingLabel;
        if (!label) {
            // Only host uses this dynamic recreation if not stored, but host is static
            if (!mesh.userData.labelEl) {
                mesh.userData.labelEl = document.createElement('div');
                mesh.userData.labelEl.style.position = 'absolute';
                mesh.userData.labelEl.style.color = color;
                mesh.userData.labelEl.style.fontFamily = 'monospace';
                mesh.userData.labelEl.style.fontSize = '14px';
                mesh.userData.labelEl.style.fontWeight = 'bold';
                mesh.userData.labelEl.style.textShadow = '0 0 8px ' + color;
                mesh.userData.labelEl.innerText = text;
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
        label.style.display = 'block';
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
        label.style.transform = `translate(-50%, -100%) translate(${x}px, ${y - 30}px)`;
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
