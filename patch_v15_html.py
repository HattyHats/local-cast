import re

with open('index.html', 'r') as f:
    html = f.read()

# 1. Add Set Password to Context Menu
ctx_old = '''<div class="context-item" id="ctx-rename">'''
ctx_new = '''<div class="context-item" id="ctx-lock">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Lock / Unlock
        </div>
        <div class="context-item" id="ctx-rename">'''
html = html.replace(ctx_old, ctx_new)

# 2. Add Folder Password Modal
folder_modal = '''    <!-- FOLDER PASSWORD MODAL (Client) -->
    <div id="folder-password-modal" class="modal hidden">
        <div class="modal-content card">
            <h2 style="color: var(--neon-blue);">LOCKED FOLDER</h2>
            <p>This folder is protected. Enter password to view contents.</p>
            <input type="password" id="folder-password-input" placeholder="Password" class="custom-input" />
            <div style="display: flex; gap: 0.5rem; width: 100%;">
                <button id="btn-submit-folder-password" class="custom-btn" style="flex: 1;">UNLOCK</button>
                <button id="btn-cancel-folder-password" class="custom-btn" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-muted); flex: 1;">CANCEL</button>
            </div>
            <p id="folder-password-error" class="error-text hidden">Access Denied</p>
        </div>
    </div>
    
    <!-- TEXT EDITOR MODAL -->'''
html = html.replace('    <!-- TEXT EDITOR MODAL -->', folder_modal)

with open('index.html', 'w') as f:
    f.write(html)
