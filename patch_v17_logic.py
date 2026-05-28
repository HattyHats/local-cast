import re

with open('app.js', 'r') as f:
    content = f.read()

# 1. Add new variables and toast function
new_vars = """
const chatBadge = document.getElementById('chat-badge');
const toastContainer = document.getElementById('toast-container');

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    // Play a subtle ding sound
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch(e) {}
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function notifyFileAdded(filename) {
    showToast(`New file: ${filename}`);
    if (isHost) {
        Object.values(connections).forEach(c => {
            if (c.open && c.isAuthenticated) c.send({ type: 'FILE_ADDED_TOAST', filename });
        });
    }
}
"""
content = content.replace("let activeAuthFolderId = null;", "let activeAuthFolderId = null;" + new_vars)

# 2. Update Chat Badge logic
chat_toggle_old = "btnChatToggle.addEventListener('click', () => chatSidebar.classList.toggle('hidden'));"
chat_toggle_new = "btnChatToggle.addEventListener('click', () => { chatSidebar.classList.toggle('hidden'); chatBadge.classList.add('hidden'); });"
content = content.replace(chat_toggle_old, chat_toggle_new)

append_chat_old = """    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}"""
append_chat_new = """    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (type !== 'self' && chatSidebar.classList.contains('hidden') && type !== 'system') {
        chatBadge.classList.remove('hidden');
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } catch(e) {}
    }
}"""
content = content.replace(append_chat_old, append_chat_new)

# 3. Add to New Note completion
new_note_old = """    saveVFSToDB();
    renderHostExplorer();
    broadcastTree();
});"""
new_note_new = """    saveVFSToDB();
    renderHostExplorer();
    broadcastTree();
    notifyFileAdded(name);
});"""
content = content.replace(new_note_old, new_note_new)

# 4. Add to handleFiles (Host drop/upload completion)
handle_files_old = """    saveVFSToDB();
    renderHostExplorer();
    broadcastTree();
}"""
handle_files_new = """    saveVFSToDB();
    renderHostExplorer();
    broadcastTree();
    if (files.length > 0) notifyFileAdded(files.length === 1 ? files[0].name : `${files.length} items`);
}"""
content = content.replace(handle_files_old, handle_files_new)

# 5. Add to Client FILE_ADDED_TOAST receiver
client_auth_old = """} else if (data.type === 'FOLDER_AUTH_SUCCESS') {"""
client_auth_new = """} else if (data.type === 'FILE_ADDED_TOAST') {
                showToast(`New file: ${data.filename}`);
            } else if (data.type === 'FOLDER_AUTH_SUCCESS') {"""
content = content.replace(client_auth_old, client_auth_new)

# 6. Add to Guest Upload completion (on Host)
guest_upload_old = """                            const blob = new Blob(transfer.chunks, { type: transfer.mime });
                            const fileObj = new File([blob], transfer.name, { type: transfer.mime });
                            vfs.root.children.push({ id: transfer.id, type: 'file', name: transfer.name, size: fileObj.size, mime: transfer.mime, parent: vfs.root, fileObj });
                            saveVFSToDB();
                            if (vfs.currentDir === vfs.root) renderHostExplorer();
                            broadcastTree();
                            conn.send({ type: 'UPLOAD_COMPLETE' });
                            delete incomingTransfers[data.id];"""
guest_upload_new = """                            const blob = new Blob(transfer.chunks, { type: transfer.mime });
                            const fileObj = new File([blob], transfer.name, { type: transfer.mime });
                            vfs.root.children.push({ id: transfer.id, type: 'file', name: transfer.name, size: fileObj.size, mime: transfer.mime, parent: vfs.root, fileObj });
                            saveVFSToDB();
                            if (vfs.currentDir === vfs.root) renderHostExplorer();
                            broadcastTree();
                            conn.send({ type: 'UPLOAD_COMPLETE' });
                            delete incomingTransfers[data.id];
                            notifyFileAdded(transfer.name);"""
content = content.replace(guest_upload_old, guest_upload_new)

with open('app.js', 'w') as f:
    f.write(content)
