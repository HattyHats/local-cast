with open('app.js', 'r') as f:
    content = f.read()

scratchpad_logic = """
// --- SCRATCHPAD LOGIC ---
const scratchpadModal = document.getElementById('scratchpad-modal');
const scratchpadTextarea = document.getElementById('scratchpad-textarea');
const btnCloseScratchpad = document.getElementById('btn-close-scratchpad');
const btnLiveScratchpad = document.getElementById('btn-live-scratchpad');

let globalScratchpadContent = ''; // Used by Host

if (btnLiveScratchpad) {
    btnLiveScratchpad.addEventListener('click', () => {
        scratchpadModal.classList.remove('hidden');
        if (!isHost && hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'REQUEST_SCRATCHPAD' });
        } else if (isHost) {
            scratchpadTextarea.value = globalScratchpadContent;
        }
    });

    btnCloseScratchpad.addEventListener('click', () => {
        scratchpadModal.classList.add('hidden');
    });

    scratchpadTextarea.addEventListener('input', () => {
        const text = scratchpadTextarea.value;
        if (isHost) {
            globalScratchpadContent = text;
            Object.values(connections).forEach(c => {
                if (c.open && c.isAuthenticated) c.send({ type: 'SCRATCHPAD_UPDATE', text });
            });
        } else if (hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'SCRATCHPAD_UPDATE', text });
        }
    });
}
"""

content += "\n" + scratchpad_logic

# Add Host Handlers
old_host_chat = """            } else if (data.type === 'PROFILE_UPDATE' && conn.isAuthenticated) {"""
new_host_chat = """            } else if (data.type === 'SCRATCHPAD_UPDATE' && conn.isAuthenticated) {
                globalScratchpadContent = data.text;
                if (scratchpadModal && !scratchpadModal.classList.contains('hidden') && scratchpadTextarea.value !== data.text) {
                    const start = scratchpadTextarea.selectionStart;
                    const end = scratchpadTextarea.selectionEnd;
                    scratchpadTextarea.value = data.text;
                    scratchpadTextarea.setSelectionRange(start, end);
                }
                Object.values(connections).forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated) {
                        c.send({ type: 'SCRATCHPAD_UPDATE', text: data.text });
                    }
                });
            } else if (data.type === 'REQUEST_SCRATCHPAD' && conn.isAuthenticated) {
                conn.send({ type: 'SCRATCHPAD_UPDATE', text: globalScratchpadContent });
            } else if (data.type === 'PROFILE_UPDATE' && conn.isAuthenticated) {"""
content = content.replace(old_host_chat, new_host_chat)

# Add Client Handlers
old_client_recv = """            } else if (data.type === 'CHAT_MSG') {"""
new_client_recv = """            } else if (data.type === 'SCRATCHPAD_UPDATE') {
                if (scratchpadModal && !scratchpadModal.classList.contains('hidden') && scratchpadTextarea.value !== data.text) {
                    const start = scratchpadTextarea.selectionStart;
                    const end = scratchpadTextarea.selectionEnd;
                    scratchpadTextarea.value = data.text;
                    scratchpadTextarea.setSelectionRange(start, end);
                }
            } else if (data.type === 'CHAT_MSG') {"""
content = content.replace(old_client_recv, new_client_recv)


with open('app.js', 'w') as f:
    f.write(content)
