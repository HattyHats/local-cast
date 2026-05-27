import re

with open('app.js', 'r') as f:
    content = f.read()

new_vars = """
// v14 DOM Elements
const btnChatToggle = document.getElementById('btn-chat-toggle');
const chatSidebar = document.getElementById('chat-sidebar');
const btnCloseChat = document.getElementById('btn-close-chat');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const btnSendChat = document.getElementById('btn-send-chat');

const btnNewNote = document.getElementById('btn-new-note');
const editorModal = document.getElementById('editor-modal');
const editorFilename = document.getElementById('editor-filename');
const editorTextarea = document.getElementById('editor-textarea');
const btnSaveNote = document.getElementById('btn-save-note');
const btnCloseEditor = document.getElementById('btn-close-editor');

const hostSearch = document.getElementById('host-search');
const clientSearch = document.getElementById('client-search');
const btnViewToggleHost = document.getElementById('btn-view-toggle-host');
const btnViewToggleClient = document.getElementById('btn-view-toggle-client');

const contextMenu = document.getElementById('context-menu');
const ctxRename = document.getElementById('ctx-rename');
const ctxDelete = document.getElementById('ctx-delete');

let contextTargetId = null;
let isListViewHost = false;
let isListViewClient = false;
let hostSearchQuery = '';
let clientSearchQuery = '';
"""

# Insert right before bootSequence
content = content.replace("const bootSequence = document.getElementById('boot-sequence');", new_vars + "\nconst bootSequence = document.getElementById('boot-sequence');")

with open('app.js', 'w') as f:
    f.write(content)
