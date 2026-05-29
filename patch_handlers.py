import sys

def inject():
    with open('app.js', 'r') as f:
        js = f.read()

    # Add Host handler for WHISPER_RELAY
    host_relay = """            } else if (data.type === 'WHISPER_RELAY' && conn.isAuthenticated) {
                if (data.targetId === (peer ? peer.id : null)) {
                    handleWhisper(data);
                } else {
                    const target = connections.find(c => c.peer === data.targetId);
                    if (target && target.open) {
                        target.send({ type: 'WHISPER', fromId: data.fromId, fromAlias: data.fromAlias, fromColor: data.fromColor, msg: data.msg });
                    }
                }
"""
    if "data.type === 'WHISPER_RELAY'" not in js:
        js = js.replace("} else if (data.type === 'CHAT_MSG' && conn.isAuthenticated) {", host_relay + "} else if (data.type === 'CHAT_MSG' && conn.isAuthenticated) {")

    # Add Client handler for PEER_LIST and WHISPER
    client_handlers = """            } else if (data.type === 'PEER_LIST') {
                activePeers = {};
                data.peers.forEach(p => activePeers[p.id] = p);
            } else if (data.type === 'WHISPER') {
                handleWhisper(data);
"""
    if "data.type === 'PEER_LIST'" not in js:
        js = js.replace("} else if (data.type === 'CHAT_MSG') {", client_handlers + "} else if (data.type === 'CHAT_MSG') {")

    with open('app.js', 'w') as f:
        f.write(js)
    
    print("Injected Whisper/Radar handlers")

if __name__ == '__main__':
    inject()
