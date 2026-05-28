with open('app.js', 'r') as f:
    content = f.read()

intercom_logic = """
// --- INTERCOM LOGIC ---
const btnIntercom = document.getElementById('btn-intercom');
let localAudioStream = null;
let inIntercom = false;
let activeCalls = {};
let intercomUsers = new Set();

function playAudioStream(stream, peerId) {
    if (document.getElementById(`audio-${peerId}`)) return;
    const audio = document.createElement('audio');
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.id = `audio-${peerId}`;
    document.body.appendChild(audio);
}

function cleanupAudio(peerId) {
    const audio = document.getElementById(`audio-${peerId}`);
    if (audio) audio.remove();
    if (activeCalls[peerId]) {
        activeCalls[peerId].close();
        delete activeCalls[peerId];
    }
}

if (btnIntercom) {
    btnIntercom.addEventListener('click', async () => {
        if (!inIntercom) {
            try {
                localAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                inIntercom = true;
                btnIntercom.style.color = 'var(--neon-green)';
                btnIntercom.style.borderColor = 'var(--neon-green)';
                
                peer.on('call', (call) => {
                    if (!inIntercom) { call.close(); return; }
                    call.answer(localAudioStream);
                    call.on('stream', (remoteStream) => playAudioStream(remoteStream, call.peer));
                    call.on('close', () => cleanupAudio(call.peer));
                    activeCalls[call.peer] = call;
                });

                if (isHost) {
                    intercomUsers.add(peer.id);
                    intercomUsers.forEach(id => {
                        if (id !== peer.id && inIntercom) {
                            const call = peer.call(id, localAudioStream);
                            call.on('stream', (remoteStream) => playAudioStream(remoteStream, id));
                            call.on('close', () => cleanupAudio(id));
                            activeCalls[id] = call;
                        }
                    });
                } else if (hostConnection && hostConnection.open) {
                    hostConnection.send({ type: 'INTERCOM_JOIN', peerId: peer.id });
                }
            } catch(e) {
                alert("Microphone access denied or not available.");
            }
        } else {
            inIntercom = false;
            btnIntercom.style.color = '';
            btnIntercom.style.borderColor = '';
            if (localAudioStream) {
                localAudioStream.getTracks().forEach(t => t.stop());
                localAudioStream = null;
            }
            Object.keys(activeCalls).forEach(id => cleanupAudio(id));
            if (isHost) {
                intercomUsers.delete(peer.id);
            } else if (hostConnection && hostConnection.open) {
                hostConnection.send({ type: 'INTERCOM_LEAVE', peerId: peer.id });
            }
        }
    });
}
"""

content += "\n" + intercom_logic

# Add Host Handlers
old_host_chat = """            } else if (data.type === 'REQUEST_WHITEBOARD' && conn.isAuthenticated) {"""
new_host_chat = """            } else if (data.type === 'REQUEST_WHITEBOARD' && conn.isAuthenticated) {
                if (canvas) conn.send({ type: 'WHITEBOARD_SYNC', image: canvas.toDataURL() });
            } else if (data.type === 'INTERCOM_JOIN' && conn.isAuthenticated) {
                intercomUsers.add(data.peerId);
                const others = Array.from(intercomUsers).filter(id => id !== data.peerId);
                conn.send({ type: 'INTERCOM_LIST', users: others });
            } else if (data.type === 'INTERCOM_LEAVE' && conn.isAuthenticated) {
                intercomUsers.delete(data.peerId);
            } else if (data.type === 'REQUEST_SCRATCHPAD' && conn.isAuthenticated) {"""
content = content.replace(old_host_chat, new_host_chat)

# Add Client Handlers
old_client_recv = """            } else if (data.type === 'WHITEBOARD_SYNC') {"""
new_client_recv = """            } else if (data.type === 'INTERCOM_LIST') {
                data.users.forEach(id => {
                    if (id !== peer.id && inIntercom) {
                        const call = peer.call(id, localAudioStream);
                        call.on('stream', (remoteStream) => playAudioStream(remoteStream, id));
                        call.on('close', () => cleanupAudio(id));
                        activeCalls[id] = call;
                    }
                });
            } else if (data.type === 'WHITEBOARD_SYNC') {"""
content = content.replace(old_client_recv, new_client_recv)

with open('app.js', 'w') as f:
    f.write(content)
