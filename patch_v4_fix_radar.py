import sys

def inject():
    with open('app.js', 'r') as f:
        js = f.read()
    
    # 1. Global activePeers for clients
    if "let activePeers = {};" not in js:
        js = js.replace("let radarBlips = [];", "let radarBlips = [];\nlet activePeers = {};")
    
    # 2. Host broadcast function
    broadcast_logic = """
function broadcastPeers() {
    if (!isHost) return;
    const peers = connections.filter(c => c.open && c.alias).map(c => ({ id: c.peer, alias: c.alias, color: c.color }));
    connections.forEach(c => {
        if (c.open) c.send({ type: 'PEER_LIST', peers });
    });
    // Update host's own list
    activePeers = {};
    peers.forEach(p => activePeers[p.id] = p);
}
"""
    if "function broadcastPeers()" not in js:
        js = js.replace("function broadcastTree() {", broadcast_logic + "\nfunction broadcastTree() {")

    # 3. Call broadcastPeers when someone joins or leaves
    # Search for connections.push and connections = connections.filter
    js = js.replace("connections.push(conn);", "connections.push(conn);\n        broadcastPeers();")
    js = js.replace("connections = connections.filter(c => c !== conn);", "connections = connections.filter(c => c !== conn);\n            broadcastPeers();")
    # Also when they AUTH and get their alias set
    js = js.replace("conn.alias = data.alias;", "conn.alias = data.alias;\n                    broadcastPeers();")

    # 4. Client handles PEER_LIST
    peer_list_case = """
                case 'PEER_LIST':
                    activePeers = {};
                    data.peers.forEach(p => activePeers[p.id] = p);
                    break;
"""
    if "case 'PEER_LIST':" not in js:
        js = js.replace("case 'BURN_NOTICE':", peer_list_case + "                case 'BURN_NOTICE':")

    # 5. Fix drawRadar to use activePeers instead of scratchpadAliases
    old_radar = """        for (const [id, data] of Object.entries(scratchpadAliases)) {"""
    new_radar = """        for (const [id, data] of Object.entries(activePeers)) {"""
    js = js.replace(old_radar, new_radar)

    with open('app.js', 'w') as f:
        f.write(js)
    
    print("Fixed Radar Reference Error")

if __name__ == '__main__':
    inject()
