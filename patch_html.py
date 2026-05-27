import re

with open('index.html', 'r') as f:
    html = f.read()

# 1. Header Actions (Chat Toggle)
html = html.replace(
    '<div class="header-actions">',
    '''<div class="header-actions">
                <button id="btn-chat-toggle" class="btn-icon header-btn" title="Open Chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>'''
)

# 2. Host Actions (New Note)
html = html.replace(
    '''<div class="action-buttons">
                        <button id="btn-new-folder"''',
    '''<div class="action-buttons">
                        <button id="btn-new-folder" class="custom-btn action-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                            New Folder
                        </button>
                        <button id="btn-new-note" class="custom-btn action-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            New Note
                        </button>
                        <!-- _OLD_BTN_NEW_FOLDER_REMOVED_ -->'''
)
# remove the duplicate new-folder
html = re.sub(r'<!-- _OLD_BTN_NEW_FOLDER_REMOVED_ -->.*?New Folder\s*</button>', '', html, flags=re.DOTALL)

# 3. Host Explorer Header
host_header_old = '''<div class="explorer-header">
                    <h2>FILE EXPLORER</h2>
                    <div class="breadcrumbs" id="host-breadcrumbs"><span class="crumb" data-id="root">/ Home</span></div>
                </div>'''
host_header_new = '''<div class="explorer-header" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                        <h2>FILE EXPLORER</h2>
                        <div class="explorer-tools" style="display: flex; gap: 0.5rem; align-items: center;">
                            <div class="search-container">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; position: absolute; left: 10px; top: 10px; color: var(--text-muted);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <input type="text" id="host-search" placeholder="Search..." class="custom-input search-input" style="padding-left: 32px; width: 150px; font-size: 0.8rem;">
                            </div>
                            <button id="btn-view-toggle-host" class="btn-icon header-btn" title="Toggle List View">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>
                    <div class="breadcrumbs" id="host-breadcrumbs"><span class="crumb" data-id="root">/ Home</span></div>
                </div>'''
html = html.replace(host_header_old, host_header_new)

# 4. Client Explorer Header
client_header_old = '''<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <div class="breadcrumbs" id="client-breadcrumbs"><span class="crumb" data-id="root">/ Home</span></div>
                        <div style="display: flex; gap: 0.5rem;">'''
client_header_new = '''<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                        <div class="breadcrumbs" id="client-breadcrumbs"><span class="crumb" data-id="root">/ Home</span></div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                            <div class="search-container">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; position: absolute; left: 10px; top: 10px; color: var(--text-muted);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <input type="text" id="client-search" placeholder="Search..." class="custom-input search-input" style="padding-left: 32px; width: 120px; font-size: 0.8rem;">
                            </div>
                            <button id="btn-view-toggle-client" class="btn-icon header-btn" title="Toggle List View">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </button>'''
html = html.replace(client_header_old, client_header_new)

# 5. Append Modals and Menus before scripts
additions = '''
    <!-- CONTEXT MENU -->
    <div id="context-menu" class="context-menu hidden">
        <div class="context-item" id="ctx-rename">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Rename
        </div>
        <div class="context-item" id="ctx-delete" style="color: var(--neon-red);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Delete
        </div>
    </div>

    <!-- TEXT EDITOR MODAL -->
    <div id="editor-modal" class="modal hidden">
        <div class="modal-content card" style="max-width: 800px; width: 95%; height: 80vh; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <input type="text" id="editor-filename" placeholder="Untitled.txt" class="custom-input" style="width: auto; flex: 1; margin-right: 1rem; border: none; font-size: 1.2rem; background: transparent; padding: 0;">
                <div style="display: flex; gap: 0.5rem;">
                    <button id="btn-save-note" class="custom-btn" style="width: auto; padding: 0.5rem 1rem;">SAVE</button>
                    <button id="btn-close-editor" class="btn-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            <textarea id="editor-textarea" class="custom-input" style="flex: 1; resize: none; font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.5; border: 1px solid var(--border-color);"></textarea>
        </div>
    </div>

    <!-- CHAT SIDEBAR -->
    <aside id="chat-sidebar" class="chat-sidebar hidden">
        <div class="chat-header">
            <h3>LOCAL CHAT</h3>
            <button id="btn-close-chat" class="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        <div class="chat-messages" id="chat-messages">
            <div class="chat-msg system">Chat initialized. Encrypted P2P.</div>
        </div>
        <div class="chat-input-area">
            <input type="text" id="chat-input" class="custom-input" placeholder="Type a message...">
            <button id="btn-send-chat" class="custom-btn" style="width: auto; padding: 0.75rem;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; margin:0;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
        </div>
    </aside>

    <!-- External Libraries -->'''
html = html.replace('<!-- External Libraries -->', additions)

with open('index.html', 'w') as f:
    f.write(html)
