import sys

def inject():
    with open('index.html', 'r') as f:
        html = f.read()

    # 1. HTML Additions
    old_whisper_header = """            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0; color: var(--neon-pink);"><span id="whisper-target-name">Whisper</span></h2>
                <button id="btn-close-whisper" class="btn-icon">"""
    
    new_whisper_header = """            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0; color: var(--neon-pink);"><span id="whisper-target-name">Whisper</span></h2>
                <div style="display: flex; gap: 0.5rem;">
                    <button id="btn-start-call" class="btn-icon" title="Start Secure Comm-Link" style="color: var(--neon-green);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </button>
                    <button id="btn-close-whisper" class="btn-icon">"""
    if 'id="btn-start-call"' not in html:
        html = html.replace(old_whisper_header, new_whisper_header)
    
    old_whisper_messages = """<div id="whisper-messages" style="height: 300px; overflow-y: auto; background: #000; border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.85rem;"></div>"""
    new_whisper_messages = """<div id="active-call-banner" class="hidden" style="background: rgba(57, 255, 20, 0.1); border: 1px solid var(--neon-green); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--neon-green); font-family: var(--font-mono); font-weight: bold; animation: glitch-anim 2s infinite;">SECURE COMM-LINK ACTIVE</span>
                <button id="btn-end-call" class="custom-btn" style="background: transparent; border-color: var(--neon-red); color: var(--neon-red); padding: 0.25rem 0.5rem;">END CALL</button>
            </div>
            <div id="whisper-messages" style="height: 300px; overflow-y: auto; background: #000; border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.85rem;"></div>"""
    if 'id="active-call-banner"' not in html:
        html = html.replace(old_whisper_messages, new_whisper_messages)

    if '<audio id="comm-link-audio" autoplay></audio>' not in html:
        html = html.replace('<!-- MODALS -->', '<audio id="comm-link-audio" autoplay></audio>\n    <!-- MODALS -->')

    with open('index.html', 'w') as f:
        f.write(html)


    # 2. JS Logic
    with open('app.js', 'r') as f:
        js = f.read()

    js_commlink = """
// --- COMM-LINK LOGIC ---
const btnStartCall = document.getElementById('btn-start-call');
const btnEndCall = document.getElementById('btn-end-call');
const activeCallBanner = document.getElementById('active-call-banner');
const commLinkAudio = document.getElementById('comm-link-audio');

let currentCall = null;
let localMediaStream = null;

async function startCommLink() {
    try {
        localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        currentCall = peer.call(whisperTarget, localMediaStream);
        setupCallHandlers(currentCall);
    } catch (e) {
        alert("Microphone access denied.");
    }
}

function setupCallHandlers(call) {
    activeCallBanner.classList.remove('hidden');
    
    call.on('stream', (remoteStream) => {
        commLinkAudio.srcObject = remoteStream;
    });
    
    call.on('close', () => {
        endCommLink();
    });
}

function endCommLink() {
    if (currentCall) {
        currentCall.close();
        currentCall = null;
    }
    if (localMediaStream) {
        localMediaStream.getTracks().forEach(t => t.stop());
        localMediaStream = null;
    }
    commLinkAudio.srcObject = null;
    if (activeCallBanner) activeCallBanner.classList.add('hidden');
}

if (btnStartCall) {
    btnStartCall.addEventListener('click', startCommLink);
}
if (btnEndCall) {
    btnEndCall.addEventListener('click', endCommLink);
}

// Global PeerJS incoming call listener
// Note: ensure peer.on('call') is registered globally
if (peer) {
    peer.on('call', async (call) => {
        // Automatically accept incoming comm-links for now to fit the hacker theme
        try {
            localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            call.answer(localMediaStream);
            currentCall = call;
            
            // Open whisper modal if not open to show active call UI
            openWhisper(call.peer, 'Incoming Caller', 'var(--neon-green)');
            setupCallHandlers(call);
        } catch (e) {
            console.error("Failed to answer call:", e);
            call.close();
        }
    });
}
"""
    if "COMM-LINK LOGIC" not in js:
        js = js + js_commlink

    with open('app.js', 'w') as f:
        f.write(js)
    
    print("Injected Comm-Link")

if __name__ == '__main__':
    inject()
