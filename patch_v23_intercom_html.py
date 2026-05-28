with open('index.html', 'r') as f:
    html = f.read()

btn_old = """                <div class="header-actions">
                    <button id="btn-chat-toggle" class="btn-icon">"""
btn_new = """                <div class="header-actions">
                    <button id="btn-intercom" class="btn-icon" title="Join Intercom" style="margin-right: 0.5rem;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                    </button>
                    <button id="btn-chat-toggle" class="btn-icon">"""
html = html.replace(btn_old, btn_new)

with open('index.html', 'w') as f:
    f.write(html)
