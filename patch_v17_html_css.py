import re

# 1. Update index.html
with open('index.html', 'r') as f:
    html = f.read()

# Add Chat Badge
chat_btn_old = '''<button id="btn-chat-toggle" class="btn-icon header-btn" title="Open Chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>'''
chat_btn_new = '''<button id="btn-chat-toggle" class="btn-icon header-btn" title="Open Chat" style="position: relative;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <div id="chat-badge" class="chat-badge hidden"></div>
                </button>'''
html = html.replace(chat_btn_old, chat_btn_new)

# Add Toast Container
toast_html = '''
    <!-- TOAST CONTAINER -->
    <div id="toast-container" class="toast-container"></div>
    
    <!-- External Libraries -->'''
html = html.replace('    <!-- External Libraries -->', toast_html)

with open('index.html', 'w') as f:
    f.write(html)

# 2. Update style.css
with open('style.css', 'a') as f:
    f.write('''
/* --- CHAT BADGE --- */
.chat-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 10px;
    height: 10px;
    background: var(--neon-red);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--neon-red);
    animation: pulse-badge 1.5s infinite;
}
@keyframes pulse-badge {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
}

/* --- TOAST NOTIFICATIONS --- */
.toast-container {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
}
.toast {
    background: rgba(10, 11, 16, 0.95);
    border: 1px solid var(--neon-green);
    color: var(--text-main);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 0.85rem;
    box-shadow: 0 0 15px rgba(57, 255, 20, 0.2);
    animation: toast-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transition: opacity 0.3s, transform 0.3s;
    font-family: var(--font-mono);
}
@keyframes toast-slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
''')
