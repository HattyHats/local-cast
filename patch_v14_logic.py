import re

with open('app.js', 'r') as f:
    content = f.read()

# 1. Global Event Listeners & Helper Functions
helpers = """
// --- V14 LOGIC ---
btnChatToggle.addEventListener('click', () => chatSidebar.classList.toggle('hidden'));
btnCloseChat.addEventListener('click', () => chatSidebar.classList.add('hidden'));

function appendChatMessage(sender, text, type) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    msg.innerHTML = `<div class="sender">${sender}</div><div>${text}</div>`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

btnSendChat.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    appendChatMessage('You', text, 'self');
    
    if (isHost) {
        Object.values(connections).forEach(c => {
            if (c.open && c.isAuthenticated) c.send({ type: 'CHAT_MSG', sender: 'Host', text });
        });
    } else {
        if (typeof hostConnection !== 'undefined' && hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'CHAT_MSG', sender: 'Guest', text });
        }
    }
});
chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') btnSendChat.click(); });

hostSearch.addEventListener('input', (e) => { hostSearchQuery = e.target.value.toLowerCase(); renderHostExplorer(); });
clientSearch.addEventListener('input', (e) => { clientSearchQuery = e.target.value.toLowerCase(); renderClientExplorer(); });

btnViewToggleHost.addEventListener('click', () => {
    isListViewHost = !isListViewHost;
    hostExplorerGrid.classList.toggle('list-view', isListViewHost);
});
btnViewToggleClient.addEventListener('click', () => {
    isListViewClient = !isListViewClient;
    clientExplorerGrid.classList.toggle('list-view', isListViewClient);
});

btnNewNote.addEventListener('click', () => {
    editorFilename.value = 'Untitled.txt';
    editorTextarea.value = '';
    editorModal.classList.remove('hidden');
});
btnCloseEditor.addEventListener('click', () => editorModal.classList.add('hidden'));

btnSaveNote.addEventListener('click', async () => {
    const text = editorTextarea.value;
    let name = editorFilename.value.trim() || 'Untitled.txt';
    if (!name.endsWith('.txt') && !name.endsWith('.md')) name += '.txt';
    
    const blob = new Blob([text], { type: 'text/plain' });
    const file = new File([blob], name, { type: 'text/plain' });
    
    const id = "file_" + Date.now();
    const node = { id, type: 'file', name, size: file.size, mime: file.type, parent: vfs.currentDir, fileObj: file };
    
    // if editing existing, overwrite
    const existing = vfs.currentDir.children.find(c => c.name === name);
    if (existing) {
        existing.fileObj = file;
        existing.size = file.size;
    } else {
        vfs.currentDir.children.push(node);
    }
    
    editorModal.classList.add('hidden');
    saveVFSToDB();
    renderHostExplorer();
    broadcastTree();
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.context-menu')) contextMenu.classList.add('hidden');
});

ctxDelete.addEventListener('click', () => {
    if (!contextTargetId) return;
    const node = vfs.findNode(contextTargetId);
    if (node && node.parent) {
        node.parent.children = node.parent.children.filter(c => c.id !== contextTargetId);
        contextTargetId = null;
        contextMenu.classList.add('hidden');
        saveVFSToDB();
        renderHostExplorer();
        broadcastTree();
    }
});

ctxRename.addEventListener('click', () => {
    if (!contextTargetId) return;
    const node = vfs.findNode(contextTargetId);
    if (node) {
        const newName = prompt("Enter new name:", node.name);
        if (newName && newName.trim()) {
            node.name = newName.trim();
            contextTargetId = null;
            contextMenu.classList.add('hidden');
            saveVFSToDB();
            renderHostExplorer();
            broadcastTree();
        }
    }
});

function searchVFS(dir, query, results) {
    dir.children.forEach(c => {
        if (c.name.toLowerCase().includes(query)) results.push(c);
        if (c.type === 'folder') searchVFS(c, query, results);
    });
}
// --- END V14 LOGIC ---

"""

content = content.replace("window.onload = runBootSequence;", helpers + "window.onload = runBootSequence;")

# 2. Update renderHostExplorer & renderClientExplorer to use search
host_render_old = "vfs.currentDir.children.forEach(child => {"
host_render_new = """let itemsToRender = vfs.currentDir.children;
    if (hostSearchQuery) {
        itemsToRender = [];
        searchVFS(vfs.root, hostSearchQuery, itemsToRender);
    }
    itemsToRender.forEach(child => {"""
content = content.replace(host_render_old, host_render_new)

client_render_old = "clientCurrentDir.children.forEach(child => {"
client_render_new = """let itemsToRender = clientCurrentDir.children;
    if (clientSearchQuery) {
        itemsToRender = [];
        searchVFS(clientVFS, clientSearchQuery, itemsToRender);
    }
    itemsToRender.forEach(child => {"""
content = content.replace(client_render_old, client_render_new)

# 3. Add Context Menu Binding and Editor DblClick to Host Explorer items
host_item_binding_old = "        hostExplorerGrid.appendChild(item);"
host_item_binding_new = """        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            contextTargetId = child.id;
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.classList.remove('hidden');
        });
        
        if (child.type === 'file' && (child.name.endsWith('.txt') || child.name.endsWith('.md'))) {
            item.addEventListener('dblclick', async () => {
                if (child.fileObj) {
                    const text = await child.fileObj.text();
                    editorFilename.value = child.name;
                    editorTextarea.value = text;
                    editorModal.classList.remove('hidden');
                }
            });
        }
        
        hostExplorerGrid.appendChild(item);"""
content = content.replace(host_item_binding_old, host_item_binding_new)

# 4. Host Chat Receiving
host_chat_old = "} else if (data.type === 'REQUEST_FILE' && conn.isAuthenticated) {"
host_chat_new = """} else if (data.type === 'CHAT_MSG' && conn.isAuthenticated) {
                appendChatMessage('Guest', data.text, 'other');
                Object.values(connections).forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated) {
                        c.send({ type: 'CHAT_MSG', sender: 'Guest', text: data.text });
                    }
                });
            } else if (data.type === 'REQUEST_FILE' && conn.isAuthenticated) {"""
content = content.replace(host_chat_old, host_chat_new)

# 5. Client Chat Receiving
client_chat_old = "} else if (data.type === 'SERVER_BURNED') {"
client_chat_new = """} else if (data.type === 'CHAT_MSG') {
                appendChatMessage(data.sender, data.text, 'other');
            } else if (data.type === 'SERVER_BURNED') {"""
content = content.replace(client_chat_old, client_chat_new)

with open('app.js', 'w') as f:
    f.write(content)
