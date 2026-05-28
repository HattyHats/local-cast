import re

with open('app.js', 'r') as f:
    content = f.read()

# 1. Chat Message Function Update
old_chat_fn = """function appendChatMessage(sender, text, type) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    msg.innerHTML = `<div class="sender">${sender}</div><div>${text}</div>`;
    chatMessages.appendChild(msg);"""

new_chat_fn = """function appendChatMessage(sender, text, type, color = 'var(--neon-blue)') {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    msg.innerHTML = `<div class="sender" style="color: ${color};">${sender}</div><div>${text}</div>`;
    chatMessages.appendChild(msg);"""
content = content.replace(old_chat_fn, new_chat_fn)

# 2. Host Chat Forwarding
old_host_chat = """            } else if (data.type === 'CHAT_MSG' && conn.isAuthenticated) {
                appendChatMessage('Guest', data.text, 'other');
                Object.values(connections).forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated) {
                        c.send({ type: 'CHAT_MSG', sender: 'Guest', text: data.text });
                    }
                });
            }"""

new_host_chat = """            } else if (data.type === 'CHAT_MSG' && conn.isAuthenticated) {
                const sName = conn.profile ? conn.profile.name : (data.sender || 'Guest');
                const sColor = conn.profile ? conn.profile.color : (data.color || 'var(--neon-blue)');
                appendChatMessage(sName, data.text, 'other', sColor);
                Object.values(connections).forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated) {
                        c.send({ type: 'CHAT_MSG', sender: sName, text: data.text, color: sColor });
                    }
                });
            } else if (data.type === 'PROFILE_UPDATE' && conn.isAuthenticated) {
                conn.profile = { name: data.name, color: data.color };
                appendChatMessage('System', `${data.name} joined the network`, 'system', 'var(--text-muted)');
                Object.values(connections).forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated) {
                        c.send({ type: 'CHAT_MSG', sender: 'System', text: `${data.name} joined the network`, color: 'var(--text-muted)' });
                    }
                });
            }"""
content = content.replace(old_host_chat, new_host_chat)

# 3. Client Send Chat
old_client_chat = """        if (hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'CHAT_MSG', text });
        }"""
new_client_chat = """        if (hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'CHAT_MSG', text, color: guestColor, sender: guestAlias });
        }"""
content = content.replace(old_client_chat, new_client_chat)

# 4. Host Send Chat
old_host_send = """    appendChatMessage('You', text, 'self');
    if (isHost) {
        Object.values(connections).forEach(c => {
            if (c.open && c.isAuthenticated) c.send({ type: 'CHAT_MSG', sender: 'Host', text });
        });
    } else {"""
new_host_send = """    appendChatMessage(isHost ? 'Host' : guestAlias || 'You', text, 'self', isHost ? 'var(--neon-green)' : guestColor);
    if (isHost) {
        Object.values(connections).forEach(c => {
            if (c.open && c.isAuthenticated) c.send({ type: 'CHAT_MSG', sender: 'Host', text, color: 'var(--neon-green)' });
        });
    } else {"""
content = content.replace(old_host_send, new_host_send)

# 5. Client Receive Chat Update
old_client_recv = """            } else if (data.type === 'CHAT_MSG') {
                appendChatMessage(data.sender, data.text, 'other');
            }"""
new_client_recv = """            } else if (data.type === 'CHAT_MSG') {
                appendChatMessage(data.sender, data.text, data.sender === 'System' ? 'system' : 'other', data.color);
            }"""
content = content.replace(old_client_recv, new_client_recv)

# 6. Profile UI Logic Injection at the end
profile_logic = """
// --- GUEST PROFILE LOGIC ---
const profileModal = document.getElementById('profile-modal');
const profileNameInput = document.getElementById('profile-name-input');
const btnSaveProfile = document.getElementById('btn-save-profile');
let guestAlias = localStorage.getItem('localcast_alias') || '';
let guestColor = localStorage.getItem('localcast_color') || '#00f0ff';

if (profileModal) {
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            document.querySelectorAll('.color-swatch').forEach(s => {
                s.classList.remove('selected');
                s.style.borderColor = 'transparent';
            });
            swatch.classList.add('selected');
            swatch.style.borderColor = '#fff';
            guestColor = swatch.dataset.color;
        });
    });

    btnSaveProfile.addEventListener('click', () => {
        const val = profileNameInput.value.trim();
        if (val) {
            guestAlias = val;
            localStorage.setItem('localcast_alias', guestAlias);
            localStorage.setItem('localcast_color', guestColor);
            profileModal.classList.add('hidden');
            if (hostConnection && hostConnection.open) {
                hostConnection.send({ type: 'PROFILE_UPDATE', name: guestAlias, color: guestColor });
            }
        }
    });
}
"""
content += profile_logic

# 7. Check if we need to show profile modal when TREE arrives
old_tree_recv = """            if (data.type === 'TREE') {
                clientVFS = data.tree;"""
new_tree_recv = """            if (data.type === 'TREE') {
                if (!isHost && !guestAlias && profileModal && profileModal.classList.contains('hidden') && !localStorage.getItem('localcast_alias')) {
                    profileModal.classList.remove('hidden');
                } else if (!isHost && guestAlias && hostConnection && hostConnection.open && !window.profileSent) {
                    hostConnection.send({ type: 'PROFILE_UPDATE', name: guestAlias, color: guestColor });
                    window.profileSent = true;
                }
                clientVFS = data.tree;"""
content = content.replace(old_tree_recv, new_tree_recv)

with open('app.js', 'w') as f:
    f.write(content)
