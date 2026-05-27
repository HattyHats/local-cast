import re

with open('app.js', 'r') as f:
    content = f.read()

# 1. Add new DOM elements to vars
new_vars = """
const ctxLock = document.getElementById('ctx-lock');
const folderPasswordModal = document.getElementById('folder-password-modal');
const folderPasswordInput = document.getElementById('folder-password-input');
const btnSubmitFolderPassword = document.getElementById('btn-submit-folder-password');
const btnCancelFolderPassword = document.getElementById('btn-cancel-folder-password');
const folderPasswordError = document.getElementById('folder-password-error');
let activeAuthFolderId = null;
"""
content = content.replace("const ctxDelete = document.getElementById('ctx-delete');", "const ctxDelete = document.getElementById('ctx-delete');" + new_vars)

# 2. Add connection prototype for unlockedFolders
auth_init_old = "    connection.isAuthenticated = false;"
auth_init_new = "    connection.isAuthenticated = false;\n    connection.unlockedFolders = new Set();"
content = content.replace(auth_init_old, auth_init_new)

# 3. Update VFS getTree to accept unlockedSet
vfs_gettree_old = """    getTree() {
        function clone(node) {
            const n = { id: node.id, type: node.type, name: node.name, size: node.size, mime: node.mime };
            if (node.children) n.children = node.children.map(clone);
            return n;
        }
        return clone(this.root);
    }"""
vfs_gettree_new = """    getTree(unlockedSet = new Set()) {
        function clone(node) {
            const n = { id: node.id, type: node.type, name: node.name, size: node.size, mime: node.mime, isLocked: !!node.password };
            if (node.children) {
                if (node.password && !unlockedSet.has(node.id)) {
                    n.children = []; // Hidden
                } else {
                    n.children = node.children.map(clone);
                }
            }
            return n;
        }
        return clone(this.root);
    }"""
content = content.replace(vfs_gettree_old, vfs_gettree_new)

# 4. Update broadcastTree to use connection-specific trees
broadcast_old = """function broadcastTree() {
    const tree = vfs.getTree();
    Object.values(connections).forEach(c => {
        if (c.open && c.isAuthenticated) c.send({ type: 'TREE', tree });
    });
}"""
broadcast_new = """function broadcastTree() {
    Object.values(connections).forEach(c => {
        if (c.open && c.isAuthenticated) {
            c.send({ type: 'TREE', tree: vfs.getTree(c.unlockedFolders) });
        }
    });
}"""
content = content.replace(broadcast_old, broadcast_new)

# 5. Add ctx-lock handler
ctx_lock_logic = """
ctxLock.addEventListener('click', () => {
    if (!contextTargetId) return;
    const node = vfs.findNode(contextTargetId);
    if (node && node.type === 'folder') {
        if (node.password) {
            if (confirm("Remove password from this folder?")) {
                delete node.password;
            }
        } else {
            const pwd = prompt("Enter a password to lock this folder:");
            if (pwd) node.password = pwd;
        }
        contextTargetId = null;
        contextMenu.classList.add('hidden');
        saveVFSToDB();
        renderHostExplorer();
        broadcastTree();
    } else {
        alert("You can only lock folders.");
        contextMenu.classList.add('hidden');
    }
});
"""
content = content.replace("ctxDelete.addEventListener('click', () => {", ctx_lock_logic + "\nctxDelete.addEventListener('click', () => {")

# 6. Show Lock Icon in renderHostExplorer and renderClientExplorer
icon_folder_old = """`<svg class="item-icon folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>` :"""
icon_folder_new = """`<svg class="item-icon folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>${child.isLocked || child.password ? '<rect x="15" y="15" width="8" height="8" fill="var(--bg-card)" stroke="none"></rect><rect x="16" y="18" width="6" height="4" rx="1" fill="var(--neon-red)" stroke="var(--neon-red)"></rect><path d="M17 18V16a2 2 0 0 1 4 0v2" stroke="var(--neon-red)"></path>' : ''}</svg>` :"""
content = content.replace(icon_folder_old, icon_folder_new)
content = content.replace(icon_folder_old, icon_folder_new) # Replace in both renderHost and renderClient

