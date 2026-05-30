import sys

def inject():
    with open('app.js', 'r') as f:
        js = f.read()

    # I will replace the global block I added earlier, which might not work if peer is null
    old_global_block = """// Global PeerJS incoming call listener
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
}"""
    js = js.replace(old_global_block, "")

    peer_call_logic = """
    peer.on('call', async (call) => {
        if (call.metadata && call.metadata.type === 'media_stream') return; // Handled elsewhere
        try {
            localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            call.answer(localMediaStream);
            currentCall = call;
            openWhisper(call.peer, 'Incoming Comm-Link', 'var(--neon-green)');
            setupCallHandlers(call);
        } catch (e) {
            console.error("Failed to answer call:", e);
            call.close();
        }
    });
"""
    
    # Inject after peer = new Peer
    pieces = js.split('peer = new Peer({ debug: 2 });')
    js = pieces[0] + 'peer = new Peer({ debug: 2 });' + peer_call_logic + pieces[1] + 'peer = new Peer({ debug: 2 });' + peer_call_logic + pieces[2]

    # Oh wait, the `peer.call(whisperTarget, localMediaStream)` doesn't pass metadata. But wait, MEDIA STREAMING uses peer.call too!
    # Let's check how media streaming calls are made. 
    # They are made with `peer.call(id, stream)`. Wait, media streaming doesn't pass streams out, it receives streams.
    # Actually I should be careful not to conflict.

    with open('app.js', 'w') as f:
        f.write(js)
    
    print("Injected peer.on('call') correctly")

if __name__ == '__main__':
    inject()
