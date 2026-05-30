import sys
import re

def inject():
    with open('app.js', 'r') as f:
        js = f.read()

    # Find the btnIntercom block and remove it
    # It starts around: const btnIntercom = document.getElementById('btn-intercom');
    # And ends after the try-catch block for btnIntercom.addEventListener
    
    # Let's just use regex or simple string replacement for the known btnIntercom declarations.
    # It might be easier to just comment out the btnIntercom.addEventListener block.

    block_to_remove = """    btnIntercom.addEventListener('click', async () => {
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
            btnIntercom.style.color = 'var(--text-main)';
            btnIntercom.style.borderColor = 'var(--border-color)';
            if (localAudioStream) {
                localAudioStream.getTracks().forEach(t => t.stop());
                localAudioStream = null;
            }
            Object.values(activeCalls).forEach(call => call.close());
            activeCalls = {};
            if (isHost) {
                intercomUsers.delete(peer.id);
            } else if (hostConnection && hostConnection.open) {
                hostConnection.send({ type: 'INTERCOM_LEAVE', peerId: peer.id });
            }
        }
    });"""

    if block_to_remove in js:
        js = js.replace(block_to_remove, "/* INTERCOM REMOVED */")
    
    with open('app.js', 'w') as f:
        f.write(js)
    
    print("Removed old intercom")

if __name__ == '__main__':
    inject()
