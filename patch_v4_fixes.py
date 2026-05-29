import sys

def inject():
    with open('app.js', 'r') as f:
        js = f.read()

    # Fix 1: Dead Drop context menu
    old_ctx = """    ctxDeaddrop.addEventListener('click', () => {
        const node = selectedNodes.values().next().value;
        if (node) {"""
    new_ctx = """    ctxDeaddrop.addEventListener('click', () => {
        if (!contextTargetId) return;
        const node = vfs.findNode(contextTargetId);
        if (node) {"""
    js = js.replace(old_ctx, new_ctx)

    # Fix 2: Radar profile
    old_peers = "const peers = connections.filter(c => c.open && c.alias).map(c => ({ id: c.peer, alias: c.alias, color: c.color }));"
    new_peers = "const peers = connections.filter(c => c.open && c.profile).map(c => ({ id: c.peer, alias: c.profile.name, color: c.profile.color }));"
    js = js.replace(old_peers, new_peers)

    # We also need to make sure broadcastPeers is called when PROFILE_UPDATE is received!
    js = js.replace("conn.profile = { name: data.name, color: data.color };", "conn.profile = { name: data.name, color: data.color };\n                broadcastPeers();")

    with open('app.js', 'w') as f:
        f.write(js)
    
    print("Fixed Dead Drop ctx and Radar profile")

if __name__ == '__main__':
    inject()
