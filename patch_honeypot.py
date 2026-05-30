import sys

def inject():
    with open('index.html', 'r') as f:
        html = f.read()

    honeypot_ctx = """        <div class="context-item" id="ctx-honeypot" style="color: #ff00ff;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>
            Toggle Honey-Pot
        </div>
"""
    if "id=\"ctx-honeypot\"" not in html:
        html = html.replace('<div class="context-item" id="ctx-delete"', honeypot_ctx + '        <div class="context-item" id="ctx-delete"')

    lockdown_overlay = """    <!-- HONEYPOT LOCKDOWN OVERLAY -->
    <div id="lockdown-overlay" class="modal-overlay hidden" style="z-index: 10000; background: rgba(255, 0, 0, 0.9); flex-direction: column; text-align: center; justify-content: center; align-items: center;">
        <h1 style="color: #fff; font-size: 4rem; text-shadow: 0 0 20px #000; animation: glitch-anim 0.2s infinite; font-family: var(--font-mono);">INTRUSION DETECTED</h1>
        <h2 style="color: #000; font-size: 2rem; margin-top: 2rem; background: #fff; padding: 10px 20px;">NETWORK LOCKDOWN INITIATED</h2>
        <p style="color: #fff; margin-top: 2rem; font-size: 1.2rem;">CONNECTION TERMINATED BY HOST.</p>
    </div>
"""
    if "id=\"lockdown-overlay\"" not in html:
        html = html.replace('<!-- MODALS -->', '<!-- MODALS -->\n' + lockdown_overlay)
        if "<!-- MODALS -->" not in html: # Fallback if MODALS was deleted
            html = html.replace('<!-- THEME MODAL -->', lockdown_overlay + '\n    <!-- THEME MODAL -->')

    with open('index.html', 'w') as f:
        f.write(html)

    # JS Logic
    with open('app.js', 'r') as f:
        js = f.read()

    # 1. Context Menu UI
    ctx_logic = """
const ctxHoneypot = document.getElementById('ctx-honeypot');
if (ctxHoneypot) {
    ctxHoneypot.addEventListener('click', () => {
        if (!contextTargetId) return;
        const node = vfs.findNode(contextTargetId);
        if (node && node.type === 'folder') {
            node.isHoneyPot = !node.isHoneyPot;
            saveVFSToDB();
            renderHostExplorer();
            // We do not broadcast honey-pot status to clients!
        }
        hideContextMenu();
    });
}
"""
    if "ctxHoneypot.addEventListener" not in js:
        js = js + ctx_logic

    # 2. visual indicator for Host
    # Find renderHostExplorer where it draws the item
    old_render = "if (child.isHidden) {"
    new_render = """if (child.isHoneyPot) {
            item.style.borderColor = '#ff00ff';
            item.style.boxShadow = '0 0 10px #ff00ff';
        }
        if (child.isHidden) {"""
    js = js.replace(old_render, new_render)

    # 3. Auth Attempt logic
    old_auth = """            } else if (data.type === 'FOLDER_AUTH_ATTEMPT' && conn.isAuthenticated) {
                const node = vfs.findNode(data.folderId);
                if (node && node.type === 'folder' && node.password === data.password) {
                    conn.unlockedFolders.add(node.id);
                    conn.send({ type: 'FOLDER_AUTH_SUCCESS', folderId: node.id });
                    conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders) });
                } else {
                    conn.send({ type: 'FOLDER_AUTH_FAIL', folderId: data.folderId });
                }"""
    
    new_auth = """            } else if (data.type === 'FOLDER_AUTH_ATTEMPT' && conn.isAuthenticated) {
                const node = vfs.findNode(data.folderId);
                if (node && node.type === 'folder') {
                    if (node.password === data.password && !node.isHoneyPot) {
                        conn.unlockedFolders.add(node.id);
                        conn.send({ type: 'FOLDER_AUTH_SUCCESS', folderId: node.id });
                        conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders) });
                    } else {
                        conn.send({ type: 'FOLDER_AUTH_FAIL', folderId: data.folderId });
                        if (node.isHoneyPot) {
                            conn.honeyPotStrikes = (conn.honeyPotStrikes || 0) + 1;
                            if (conn.honeyPotStrikes >= 3) {
                                conn.send({ type: 'HONEYPOT_LOCKDOWN' });
                                setTimeout(() => conn.close(), 500);
                            }
                        }
                    }
                }"""
    js = js.replace(old_auth, new_auth)

    # 4. Client handler for HONEYPOT_LOCKDOWN
    client_lockdown = """            } else if (data.type === 'HONEYPOT_LOCKDOWN') {
                document.getElementById('lockdown-overlay').classList.remove('hidden');
"""
    if "HONEYPOT_LOCKDOWN" not in js:
        js = js.replace("} else if (data.type === 'SERVER_BURNED') {", client_lockdown + "} else if (data.type === 'SERVER_BURNED') {")


    with open('app.js', 'w') as f:
        f.write(js)
    
    print("Injected Honey-Pot System")

if __name__ == '__main__':
    inject()