# 7. Add FOLDER_AUTH to Host
host_auth_old = """} else if (data.type === 'REQUEST_FILE' && conn.isAuthenticated) {"""
host_auth_new = """} else if (data.type === 'FOLDER_AUTH_ATTEMPT' && conn.isAuthenticated) {
                const node = vfs.findNode(data.folderId);
                if (node && node.type === 'folder' && node.password === data.password) {
                    conn.unlockedFolders.add(node.id);
                    conn.send({ type: 'FOLDER_AUTH_SUCCESS', folderId: node.id });
                    conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders) });
                } else {
                    conn.send({ type: 'FOLDER_AUTH_FAIL' });
                }
            } else if (data.type === 'REQUEST_FILE' && conn.isAuthenticated) {"""
content = content.replace(host_auth_old, host_auth_new)

# 8. Add FOLDER_AUTH Client Logic & Prompt
client_nav_old = """        item.addEventListener('click', (e) => {
            if (child.type === 'folder') {
                clientCurrentDir = child;
                renderClientExplorer();
            } else {"""
client_nav_new = """        item.addEventListener('click', (e) => {
            if (child.type === 'folder') {
                if (child.isLocked && (!child.children || child.children.length === 0)) {
                    activeAuthFolderId = child.id;
                    folderPasswordInput.value = '';
                    folderPasswordError.classList.add('hidden');
                    folderPasswordModal.classList.remove('hidden');
                } else {
                    clientCurrentDir = child;
                    renderClientExplorer();
                }
            } else {"""
content = content.replace(client_nav_old, client_nav_new)

# 9. FOLDER_AUTH Client Listeners & Response
client_handlers_old = """    btnSubmitPassword.addEventListener('click', () => {"""
client_handlers_new = """    btnSubmitFolderPassword.addEventListener('click', () => {
        const pwd = folderPasswordInput.value;
        if (pwd && hostConnection && hostConnection.open && activeAuthFolderId) {
            hostConnection.send({ type: 'FOLDER_AUTH_ATTEMPT', folderId: activeAuthFolderId, password: pwd });
        }
    });
    btnCancelFolderPassword.addEventListener('click', () => folderPasswordModal.classList.add('hidden'));

    btnSubmitPassword.addEventListener('click', () => {"""
content = content.replace(client_handlers_old, client_handlers_new)

client_resp_old = """} else if (data.type === 'SERVER_BURNED') {"""
client_resp_new = """} else if (data.type === 'FOLDER_AUTH_SUCCESS') {
                folderPasswordModal.classList.add('hidden');
                // The updated TREE will arrive next and we can navigate in
            } else if (data.type === 'FOLDER_AUTH_FAIL') {
                folderPasswordError.classList.remove('hidden');
            } else if (data.type === 'SERVER_BURNED') {"""
content = content.replace(client_resp_old, client_resp_new)

# 10. Text File Preview (app.js bottom)
text_preview_old = """        if (mime.startsWith('image/')) {
            previewIconContainer.innerHTML = `<img src="${url}" style="max-width: 100%; max-height: 250px; border-radius: 8px;">`;
        } else if (mime.startsWith('video/')) {"""
text_preview_new = """        if (mime.startsWith('image/')) {
            previewIconContainer.innerHTML = `<img src="${url}" style="max-width: 100%; max-height: 250px; border-radius: 8px;">`;
        } else if (mime.startsWith('text/') || mime === '' || data.name.endsWith('.md')) {
            const text = await blob.text();
            previewIconContainer.innerHTML = `<div style="max-width: 100%; max-height: 250px; overflow: auto; background: var(--bg-main); padding: 1rem; border-radius: 8px; font-family: var(--font-mono); font-size: 0.8rem; text-align: left; color: var(--text-main); white-space: pre-wrap; word-break: break-word;">${text.replace(/</g, '&lt;')}</div>`;
        } else if (mime.startsWith('video/')) {"""
content = content.replace(text_preview_old, text_preview_new)

with open('app.js', 'w') as f:
    f.write(content)
