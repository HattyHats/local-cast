// --- DOM Elements ---

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

const sortSelectHost = document.getElementById('sort-select-host');
const sortSelectClient = document.getElementById('sort-select-client');

btnViewToggleHost.addEventListener('click', () => {
    isListView = !isListView;
    localStorage.setItem('localcast_listview', isListView);
    renderHostExplorer();
});

if (sortSelectHost) {
    sortSelectHost.addEventListener('change', () => {
        renderHostExplorer();
    });
}
if (sortSelectClient) {
    sortSelectClient.addEventListener('change', () => {
        renderClientExplorer();
    });
}

const btnViewToggleClient = document.getElementById('btn-view-toggle-client');

btnViewToggleClient.addEventListener('click', () => {
    isListView = !isListView;
    localStorage.setItem('localcast_listview', isListView);
    renderClientExplorer();
});

function sortNodes(nodes, criteria) {
    // Return a new sorted array so we don't mutate original
    let sorted = [...nodes];
    sorted.sort((a, b) => {
        if (criteria === 'name-asc') {
            return a.name.localeCompare(b.name);
        } else if (criteria === 'name-desc') {
            return b.name.localeCompare(a.name);
        } else if (criteria === 'type') {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        } else if (criteria === 'size-asc') {
            const sizeA = a.size || 0;
            const sizeB = b.size || 0;
            return sizeA - sizeB;
        } else if (criteria === 'size-desc') {
            const sizeA = a.size || 0;
            const sizeB = b.size || 0;
            return sizeB - sizeA;
        }
        return 0;
    });
    return sorted;
}

const contextMenu = document.getElementById('context-menu');
const ctxRename = document.getElementById('ctx-rename');
const ctxDelete = document.getElementById('ctx-delete');
const ctxLock = document.getElementById('ctx-lock');
const ctxOpen = document.getElementById('ctx-open');
const ctxDownload = document.getElementById('ctx-download');
const ctxMagicLink = document.getElementById('ctx-magic-link');
const folderPasswordModal = document.getElementById('folder-password-modal');
const folderPasswordInput = document.getElementById('folder-password-input');
const btnSubmitFolderPassword = document.getElementById('btn-submit-folder-password');
const btnCancelFolderPassword = document.getElementById('btn-cancel-folder-password');
const folderPasswordError = document.getElementById('folder-password-error');
let activeAuthFolderId = null;
let autoEnterFolderId = null;
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



let contextTargetId = null;
let isListView = localStorage.getItem('localcast_listview') === 'true';
let hostSearchQuery = '';
let clientSearchQuery = '';

const bootSequence = document.getElementById('boot-sequence');
const appWrapper = document.getElementById('app-wrapper');

try {
    if (typeof localforage !== 'undefined') {
        localforage.config({ name: "LocalCast" });
    }
} catch (e) {
    console.warn("LocalForage config failed:", e);
}
const CHUNK_SIZE = 16 * 1024; // 16 KB for safe WebRTC transmission
const incomingTransfers = {};
let selectedNodes = new Set();

const hostView = document.getElementById('host-view');
const clientView = document.getElementById('client-view');

const statusIndicator = document.getElementById('status-indicator');
const statusDot = statusIndicator.querySelector('.status-dot');
const statusText = statusIndicator.querySelector('.status-text');

const btnLock = document.getElementById('btn-lock');
const iconUnlocked = document.querySelector('.icon-unlocked');
const iconLocked = document.querySelector('.icon-locked');
const passwordModal = document.getElementById('password-modal');
const clientPasswordInput = document.getElementById('client-password');
const btnSubmitPassword = document.getElementById('btn-submit-password');
const passwordError = document.getElementById('password-error');

const previewModal = document.getElementById('preview-modal');

const btnStreamDirect = document.getElementById('btn-stream-direct');

const btnRadar = document.getElementById('btn-radar');
const radarModal = document.getElementById('radar-modal');
const btnCloseRadar = document.getElementById('btn-close-radar');
const radarCanvas = document.getElementById('radar-canvas');

const whisperModal = document.getElementById('whisper-modal');
const btnCloseWhisper = document.getElementById('btn-close-whisper');
const whisperMessages = document.getElementById('whisper-messages');
const whisperInput = document.getElementById('whisper-input');
const whisperForm = document.getElementById('whisper-form');

let radarBlips = [];
let showDeadDrops = false;
let activePeers = {};
let whisperTarget = null;

const mediaModal = document.getElementById('media-modal');
const btnCloseMedia = document.getElementById('btn-close-media');
const mediaTitle = document.getElementById('media-title');
const mediaContainer = document.getElementById('media-container');
const btnDownloadMedia = document.getElementById('btn-download-media');

const btnClosePreview = document.getElementById('btn-close-preview');
const previewFilename = document.getElementById('preview-filename');
const previewMeta = document.getElementById('preview-meta');
const btnRequestFile = document.getElementById('btn-request-file');
const btnDownloadDirect = document.getElementById('btn-download-direct');
const previewLoader = document.getElementById('preview-loader');
let activePreviewFileId = null;

// Host Action Elements
const btnNewFolder = document.getElementById('btn-new-folder');
const createFolderModal = document.getElementById('create-folder-modal');
const btnCloseCreateFolder = document.getElementById('btn-close-create-folder');
const btnConfirmCreateFolder = document.getElementById('btn-confirm-create-folder');
const createFolderNameInput = document.getElementById('create-folder-name');
const createFolderIsVault = document.getElementById('create-folder-is-vault');

const vaultPasswordModal = document.getElementById('vault-password-modal');
const btnCloseVaultModal = document.getElementById('btn-close-vault-modal');
const btnConfirmVaultPassword = document.getElementById('btn-confirm-vault-password');
const vaultPasswordInput = document.getElementById('vault-password-input');

let unlockedVaults = {}; // mapping: folderId -> password

// Crypto Engine
async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
    );
    return await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
}

async function encryptFile(buffer, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, buffer);
    return { encrypted: new Uint8Array(encrypted), salt, iv };
}

async function decryptFile(encryptedBuffer, password, salt, iv) {
    const key = await deriveKey(password, salt);
    try {
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedBuffer);
        return new Uint8Array(decrypted);
    } catch (e) {
        throw new Error('Incorrect Password or Corrupted File');
    }
}

async function getDecryptedFileObj(child) {
    if (child.isNative && child.type === 'file') {
        if (!nativeVaultPassword) throw new Error("Native Vault is locked");
        const file = await child.nativeHandle.getFile();
        const buffer = await file.arrayBuffer();
        const decryptedBuffer = await decryptNativeFile(buffer, nativeVaultPassword);
        return new Blob([decryptedBuffer], { type: child.mime });
    }
    if (!child.isEncrypted) return child.fileObj;
    let current = child.parent;
    let password = null;
    while (current && current.id !== 'root') {
        if (current.isVault) {
            password = unlockedVaults[current.id];
            break;
        }
        current = current.parent;
    }
    if (!password) {
        alert("Cannot decrypt file: Vault is locked!");
        throw new Error("Vault is locked");
    }
    const buffer = await child.fileObj.arrayBuffer();
    const decryptedBuffer = await decryptFile(buffer, password, child.salt, child.iv);
    return new Blob([decryptedBuffer], { type: child.mime });
}


const btnUploadFiles = document.getElementById('btn-upload-files');
const btnUploadFolder = document.getElementById('btn-upload-folder');
const btnMountNative = document.getElementById('btn-mount-native');
const btnDownloadAllHost = document.getElementById('btn-download-all-host');

// Native Vault Modals
const hostApprovalModal = document.getElementById('host-approval-modal');
const hostOtpDisplayModal = document.getElementById('host-otp-display-modal');
const guestOtpEntryModal = document.getElementById('guest-otp-entry-modal');
const btnApproveVault = document.getElementById('btn-approve-vault');
const btnDenyVault = document.getElementById('btn-deny-vault');
const btnCloseOtpDisplay = document.getElementById('btn-close-otp-display');
const btnCloseGuestOtp = document.getElementById('btn-close-guest-otp');
const btnSubmitGuestOtp = document.getElementById('btn-submit-guest-otp');
const requestingGuestName = document.getElementById('requesting-guest-name');
const otpGuestName = document.getElementById('otp-guest-name');
const hostOtpCode = document.getElementById('host-otp-code');
const guestOtpInput = document.getElementById('guest-otp-input');

const btnBurn = document.getElementById('btn-burn');
const burnOverlay = document.getElementById('burn-overlay');
const burnCountdown = document.getElementById('burn-countdown');

const btnDownloadAllClient = document.getElementById('btn-download-all-client');

// --- TRANSFER DASHBOARD & DRAG/DROP ---
const dragOverlay = document.getElementById('drag-overlay');
const transferDashboard = document.getElementById('transfer-dashboard');
const transferList = document.getElementById('transfer-list');
const btnMinimizeTransfers = document.getElementById('btn-minimize-transfers');

let dragCounter = 0;
document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    if (dragOverlay) {
        dragOverlay.classList.remove('hidden');
        dragOverlay.style.display = 'flex';
    }
});
document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0 && dragOverlay) {
        dragOverlay.classList.add('hidden');
        dragOverlay.style.display = 'none';
    }
});
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    if (dragOverlay) {
        dragOverlay.classList.add('hidden');
        dragOverlay.style.display = 'none';
    }
    // File processing is handled by the global body drop listener to support folders
});

if (btnMinimizeTransfers) {
    btnMinimizeTransfers.addEventListener('click', () => {
        if (transferList.style.display === 'none') {
            transferList.style.display = 'flex';
        } else {
            transferList.style.display = 'none';
        }
    });
}

const activeTransfers = {};
function createTransferItem(id, name, type) { // type: 'upload' or 'download'
    if (transferDashboard) {
        transferDashboard.classList.remove('hidden');
    }
    const el = document.createElement('div');
    el.className = 'transfer-item ' + type;
    el.id = 'transfer-' + id;
    el.innerHTML = `
        <div class="transfer-header">
            <span class="transfer-filename" title="${name}">${name}</span>
            <span class="transfer-speed" id="speed-${id}">0 MB/s</span>
        </div>
        <div class="transfer-progress-bg">
            <div class="transfer-progress-fill" id="prog-${id}"></div>
        </div>
    `;
    if (transferList) {
        transferList.prepend(el); // newest on top
    }
    activeTransfers[id] = {
        el,
        bytes: 0,
        lastBytes: 0,
        lastTime: Date.now(),
        speedEl: el.querySelector('#speed-' + id),
        progEl: el.querySelector('#prog-' + id),
        totalSize: 1 // prevent div by zero
    };
}
function updateTransferProgress(id, newBytesSent, totalSize) {
    const t = activeTransfers[id];
    if (!t) return;
    t.bytes += newBytesSent;
    t.totalSize = totalSize;
    
    const now = Date.now();
    const dt = now - t.lastTime;
    if (dt >= 500) { // Update speed every 500ms
        const dBytes = t.bytes - t.lastBytes;
        const speedMBps = (dBytes / (1024 * 1024)) / (dt / 1000);
        t.speedEl.textContent = speedMBps.toFixed(2) + ' MB/s';
        t.lastBytes = t.bytes;
        t.lastTime = now;
    }
    const percent = Math.min(100, (t.bytes / totalSize) * 100);
    t.progEl.style.width = percent + '%';
}
function finishTransfer(id) {
    const t = activeTransfers[id];
    if (t) {
        t.progEl.style.width = '100%';
        t.speedEl.textContent = 'DONE';
        setTimeout(() => {
            if (t.el.parentNode) t.el.parentNode.removeChild(t.el);
            delete activeTransfers[id];
            if (Object.keys(activeTransfers).length === 0 && transferDashboard) {
                transferDashboard.classList.add('hidden');
            }
        }, 3000);
    }
}

const fileInput = document.getElementById('file-input');
const folderInput = document.getElementById('folder-input');

// Explorer Elements
const hostExplorerGrid = document.getElementById('host-file-grid');
const hostBreadcrumbs = document.getElementById('host-breadcrumbs');
const clientExplorerGrid = document.getElementById('client-file-grid');
const clientBreadcrumbs = document.getElementById('client-breadcrumbs');
const qrcodeEl = document.getElementById('qrcode');
const qrPlaceholder = document.querySelector('.qr-placeholder');
const joinInfo = document.getElementById('join-info');
const joinUrl = document.getElementById('join-url');

const clientDownloading = document.getElementById('client-downloading');
const downloadFilename = document.getElementById('download-filename');

// Guest Permissions logic will be connection-specific
const btnUploadFilesClient = document.getElementById('btn-upload-files-client');
const btnUploadFolderClient = document.getElementById('btn-upload-folder-client');
const clientFileInput = document.getElementById('client-file-input');
const clientFolderInput = document.getElementById('client-folder-input');

// Modify triggerBurnSequence to be more aggressive

let burnTimerInterval;


function startBurnCountdown(seconds) {
    if (burnTimerInterval) clearInterval(burnTimerInterval);
    if (burnOverlay) burnOverlay.style.display = 'flex';
    
    let left = seconds;
    if (burnCountdown) burnCountdown.innerText = left.toFixed(2);
    
    const start = Date.now();
    const target = start + (seconds * 1000);
    
    burnTimerInterval = setInterval(() => {
        const now = Date.now();
        let remaining = (target - now) / 1000;
        if (remaining <= 0) {
            remaining = 0;
            clearInterval(burnTimerInterval);
            triggerBurnSequence();
        }
        if (burnCountdown) burnCountdown.innerText = remaining.toFixed(2);
    }, 10);
}

function triggerBurnSequence() {
    vfs = new VirtualFileSystem();
    if (typeof localforage !== 'undefined') localforage.clear();
    connections.forEach(conn => conn.close());
    connections = [];
    document.body.innerHTML = '<div style="background:#000; color:#f00; height:100vh; width:100vw; display:flex; justify-content:center; align-items:center; flex-direction:column; font-family: \'Courier New\', monospace;"><h1 style="font-size:10vw; margin:0; text-shadow: 0 0 50px #f00; text-align: center;">NETWORK DESTROYED</h1><p style="font-size: 1.5rem; margin-bottom: 2rem;">All traces wiped from memory.</p><button onclick="window.location.reload()" style="background: transparent; border: 2px solid #f00; color: #f00; padding: 1rem 2rem; font-size: 1.2rem; cursor: pointer; border-radius: 4px; text-transform: uppercase; letter-spacing: 2px; transition: all 0.2s; box-shadow: 0 0 15px rgba(255,0,0,0.3);">Initialize New Server</button></div>';
}



// --- VIRTUAL FILE SYSTEM ---
async function saveVFSToDB() {
    if(!isHost) return;
    function stripParents(node) {
        return {
            id: node.id,
            name: node.name,
            type: node.type,
            size: node.size,
            mime: node.mime,
            thumbnail: node.thumbnail,
            fileObj: node.fileObj,
            children: node.children ? node.children.map(stripParents) : []
        };
    }
    await localforage.setItem("vfs_root", stripParents(vfs.root));
}


// --- NATIVE VAULT ENGINE ---
let nativeVaultHandle = null;
let nativeVaultPassword = null;
let nativeVaultOTP = null; // Generated for guest
let guestNativePermissions = {}; // e.g. { 'peerId': 'read' | 'write' }

async function encryptNativeFile(buffer, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, buffer);
    const finalBuffer = new Uint8Array(16 + 12 + encrypted.byteLength);
    finalBuffer.set(salt, 0);
    finalBuffer.set(iv, 16);
    finalBuffer.set(new Uint8Array(encrypted), 28);
    return finalBuffer;
}

async function decryptNativeFile(finalBuffer, password) {
    if (finalBuffer.byteLength < 28) throw new Error('Invalid Native Vault file format');
    const salt = finalBuffer.slice(0, 16);
    const iv = finalBuffer.slice(16, 28);
    const encrypted = finalBuffer.slice(28);
    const key = await deriveKey(password, salt);
    return await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
}

// Recursively builds the VFS tree from a native directory handle
async function scanNativeVault(handle, parentNode) {
    for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
            if (entry.name.endsWith('.loc')) {
                const originalName = entry.name.replace('.loc', '');
                const fileHandle = entry;
                const file = await fileHandle.getFile();
                parentNode.children.push({
                    id: 'native_' + Math.random().toString(36).substr(2, 9),
                    name: originalName,
                    type: 'file',
                    size: file.size, 
                    mime: 'application/octet-stream', 
                    isNative: true,
                    nativeHandle: fileHandle,
                    parent: parentNode
                });
            }
        } else if (entry.kind === 'directory') {
            const dirNode = {
                id: 'native_dir_' + Math.random().toString(36).substr(2, 9),
                name: entry.name,
                type: 'folder',
                isNative: true,
                nativeHandle: entry,
                children: [],
                parent: parentNode
            };
            parentNode.children.push(dirNode);
            await scanNativeVault(entry, dirNode);
        }
    }
}

if (btnMountNative) {
    btnMountNative.addEventListener('click', async () => {
        try {
            if (!window.showDirectoryPicker) {
                alert("Native Vault is not supported in this browser. Please use Chrome, Edge, or Brave.");
                return;
            }
            const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
            
            // Ask for password
            vaultModal.classList.remove('hidden');
            vaultPasswordDesc.textContent = "Create a strong password to encrypt this Native Vault folder.";
            vaultPasswordInput.value = '';
            
            const handleVaultSubmit = async () => {
                const pass = vaultPasswordInput.value;
                if (!pass) return;
                
                nativeVaultPassword = pass;
                nativeVaultHandle = handle;
                
                // Add the root Native Vault node
                const nativeRoot = {
                    id: 'native_root',
                    name: 'NATIVE VAULT',
                    type: 'folder',
                    isNative: true,
                    isNativeRoot: true,
                    nativeHandle: handle,
                    children: [],
                    parent: vfs.root
                };
                vfs.root.children.push(nativeRoot);
                await scanNativeVault(handle, nativeRoot);
                
                renderHostExplorer();
                vaultModal.classList.add('hidden');
                btnConfirmVaultPassword.removeEventListener('click', handleVaultSubmit);
                btnCloseVaultModal.removeEventListener('click', handleVaultClose);
                
                // Save handle for next load
                try {
                    if (typeof localforage !== 'undefined') {
                        await localforage.setItem('native_vault_handle', handle);
                    }
                } catch(e) { console.warn('Could not save native handle', e); }
            };
            
            const handleVaultClose = () => {
                vaultModal.classList.add('hidden');
                btnConfirmVaultPassword.removeEventListener('click', handleVaultSubmit);
                btnCloseVaultModal.removeEventListener('click', handleVaultClose);
            };
            
            btnConfirmVaultPassword.addEventListener('click', handleVaultSubmit);
            btnCloseVaultModal.addEventListener('click', handleVaultClose);
            
        } catch (err) {
            console.error('Mount Native Vault aborted:', err);
        }
    });
}
// --- END NATIVE VAULT ENGINE ---


if (btnCloseOtpDisplay) {
    btnCloseOtpDisplay.addEventListener('click', () => {
        hostOtpDisplayModal.classList.add('hidden');
    });
}
class VirtualFileSystem {
    constructor() {
        this.root = { id: 'root', name: 'Home', type: 'folder', children: [], parent: null };
        this.currentDir = this.root;
    }
    
    
    addNode(parent, node) {
        if (!node.id) node.id = (node.type === 'folder' ? 'folder_' : 'file_') + Math.random().toString(36).substr(2, 9);
        node.parent = parent;
        parent.children.push(node);
        return node;
    }

    addFolder(name, isVault = false, salt = null) {
        const id = 'folder_' + Math.random().toString(36).substr(2, 9);
        const folder = { id, name, type: 'folder', children: [], parent: this.currentDir };
        if (isVault) {
            folder.isVault = true;
            folder.salt = salt;
        }
        this.currentDir.children.push(folder);
        return folder;
    }
    
    getTree(unlockedSet = new Set()) {
        function clone(node) {
            if (node.isHidden && !showDeadDrops) return null;
            const isUnlocked = unlockedSet.has(node.id) || unlockedVaults[node.id];
            const n = { 
                id: node.id, type: node.type, name: node.name, size: node.size, mime: node.mime, thumbnail: node.thumbnail,
                isLocked: !!node.password, isVault: !!node.isVault, isUnlocked, isHidden: node.isHidden,
                isEncrypted: node.isEncrypted, salt: node.salt, iv: node.iv
            };
            if (node.children) {
                if ((node.password || node.isVault) && !isUnlocked) {
                    n.children = []; // Hide contents
                } else {
                    n.children = node.children.map(clone).filter(x => x !== null);
                }
            }
            return n;
        }
        return clone(this.root);
    }
    
    findNode(id, dir = this.root) {
        if (dir.id === id) return dir;
        for (let child of dir.children) {
            if (child.id === id) return child;
            if (child.type === 'folder') {
                const found = this.findNode(id, child);
                if (found) return found;
            }
        }
        return null;
    }
}

let vfs = new VirtualFileSystem();
let clientVFS = null; // Client's copy of the tree
let clientCurrentDir = null;
let clientUnlockedVaults = {}; // track guest vault passwords

// State
let isHost = true;
let peer = null;
let connections = [];
let hostConnection = null;
let hostPassword = null;

const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('room');
const magicPeerId = urlParams.get('peer');
const magicFileId = urlParams.get('file');

if (roomCode) {
    isHost = false;
}

function initApp() {
    if (magicPeerId && magicFileId) {
        initMagicPeer(magicPeerId, magicFileId);
    } else if (isHost) {
        hostView.classList.remove('hidden');
        initHost();
    } else {
        clientView.classList.remove('hidden');
        initClient();
    }
}

async function initMagicPeer(targetPeerId, targetFileId) {
    document.getElementById('magic-link-modal').classList.remove('hidden');
    const magicStatus = document.getElementById('magic-status');
    const magicProgressBar = document.getElementById('magic-progress-fill');
    const magicProgressText = document.getElementById('magic-progress-text');
    const magicFilename = document.getElementById('magic-filename');
    
    const magicPeer = new Peer();
        magicPeer.on("error", err => console.error("PeerJS Magic Error:", err));
    magicPeer.on('open', (id) => {
        magicStatus.textContent = 'Connecting to Host...';
        const conn = magicPeer.connect(targetPeerId, { reliable: true });
        
        conn.on('open', () => {
            magicStatus.textContent = 'Requesting File...';
            conn.send({ type: 'REQUEST_MAGIC_FILE', fileId: targetFileId });
        });
        
        let fileTransfer = null;
        
        conn.on('data', (data) => {
            if (data.type === 'MAGIC_FILE_ERROR') {
                magicStatus.textContent = 'Error: ' + data.message;
                magicStatus.style.color = 'var(--neon-red)';
            } else if (data.type === 'CLIENT_UPLOAD_CHUNK_START') {
                magicStatus.textContent = 'Receiving Data...';
                magicFilename.textContent = data.name;
                fileTransfer = { chunks: [], received: 0, total: data.totalChunks, name: data.name, mime: data.mime, isEncrypted: data.isEncrypted, salt: data.salt, iv: data.iv };
            } else if (data.type === 'CLIENT_UPLOAD_CHUNK') {
                if (fileTransfer) {
                    fileTransfer.chunks[data.index] = data.chunk;
                    fileTransfer.received++;
                    
                    const pct = Math.floor((fileTransfer.received / fileTransfer.total) * 100);
                    magicProgressBar.style.width = pct + '%';
                    magicProgressText.textContent = pct + '%';
                    
                    if (fileTransfer.received === fileTransfer.total) {
                        magicStatus.textContent = 'Download Complete!';
                        magicStatus.style.color = 'var(--neon-green)';
                        const fileBlob = new Blob(fileTransfer.chunks, { type: fileTransfer.mime });
                        
                        const finalizeMagic = (blobToSave) => {
                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(blobToSave);
                            a.download = fileTransfer.name;
                            a.click();
                            
                            setTimeout(() => {
                                conn.send({ type: 'UPLOAD_COMPLETE' });
                                setTimeout(() => { conn.close(); }, 500);
                            }, 1000);
                        };
                        
                        if (fileTransfer.isEncrypted) {
                            const pwd = prompt("This file is encrypted. Enter Vault Password:");
                            if (!pwd) {
                                magicStatus.textContent = 'Decryption cancelled.';
                                magicStatus.style.color = 'var(--neon-red)';
                                return;
                            }
                            (async () => {
                                try {
                                    const buffer = await fileBlob.arrayBuffer();
                                    const decryptedBuffer = await decryptFile(buffer, pwd, fileTransfer.salt, fileTransfer.iv);
                                    const decryptedBlob = new Blob([decryptedBuffer], { type: fileTransfer.mime });
                                    finalizeMagic(decryptedBlob);
                                } catch(e) {
                                    magicStatus.textContent = 'Decryption Failed!';
                                    magicStatus.style.color = 'var(--neon-red)';
                                }
                            })();
                        } else {
                            finalizeMagic(fileBlob);
                        }
                    }
                }
            }
        });
        
        conn.on('close', () => {
            if (magicStatus.textContent !== 'Download Complete!') {
                magicStatus.textContent = 'Connection lost.';
                magicStatus.style.color = 'var(--neon-red)';
            }
        });
    });
}

// --- HOST LOGIC ---
async function initHost() {
    updateStatus('CONNECTING...', 'offline');
    
    const savedRoot = await localforage.getItem("vfs_root");
    if (savedRoot) {
        function linkParents(node, parent) {
            node.parent = parent;
            if (node.children) node.children.forEach(c => linkParents(c, node));
        }
        linkParents(savedRoot, null);
        vfs.root = savedRoot;
        vfs.currentDir = vfs.root;
    }
    
    const savedHostPass = await localforage.getItem("host_password");
    if (savedHostPass) {
        hostPassword = savedHostPass;
        iconUnlocked.classList.add('hidden');
        iconLocked.classList.remove('hidden');
    }

    btnLock.classList.remove('hidden');
    btnLock.addEventListener('click', () => {
        if (!hostPassword) {
            const pwd = prompt("Enter a password to lock this session:");
            if (pwd) {
                hostPassword = pwd;
                localforage.setItem("host_password", hostPassword);
                iconUnlocked.classList.add('hidden');
                iconLocked.classList.remove('hidden');
            }
        } else {
            if (confirm("Remove password protection?")) {
                hostPassword = null;
                localforage.removeItem("host_password");
                iconUnlocked.classList.add('hidden');
                iconLocked.classList.add('hidden');
                connections.forEach(conn => {
                    if (!conn.isAuthenticated) {
                        conn.isAuthenticated = true;
                        conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
                        conn.send({ type: 'GUEST_PERMISSIONS', permissions: conn.permissions });
                    }
                });
            }
        }
    });

    const savedPeerId = await localforage.getItem("host_peer_id");
    if (savedPeerId) {
        peer = new Peer(savedPeerId, { debug: 2 });
    } else {
        peer = new Peer({ debug: 2 });
    }

    peer.on('call', async (call) => {
        if (call.metadata && call.metadata.type === 'media_stream') return; // Handled elsewhere
        try {
            localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            call.answer(localMediaStream);
            currentCall = call;
            openWhisper(call.peer, 'Incoming Comm-Link', 'var(--neon-green)');
            setupCallHandlers(call);
        } catch (e) {
            console.error("Failed to answer call:", e);
            call.close();
        }
    });

    peer.on('open', (id) => {
        localforage.setItem("host_peer_id", id);
        updateStatus('HOST ACTIVE', 'online');
        const connectUrl = `${window.location.origin}${window.location.pathname}?room=${id}`;
        
        qrPlaceholder.classList.add('hidden');
        new QRCode(qrcodeEl, { text: connectUrl, width: 130, height: 130, colorDark : "#00f0ff", colorLight : "#0a0b10", correctLevel : QRCode.CorrectLevel.L });
        joinInfo.classList.remove('hidden');
        joinUrl.textContent = connectUrl;
        
        const btnCopyUrl = document.getElementById('btn-copy-url');
        if (btnCopyUrl) {
            btnCopyUrl.onclick = () => {
                navigator.clipboard.writeText(connectUrl);
                btnCopyUrl.style.color = 'var(--neon-green)';
                setTimeout(() => btnCopyUrl.style.color = '#fff', 2000);
            };
        }
    });

    peer.on('connection', async (conn) => {
        if (hostPassword) {
            if (!conn.metadata || !conn.metadata.secureProfile) {
                console.warn("Connection rejected: Missing secure metadata");
                setTimeout(() => conn.close(), 500);
                return;
            }
            const decryptedProfile = await decryptMetadata(conn.metadata.secureProfile, hostPassword);
            if (!decryptedProfile) {
                console.warn("Connection rejected: Invalid password or decryption failed");
                setTimeout(() => conn.close(), 500);
                return;
            }
            // Decryption successful!
            conn.profile = { name: decryptedProfile.name, color: decryptedProfile.color, avatar: decryptedProfile.avatar };
            conn.isAuthenticated = true;
        } else {
            conn.isAuthenticated = true; // No password required
        }
        connections.push(conn);
        broadcastPeers();

        conn.unlockedFolders = new Set();
        conn.permissions = { upload: false, chat: true, delete: false, edit: false };
        
        conn.on('data', (data) => {
            if (data.type === 'REQUEST_MAGIC_FILE') {
                const node = vfs.findNode(data.fileId);
                if (node && node.type === 'file') {
                    if (node.isLocked || node.password) {
                        conn.send({ type: 'MAGIC_FILE_ERROR', message: 'File is locked or requires a password.' });
                    } else if (node.isNative) {
                        getDecryptedFileObj(node).then(blob => {
                            sendFileInChunks(conn, node.id, blob, node.name, node.mime, 'CLIENT_UPLOAD_CHUNK', { isEncrypted: false });
                        }).catch(e => {
                            conn.send({ type: 'MAGIC_FILE_ERROR', message: 'Failed to access native file.' });
                        });
                    } else {
                        sendFileInChunks(conn, node.id, node.fileObj, node.name, node.mime, 'CLIENT_UPLOAD_CHUNK', { isEncrypted: node.isEncrypted, salt: node.salt, iv: node.iv });
                    }
                } else {
                    conn.send({ type: 'MAGIC_FILE_ERROR', message: 'File not found or access denied.' });
                }
                return;
            }
            if (data.type === 'AUTH_ATTEMPT') {
                if (conn.isAuthenticated) {
                    conn.send({ type: 'AUTH_SUCCESS' });
                    conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
                    conn.send({ type: 'GUEST_PERMISSIONS', permissions: conn.permissions });
                    return;
                }
                if (data.password === hostPassword) {
                    conn.isAuthenticated = true;
                    conn.send({ type: 'AUTH_SUCCESS' });
                    conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
                    conn.send({ type: 'GUEST_PERMISSIONS', permissions: conn.permissions });
                } else {
                    conn.send({ type: 'AUTH_FAIL' });
                }
                        } else if (data.type === 'WHISPER_RELAY' && conn.isAuthenticated) {
                if (data.targetId === (peer ? peer.id : null)) {
                    handleWhisper(data);
                } else {
                    const target = connections.find(c => c.peer === data.targetId);
                    if (target && target.open) {
                        target.send({ type: 'WHISPER', fromId: data.fromId, fromAlias: data.fromAlias, fromColor: data.fromColor, msg: data.msg });
                    }
                }
            } else if (data.type === 'ARCADE_RELAY' && conn.isAuthenticated) {
                if (data.targetId === (peer ? peer.id : null)) {
                    // Directed at host
                    handleArcadeNetwork(data.data);
                } else {
                    const target = connections.find(c => c.peer === data.targetId);
                    if (target && target.open) {
                        target.send(data.data);
                    }
                }
            } else if (['ARCADE_INVITE', 'ARCADE_ACCEPT', 'ARCADE_DECLINE', 'ARCADE_MOVE', 'ARCADE_RESET'].includes(data.type) && conn.isAuthenticated) {
                handleArcadeNetwork(data);
            } else if (data.type === 'CHAT_MSG' && conn.isAuthenticated) {
                const sName = conn.profile ? conn.profile.name : (data.sender || 'Guest');
                const sColor = conn.profile ? conn.profile.color : (data.color || 'var(--neon-blue)');
                appendChatMessage(sName, data.text, 'other', sColor);
                Object.values(connections).forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated) {
                        c.send({ type: 'CHAT_MSG', sender: sName, text: data.text, color: sColor });
                    }
                });
            } else if (data.type === 'SCRATCHPAD_UPDATE' && conn.isAuthenticated) {
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
            } else if (data.type === 'WHITEBOARD_DRAW' && conn.isAuthenticated) {
                if (wbCtx) {
                    const w = wbCanvas.width; const h = wbCanvas.height;
                    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, false);
                }
                Object.values(connections).forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated) c.send(data);
                });
            } else if (data.type === 'WHITEBOARD_CLEAR' && conn.isAuthenticated) {
                if (wbCtx) wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
                Object.values(connections).forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated) c.send(data);
                });
            } else if (data.type === 'REQUEST_WHITEBOARD' && conn.isAuthenticated) {
                if (canvas) conn.send({ type: 'WHITEBOARD_SYNC', image: wbCanvas.toDataURL() });
            } else if (data.type === 'INTERCOM_JOIN' && conn.isAuthenticated) {
                intercomUsers.add(data.peerId);
                const others = Array.from(intercomUsers).filter(id => id !== data.peerId);
                conn.send({ type: 'INTERCOM_LIST', users: others });
            } else if (data.type === 'INTERCOM_LEAVE' && conn.isAuthenticated) {
                intercomUsers.delete(data.peerId);
            } else if (data.type === 'REQUEST_SCRATCHPAD' && conn.isAuthenticated) {
                if (canvas) conn.send({ type: 'WHITEBOARD_SYNC', image: wbCanvas.toDataURL() });
            } else if (data.type === 'REQUEST_SCRATCHPAD' && conn.isAuthenticated) {
                conn.send({ type: 'SCRATCHPAD_UPDATE', text: globalScratchpadContent });
            } else if (data.type === 'PROFILE_UPDATE' && conn.isAuthenticated) {
                conn.profile = { name: data.name, color: data.color, avatar: data.avatar };
                broadcastPeers();
                appendChatMessage('System', `${data.name} joined the network`, 'system', 'var(--text-muted)');
                Object.values(connections).forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated) {
                        c.send({ type: 'CHAT_MSG', sender: 'System', text: `${data.name} joined the network`, color: 'var(--text-muted)' });
                    }
                });
            } else if (data.type === 'REQUEST_NATIVE_VAULT_ACCESS' && conn.isAuthenticated) {
                requestingGuestName.textContent = conn.profile ? conn.profile.name : 'Unknown Guest';
                hostApprovalModal.classList.remove('hidden');
                
                const handleApprove = () => {
                    hostApprovalModal.classList.add('hidden');
                    nativeVaultOTP = Math.floor(100000 + Math.random() * 900000).toString();
                    hostOtpCode.textContent = nativeVaultOTP;
                    otpGuestName.textContent = conn.profile ? conn.profile.name : 'Guest';
                    
                    const permission = document.querySelector('input[name="vault-permission"]:checked').value;
                    guestNativePermissions[conn.peer] = permission;
                    
                    hostOtpDisplayModal.classList.remove('hidden');
                    
                    btnApproveVault.removeEventListener('click', handleApprove);
                    btnDenyVault.removeEventListener('click', handleDeny);
                };
                
                const handleDeny = () => {
                    hostApprovalModal.classList.add('hidden');
                    conn.send({ type: 'NATIVE_VAULT_ACCESS_DENIED' });
                    btnApproveVault.removeEventListener('click', handleApprove);
                    btnDenyVault.removeEventListener('click', handleDeny);
                };
                
                btnApproveVault.addEventListener('click', handleApprove);
                btnDenyVault.addEventListener('click', handleDeny);
                
            } else if (data.type === 'SUBMIT_NATIVE_VAULT_OTP' && conn.isAuthenticated) {
                if (data.pin === nativeVaultOTP && nativeVaultOTP !== null) {
                    conn.unlockedFolders.add(data.folderId);
                    conn.send({ type: 'NATIVE_VAULT_AUTH_SUCCESS', folderId: data.folderId, permission: guestNativePermissions[conn.peer] });
                    conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders) });
                    nativeVaultOTP = null; 
                } else {
                    conn.send({ type: 'NATIVE_VAULT_AUTH_FAIL' });
                }
            } else if (data.type === 'FOLDER_AUTH_ATTEMPT' && conn.isAuthenticated) {
                const node = vfs.findNode(data.folderId);
                if (node && node.type === 'folder') {
                    if (node.password === data.password) {
                        conn.unlockedFolders.add(node.id);
                        conn.send({ type: 'FOLDER_AUTH_SUCCESS', folderId: node.id });
                        conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
                    } else {
                        conn.send({ type: 'FOLDER_AUTH_FAIL', folderId: data.folderId });
                        if (node.isHoneyPot) {
                            conn.honeyPotStrikes = (conn.honeyPotStrikes || 0) + 1;
                            if (conn.honeyPotStrikes >= 3) {
                                conn.send({ type: 'HONEYPOT_LOCKDOWN' });
                                setTimeout(() => conn.close(), 500);
                            }
                        }
                    }
                }
            } else if (data.type === 'REQUEST_FILE' && conn.isAuthenticated) {
                const node = vfs.findNode(data.id);
                if (node && node.type === 'file') {
                    if (node.isNative) {
                        getDecryptedFileObj(node).then(blob => {
                            sendFileInChunks(conn, node.id, blob, node.name, node.mime, 'FILE_CHUNK', { isEncrypted: false });
                        }).catch(e => console.error('Native read error:', e));
                    } else {
                        sendFileInChunks(conn, node.id, node.fileObj, node.name, node.mime, 'FILE_CHUNK', { isEncrypted: node.isEncrypted, salt: node.salt, iv: node.iv });
                    }
                }
            } else if (data.type === 'REQUEST_ZIP_ALL' && conn.isAuthenticated) {
                generateZipBlob().then(blob => {
                    sendFileInChunks(conn, 'zip-all', blob, 'local-cast-backup.zip', 'application/zip', 'ZIP_CHUNK');
                });
            } else if (data.type === 'CLIENT_UPLOAD_CHUNK_START') {
                if (conn.permissions && conn.permissions.upload) {
                    incomingTransfers[data.id] = { chunks: [], received: 0, total: data.totalChunks, name: data.name, mime: data.mime, size: data.size || (data.totalChunks * CHUNK_SIZE), path: data.path, targetFolderId: data.targetFolderId, thumbnail: data.thumbnail };
                    createTransferItem(data.id, data.name, 'download');
                }
            } else if (data.type === 'CLIENT_UPLOAD_CHUNK') {
                if (!conn.permissions || !conn.permissions.upload) return;
                const transfer = incomingTransfers[data.id];
                if (transfer) {
                    transfer.chunks[data.index] = data.chunk;
                    transfer.received++;
                    updateTransferProgress(data.id, data.chunk.byteLength, transfer.size);
                    if (transfer.received === transfer.total) {
                        finishTransfer(data.id);
                        const fileBlob = new Blob(transfer.chunks, { type: transfer.mime });
                        const fileObj = new File([fileBlob], transfer.name, { type: transfer.mime });
                        const newId = 'file_' + Math.random().toString(36).substr(2);
                        
                        let current = vfs.currentDir;
                        if (transfer.targetFolderId) {
                            const found = vfs.findNode(transfer.targetFolderId);
                            if (found && found.type === 'folder') current = found;
                        }
                        
                        if (transfer.path) {
                            const parts = transfer.path.split('/');
                            for(let i=0; i<parts.length-1; i++) {
                                let folderName = parts[i];
                                let existing = current.children.find(c => c.type === 'folder' && c.name === folderName);
                                if (!existing) {
                                    existing = { id: 'folder_' + Math.random().toString(36).substr(2), name: folderName, type: 'folder', children: [], parent: current };
                                    current.children.push(existing);
                                }
                                current = existing;
                            }
                        }
                        
                        
                        (async () => {
                            let finalFileObj = fileObj;
                            let isEncrypted = false;
                            let salt = null;
                            let iv = null;
                            let nativeHandle = null;
                            let isNative = false;

                            let c = current;
                            let vaultNode = null;
                            let nativeNode = null;
                            while(c) {
                                if (c.isNative) { nativeNode = c; break; }
                                if (c.isVault) { vaultNode = c; break; }
                                c = c.parent;
                            }

                            if (nativeNode) {
                                try {
                                    const buffer = await fileBlob.arrayBuffer();
                                    const encryptedBuffer = await encryptNativeFile(buffer, nativeVaultPassword);
                                    let dirHandle = current.nativeHandle;
                                    if (!dirHandle && current.isNativeRoot) dirHandle = nativeVaultHandle;
                                    if (dirHandle) {
                                        const fileHandle = await dirHandle.getFileHandle(transfer.name + '.loc', { create: true });
                                        const writable = await fileHandle.createWritable();
                                        await writable.write(encryptedBuffer);
                                        await writable.close();
                                        nativeHandle = fileHandle;
                                        finalFileObj = null;
                                        isEncrypted = true;
                                        isNative = true;
                                    }
                                } catch (e) { console.error("Native save failed", e); }
                            } else if (vaultNode) {
                                try {
                                    const buffer = await fileBlob.arrayBuffer();
                                    const pass = unlockedVaults[vaultNode.id];
                                    if (pass) {
                                        const encData = await encryptFile(buffer, pass);
                                        finalFileObj = new Blob([encData.encrypted], { type: 'application/octet-stream' });
                                        isEncrypted = true;
                                        salt = encData.salt;
                                        iv = encData.iv;
                                    }
                                } catch(e) { console.error("Guest Vault upload failed:", e); }
                            }

                            current.children.push({ id: newId, name: transfer.name, type: 'file', size: transfer.size, mime: transfer.mime, fileObj: finalFileObj, parent: current, thumbnail: transfer.thumbnail, isEncrypted, salt, iv, nativeHandle, isNative });
                            saveVFSToDB();
                            renderHostExplorer();
                            broadcastTree();
                        })();

                        delete incomingTransfers[data.id];
                        conn.send({ type: 'UPLOAD_COMPLETE' });
                        notifyFileAdded(transfer.name);
                    }
                }
            } else if (data.type === 'CLIENT_MOVE_NODE') {
                if (conn.permissions && conn.permissions.delete) {
                    if (moveNode(data.id, data.targetFolderId)) {
                        saveVFSToDB();
                        renderHostExplorer();
                        broadcastTree();
                    } else {
                        conn.send({ type: 'ALERT', message: 'Move failed: Invalid node or target.' });
                    }
                } else {
                    conn.send({ type: 'ALERT', message: 'Move failed: No delete permission on Host.' });
                }
            } else if (data.type === 'CLIENT_RENAME_NODE') {
                if (conn.permissions && conn.permissions.delete) {
                    const node = vfs.findNode(data.id);
                    if (node && !node.isLocked) {
                        node.name = data.newName;
                        saveVFSToDB();
                        renderHostExplorer();
                        broadcastTree();
                    } else {
                        conn.send({ type: 'ALERT', message: 'Rename failed: Node not found or locked.' });
                    }
                } else {
                    conn.send({ type: 'ALERT', message: 'Rename failed: No delete permission on Host. Permissions object: ' + JSON.stringify(conn.permissions) });
                }
            } else if (data.type === 'CLIENT_DELETE_NODE') {
                if (conn.permissions && conn.permissions.delete) {
                    const node = vfs.findNode(data.id);
                    if (node && node.parent && !node.isLocked && !node.parent.isLocked) {
                        node.parent.children = node.parent.children.filter(c => c.id !== data.id);
                        saveVFSToDB();
                        renderHostExplorer();
                        broadcastTree();
                    }
                }
            } else if (data.type === 'TEXT_EDIT_SYNC') {
                if (conn.permissions && conn.permissions.edit) {
                    const node = vfs.findNode(data.fileId);
                    if (node && !node.isLocked) {
                        (async () => {
                            let fileBlob = new Blob([data.text], { type: 'text/plain' });
                            if (node.isEncrypted) {
                                let vaultDir = node.parent;
                                while (vaultDir && !vaultDir.isVault && vaultDir.parent) vaultDir = vaultDir.parent;
                                if (vaultDir && vaultDir.isVault) {
                                    const pass = unlockedVaults[vaultDir.id];
                                    if (pass) {
                                        const buffer = await fileBlob.arrayBuffer();
                                        const iv = crypto.getRandomValues(new Uint8Array(12));
                                        const encryptedBuffer = await encryptFile(buffer, pass, node.salt, iv);
                                        fileBlob = new Blob([encryptedBuffer], { type: 'text/plain' });
                                        node.iv = iv;
                                    }
                                }
                            }
                            node.fileObj = new File([fileBlob], node.name, { type: 'text/plain' });
                            node.size = fileBlob.size;
                            saveVFSToDB();
                        })();
                        
                        if (currentEditorFileId === data.fileId && !editorModal.classList.contains('hidden')) {
                            const selStart = editorTextarea.selectionStart;
                            editorTextarea.value = data.text;
                            editorTextarea.setSelectionRange(selStart, selStart);
                            editorTextarea.style.borderColor = 'var(--neon-green)';
                            setTimeout(() => editorTextarea.style.borderColor = 'var(--border-color)', 500);
                        }
                        
                        connections.forEach(c => {
                            if (c !== conn && c.open) c.send({ type: 'TEXT_EDIT_SYNC', fileId: data.fileId, text: data.text });
                        });
                    }
                }
            }
        });
        
        conn.on('open', () => {
            if (hostPassword) {
                conn.send({ type: 'AUTH_REQUIRED' });
            } else {
                conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
                conn.send({ type: 'GUEST_PERMISSIONS', permissions: conn.permissions });
            }
        });
        
        conn.on('close', () => {
            connections = connections.filter(c => c !== conn);
            broadcastPeers();
        });
    });

    setupHostActions();
    renderHostExplorer();
    hostExplorerGrid.addEventListener('click', (e) => {
        if (e.target === hostExplorerGrid) {
            selectedNodes.clear();
            document.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
        }
    });
}


function broadcastPeers() {
    if (!isHost) return;
    const peers = connections.filter(c => c.open && c.profile).map(c => ({ id: c.peer, alias: c.profile.name, color: c.profile.color, avatar: c.profile.avatar }));
    connections.forEach(c => {
        if (c.open) c.send({ type: 'PEER_LIST', peers });
    });
    // Update host's own list
    activePeers = {};
    peers.forEach(p => activePeers[p.id] = p);
}

function broadcastTree() {
    connections.forEach(conn => {
        if (conn.open && conn.isAuthenticated) {
            conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
        }
    });
}

async function generateZipBlob() {
    const zip = new JSZip();
    
    function addNodeToZip(node, currentZipFolder) {
        node.children.forEach(child => {
            if (child.type === 'folder') {
                const newFolder = currentZipFolder.folder(child.name);
                addNodeToZip(child, newFolder);
            } else if (child.type === 'file') {
                currentZipFolder.file(child.name, child.fileObj);
            }
        });
    }
    
    addNodeToZip(vfs.root, zip);
    return await zip.generateAsync({ type: 'blob' });
}

function setupHostActions() {
    btnNewFolder.addEventListener('click', () => {
        createFolderNameInput.value = '';
        createFolderIsVault.checked = false;
        createFolderModal.classList.remove('hidden');
    });
    
    btnCloseCreateFolder.addEventListener('click', () => createFolderModal.classList.add('hidden'));
    
    btnConfirmCreateFolder.addEventListener('click', async () => {
        const name = createFolderNameInput.value.trim();
        const isVault = createFolderIsVault.checked;
        if (!name) return;
        
        if (isVault) {
            createFolderModal.classList.add('hidden');
            vaultPasswordModal.classList.remove('hidden');
            vaultPasswordInput.value = '';
            
            const handleVaultSubmit = async () => {
                const pass = vaultPasswordInput.value;
                if (!pass) return alert("Password required for Vault!");
                
                // Remove listener so it doesn't fire multiple times
                btnConfirmVaultPassword.removeEventListener('click', handleVaultSubmit);
                vaultPasswordModal.classList.add('hidden');
                
                // Create a dummy salt for the folder (files will have their own)
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const folder = vfs.addFolder(name, true, salt);
                unlockedVaults[folder.id] = pass; // auto-unlock for host on creation
                
                saveVFSToDB();
                renderHostExplorer();
                broadcastTree();
            };
            
            btnConfirmVaultPassword.addEventListener('click', handleVaultSubmit);
            btnCloseVaultModal.addEventListener('click', () => {
                btnConfirmVaultPassword.removeEventListener('click', handleVaultSubmit);
                vaultPasswordModal.classList.add('hidden');
            }, { once: true });
        } else {
            vfs.addFolder(name);
            saveVFSToDB();
            renderHostExplorer();
            broadcastTree();
            createFolderModal.classList.add('hidden');
        }
    });
    
    btnUploadFiles.addEventListener('click', () => fileInput.click());
    btnUploadFolder.addEventListener('click', () => folderInput.click());
    
    btnBurn.addEventListener('click', () => {
        const time = prompt("SET BURN TIMER (seconds) or 0 for instant:", "10");
        if (time !== null && !isNaN(time)) {
            const seconds = parseInt(time, 10);
            startBurnCountdown(seconds);
            Object.values(connections).forEach(c => {
                if (c.open) c.send({ type: 'BURN_NOTICE', seconds: seconds });
            });
        }
    });
    
    btnDownloadAllHost.addEventListener('click', async () => {
        btnDownloadAllHost.style.opacity = '0.5';
        btnDownloadAllHost.innerText = 'Zipping...';
        const blob = await generateZipBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'local-cast-backup.zip';
        a.click();
        URL.revokeObjectURL(url);
        btnDownloadAllHost.style.opacity = '1';
        btnDownloadAllHost.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download Backup`;
    });
    
    fileInput.addEventListener('change', (e) => processFiles(Array.from(e.target.files)));
    folderInput.addEventListener('change', (e) => processFiles(Array.from(e.target.files)));
}


async function generateThumbnail(file) {
    if (!file || !file.type) return null;
    return new Promise((resolve) => {
        let timeout = setTimeout(() => { resolve(null); }, 2000);
        try {
            if (file.type.startsWith('image/')) {
                const img = new Image();
                const url = URL.createObjectURL(file);
                img.onload = () => {
                    clearTimeout(timeout);
                    try {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 256;
                        let width = img.width; let height = img.height;
                        if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
                        else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                        canvas.width = width; canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        URL.revokeObjectURL(url);
                        resolve(canvas.toDataURL('image/jpeg', 0.6));
                    } catch(e) { resolve(null); }
                };
                img.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(url); resolve(null); };
                img.src = url;
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                const url = URL.createObjectURL(file);
                video.src = url;
                video.muted = true;
                video.playsInline = true;
                
                const processVideo = () => {
                    clearTimeout(timeout);
                    try {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 256;
                        let width = video.videoWidth; let height = video.videoHeight;
                        if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
                        else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                        canvas.width = width || 256; canvas.height = height || 256;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        URL.revokeObjectURL(url);
                        resolve(canvas.toDataURL('image/jpeg', 0.6));
                    } catch(e) { resolve(null); }
                };

                video.onloadedmetadata = () => {
                    video.currentTime = Math.min(1, video.duration / 2);
                };
                video.onseeked = processVideo;
                video.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(url); resolve(null); };
                video.load();
            } else {
                clearTimeout(timeout);
                resolve(null);
            }
        } catch(e) {
            clearTimeout(timeout);
            resolve(null);
        }
    });
}

async function processFiles(files) {
    const isVault = vfs.currentDir.isVault;
    const isNativeDir = vfs.currentDir.isNative || (() => { let c=vfs.currentDir; while(c){ if(c.isNative)return true; c=c.parent; } return false; })();
    let password = null;
    if (isVault) {
        password = unlockedVaults[vfs.currentDir.id];
        if (!password) {
            alert("Please unlock this Vault before adding files.");
            return;
        }
    }
    if (isNativeDir && !nativeVaultPassword) {
        alert("Native Vault is locked!");
        return;
    }

    for (const file of files) {
        let thumbnailData = await generateThumbnail(file);
        const localTransferId = "local_" + Date.now() + "_" + Math.floor(Math.random()*1000);
        createTransferItem(localTransferId, (isNativeDir || isVault) ? ("Encrypting " + file.name) : file.name, "upload");
        updateTransferProgress(localTransferId, 0, file.size || 1);

        let finalFileObj = file;
        let finalSize = file.size;
        let isEncrypted = false;
        let salt = null;
        let iv = null;
        let nativeHandle = null;

        if (isNativeDir) {
            try {
                const buffer = await file.arrayBuffer();
                const encryptedBuffer = await encryptNativeFile(buffer, nativeVaultPassword);
                
                // Write to Native FS
                let dirHandle = vfs.currentDir.nativeHandle;
                if (!dirHandle && vfs.currentDir.isNativeRoot) dirHandle = nativeVaultHandle;
                
                const fileHandle = await dirHandle.getFileHandle(file.name + '.loc', { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(encryptedBuffer);
                await writable.close();
                
                nativeHandle = fileHandle;
                finalSize = encryptedBuffer.byteLength;
                isEncrypted = true;
                // For VFS representation, we don't need a Blob since we read directly from OS
                finalFileObj = null; 
            } catch (e) {
                console.error("Native write failed", e);
                finishTransfer(localTransferId);
                continue;
            }
        } else if (isVault) {
            try {
                const buffer = await file.arrayBuffer();
                const encData = await encryptFile(buffer, password);
                finalFileObj = new Blob([encData.encrypted], { type: 'application/octet-stream' });
                finalSize = finalFileObj.size;
                isEncrypted = true;
                salt = encData.salt;
                iv = encData.iv;
            } catch (e) {
                console.error("Encryption failed for", file.name, e);
                finishTransfer(localTransferId);
                continue;
            }
        }

        if (file.webkitRelativePath) {
            const parts = file.webkitRelativePath.split('/');
            let current = vfs.currentDir;
            for(let i=0; i<parts.length-1; i++) {
                let folderName = parts[i];
                let existing = current.children.find(c => c.type === 'folder' && c.name === folderName);
                if (!existing) {
                    existing = { id: 'folder_' + Math.random().toString(36).substr(2), name: folderName, type: 'folder', children: [], parent: current };
                    vfs.addNode(current, existing);
                }
                current = existing;
            }
            vfs.addNode(current, {
                type: 'file',
                name: file.name,
                size: finalSize,
                mime: file.type,
                fileObj: finalFileObj,
                isEncrypted, salt, iv,
                nativeHandle,
                isNative: !!nativeHandle,
                thumbnail: thumbnailData
            });
        } else {
            vfs.addNode(vfs.currentDir, {
                type: 'file',
                name: file.name,
                size: finalSize,
                mime: file.type,
                fileObj: finalFileObj,
                isEncrypted, salt, iv,
                nativeHandle,
                isNative: !!nativeHandle,
                thumbnail: thumbnailData
            });
        }
        updateTransferProgress(localTransferId, finalSize, finalSize);
        finishTransfer(localTransferId);
        renderHostExplorer();
    }
    saveVFSToDB();
    fileInput.value = '';
    folderInput.value = '';
    renderHostExplorer();
    broadcastTree();
}

function moveNode(nodeId, targetFolderId, autoRender = true) {
    const node = vfs.findNode(nodeId);
    const target = vfs.findNode(targetFolderId);
    
    if (!node || !target || target.type !== 'folder') return false;
    
    let curr = target;
    while(curr) {
        if(curr.id === node.id) return false;
        curr = curr.parent;
    }
    
    if (node.parent) {
        node.parent.children = node.parent.children.filter(c => c.id !== node.id);
    }
    
    node.parent = target;
    target.children.push(node);
    
    if (autoRender) {
        saveVFSToDB();
        renderHostExplorer();
        broadcastTree();
    }
    return true;
}


    // Konami code for dead drops
    [hostSearch, document.getElementById('client-search')].forEach(input => {
        if (!input) return;
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (input.value.trim().toLowerCase() === '/deaddrop') {
                    showDeadDrops = !showDeadDrops;
                    input.value = '';
                    hostSearchQuery = '';
                    clientSearchQuery = '';
                    if (isHost) {
                        renderHostExplorer();
                        broadcastTree();
                    } else {
                        renderClientExplorer();
                    }
                    
                    // Glitch effect
                    document.body.style.animation = 'glitch-anim 0.2s';
                    setTimeout(() => document.body.style.animation = '', 200);
                }
            }
        });
    });

function renderHostExplorer() {
    renderBreadcrumbs(vfs.currentDir, hostBreadcrumbs, (node) => {
        vfs.currentDir = node;
        renderHostExplorer();
    });
    
    hostExplorerGrid.innerHTML = '';
    let itemsToRender = vfs.currentDir.children;
    if (hostSearchQuery) {
        itemsToRender = [];
        searchVFS(vfs.root, hostSearchQuery, itemsToRender);
    }
    
    if (sortSelectHost) {
        itemsToRender = sortNodes(itemsToRender, sortSelectHost.value);
    }
    
    itemsToRender.forEach(child => {
        const item = document.createElement('div');
        item.className = `file-item ${child.type}`;
        
        const icon = child.thumbnail ? `<div class="item-thumbnail" style="background-image: url('${child.thumbnail}');"></div>` : (child.type === 'folder' ? 
            `<svg class="item-icon folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>${child.isLocked || child.password || child.isVault ? '<rect x="15" y="15" width="8" height="8" fill="var(--bg-card)" stroke="none"></rect><rect x="16" y="18" width="6" height="4" rx="1" fill="var(--neon-red)" stroke="var(--neon-red)"></rect><path d="M17 18V16a2 2 0 0 1 4 0v2" stroke="var(--neon-red)"></path>' : ''}</svg>` : 
            `<svg class="item-icon file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`);
            
        item.innerHTML = `${icon}<div class="item-name" title="${child.name}">${child.name}</div>`;
        item.draggable = true;
        
        if (child.isHoneyPot) {
            item.style.borderColor = '#ff00ff';
            item.style.boxShadow = '0 0 10px #ff00ff';
        }
        if (child.isHidden) {
            item.style.opacity = '0.5';
            item.style.boxShadow = '0 0 10px var(--neon-purple)';
        }
        
        if (selectedNodes.has(child.id)) item.classList.add('selected');
        
        item.addEventListener('click', (e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey) {
                if (selectedNodes.has(child.id)) {
                    selectedNodes.delete(child.id);
                    item.classList.remove('selected');
                } else {
                    selectedNodes.add(child.id);
                    item.classList.add('selected');
                }
            } else {
                selectedNodes.clear();
                document.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
                selectedNodes.add(child.id);
                item.classList.add('selected');
            }
        });
        
        item.addEventListener('dragstart', (e) => {
            if (!selectedNodes.has(child.id)) {
                selectedNodes.clear();
                document.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
                selectedNodes.add(child.id);
                item.classList.add('selected');
            }
            e.dataTransfer.setData('application/json', JSON.stringify(Array.from(selectedNodes)));
            e.dataTransfer.effectAllowed = 'move';
        });
        
        if (child.type === 'folder') {
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.style.borderColor = 'var(--neon-blue)';
            });
            item.addEventListener('dragleave', () => {
                item.style.borderColor = 'transparent';
            });
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.style.borderColor = 'transparent';
                try {
                    const ids = JSON.parse(e.dataTransfer.getData('application/json'));
                    let moved = false;
                    ids.forEach(id => {
                        if (id !== child.id && moveNode(id, child.id, false)) moved = true;
                    });
                    if (moved) {
                        selectedNodes.clear();
                        saveVFSToDB();
                        renderHostExplorer();
                        broadcastTree();
                    }
                } catch(err) {
                    // Fallback
                    const draggedId = e.dataTransfer.getData('text/plain');
                    if (draggedId && draggedId !== child.id) moveNode(draggedId, child.id);
                }
            });
            
            item.addEventListener('dblclick', () => {
                if (child.isVault && !unlockedVaults[child.id]) {
                    vaultPasswordModal.classList.remove('hidden');
                    vaultPasswordInput.value = '';
                    
                    const handleUnlock = async () => {
                        const pass = vaultPasswordInput.value;
                        if (!pass) return alert("Password required");
                        btnConfirmVaultPassword.removeEventListener('click', handleUnlock);
                        vaultPasswordModal.classList.add('hidden');
                        
                        unlockedVaults[child.id] = pass;
                        vfs.currentDir = child;
                        renderHostExplorer();
                        broadcastTree();
                    };
                    btnConfirmVaultPassword.addEventListener('click', handleUnlock);
                    btnCloseVaultModal.addEventListener('click', () => {
                        btnConfirmVaultPassword.removeEventListener('click', handleUnlock);
                        vaultPasswordModal.classList.add('hidden');
                    }, { once: true });
                } else {
                    vfs.currentDir = child;
                    renderHostExplorer();
                }
            });
        }
        
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            contextTargetId = child.id;
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.classList.remove('hidden');
            if (document.getElementById('ctx-deaddrop')) document.getElementById('ctx-deaddrop').style.display = child.type === 'folder' ? 'flex' : 'none';
            if (document.getElementById('ctx-magic-link')) document.getElementById('ctx-magic-link').style.display = child.type === 'file' ? 'flex' : 'none';
        });
        
        if (child.type === 'file' && (child.name.endsWith('.txt') || child.name.endsWith('.md'))) {
            item.addEventListener('dblclick', async () => {
                    try {
                        const decryptedObj = await getDecryptedFileObj(child);
                        const text = await decryptedObj.text();
                        currentEditorFileId = child.id;
                        editorFilename.value = child.name;
                        editorTextarea.value = text;
                        editorModal.classList.remove('hidden');
                    } catch (e) {
                        alert("Failed to decrypt: " + e.message);
                    }
            });
        } else if (child.type === 'file' && child.mime && (child.mime.startsWith('image/') || child.mime.startsWith('video/') || child.mime.startsWith('audio/'))) {
            item.addEventListener('dblclick', async () => {
                    try {
                        const decryptedObj = await getDecryptedFileObj(child);
                        const url = URL.createObjectURL(decryptedObj);
                        mediaModal.classList.remove('hidden');
                    mediaTitle.innerText = child.name;
                    mediaContainer.innerHTML = '';
                    if (btnDownloadMedia) {
                        btnDownloadMedia.href = url;
                        btnDownloadMedia.download = child.name;
                        btnDownloadMedia.style.display = "block";
                    }
                    if (child.mime.startsWith('video/')) {
                        mediaContainer.innerHTML = `<video src="${url}" controls autoplay style="width:100%; max-height:70vh; display:block;"></video>`;
                    } else if (child.mime.startsWith('audio/')) {
                        mediaContainer.innerHTML = `<audio src="${url}" controls autoplay style="width:100%;"></audio>`;
                    } else {
                        mediaContainer.innerHTML = `<img src="${url}" style="max-width:100%; max-height:70vh; display:block; margin:0 auto;" />`;
                    }
                    } catch (e) {
                        alert("Failed to decrypt: " + e.message);
                    }
            });
        } else if (child.type === 'file') {
            item.addEventListener('dblclick', async () => {
                    try {
                        const decryptedObj = await getDecryptedFileObj(child);
                        const url = URL.createObjectURL(decryptedObj);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = child.name;
                        a.click();
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                    } catch (e) {
                        alert("Failed to decrypt: " + e.message);
                    }
            });
        }
        
        hostExplorerGrid.appendChild(item);
    });
}

function renderBreadcrumbs(currentDir, container, onClick) {
    container.innerHTML = '';
    const path = [];
    let curr = currentDir;
    while(curr) {
        path.unshift(curr);
        curr = curr.parent;
    }
    
    path.forEach((node, idx) => {
        const crumb = document.createElement('span');
        crumb.className = 'crumb';
        crumb.textContent = (idx === 0 ? '/ ' : ' / ') + node.name;
        crumb.addEventListener('click', () => onClick(node));
        
        crumb.addEventListener('dragover', (e) => {
            e.preventDefault();
            crumb.style.color = '#fff';
            crumb.style.textShadow = '0 0 8px var(--neon-blue)';
        });
        crumb.addEventListener('dragleave', () => {
            crumb.style.color = '';
            crumb.style.textShadow = '';
        });
        crumb.addEventListener('drop', (e) => {
            e.preventDefault();
            crumb.style.color = '';
            crumb.style.textShadow = '';
            try {
                const ids = JSON.parse(e.dataTransfer.getData('application/json'));
                let moved = false;
                ids.forEach(id => {
                    if (id !== node.id && moveNode(id, node.id, false)) moved = true;
                });
                if (moved) {
                    selectedNodes.clear();
                    saveVFSToDB();
                    renderHostExplorer();
                    broadcastTree();
                }
            } catch(err) {
                const draggedId = e.dataTransfer.getData('text/plain');
                if (draggedId && draggedId !== node.id) moveNode(draggedId, node.id);
            }
        });
        
        container.appendChild(crumb);
    });
}

// --- CLIENT LOGIC ---
async function initClient() {
    updateStatus('CONNECTING...', 'offline');
    
    peer = new Peer({ debug: 2 });
    peer.on("error", err => console.error("PeerJS Client Error:", err));
    
    // Intercept incoming connections for Swarm
    peer.on('connection', (conn) => {
        if (!isHost) {
            conn.on('open', () => {
                if (!swarmConnections.find(c => c.peer === conn.peer)) {
                    swarmConnections.push(conn);
                    printCli('Swarm peer connected: ' + conn.peer, 'var(--neon-green)');
                }
            });
            
            conn.on('data', (data) => {
                if (['ARCADE_INVITE', 'ARCADE_ACCEPT', 'ARCADE_DECLINE', 'ARCADE_MOVE', 'ARCADE_RESET'].includes(data.type)) {
                    handleArcadeNetwork(data);
                }
            });
            
            conn.on('close', () => {
                swarmConnections = swarmConnections.filter(c => c.peer !== conn.peer);
            });
        }
    });

    peer.on('call', async (call) => {
        if (call.metadata && call.metadata.type === 'media_stream') return; // Handled elsewhere
        try {
            localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            call.answer(localMediaStream);
            currentCall = call;
            openWhisper(call.peer, 'Incoming Comm-Link', 'var(--neon-green)');
            setupCallHandlers(call);
        } catch (e) {
            console.error("Failed to answer call:", e);
            call.close();
        }
    });

    peer.on('open', () => {
        hostConnection = peer.connect(roomCode, { reliable: true });
        
        hostConnection.on('open', () => {
            updateStatus('CONNECTED TO HOST', 'online');
        });
        
        hostConnection.on('data', (data) => {
            if (['ARCADE_INVITE', 'ARCADE_ACCEPT', 'ARCADE_DECLINE', 'ARCADE_MOVE', 'ARCADE_RESET'].includes(data.type)) {
                handleArcadeNetwork(data);
            } else if (data.type === 'AUTH_REQUIRED') {
                passwordModal.classList.remove('hidden');
            } else if (data.type === 'AUTH_SUCCESS') {
                passwordModal.classList.add('hidden');
                passwordError.classList.add('hidden');
            } else if (data.type === 'AUTH_FAIL') {
                passwordError.classList.remove('hidden');
            } else if (data.type === 'TREE') {
                hostConnection.send({ type: 'PROFILE_UPDATE', name: guestAlias, color: guestColor, avatar: guestAvatar });
                clientVFS = data.tree;
                
                // Reconstruct parent links for client navigation
                function linkParents(node, parent) {
                    node.parent = parent;
                    if (node.children) node.children.forEach(c => linkParents(c, node));
                }
                linkParents(clientVFS, null);
                
                // Keep current directory if it still exists in the new tree
                if (clientCurrentDir) {
                    const findInTree = (id, n) => {
                        if (n.id === id) return n;
                        if (n.children) {
                            for (let c of n.children) {
                                let f = findInTree(id, c);
                                if (f) return f;
                            }
                        }
                        return null;
                    };
                    const stillExists = findInTree(clientCurrentDir.id, clientVFS);
                    clientCurrentDir = stillExists ? stillExists : clientVFS;
                } else {
                    clientCurrentDir = clientVFS;
                }
                
                renderClientExplorer();
            } else if (data.type === 'FILE_CHUNK_START' || data.type === 'ZIP_CHUNK_START') {
                incomingTransfers[data.id] = { chunks: [], received: 0, total: data.totalChunks, name: data.name, mime: data.mime, size: data.size || (data.totalChunks * CHUNK_SIZE), isEncrypted: data.isEncrypted, salt: data.salt, iv: data.iv };
                createTransferItem(data.id, data.name, 'download');
                const pct = document.getElementById(data.type === 'ZIP_CHUNK_START' ? 'client-progress-text' : 'preview-progress-text');
                if (pct) pct.textContent = '0%';
            } else if (data.type === 'FILE_CHUNK' || data.type === 'ZIP_CHUNK') {
                const transfer = incomingTransfers[data.id];
                if (transfer) {
                    transfer.chunks[data.index] = data.chunk;
                    transfer.received++;
                    updateTransferProgress(data.id, data.chunk.byteLength, transfer.size);
                    const pctVal = Math.floor((transfer.received / transfer.total) * 100);
                    const pct = document.getElementById(data.type === 'ZIP_CHUNK' ? 'client-progress-text' : 'preview-progress-text');
                    if (pct) pct.textContent = `${pctVal}%`;
                    
                    if (transfer.received === transfer.total) {
                        finishTransfer(data.id);
                        const blob = new Blob(transfer.chunks, { type: transfer.mime });
                        if (transfer.isEncrypted) {
                            // Since they already unlocked the folder, they have the password!
                            // Or they might have been sent the file directly.
                            const pass = clientUnlockedVaults[clientCurrentDir.id];
                            if (pass) {
                                (async () => {
                                    try {
                                        const buffer = await blob.arrayBuffer();
                                        const decryptedBuffer = await decryptFile(buffer, pass, transfer.salt, transfer.iv);
                                        const decryptedBlob = new Blob([decryptedBuffer], { type: transfer.mime });
                                        triggerDownload(decryptedBlob, transfer.name, transfer.mime, data.id);
                                    } catch (e) {
                                        alert("Decryption failed: " + e.message);
                                    }
                                })();
                            } else {
                                vaultPasswordModal.classList.remove('hidden');
                                vaultPasswordInput.value = '';
                                
                                const handleClientDecrypt = async () => {
                                    const manualPass = vaultPasswordInput.value;
                                    if (!manualPass) return alert("Password required to decrypt!");
                                    btnConfirmVaultPassword.removeEventListener('click', handleClientDecrypt);
                                    vaultPasswordModal.classList.add('hidden');
                                    
                                    try {
                                        const buffer = await blob.arrayBuffer();
                                        const decryptedBuffer = await decryptFile(buffer, manualPass, transfer.salt, transfer.iv);
                                        const decryptedBlob = new Blob([decryptedBuffer], { type: transfer.mime });
                                        triggerDownload(decryptedBlob, transfer.name, transfer.mime, data.id);
                                    } catch (e) {
                                        alert("Decryption failed: " + e.message);
                                    }
                                };
                                
                                btnConfirmVaultPassword.addEventListener('click', handleClientDecrypt);
                                btnCloseVaultModal.addEventListener('click', () => {
                                    btnConfirmVaultPassword.removeEventListener('click', handleClientDecrypt);
                                    vaultPasswordModal.classList.add('hidden');
                                }, { once: true });
                            }
                        } else {
                            triggerDownload(blob, transfer.name, transfer.mime, data.id);
                        }
                        delete incomingTransfers[data.id];
                    }
                }
            } else if (data.type === 'ALERT') {
                alert(data.message);
            } else if (data.type === 'GUEST_PERMISSIONS') {
                myPermissions = data.permissions;
                if (btnUploadFilesClient) btnUploadFilesClient.classList.toggle('hidden', !myPermissions.upload);
                if (btnUploadFolderClient) btnUploadFolderClient.classList.toggle('hidden', !myPermissions.upload);
                if (btnChatToggle) btnChatToggle.classList.toggle('hidden', myPermissions.chat === false);
                if (chatSidebar && myPermissions.chat === false) chatSidebar.classList.add('hidden');
                
                // Hide context menu rename/delete buttons if not allowed
                const ctxRename = document.getElementById('ctx-rename');
                const ctxDelete = document.getElementById('ctx-delete');
                if (ctxRename) ctxRename.style.display = myPermissions.delete ? 'flex' : 'none';
                if (ctxDelete) ctxDelete.style.display = myPermissions.delete ? 'flex' : 'none';
            } else if (data.type === 'UPLOAD_COMPLETE') {
                // Let the processClientFiles loop handle the UI and final alert
            } else if (data.type === 'WHITEBOARD_DRAW') {
                if (wbCtx) {
                    const w = wbCanvas.width; const h = wbCanvas.height;
                    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, false);
                }
            } else if (data.type === 'WHITEBOARD_CLEAR') {
                if (wbCtx) wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
            } else if (data.type === 'TEXT_EDIT_SYNC') {
                if (currentEditorFileId === data.fileId && !editorModal.classList.contains('hidden')) {
                    const selStart = editorTextarea.selectionStart;
                    editorTextarea.value = data.text;
                    editorTextarea.setSelectionRange(selStart, selStart);
                    editorTextarea.style.borderColor = 'var(--neon-blue)';
                    setTimeout(() => editorTextarea.style.borderColor = 'var(--border-color)', 500);
                }
            } else if (data.type === 'INTERCOM_LIST') {
                data.users.forEach(id => {
                    if (id !== peer.id && inIntercom) {
                        const call = peer.call(id, localAudioStream);
                        call.on('stream', (remoteStream) => playAudioStream(remoteStream, id));
                        call.on('close', () => cleanupAudio(id));
                        activeCalls[id] = call;
                    }
                });
            } else if (data.type === 'WHITEBOARD_SYNC') {
                if (ctx && data.image) {
                    const img = new Image();
                    img.onload = () => wbCtx.drawImage(img, 0, 0, wbCanvas.width, wbCanvas.height);
                    img.src = data.image;
                }
            } else if (data.type === 'SCRATCHPAD_UPDATE') {
                if (scratchpadModal && !scratchpadModal.classList.contains('hidden') && scratchpadTextarea.value !== data.text) {
                    const start = scratchpadTextarea.selectionStart;
                    const end = scratchpadTextarea.selectionEnd;
                    scratchpadTextarea.value = data.text;
                    scratchpadTextarea.setSelectionRange(start, end);
                }
            
            } else if (data.type === 'NETWORK_MAP') {
                const map = data.peers;
                map.forEach(peerId => {
                    if (peerId !== peer.id && !swarmConnections.find(c => c.peer === peerId)) {
                        const conn = peer.connect(peerId, { reliable: true });
                        conn.on('open', () => {
                            swarmConnections.push(conn);
                            printCli('Connected to Swarm peer: ' + peerId, 'var(--neon-green)');
                        });
                        conn.on('close', () => {
                            swarmConnections = swarmConnections.filter(c => c.peer !== peerId);
                        });
                        conn.on('data', (d) => {
                            if (['ARCADE_INVITE', 'ARCADE_ACCEPT', 'ARCADE_DECLINE', 'ARCADE_MOVE', 'ARCADE_RESET'].includes(d.type)) {
                                handleArcadeNetwork(d);
                            }
                        });
                    }
                });
            } else if (data.type === 'KICK') {
                window.location.reload();
            } else if (data.type === 'PEER_LIST') {
                activePeers = {};
                data.peers.forEach(p => activePeers[p.id] = p);
            } else if (data.type === 'WHISPER') {
                handleWhisper(data);
} else if (data.type === 'CHAT_MSG') {
                appendChatMessage(data.sender, data.text, data.sender === 'System' ? 'system' : 'other', data.color);
            } else if (data.type === 'FILE_ADDED_TOAST') {
                showToast(`New file: ${data.filename}`);
            } else if (data.type === 'NATIVE_VAULT_AUTH_SUCCESS') {
                clientUnlockedVaults[data.folderId] = true;
                clientCurrentDir = clientVFS.root.children.find(c => c.id === data.folderId) || clientCurrentDir;
                if (data.permission === 'write' && btnUploadFilesClient) {
                    myPermissions.upload = true; // Temp upload permit
                    btnUploadFilesClient.classList.remove('hidden');
                }
                renderClientExplorer();
            } else if (data.type === 'NATIVE_VAULT_AUTH_FAIL') {
                alert("Incorrect Native Vault PIN.");
            } else if (data.type === 'NATIVE_VAULT_ACCESS_DENIED') {
                alert("The Host denied your request to access the Native Vault.");
                guestOtpEntryModal.classList.add('hidden');
            } else if (data.type === 'FOLDER_AUTH_SUCCESS') {
                folderPasswordModal.classList.add('hidden');
                autoEnterFolderId = activeAuthFolderId;
                // The updated TREE will arrive next and we can navigate in
            } else if (data.type === 'FOLDER_AUTH_FAIL') {
                folderPasswordError.classList.remove('hidden');
                        } else if (data.type === 'BURN_NOTICE') {
                startBurnCountdown(data.seconds);
            } else if (data.type === 'HONEYPOT_LOCKDOWN') {
                document.getElementById('lockdown-overlay').classList.remove('hidden');
} else if (data.type === 'SERVER_BURNED') {
                triggerBurnSequence();
            }
        });
        
        hostConnection.on('close', () => {
            updateStatus('HOST DISCONNECTED', 'offline');
        });
    });
    
    btnSubmitFolderPassword.addEventListener('click', () => {
        const pwd = folderPasswordInput.value;
        if (pwd && hostConnection && hostConnection.open && activeAuthFolderId) {
            hostConnection.send({ type: 'FOLDER_AUTH_ATTEMPT', folderId: activeAuthFolderId, password: pwd });
        }
    });
    btnCancelFolderPassword.addEventListener('click', () => folderPasswordModal.classList.add('hidden'));

    btnSubmitPassword.addEventListener('click', () => {
        const pwd = clientPasswordInput.value;
        if (pwd && hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'AUTH_ATTEMPT', password: pwd });
        }
    });
    
    if(btnUploadFilesClient) btnUploadFilesClient.addEventListener("click", () => clientFileInput.click());
    if(btnUploadFolderClient) btnUploadFolderClient.addEventListener("click", () => clientFolderInput.click());
    
    if(clientFileInput) clientFileInput.addEventListener("change", (e) => processClientFiles(Array.from(e.target.files)));
    if(clientFolderInput) clientFolderInput.addEventListener("change", (e) => processClientFiles(Array.from(e.target.files)));
    
    btnDownloadAllClient.addEventListener('click', () => {
        if (hostConnection && hostConnection.open) {
            clientDownloading.classList.remove('hidden');
            downloadFilename.textContent = 'local-cast-backup.zip (Zipping on Host...)';
            hostConnection.send({ type: 'REQUEST_ZIP_ALL' });
        }
    });
    
}

async function processClientFiles(files) {
    if (!files.length || !hostConnection || !hostConnection.open) return;
    const btnUploadFilesClient = document.getElementById('btn-upload-files-client');
    if (btnUploadFilesClient && btnUploadFilesClient.classList.contains('hidden')) {
        alert("The host has disabled guest uploads.");
        return;
    }
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        downloadFilename.textContent = `Uploading ${file.name} (${i + 1}/${files.length})`;
        document.getElementById("client-progress-text").textContent = "Starting...";
        const thumbnailData = await generateThumbnail(file);
        const extraData = { targetFolderId: clientCurrentDir.id, path: file.webkitRelativePath || '', thumbnail: thumbnailData };
        await sendFileInChunks(hostConnection, "upload_" + Date.now() + "_" + i, file, file.name, file.type, "CLIENT_UPLOAD_CHUNK", extraData);
    }
    
    // Upload complete
}

if (btnCloseMedia) {
    btnCloseMedia.addEventListener('click', () => {
        mediaModal.classList.add('hidden');
        mediaContainer.innerHTML = ''; // Stop playback
    });
}

btnClosePreview.addEventListener('click', () => {
    previewModal.classList.add('hidden');
    btnDownloadDirect.classList.add('hidden');
    btnDownloadDirect.style.display = "none";
    if(btnStreamDirect) { btnStreamDirect.classList.add('hidden'); btnStreamDirect.style.display = 'none'; }
    btnRequestFile.classList.remove("hidden");
    document.getElementById("preview-loader-container").classList.add("hidden");
    document.getElementById("preview-icon").innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 80px; height: 80px; color: var(--neon-blue);"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
    if (btnDownloadDirect.href) {
        URL.revokeObjectURL(btnDownloadDirect.href);
        btnDownloadDirect.href = '';
    }
});

btnRequestFile.addEventListener('click', () => {
    if (activePreviewFileId && hostConnection && hostConnection.open) {
        btnRequestFile.classList.add("hidden");
        document.getElementById("preview-loader-container").classList.remove("hidden");
        hostConnection.send({ type: 'REQUEST_FILE', id: activePreviewFileId });
    }
});

function renderClientExplorer() {
    if (!clientCurrentDir) return;
    
    renderBreadcrumbs(clientCurrentDir, clientBreadcrumbs, (node) => {
        clientCurrentDir = node;
        renderClientExplorer();
    });
    
    clientExplorerGrid.innerHTML = '';
    if (clientCurrentDir.children.length === 0) {
        clientExplorerGrid.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">Folder is empty</p>';
        return;
    }
    
    let itemsToRender = clientCurrentDir.children;
    if (clientSearchQuery) {
        itemsToRender = [];
        searchVFS(clientVFS, clientSearchQuery, itemsToRender);
    }
    
    if (sortSelectClient) {
        itemsToRender = sortNodes(itemsToRender, sortSelectClient.value);
    }
    
    itemsToRender.forEach(child => {
        const item = document.createElement('div');
        item.className = `file-item ${child.type}`;
        
        const icon = child.thumbnail ? `<div class="item-thumbnail" style="background-image: url('${child.thumbnail}');"></div>` : (child.type === 'folder' ? 
            `<svg class="item-icon folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>${child.isLocked || child.password ? '<rect x="15" y="15" width="8" height="8" fill="var(--bg-card)" stroke="none"></rect><rect x="16" y="18" width="6" height="4" rx="1" fill="var(--neon-red)" stroke="var(--neon-red)"></rect><path d="M17 18V16a2 2 0 0 1 4 0v2" stroke="var(--neon-red)"></path>' : ''}</svg>` : 
            `<svg class="item-icon file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`);
            
        const sizeText = child.size ? `<div class="item-meta">${(child.size / 1024 / 1024).toFixed(2)} MB</div>` : '';
        item.innerHTML = `${icon}<div class="item-name" title="${child.name}">${child.name}</div>${sizeText}`;
        item.draggable = true;
        
        item.addEventListener('dragstart', (e) => {
            if (!myPermissions || !myPermissions.delete) { e.preventDefault(); return; }
            e.dataTransfer.setData('text/plain', child.id);
            e.dataTransfer.effectAllowed = 'move';
        });

        if (child.type === 'folder') {
            item.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; item.style.background = 'rgba(255,255,255,0.1)'; });
            item.addEventListener('dragleave', () => item.style.background = 'transparent');
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.style.background = 'transparent';
                const nodeId = e.dataTransfer.getData('text/plain');
                if (nodeId && nodeId !== child.id) {
                    if (hostConnection && hostConnection.open) {
                        hostConnection.send({ type: 'CLIENT_MOVE_NODE', id: nodeId, targetFolderId: child.id });
                    }
                }
            });
        }
        
        item.addEventListener('click', () => {
            if (child.type === 'folder') {
                if (child.isLocked && !child.isUnlocked) {
                    activeAuthFolderId = child.id;
                    folderPasswordInput.value = '';
                    folderPasswordError.classList.add('hidden');
                    folderPasswordModal.classList.remove('hidden');
                } else if (child.isNativeRoot && !clientUnlockedVaults[child.id]) {
                    hostConnection.send({ type: 'REQUEST_NATIVE_VAULT_ACCESS' });
                    guestOtpEntryModal.classList.remove('hidden');
                    guestOtpInput.value = '';
                    
                    const handleGuestOtpSubmit = () => {
                        const pin = guestOtpInput.value;
                        if (!pin) return;
                        hostConnection.send({ type: 'SUBMIT_NATIVE_VAULT_OTP', pin: pin, folderId: child.id });
                        guestOtpEntryModal.classList.add('hidden');
                        btnSubmitGuestOtp.removeEventListener('click', handleGuestOtpSubmit);
                        btnCloseGuestOtp.removeEventListener('click', handleGuestOtpClose);
                    };
                    const handleGuestOtpClose = () => {
                        guestOtpEntryModal.classList.add('hidden');
                        btnSubmitGuestOtp.removeEventListener('click', handleGuestOtpSubmit);
                        btnCloseGuestOtp.removeEventListener('click', handleGuestOtpClose);
                    };
                    btnSubmitGuestOtp.addEventListener('click', handleGuestOtpSubmit);
                    btnCloseGuestOtp.addEventListener('click', handleGuestOtpClose);
                } else if (child.isVault && !clientUnlockedVaults[child.id]) {
                    vaultPasswordModal.classList.remove('hidden');
                    vaultPasswordInput.value = '';
                    
                    const handleClientVaultUnlock = () => {
                        const pass = vaultPasswordInput.value;
                        if (!pass) return alert("Password required");
                        btnConfirmVaultPassword.removeEventListener('click', handleClientVaultUnlock);
                        vaultPasswordModal.classList.add('hidden');
                        
                        clientUnlockedVaults[child.id] = pass;
                        clientCurrentDir = child;
                        renderClientExplorer();
                    };
                    btnConfirmVaultPassword.addEventListener('click', handleClientVaultUnlock);
                    btnCloseVaultModal.addEventListener('click', () => {
                        btnConfirmVaultPassword.removeEventListener('click', handleClientVaultUnlock);
                        vaultPasswordModal.classList.add('hidden');
                    }, { once: true });
                } else {
                    clientCurrentDir = child;
                    renderClientExplorer();
                }
            } else {
                // Open Preview Modal
                activePreviewFileId = child.id;
                previewFilename.textContent = child.name;
                previewMeta.textContent = `${(child.size / 1024 / 1024).toFixed(2)} MB  •  ${child.mime || 'Unknown Type'}`;
                
                btnDownloadDirect.classList.add('hidden');
                btnDownloadDirect.style.display = "none";
        if(btnStreamDirect) { btnStreamDirect.classList.add('hidden'); btnStreamDirect.style.display = 'none'; }
                btnRequestFile.classList.remove("hidden");
                document.getElementById("preview-loader-container").classList.add("hidden");
                document.getElementById("preview-icon").innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 80px; height: 80px; color: var(--neon-blue);"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
                
                previewModal.classList.remove('hidden');
            }
        });
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            contextTargetId = child.id;
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.classList.remove('hidden');
            
            // Hide host-only options
            if (document.getElementById('ctx-deaddrop')) document.getElementById('ctx-deaddrop').style.display = 'none';
            if (document.getElementById('ctx-magic-link')) document.getElementById('ctx-magic-link').style.display = 'none';
            if (document.getElementById('ctx-lock')) document.getElementById('ctx-lock').style.display = 'none';
            if (document.getElementById('ctx-honeypot')) document.getElementById('ctx-honeypot').style.display = 'none';
        });
        
        clientExplorerGrid.appendChild(item);
    });
}


async function triggerDownload(fileData, name, mime, fileId = null) {
    if (name === 'local-cast-backup.zip') {
        clientDownloading.classList.add('hidden');
        const url = URL.createObjectURL(fileData);
        const a = document.createElement('a');
        a.href = url; a.download = name; document.body.appendChild(a); a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    } else {
        const url = URL.createObjectURL(fileData);
        const loaderContainer = document.getElementById('preview-loader-container');
        if (loaderContainer) loaderContainer.classList.add('hidden');

        if (activePreviewFileId === null) {
            const a = document.createElement('a');
            a.href = url; a.download = name; document.body.appendChild(a); a.click();
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
            return;
        }
        
        const lowerName = name.toLowerCase();
        const isMedia = (mime && (mime.startsWith('video/') || mime.startsWith('audio/') || mime.startsWith('image/'))) || 
                        lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.ogg') ||
                        lowerName.endsWith('.mp3') || lowerName.endsWith('.wav') ||
                        lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.gif');
        const isText = lowerName.endsWith('.txt') || lowerName.endsWith('.md');
        
        if (isMedia) {
            btnDownloadDirect.classList.add('hidden');
            btnDownloadDirect.style.display = "none";
            btnStreamDirect.classList.remove('hidden');
            btnStreamDirect.style.display = "block";
            btnStreamDirect.onclick = () => {
                previewModal.classList.add('hidden');
                mediaModal.classList.remove('hidden');
                mediaTitle.innerText = name;
                mediaContainer.innerHTML = '';
                if (btnDownloadMedia) {
                    btnDownloadMedia.href = url;
                    btnDownloadMedia.download = name;
                    btnDownloadMedia.style.display = "block";
                }
                if ((mime && mime.startsWith('video/')) || lowerName.endsWith('.mp4') || lowerName.endsWith('.webm')) {
                    mediaContainer.innerHTML = `<video src="${url}" controls autoplay style="width:100%; max-height:70vh; display:block;"></video>`;
                } else if ((mime && mime.startsWith('audio/')) || lowerName.endsWith('.mp3') || lowerName.endsWith('.wav')) {
                    mediaContainer.innerHTML = `<audio src="${url}" controls autoplay style="width:100%; margin: 2rem 0;"></audio>`;
                } else {
                    mediaContainer.innerHTML = `<img src="${url}" style="width:100%; max-height:70vh; display:block; object-fit: contain;">`;
                }
            };
        } else if (isText && fileId && activePreviewFileId === fileId) {
            previewModal.classList.add('hidden');
            const text = await fileData.text();
            currentEditorFileId = fileId;
            editorFilename.value = name;
            editorTextarea.value = text;
            editorTextarea.readOnly = !myPermissions.edit;
            editorModal.classList.remove('hidden');
        } else {
            btnDownloadDirect.href = url;
            btnDownloadDirect.download = name;
            btnDownloadDirect.classList.remove('hidden');
            btnDownloadDirect.style.display = "block";
        }
    }
}


// --- UTILS ---
async function sendFileInChunks(conn, fileId, fileBlob, fileName, fileMime, typeStr, extraData = {}) {
    let totalChunks = Math.ceil(fileBlob.size / CHUNK_SIZE);
    if (totalChunks === 0) totalChunks = 1; // Ensure at least 1 chunk for 0-byte files
    conn.send({ type: typeStr + '_START', id: fileId, name: fileName, mime: fileMime, size: fileBlob.size, totalChunks, ...extraData });
    createTransferItem(fileId, fileName, 'upload');
    for (let i = 0; i < totalChunks; i++) {
        // Prevent WebRTC buffer overflow by waiting for the data channel buffer to drain
        if (conn.dataChannel) {
            while (conn.dataChannel.bufferedAmount > 1024 * 128) { // Wait if buffer > 128KB
                await new Promise(r => setTimeout(r, 50));
            }
        }
        
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileBlob.size);
        const chunk = fileBlob.slice(start, end);
        const arrayBuffer = await chunk.arrayBuffer();
        
        try {
            conn.send({ type: typeStr, id: fileId, index: i, chunk: arrayBuffer });
            updateTransferProgress(fileId, arrayBuffer.byteLength, fileBlob.size);
            if (i === totalChunks - 1) finishTransfer(fileId);
        } catch (e) {
            console.warn("Chunk send error, retrying...", e);
            try {
                await new Promise(r => setTimeout(r, 500));
                conn.send({ type: typeStr, id: fileId, index: i, chunk: arrayBuffer });
                updateTransferProgress(fileId, arrayBuffer.byteLength, fileBlob.size);
                if (i === totalChunks - 1) finishTransfer(fileId);
            } catch (err) {
                console.error("Unrecoverable chunk error", err);
                finishTransfer(fileId);
                break;
            }
        }
        await new Promise(r => setTimeout(r, 2)); // Tiny yield to event loop
    }
}


function updateStatus(text, state) {
    statusText.textContent = text;
    statusDot.className = `status-dot ${state}`;
}


// --- V14 LOGIC ---
btnChatToggle.addEventListener('click', () => { chatSidebar.classList.toggle('hidden'); chatBadge.classList.add('hidden'); });
btnCloseChat.addEventListener('click', () => chatSidebar.classList.add('hidden'));

function appendChatMessage(sender, text, type, color = 'var(--neon-blue)') {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    msg.innerHTML = `<div class="sender" style="color: ${color};">${sender}</div><div>${text}</div>`;
    chatMessages.appendChild(msg);
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

btnNewNote.addEventListener('click', () => {
    currentEditorFileId = null;
    editorFilename.value = 'Untitled.txt';
    editorTextarea.value = '';
    editorModal.classList.remove('hidden');
});
btnCloseEditor.addEventListener('click', () => {
    currentEditorFileId = null;
    editorModal.classList.add('hidden');
});

editorTextarea.addEventListener('input', () => {
    if (!currentEditorFileId) return; // Don't sync completely new unsaved files
    const text = editorTextarea.value;
    if (isHost) {
        connections.forEach(conn => {
            if (conn.open) conn.send({ type: 'TEXT_EDIT_SYNC', fileId: currentEditorFileId, text: text });
        });
        
        // Host live saves to its own VFS instantly
        const node = vfs.findNode(currentEditorFileId);
        if (node && !node.isLocked) {
            (async () => {
                let fileBlob = new Blob([text], { type: 'text/plain' });
                if (node.isEncrypted) {
                    let vaultDir = node.parent;
                    while (vaultDir && !vaultDir.isVault && vaultDir.parent) vaultDir = vaultDir.parent;
                    if (vaultDir && vaultDir.isVault) {
                        const pass = unlockedVaults[vaultDir.id];
                        if (pass) {
                            const buffer = await fileBlob.arrayBuffer();
                            const iv = crypto.getRandomValues(new Uint8Array(12));
                            const encryptedBuffer = await encryptFile(buffer, pass, node.salt, iv);
                            fileBlob = new Blob([encryptedBuffer], { type: 'text/plain' });
                            node.iv = iv;
                        }
                    }
                }
                node.fileObj = new File([fileBlob], node.name, { type: 'text/plain' });
                node.size = fileBlob.size;
                saveVFSToDB();
            })();
        }
    } else {
        if (hostConnection && hostConnection.open && myPermissions.edit) {
            hostConnection.send({ type: 'TEXT_EDIT_SYNC', fileId: currentEditorFileId, text: text });
        }
    }
});

btnSaveNote.addEventListener('click', async () => {
    const text = editorTextarea.value;
    let name = editorFilename.value.trim() || 'Untitled.txt';
    if (!name.endsWith('.txt') && !name.endsWith('.md')) name += '.txt';
    
    const blob = new Blob([text], { type: 'text/plain' });
    const file = new File([blob], name, { type: 'text/plain' });
    
    if (isHost) {
        const id = "file_" + Date.now();
        const node = { id, type: 'file', name, size: file.size, mime: file.type, parent: vfs.currentDir, fileObj: file };
        
        // if editing existing, overwrite
        const existing = vfs.currentDir.children.find(c => c.name === name);
        if (existing) {
            let finalBlob = blob;
            if (existing.isEncrypted) {
                let vaultDir = existing.parent;
                while (vaultDir && !vaultDir.isVault && vaultDir.parent) vaultDir = vaultDir.parent;
                if (vaultDir && vaultDir.isVault) {
                    const pass = unlockedVaults[vaultDir.id];
                    if (pass) {
                        const buffer = await file.arrayBuffer();
                        const iv = crypto.getRandomValues(new Uint8Array(12));
                        const encryptedBuffer = await encryptFile(buffer, pass, existing.salt, iv);
                        finalBlob = new Blob([encryptedBuffer], { type: file.type });
                        existing.iv = iv;
                    }
                }
            }
            existing.fileObj = new File([finalBlob], existing.name, { type: file.type });
            existing.size = finalBlob.size;
        } else {
            if (vfs.currentDir.isVault || (vfs.currentDir.parent && vfs.currentDir.parent.isVault)) {
                let vaultDir = vfs.currentDir;
                while (vaultDir && !vaultDir.isVault && vaultDir.parent) vaultDir = vaultDir.parent;
                if (vaultDir && vaultDir.isVault) {
                    const pass = unlockedVaults[vaultDir.id];
                    if (pass) {
                        const salt = crypto.getRandomValues(new Uint8Array(16));
                        const iv = crypto.getRandomValues(new Uint8Array(12));
                        const buffer = await file.arrayBuffer();
                        const encryptedBuffer = await encryptFile(buffer, pass, salt, iv);
                        const encryptedBlob = new Blob([encryptedBuffer], { type: file.type });
                        
                        node.fileObj = new File([encryptedBlob], name, { type: file.type });
                        node.size = encryptedBlob.size;
                        node.isEncrypted = true;
                        node.salt = salt;
                        node.iv = iv;
                    }
                }
            }
            vfs.currentDir.children.push(node);
        }
        
        editorModal.classList.add('hidden');
        saveVFSToDB();
        renderHostExplorer();
        broadcastTree();
        notifyFileAdded(name);
    } else {
        // GUEST
        if (!currentEditorFileId) {
            // New file! Upload it!
            if (hostConnection && hostConnection.open && myPermissions.upload) {
                if (typeof processClientFiles === 'function') processClientFiles([file]);
            } else {
                alert("You do not have permission to upload files.");
            }
        }
        editorModal.classList.add('hidden');
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.context-menu')) contextMenu.classList.add('hidden');
});

function findClientNode(node, id) {
    if (!node) return null;
    if (node.id === id) return node;
    if (node.children) {
        for (let child of node.children) {
            const found = findClientNode(child, id);
            if (found) return found;
        }
    }
    return null;
}

if (ctxOpen) {
    ctxOpen.addEventListener('click', async () => {
        if (!contextTargetId) return;
        
        if (isHost) {
            const node = vfs.findNode(contextTargetId);
            if (!node) return;
            if (node.type === 'file') {
                if (node.mime && (node.mime.startsWith('image/') || node.mime.startsWith('video/') || node.mime.startsWith('audio/'))) {
                    try {
                        const decryptedObj = await getDecryptedFileObj(node);
                        const url = URL.createObjectURL(decryptedObj);
                        mediaModal.classList.remove('hidden');
                        mediaTitle.innerText = node.name;
                        mediaContainer.innerHTML = '';
                        if (btnDownloadMedia) {
                            btnDownloadMedia.href = url;
                            btnDownloadMedia.download = node.name;
                            btnDownloadMedia.style.display = "block";
                        }
                        if (node.mime.startsWith('video/')) {
                            mediaContainer.innerHTML = `<video src="${url}" controls autoplay style="width:100%; max-height:70vh; display:block;"></video>`;
                        } else if (node.mime.startsWith('audio/')) {
                            mediaContainer.innerHTML = `<audio src="${url}" controls autoplay style="width:100%; margin: 2rem 0;"></audio>`;
                        } else {
                            mediaContainer.innerHTML = `<img src="${url}" style="width:100%; max-height:70vh; display:block; object-fit: contain;">`;
                        }
                    } catch(e) {
                        alert("Failed to decrypt: " + e.message);
                    }
                } else if (node.name.endsWith('.txt') || node.name.endsWith('.md')) {
                    if (node.fileObj) {
                        try {
                            const decryptedObj = await getDecryptedFileObj(node);
                            const text = await decryptedObj.text();
                            currentEditorFileId = node.id;
                            editorFilename.value = node.name;
                            editorTextarea.value = text;
                            editorTextarea.readOnly = !myPermissions.edit;
                            editorModal.classList.remove('hidden');
                        } catch(e) {
                            alert("Failed to decrypt: " + e.message);
                        }
                    }
                } else {
                    alert("Cannot preview this file type.");
                }
            } else if (node.type === 'folder') {
                if (node.isVault && !unlockedVaults[node.id]) {
                    vaultPasswordModal.classList.remove('hidden');
                    vaultPasswordInput.value = '';
                    const handleUnlock = async () => {
                        const pass = vaultPasswordInput.value;
                        if (!pass) return alert("Password required");
                        btnConfirmVaultPassword.removeEventListener('click', handleUnlock);
                        vaultPasswordModal.classList.add('hidden');
                        unlockedVaults[node.id] = pass;
                        vfs.currentDir = node;
                        renderHostExplorer();
                        broadcastTree();
                    };
                    btnConfirmVaultPassword.addEventListener('click', handleUnlock);
                    btnCloseVaultModal.addEventListener('click', () => {
                        btnConfirmVaultPassword.removeEventListener('click', handleUnlock);
                        vaultPasswordModal.classList.add('hidden');
                    }, { once: true });
                } else {
                    vfs.currentDir = node;
                    renderHostExplorer();
                }
            }
        } else {
            // Guest Logic
            const node = findClientNode(clientVFS, contextTargetId);
            if (!node) return;
            if (node.type === 'file') {
                activePreviewFileId = node.id;
                previewFilename.textContent = node.name;
                previewMeta.textContent = `${(node.size / 1024 / 1024).toFixed(2)} MB  •  ${node.mime || 'Unknown Type'}`;
                
                btnDownloadDirect.classList.add('hidden');
                btnDownloadDirect.style.display = "none";
                if(btnStreamDirect) { btnStreamDirect.classList.add('hidden'); btnStreamDirect.style.display = 'none'; }
                btnRequestFile.classList.remove("hidden");
                document.getElementById("preview-loader-container").classList.add("hidden");
                document.getElementById("preview-icon").innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 80px; height: 80px; color: var(--neon-blue);"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
                previewModal.classList.remove('hidden');
            } else if (node.type === 'folder') {
                if (node.isVault && !clientUnlockedVaults[node.id]) {
                    vaultPasswordModal.classList.remove('hidden');
                    vaultPasswordInput.value = '';
                    const handleClientVaultUnlock = () => {
                        const pass = vaultPasswordInput.value;
                        if (!pass) return alert("Password required");
                        btnConfirmVaultPassword.removeEventListener('click', handleClientVaultUnlock);
                        vaultPasswordModal.classList.add('hidden');
                        clientUnlockedVaults[node.id] = pass;
                        clientCurrentDir = node;
                        renderClientExplorer();
                    };
                    btnConfirmVaultPassword.addEventListener('click', handleClientVaultUnlock);
                    btnCloseVaultModal.addEventListener('click', () => {
                        btnConfirmVaultPassword.removeEventListener('click', handleClientVaultUnlock);
                        vaultPasswordModal.classList.add('hidden');
                    }, { once: true });
                } else if (node.isLocked && !node.isUnlocked) {
                    activeAuthFolderId = node.id;
                    folderPasswordInput.value = '';
                    folderPasswordError.classList.add('hidden');
                    folderPasswordModal.classList.remove('hidden');
                } else {
                    clientCurrentDir = node;
                    renderClientExplorer();
                }
            }
        }
        
        contextTargetId = null;
        contextMenu.classList.add('hidden');
    });
}

if (ctxDownload) {
    ctxDownload.addEventListener('click', async () => {
        if (!contextTargetId) return;
        
        if (isHost) {
            const node = vfs.findNode(contextTargetId);
            if (node && node.type === 'file' && node.fileObj) {
                try {
                    const decryptedObj = await getDecryptedFileObj(node);
                    triggerDownload(decryptedObj, node.name, node.mime, node.id);
                } catch(e) {
                    alert("Failed to decrypt: " + e.message);
                }
            } else if (node && node.type === 'folder') {
                alert("Folder download via context menu not implemented. Use 'Download Backup' for now.");
            }
        } else {
            // Guest logic
            const node = findClientNode(clientVFS, contextTargetId);
            if (node && node.type === 'file') {
                activePreviewFileId = null; // We are just downloading, not editing
                if (hostConnection && hostConnection.open) {
                    hostConnection.send({ type: 'REQUEST_FILE', id: node.id });
                    const loaderContainer = document.getElementById('preview-loader-container');
                    if (loaderContainer) loaderContainer.classList.remove('hidden');
                }
            }
        }
        
        contextTargetId = null;
        contextMenu.classList.add('hidden');
    });
}


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

ctxDelete.addEventListener('click', () => {
    if (!contextTargetId) return;
    
    if (typeof hostConnection !== 'undefined' && hostConnection && hostConnection.open) {
        if (confirm("Are you sure you want to delete this?")) {
            hostConnection.send({ type: 'CLIENT_DELETE_NODE', id: contextTargetId });
            contextMenu.classList.add('hidden');
        }
        return;
    }
    
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


const ctxDeaddrop = document.getElementById('ctx-deaddrop');
if (ctxDeaddrop) {
    ctxDeaddrop.addEventListener('click', () => {
        if (!contextTargetId) return;
        const node = vfs.findNode(contextTargetId);
        if (node) {
            node.isHidden = !node.isHidden;
            saveVFSToDB();
            renderHostExplorer();
            broadcastTree();
        }
        contextMenu.classList.add('hidden');
    });
}

// Global Drop Zone
document.body.addEventListener('dragover', (e) => e.preventDefault());
document.body.addEventListener('drop', async (e) => {
    e.preventDefault();
    if (!e.dataTransfer.items) return;
    
    const files = [];
    async function traverseFileTree(item, path = '') {
        if (item.isFile) {
            const file = await new Promise(r => item.file(r));
            Object.defineProperty(file, 'webkitRelativePath', { value: path + file.name });
            files.push(file);
        } else if (item.isDirectory) {
            const dirReader = item.createReader();
            const entries = await new Promise(r => dirReader.readEntries(r));
            for (let i = 0; i < entries.length; i++) {
                await traverseFileTree(entries[i], path + item.name + '/');
            }
        }
    }
    
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i].webkitGetAsEntry();
        if (item) await traverseFileTree(item);
    }
    
    if (files.length > 0) {
        if (typeof hostConnection !== 'undefined' && hostConnection && hostConnection.open) {
            // Guest drop
            if (typeof processClientFiles === 'function') processClientFiles(files);
        } else {
            // Host drop
            processFiles(files);
        }
    }
});

ctxRename.addEventListener('click', () => {
    if (!contextTargetId) return;
    
    if (typeof hostConnection !== 'undefined' && hostConnection && hostConnection.open) {
        const newName = prompt("Enter new name:");
        if (newName && newName.trim()) {
            hostConnection.send({ type: 'CLIENT_RENAME_NODE', id: contextTargetId, newName: newName.trim() });
            contextMenu.classList.add('hidden');
        }
        return;
    }
    
    const node = vfs.findNode(contextTargetId);
    if (node) {
        const newName = prompt("Enter new name:", node.name);
        if (newName && newName.trim()) {
            node.name = newName.trim();
            saveVFSToDB();
            renderHostExplorer();
            broadcastTree();
        }
    }
    contextMenu.classList.add('hidden');
});

function searchVFS(dir, query, results) {
    dir.children.forEach(c => {
        if (c.name.toLowerCase().includes(query)) results.push(c);
        if (c.type === 'folder') searchVFS(c, query, results);
    });
}
// --- END V14 LOGIC ---



async function initDB() {
    if (typeof localforage !== 'undefined') {
        try {
            const savedRoot = await localforage.getItem("vfs_root");
            if (savedRoot) {
                vfs.root = savedRoot;
                vfs.currentDir = vfs.root;
                function reattachParents(node, parent) {
                    node.parent = parent;
                    if (node.children) {
                        node.children.forEach(child => reattachParents(child, node));
                    }
                }
                reattachParents(vfs.root, null);
            }
        } catch (e) {
            console.error("Failed to init DB", e);
        }
    }
}

async function initLogic() {
    // START BOOT SEQUENCE
    await new Promise(r => setTimeout(r, 2000)); // wait for loading bar animation
    const bootElement = document.getElementById('boot-sequence');
    if (bootElement) {
        bootElement.classList.add('inactive');
        setTimeout(() => bootElement.remove(), 1000);
    }

    await initDB();
    
    if (magicPeerId && magicFileId) {
        if (!localStorage.getItem('localcast_alias')) {
            
            profileModal.classList.remove('hidden');
        } else {
            initApp();
        }
    } else if (roomCode) {
        if (!localStorage.getItem('localcast_alias')) {
            
            profileModal.classList.remove('hidden');
        } else {
            initApp();
        }
    } else {
        initApp();
    }
}
window.onload = initLogic;


// --- GUEST PROFILE LOGIC ---
const profileModal = document.getElementById('profile-modal');
const profileNameInput = document.getElementById('profile-name-input');
const avatarInput = document.getElementById('profile-avatar-input');
let guestAvatar = localStorage.getItem('localcast_avatar') || '';
let guestAlias = localStorage.getItem('localcast_alias') || '';
let guestColor = localStorage.getItem('localcast_color') || '#00f0ff';

const avatarPreview = document.getElementById('profile-avatar-preview');
if (avatarPreview) {
    if (guestAvatar) {
        avatarPreview.style.backgroundImage = `url('${guestAvatar}')`;
        avatarPreview.innerHTML = '';
        avatarPreview.style.borderColor = 'var(--neon-green)';
    }
    avatarPreview.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 128;
                let width = img.width; let height = img.height;
                if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
                else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                guestAvatar = canvas.toDataURL('image/jpeg', 0.8);
                avatarPreview.style.backgroundImage = `url('${guestAvatar}')`;
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });
}
const btnSaveProfile = document.getElementById('btn-save-profile');
const btnEditProfile = document.getElementById('btn-edit-profile');

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
        let val = profileNameInput.value.trim();
        if (!val) {
            val = 'Guest_' + Math.floor(Math.random() * 10000);
        }
        
        guestAlias = val;
        localStorage.setItem('localcast_alias', guestAlias);
        localStorage.setItem('localcast_color', guestColor);
        localStorage.setItem('localcast_avatar', guestAvatar);
        profileModal.classList.add('hidden');
        if (hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'PROFILE_UPDATE', name: guestAlias, color: guestColor, avatar: guestAvatar });
        } else if (!isHost) {
            initApp();
        }
    });
    
    if (btnEditProfile) {
        btnEditProfile.addEventListener('click', () => {
            profileNameInput.value = guestAlias;
            document.querySelectorAll('.color-swatch').forEach(s => {
                if (s.dataset.color === guestColor) {
                    s.classList.add('selected');
                    s.style.borderColor = '#fff';
                } else {
                    s.classList.remove('selected');
                    s.style.borderColor = 'transparent';
                }
            });
            profileModal.classList.remove('hidden');
        });
    }
}


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


// --- WHITEBOARD LOGIC ---
const whiteboardModal = document.getElementById('whiteboard-modal');
const btnWhiteboard = document.getElementById('btn-whiteboard');
const btnCloseWhiteboard = document.getElementById('btn-close-whiteboard');
const btnClearWhiteboard = document.getElementById('btn-clear-whiteboard');
const wbCanvas = document.getElementById('whiteboard-canvas');
let wbCtx = null;

let isDrawing = false;
let lastX = 0;
let lastY = 0;

if (btnWhiteboard && wbCanvas) {
    wbCtx = wbCanvas.getContext('2d');
    
    function resizeCanvas() {
        const container = document.getElementById('whiteboard-container');
        if (wbCanvas.width !== container.clientWidth || wbCanvas.height !== container.clientHeight) {
            const data = wbCanvas.toDataURL();
            wbCanvas.width = container.clientWidth;
            wbCanvas.height = container.clientHeight;
            const img = new Image();
            img.onload = () => wbCtx.drawImage(img, 0, 0);
            img.src = data;
        }
    }
    
    window.addEventListener('resize', () => {
        if (!whiteboardModal.classList.contains('hidden')) resizeCanvas();
    });

    btnWhiteboard.addEventListener('click', () => {
        whiteboardModal.classList.remove('hidden');
        setTimeout(() => {
            resizeCanvas();
        }, 100);
        if (!isHost && hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'REQUEST_WHITEBOARD' });
        }
    });
    
    document.querySelectorAll('.wb-color').forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            document.querySelectorAll('.wb-color').forEach(s => s.style.borderColor = 'transparent');
            const target = e.target;
            target.style.borderColor = target.dataset.color === '#000000' ? '#fff' : target.dataset.color;
            guestColor = target.dataset.color;
        });
    });

    btnCloseWhiteboard.addEventListener('click', () => {
        whiteboardModal.classList.add('hidden');
    });
    
    btnClearWhiteboard.addEventListener('click', () => {
        wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
        if (isHost) {
            Object.values(connections).forEach(c => {
                if (c.open && c.isAuthenticated) c.send({ type: 'WHITEBOARD_CLEAR' });
            });
        } else if (hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'WHITEBOARD_CLEAR' });
        }
    });

    function drawLine(x0, y0, x1, y1, color, emit) {
        wbCtx.beginPath();
        wbCtx.moveTo(x0, y0);
        wbCtx.lineTo(x1, y1);
        wbCtx.strokeStyle = color;
        wbCtx.lineWidth = 3;
        wbCtx.lineCap = 'round';
        wbCtx.stroke();
        wbCtx.closePath();
        
        if (!emit) return;
        
        const w = wbCanvas.width;
        const h = wbCanvas.height;
        
        const payload = {
            type: 'WHITEBOARD_DRAW',
            x0: x0 / w, y0: y0 / h,
            x1: x1 / w, y1: y1 / h,
            color: color
        };

        if (isHost) {
            Object.values(connections).forEach(c => {
                if (c.open && c.isAuthenticated) c.send(payload);
            });
        } else if (hostConnection && hostConnection.open) {
            hostConnection.send(payload);
        }
    }

    function getPos(e) {
        const rect = wbCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function onDown(e) {
        isDrawing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
    }

    function onMove(e) {
        if (!isDrawing) return;
        const pos = getPos(e);
        drawLine(lastX, lastY, pos.x, pos.y, guestColor, true);
        lastX = pos.x;
        lastY = pos.y;
    }

    function onUp(e) {
        if (!isDrawing) return;
        isDrawing = false;
    }

    wbCanvas.addEventListener('mousedown', onDown);
    wbCanvas.addEventListener('mousemove', onMove);
    wbCanvas.addEventListener('mouseup', onUp);
    wbCanvas.addEventListener('mouseout', onUp);
    
    wbCanvas.addEventListener('touchstart', onDown, {passive: true});
    wbCanvas.addEventListener('touchmove', onMove, {passive: true});
    wbCanvas.addEventListener('touchend', onUp);
}


// --- INTERCOM LOGIC ---
const btnIntercom = document.getElementById('btn-intercom');
let localAudioStream = null;
let inIntercom = false;
let activeCalls = {};
let intercomUsers = new Set();

function playAudioStream(stream, peerId) {
    if (document.getElementById(`audio-${peerId}`)) return;
    const audio = document.createElement('audio');
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.id = `audio-${peerId}`;
    document.body.appendChild(audio);
}

function cleanupAudio(peerId) {
    const audio = document.getElementById(`audio-${peerId}`);
    if (audio) audio.remove();
    if (activeCalls[peerId]) {
        activeCalls[peerId].close();
        delete activeCalls[peerId];
    }
}

if (btnIntercom) {
    btnIntercom.addEventListener('click', async () => {
        if (!inIntercom) {
            try {
                localAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                inIntercom = true;
                btnIntercom.style.color = 'var(--neon-green)';
                btnIntercom.style.borderColor = 'var(--neon-green)';
                
                peer.on('call', (call) => {
                    if (!inIntercom) { call.close(); return; }
                    call.answer(localAudioStream);
                    call.on('stream', (remoteStream) => playAudioStream(remoteStream, call.peer));
                    call.on('close', () => cleanupAudio(call.peer));
                    activeCalls[call.peer] = call;
                });

                if (isHost) {
                    intercomUsers.add(peer.id);
                    intercomUsers.forEach(id => {
                        if (id !== peer.id && inIntercom) {
                            const call = peer.call(id, localAudioStream);
                            call.on('stream', (remoteStream) => playAudioStream(remoteStream, id));
                            call.on('close', () => cleanupAudio(id));
                            activeCalls[id] = call;
                        }
                    });
                } else if (hostConnection && hostConnection.open) {
                    hostConnection.send({ type: 'INTERCOM_JOIN', peerId: peer.id });
                }
            } catch(e) {
                alert("Microphone access denied or not available.");
            }
        } else {
            inIntercom = false;
            btnIntercom.style.color = '';
            btnIntercom.style.borderColor = '';
            if (localAudioStream) {
                localAudioStream.getTracks().forEach(t => t.stop());
                localAudioStream = null;
            }
            Object.keys(activeCalls).forEach(id => cleanupAudio(id));
            if (isHost) {
                intercomUsers.delete(peer.id);
            } else if (hostConnection && hostConnection.open) {
                hostConnection.send({ type: 'INTERCOM_LEAVE', peerId: peer.id });
            }
        }
    });
}

const btnInfo = document.getElementById('btn-info');
const infoModal = document.getElementById('info-modal');
const btnCloseInfo = document.getElementById('btn-close-info');

if (btnInfo) {
    btnInfo.addEventListener('click', () => {
        infoModal.classList.remove('hidden');
    });
}
if (btnCloseInfo) {
    btnCloseInfo.addEventListener('click', () => {
        infoModal.classList.add('hidden');
    });
}

// --- THEMING ENGINE ---
const themes = {
    synthwave: {
        '--bg-dark': '#050507',
        '--bg-card': '#0a0b10',
        '--bg-card-hover': '#101218',
        '--text-main': '#e2e8f0',
        '--text-muted': '#64748b',
        '--neon-blue': '#00f0ff',
        '--neon-green': '#39ff14',
        '--neon-red': '#ff003c',
        '--border-glow': 'rgba(0, 240, 255, 0.2)'
    },
    matrix: {
        '--bg-dark': '#000000',
        '--bg-card': '#001100',
        '--bg-card-hover': '#002200',
        '--text-main': '#39ff14',
        '--text-muted': '#1b8a06',
        '--neon-blue': '#39ff14',
        '--neon-green': '#39ff14',
        '--neon-red': '#39ff14',
        '--border-glow': 'rgba(57, 255, 20, 0.2)'
    },
    nightcity: {
        '--bg-dark': '#0f0f1a',
        '--bg-card': '#1a0b1c',
        '--bg-card-hover': '#2a112c',
        '--text-main': '#e2e8f0',
        '--text-muted': '#64748b',
        '--neon-blue': '#fce205', // Yellow
        '--neon-green': '#00f0ff',
        '--neon-red': '#ff00ff', // Pink
        '--border-glow': 'rgba(255, 0, 255, 0.2)'
    },
    bloodmoon: {
        '--bg-dark': '#050000',
        '--bg-card': '#1a0000',
        '--bg-card-hover': '#330000',
        '--text-main': '#ffcccc',
        '--text-muted': '#cc6666',
        '--neon-blue': '#ff003c',
        '--neon-green': '#ff003c',
        '--neon-red': '#ff003c',
        '--border-glow': 'rgba(255, 0, 60, 0.2)'
    }
};

function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    for (const [key, value] of Object.entries(theme)) {
        document.documentElement.style.setProperty(key, value);
    }
    localStorage.setItem('localcast_theme', themeName);
}

const savedTheme = localStorage.getItem('localcast_theme') || 'synthwave';
applyTheme(savedTheme);

const btnThemeToggle = document.getElementById('btn-theme-toggle');
const themeModal = document.getElementById('theme-modal');
const btnCloseTheme = document.getElementById('btn-close-theme');

if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
        themeModal.classList.remove('hidden');
    });
}
if (btnCloseTheme) {
    btnCloseTheme.addEventListener('click', () => {
        themeModal.classList.add('hidden');
    });
}
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        applyTheme(e.target.dataset.theme);
        themeModal.classList.add('hidden');
    });
});

const backgrounds = {
    'default': 'linear-gradient(0deg, transparent 24%, var(--border-glow) 25%, var(--border-glow) 26%, transparent 27%, transparent 74%, var(--border-glow) 75%, var(--border-glow) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, var(--border-glow) 25%, var(--border-glow) 26%, transparent 27%, transparent 74%, var(--border-glow) 75%, var(--border-glow) 76%, transparent 77%, transparent)',
    'circuit': 'repeating-linear-gradient(45deg, var(--border-glow) 0, var(--border-glow) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(-45deg, var(--border-glow) 0, var(--border-glow) 1px, transparent 1px, transparent 20px)',
    'dots': 'radial-gradient(var(--border-glow) 1px, transparent 1px)',
    'none': 'none'
};

function applyBackground(bgName) {
    const bg = backgrounds[bgName];
    if (bg !== undefined) {
        if (bgName === 'dots') {
            document.body.style.backgroundImage = bg;
            document.body.style.backgroundSize = '20px 20px';
        } else if (bgName === 'default') {
            document.body.style.backgroundImage = bg;
            document.body.style.backgroundSize = '100% 100%, 50px 50px, 50px 50px';
        } else {
            document.body.style.backgroundImage = bg;
            document.body.style.backgroundSize = 'auto';
        }
        localStorage.setItem('localcast_bg', bgName);
    }
}

const savedBg = localStorage.getItem('localcast_bg') || 'default';
applyBackground(savedBg);

document.querySelectorAll('.bg-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        applyBackground(e.target.dataset.bg);
        themeModal.classList.add('hidden');
    });
});


if (ctxMagicLink) {
    ctxMagicLink.addEventListener('click', () => {
        if (!contextTargetId || !peer || !peer.id) return;
        const baseUrl = window.location.origin + window.location.pathname;
        const magicUrl = `${baseUrl}?peer=${peer.id}&file=${contextTargetId}`;
        navigator.clipboard.writeText(magicUrl).then(() => {
            showToast("Magic Link copied to clipboard!");
        }).catch(err => {
            prompt("Copy this Magic Link:", magicUrl);
        });
        hideContextMenu();
    });
}

const ctxHoneypot = document.getElementById('ctx-honeypot');
if (ctxHoneypot) {
    ctxHoneypot.addEventListener('click', () => {
        if (!contextTargetId) return;
        const node = vfs.findNode(contextTargetId);
        if (node && node.type === 'folder') {
            node.isHoneyPot = !node.isHoneyPot;
            if (node.isHoneyPot && !node.password) {
                const trapPwd = prompt("Enter the bait password for this Honey-Pot:");
                if (trapPwd) {
                    node.password = trapPwd;
                } else {
                    node.isHoneyPot = false; // Cancel if no password provided
                }
            } else if (!node.isHoneyPot) {
                node.password = null; // Clear password if honeypot is turned off (optional)
            }
            saveVFSToDB();
            renderHostExplorer();
            broadcastTree(); // We must broadcast tree so the password icon updates!
        }
        hideContextMenu();
    });
}

// --- COMM-LINK LOGIC ---
const btnStartCall = document.getElementById('btn-start-call');
const btnEndCall = document.getElementById('btn-end-call');
const activeCallBanner = document.getElementById('active-call-banner');
const commLinkAudio = document.getElementById('comm-link-audio');

let currentCall = null;
let localMediaStream = null;

async function startCommLink() {
    try {
        localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        currentCall = peer.call(whisperTarget, localMediaStream);
        setupCallHandlers(currentCall);
    } catch (e) {
        alert("Microphone access denied.");
    }
}

function setupCallHandlers(call) {
    activeCallBanner.classList.remove('hidden');
    
    call.on('stream', (remoteStream) => {
        commLinkAudio.srcObject = remoteStream;
    });
    
    call.on('close', () => {
        endCommLink();
    });
}

function endCommLink() {
    if (currentCall) {
        currentCall.close();
        currentCall = null;
    }
    if (localMediaStream) {
        localMediaStream.getTracks().forEach(t => t.stop());
        localMediaStream = null;
    }
    commLinkAudio.srcObject = null;
    if (activeCallBanner) activeCallBanner.classList.add('hidden');
}

if (btnStartCall) {
    btnStartCall.addEventListener('click', startCommLink);
}
if (btnEndCall) {
    btnEndCall.addEventListener('click', endCommLink);
}




setInterval(() => {
    const title = document.querySelector('.glitch-title');
    if (title) {
        title.style.animationPlayState = 'running';
        setTimeout(() => {
            title.style.animationPlayState = 'paused';
        }, 300); // Glitch for just 300ms
    }
}, 3500); // Every 3.5 seconds

if (btnRadar) {
    btnRadar.addEventListener('click', () => {
        radarModal.classList.remove('hidden');
    });
}

if (btnCloseRadar) {
    btnCloseRadar.addEventListener('click', () => {
        radarModal.classList.add('hidden');
    });
}


const radarGuestModal = document.getElementById('radar-guest-modal');
const btnCloseRadarModal = document.getElementById('btn-close-radar-modal');
const radarGuestName = document.getElementById('radar-guest-name');
const radarGuestDot = document.getElementById('radar-guest-dot');
const radarPermUpload = document.getElementById('radar-perm-upload');
const radarPermDelete = document.getElementById('radar-perm-delete');
const radarPermEdit = document.getElementById('radar-perm-edit');

let currentRadarGuestId = null;
let currentRadarGuestAlias = null;
let currentRadarGuestColor = null;

function openRadarGuestModal(id, alias, color, avatar) {
    const radarGuestAvatar = document.getElementById('radar-guest-avatar');
    if (avatar) {
        radarGuestAvatar.style.backgroundImage = `url(${avatar})`;
        radarGuestAvatar.style.display = 'block';
        radarGuestDot.style.display = 'none';
    } else {
        radarGuestAvatar.style.display = 'none';
        radarGuestDot.style.display = 'block';
    }

    currentRadarGuestId = id;
    currentRadarGuestAlias = alias;
    currentRadarGuestColor = color;
    
    radarGuestName.textContent = alias;
    radarGuestDot.style.backgroundColor = color;
    
    const conn = connections.find(c => c.peer === id);
    if (conn) {
        if (!conn.permissions) conn.permissions = { upload: false, delete: false, edit: false };
        radarPermUpload.checked = conn.permissions.upload;
        radarPermDelete.checked = conn.permissions.delete;
        radarPermEdit.checked = conn.permissions.edit;
    }
    
    radarGuestModal.classList.remove('hidden');
}

if (btnCloseRadarModal) {
    btnCloseRadarModal.addEventListener('click', () => radarGuestModal.classList.add('hidden'));
}

[radarPermUpload, radarPermDelete, radarPermEdit].forEach(checkbox => {
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            if (!currentRadarGuestId) return;
            const conn = connections.find(c => c.peer === currentRadarGuestId);
            if (conn) {
                conn.permissions = {
                    upload: radarPermUpload.checked,
                    delete: radarPermDelete.checked,
                    edit: radarPermEdit.checked
                };
                conn.send({ type: 'GUEST_PERMISSIONS', permissions: conn.permissions });
            }
        });
    }
});

function drawRadar() {
    requestAnimationFrame(drawRadar);
    try {
        if (radarModal && radarModal.classList.contains('hidden')) return;
        
        const canvas = radarCanvas;
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = Math.min(cx, cy) - 20;

        ctx.strokeStyle = 'rgba(57,255,20,0.2)';
        ctx.lineWidth = 1;
        for(let i=1; i<=3; i++) {
            ctx.beginPath(); ctx.arc(cx, cy, (radius/3)*i, 0, Math.PI*2); ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy); ctx.stroke();

        ctx.fillStyle = guestColor || '#39ff14';
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText("YOU", cx + 10, cy + 4);

        function hashStr(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
            return Math.abs(hash);
        }
        
        radarBlips = [];
        for (const [id, data] of Object.entries(activePeers)) {
            if (id === (peer ? peer.id : null)) continue;
            const h = hashStr(id);
            const angle = (h % 360) * (Math.PI / 180);
            const dist = 30 + (h % (radius - 50));
            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist;
            
            radarBlips.push({ id, x, y, alias: data.alias, color: data.color, avatar: data.avatar });
            
            if (data.avatar) {
                if (!window.avatarCache) window.avatarCache = {};
                if (!window.avatarCache[id]) {
                    const img = new Image();
                    img.src = data.avatar;
                    window.avatarCache[id] = img;
                }
                const img = window.avatarCache[id];
                if (img.complete && img.naturalWidth > 0) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(x, y, 12, 0, Math.PI*2);
                    ctx.clip();
                    ctx.drawImage(img, x - 12, y - 12, 24, 24);
                    ctx.restore();
                    
                    ctx.strokeStyle = data.color || '#00f0ff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x, y, 12, 0, Math.PI*2);
                    ctx.stroke();
                } else {
                    ctx.fillStyle = data.color || '#00f0ff';
                    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI*2); ctx.fill();
                }
            } else {
                ctx.fillStyle = data.color || '#00f0ff';
                ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI*2); ctx.fill();
            }
            
            ctx.fillStyle = '#fff';
            ctx.fillText(data.alias, x + 18, y + 4);
        }
    } catch (e) {}
}

if (radarCanvas) {
    radarCanvas.addEventListener('click', (e) => {
        const rect = radarCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        for (const blip of radarBlips) {
            const dx = x - blip.x;
            const dy = y - blip.y;
            if (dx*dx + dy*dy <= 100) {
                openRadarGuestModal(blip.id, blip.alias, blip.color, blip.avatar);
                break;
            }
        }
    });
}

// Start radar
drawRadar();


// --- NETWORK BACKGROUND ANIMATION ---
function initNetworkBackground() {
    const canvas = document.getElementById('network-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const numParticles = Math.min(Math.floor(window.innerWidth / 15), 100);
    const maxDistance = 150;
    
    let mouse = { x: -1000, y: -1000 };
    
    // Track mouse safely
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.radius = Math.random() * 2 + 1;
            // Neon colors: purple, cyan, blue
            const colors = ['rgba(0, 240, 255, 0.8)', 'rgba(168, 85, 247, 0.8)', 'rgba(59, 130, 246, 0.8)'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Mouse repulsion
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (100 - distance) / 100;
                
                this.x -= forceDirectionX * force * 2;
                this.y -= forceDirectionY * force * 2;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 240, 255, ${1 - distance / maxDistance})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    animate();
}

// Initialize on load
initNetworkBackground();

// --- RESTORED WHISPER & CALL LOGIC ---
function appendWhisper(name, text, color) {
    if (!whisperMessages) return;
    const el = document.createElement('div');
    el.style.marginBottom = '4px';
    el.innerHTML = '<strong style="color: ' + color + ';">' + name + ':</strong> <span style="color: #fff;">' + text + '</span>';
    whisperMessages.appendChild(el);
    whisperMessages.scrollTop = whisperMessages.scrollHeight;
}

function handleWhisper(data) {
    if (whisperModal && whisperModal.classList.contains('hidden')) {
        openWhisper(data.fromId, data.fromAlias, data.fromColor);
    }
    appendWhisper(data.fromAlias, data.msg, data.fromColor);
}

function openWhisper(targetId, alias, color) {
    whisperTarget = targetId;
    document.getElementById('whisper-target-name').innerText = 'Whispering: ' + alias;
    document.getElementById('whisper-target-name').style.color = color;
    whisperMessages.innerHTML = '';
    
    const radarGuestModal = document.getElementById('radar-guest-modal');
    if (radarGuestModal) radarGuestModal.classList.add('hidden');
    if (radarModal) radarModal.classList.add('hidden');
    
    whisperModal.classList.remove('hidden');
}

const btnRadarWhisper = document.getElementById('btn-radar-whisper');
const btnRadarCall = document.getElementById('btn-radar-call');

if (btnRadarWhisper) {
    btnRadarWhisper.addEventListener('click', () => {
        if (!currentRadarGuestId) return;
        openWhisper(currentRadarGuestId, currentRadarGuestAlias, currentRadarGuestColor);
    });
}

if (btnRadarCall) {
    btnRadarCall.addEventListener('click', async () => {
        if (!currentRadarGuestId) return;
        
        const radarGuestModal = document.getElementById('radar-guest-modal');
        if (radarGuestModal) radarGuestModal.classList.add('hidden');
        
        try {
            localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            currentCall = peer.call(currentRadarGuestId, localMediaStream);
            openWhisper(currentRadarGuestId, currentRadarGuestAlias, currentRadarGuestColor);
            setupCallHandlers(currentCall);
        } catch (e) {
            console.error('Microphone access denied', e);
            alert('Microphone access denied or not available.');
        }
    });
}

if (btnCloseWhisper) {
    btnCloseWhisper.addEventListener('click', () => {
        whisperModal.classList.add('hidden');
        whisperTarget = null;
        if (currentCall) {
            currentCall.close();
            currentCall = null;
        }
        if (localMediaStream) {
            localMediaStream.getTracks().forEach(t => t.stop());
            localMediaStream = null;
        }
    });
}

if (whisperForm) {
    whisperForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!whisperInput.value.trim() || !whisperTarget) return;
        
        const msg = whisperInput.value.trim();
        whisperInput.value = '';
        
        const myName = typeof profile !== 'undefined' && profile.name ? profile.name : (typeof guestAlias !== 'undefined' ? guestAlias : 'Me');
        const myColor = typeof profile !== 'undefined' && profile.color ? profile.color : (typeof guestColor !== 'undefined' ? guestColor : '#39ff14');
        
        appendWhisper(myName, msg, myColor);
        
        if (isHost) {
            const targetConn = connections.find(c => c.peer === whisperTarget);
            if (targetConn && targetConn.open) {
                targetConn.send({ type: 'WHISPER', fromId: peer.id, fromAlias: myName, fromColor: myColor, msg: msg });
            }
        } else {
            if(hostConnection && hostConnection.open) {
                hostConnection.send({ type: 'WHISPER_RELAY', targetId: whisperTarget, fromId: peer.id, fromAlias: myName, fromColor: myColor, msg: msg });
            }
        }
    });
}

// --- HACKER CLI TERMINAL ---
const cliTerminal = document.getElementById('cli-terminal');
const cliInput = document.getElementById('cli-input');
const cliOutput = document.getElementById('cli-output');
const btnCloseCli = document.getElementById('btn-close-cli');
let cliCurrentDirId = 'root';

function printCli(text, color = '#39ff14') {
    if (!cliOutput) return;
    const span = document.createElement('span');
    span.style.color = color;
    span.innerText = text;
    cliOutput.appendChild(span);
    cliOutput.scrollTop = cliOutput.scrollHeight;
}

if (cliTerminal) {
    document.addEventListener('keydown', (e) => {
        if (e.key === '~' || e.key === '`') {
            e.preventDefault();
            if (cliTerminal.classList.contains('hidden')) {
                cliTerminal.classList.remove('hidden');
                cliTerminal.style.display = 'flex';
                cliInput.focus();
                if (cliOutput.innerHTML === '') {
                    printCli('LOCAL-CAST // TERMINAL INITIALIZED', 'var(--neon-blue)');
                    printCli('Type "help" for a list of commands.', 'var(--text-muted)');
                }
            } else {
                cliTerminal.classList.add('hidden');
                cliTerminal.style.display = 'none';
            }
        }
    });

    if (btnCloseCli) {
        btnCloseCli.addEventListener('click', () => {
            cliTerminal.classList.add('hidden');
            cliTerminal.style.display = 'none';
        });
    }

    if (cliInput) {
        cliInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = cliInput.value.trim();
                if (!val) return;
                cliInput.value = '';
                printCli('> ' + val, '#fff');
                
                const args = val.split(' ');
                const cmd = args[0].toLowerCase();
                
                try {
                    if (cmd === 'help') {
                        printCli('COMMANDS:\\n  ls        - List contents of current directory\\n  cd <id>   - Change directory\\n  mkdir <n> - Create a new folder\\n  rm <id>   - Delete a file/folder\\n  clear     - Clear terminal\\n  whoami    - Print user info', 'var(--neon-blue)');
                    } else if (cmd === 'clear') {
                        cliOutput.innerHTML = '';
                    } else if (cmd === 'whoami') {
                        printCli('ALIAS: ' + (typeof profile !== 'undefined' ? profile.name : guestAlias), 'var(--neon-purple)');
                        printCli('ID: ' + peer.id, 'var(--neon-purple)');
                    } else if (cmd === 'ls') {
                        const currentDir = vfs.findNode(cliCurrentDirId);
                        const children = currentDir ? currentDir.children : [];
                        if (children.length === 0) {
                            printCli('  (empty directory)', 'var(--text-muted)');
                        } else {
                            children.forEach(c => {
                                const icon = c.type === 'folder' ? '[DIR]' : '     ';
                                printCli('  ' + icon + ' ' + c.id.substring(0,6) + '... | ' + c.name);
                            });
                        }
                    } else if (cmd === 'mkdir') {
                        if (!isHost) {
                            printCli('Error: Only Host can use mkdir in CLI currently.', 'var(--neon-red)');
                        } else {
                            const name = args.slice(1).join(' ') || 'New Folder';
                            const currentDir = vfs.findNode(cliCurrentDirId);
                            if (currentDir) {
                                vfs.addFolder(name); // addFolder uses vfs.currentDir, so let's use addNode
                                // actually, addNode needs the parent object and new node object
                                const newFolder = {
                                    id: 'folder_' + Math.random().toString(36).substr(2, 9),
                                    name: name,
                                    type: 'folder',
                                    children: [],
                                    size: 0,
                                    createdAt: Date.now(),
                                    isVault: false
                                };
                                vfs.addNode(currentDir, newFolder);
                                saveVFSToDB();
                                renderHostExplorer();
                                broadcastTree();
                                printCli('Created directory: ' + name, 'var(--neon-green)');
                            }
                        }
                    } else if (cmd === 'cd') {
                        const targetId = args[1];
                        if (!targetId || targetId === '..') {
                            if (cliCurrentDirId === 'root') {
                                printCli('Already at root.', 'var(--neon-red)');
                            } else {
                                const current = vfs.findNode(cliCurrentDirId);
                                cliCurrentDirId = (current && current.parent) ? current.parent.id : 'root';
                                printCli('Directory changed.');
                            }
                        } else {
                            const currentDir = vfs.findNode(cliCurrentDirId);
                            const target = currentDir ? currentDir.children.find(n => n.id === targetId || n.name === targetId) : null;
                            if (target && target.type === 'folder') {
                                cliCurrentDirId = target.id;
                                printCli('Changed directory to ' + target.name);
                            } else {
                                printCli('Directory not found.', 'var(--neon-red)');
                            }
                        }
                    } else if (cmd === 'rm') {
                        if (!isHost) {
                            printCli('Error: Only Host can rm in CLI currently.', 'var(--neon-red)');
                        } else {
                            const targetId = args[1];
                            if (targetId) {
                                deleteNode(targetId);
                                saveVFSToDB();
                                renderHostExplorer();
                                broadcastTree();
                                printCli('Item deleted.', 'var(--neon-green)');
                            } else {
                                printCli('Missing target ID.', 'var(--neon-red)');
                            }
                        }
                    } else {
                        printCli('Command not found: ' + cmd, 'var(--neon-red)');
                    }
                } catch (err) {
                    printCli('Error executing command: ' + err.message, 'var(--neon-red)');
                }
            }
        });
    }
}

// --- CYBER JUKEBOX ---
const cyberJukebox = document.getElementById('cyber-jukebox');
const jukeboxPlayer = document.getElementById('jukebox-player');
const btnJukePlay = document.getElementById('btn-juke-play');
const btnJukePause = document.getElementById('btn-juke-pause');
const jukeTitle = document.getElementById('juke-title');
const jukeTime = document.getElementById('juke-time');
const btnJukeSync = document.getElementById('btn-juke-sync');
const btnCloseJukebox = document.getElementById('btn-close-jukebox');

let isJukeboxActive = false;
let currentJukeboxFileId = null;

function formatTime(secs) {
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60).toString().padStart(2, '0');
    return min + ':' + sec;
}

if (jukeboxPlayer) {
    jukeboxPlayer.addEventListener('timeupdate', () => {
        jukeTime.innerText = formatTime(jukeboxPlayer.currentTime) + ' / ' + (isNaN(jukeboxPlayer.duration) ? '0:00' : formatTime(jukeboxPlayer.duration));
    });

    jukeboxPlayer.addEventListener('ended', () => {
        btnJukePlay.classList.remove('hidden');
        btnJukePause.classList.add('hidden');
    });
}

function loadJukeboxFile(file, objectUrl) {
    isJukeboxActive = true;
    currentJukeboxFileId = file.id;
    jukeTitle.innerText = file.name;
    jukeboxPlayer.src = objectUrl;
    cyberJukebox.classList.remove('hidden');
}

if (btnJukePlay) {
    btnJukePlay.addEventListener('click', () => {
        jukeboxPlayer.play();
        btnJukePlay.classList.add('hidden');
        btnJukePause.classList.remove('hidden');
        if (isHost) {
            broadcastJukebox('JUKEBOX_PLAY', currentJukeboxFileId, jukeboxPlayer.currentTime);
        }
    });
}

if (btnJukePause) {
    btnJukePause.addEventListener('click', () => {
        jukeboxPlayer.pause();
        btnJukePause.classList.add('hidden');
        btnJukePlay.classList.remove('hidden');
        if (isHost) {
            broadcastJukebox('JUKEBOX_PAUSE', currentJukeboxFileId, jukeboxPlayer.currentTime);
        }
    });
}

if (btnJukeSync) {
    btnJukeSync.addEventListener('click', () => {
        if (isHost) {
            broadcastJukebox('JUKEBOX_SYNC', currentJukeboxFileId, jukeboxPlayer.currentTime);
            printCli('Jukebox sync signal broadcasted.', 'var(--neon-green)');
        } else {
            if (hostConnection && hostConnection.open) {
                hostConnection.send({ type: 'JUKEBOX_REQUEST_SYNC' });
            }
        }
    });
}

if (btnCloseJukebox) {
    btnCloseJukebox.addEventListener('click', () => {
        cyberJukebox.classList.add('hidden');
        jukeboxPlayer.pause();
        isJukeboxActive = false;
        currentJukeboxFileId = null;
    });
}

function broadcastJukebox(type, fileId, time) {
    connections.forEach(c => {
        if (c.open && c.isAuthenticated) {
            c.send({ type: type, fileId: fileId, time: time });
        }
    });
}

function hideContextMenu() {
    contextTargetId = null;
    if (typeof contextMenu !== 'undefined' && contextMenu) {
        contextMenu.classList.add('hidden');
    }
}

// Right click integration
function handleJukeboxContext(fileId) {
    const file = isHost ? vfs.findNode(fileId) : (typeof findClientNode === 'function' ? findClientNode(clientVFS, fileId) : null);
    if (!file) {
        alert("File not found in Virtual File System.");
        return;
    }
    const isAudio = file.name.match(/\\.(mp3|wav|ogg|m4a|flac)$/i) || (file.mime && file.mime.startsWith('audio/'));
    if (!isAudio) {
        alert("Not a supported audio file. Name: " + file.name + ", Mime: " + file.mime);
        return;
    }
    
    // Fetch file blob using getDecryptedFileObj to handle encryption, native handles, or memory blobs
    if (isHost) {
        getDecryptedFileObj(file).then(fileBlob => {
            if (fileBlob) {
                const url = URL.createObjectURL(fileBlob);
                loadJukeboxFile(file, url);
                jukeboxPlayer.play();
                btnJukePlay.classList.add('hidden');
                btnJukePause.classList.remove('hidden');
                broadcastJukebox('JUKEBOX_PLAY', file.id, 0);
            }
        }).catch(err => alert("Failed to read audio file: " + err));
    } else {
        // Guests request the file to memory first, then play. 
        // For simplicity, we can reuse the activePreviewFileId logic
        activePreviewFileId = file.id;
        document.getElementById("preview-loader-container").classList.remove("hidden");
        hostConnection.send({ type: 'REQUEST_FILE', id: file.id });
        // We'd need to intercept the completed download in handleFileChunk and pipe to jukebox...
        // Which we will do in handleJukeboxSync.
    }
    
    hideContextMenu();
}

// Add 'Play in Jukebox' to context menu
const contextMenuActions = document.getElementById('context-menu');
if (contextMenuActions) {
    const playBtn = document.createElement('div');
    playBtn.className = 'context-menu-item';
    playBtn.id = 'ctx-juke';
    playBtn.innerHTML = '<span style="color:var(--neon-pink);">▶</span> Play in Jukebox';
    contextMenuActions.appendChild(playBtn);
    
    playBtn.addEventListener('click', () => {
        if (contextTargetId) handleJukeboxContext(contextTargetId);
    });
}

// --- P2P ARCADE ---
const arcadeLobbyModal = document.getElementById('arcade-lobby-modal');
const btnCloseArcadeLobby = document.getElementById('btn-close-arcade-lobby');
const btnArcadeGames = document.querySelectorAll('.btn-arcade-game');
const arcadeLobbyTargetName = document.getElementById('arcade-lobby-target-name');

const arcadeModal = document.getElementById('arcade-modal');
const btnCloseArcade = document.getElementById('btn-close-arcade');
const arcadeGameTitle = document.getElementById('arcade-game-title');
const btnArcadeReset = document.getElementById('btn-arcade-reset');
const arcadeStatus = document.getElementById('arcade-status');

// Tic-Tac-Toe
const ticTacToeBoard = document.getElementById('tic-tac-toe-board');
const tttCells = document.querySelectorAll('.ttt-cell');
let arcadeBoard = ['', '', '', '', '', '', '', '', ''];

// Pong
const pongCanvas = document.getElementById('pong-canvas');
let pongCtx = null;
if (pongCanvas) pongCtx = pongCanvas.getContext('2d');
let pongState = {
    ballX: 300, ballY: 200, ballVX: 5, ballVY: 5,
    hostPaddleY: 150, guestPaddleY: 150,
    score1: 0, score2: 0,
    active: false, loopId: null
};
let myPongPaddle = 'host'; // 'host' or 'guest'

// Chess
const chessBoardEl = document.getElementById('chess-board');
let chessGame = null;
let myChessColor = 'w';
let selectedChessSquare = null;

// Global Arcade State
let currentGameType = null; // 'tictactoe', 'pong', 'chess'
let myArcadeMark = 'X'; // used for TTT and also side assignment (host/guest)
let currentArcadeTurn = 'X';
let arcadeOpponentId = null;
let arcadeOpponentAlias = 'Opponent';
let isArcadeActive = false;

function renderArcadeBoard() {
    tttCells.forEach((cell, idx) => {
        cell.innerText = arcadeBoard[idx];
        cell.style.color = arcadeBoard[idx] === 'X' ? 'var(--neon-pink)' : 'var(--neon-blue)';
    });
    
    if (checkArcadeWin('X')) {
        arcadeStatus.innerText = myArcadeMark === 'X' ? 'YOU WIN!' : (arcadeOpponentAlias + ' WINS!');
    } else if (checkArcadeWin('O')) {
        arcadeStatus.innerText = myArcadeMark === 'O' ? 'YOU WIN!' : (arcadeOpponentAlias + ' WINS!');
    } else if (!arcadeBoard.includes('')) {
        arcadeStatus.innerText = 'DRAW!';
    } else {
        arcadeStatus.innerText = currentArcadeTurn === myArcadeMark ? 'YOUR TURN' : (arcadeOpponentAlias + "'S TURN");
    }
}

function checkArcadeWin(mark) {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8], // rows
        [0,3,6], [1,4,7], [2,5,8], // cols
        [0,4,8], [2,4,6]           // diags
    ];
    return wins.some(combo => combo.every(idx => arcadeBoard[idx] === mark));
}

function openArcade(gameType, opponentId, mark, opponentAlias = 'Opponent') {
    currentGameType = gameType;
    arcadeOpponentId = opponentId;
    arcadeOpponentAlias = opponentAlias;
    myArcadeMark = mark;
    isArcadeActive = true;
    
    // Hide all boards first
    ticTacToeBoard.classList.add('hidden');
    pongCanvas.classList.add('hidden');
    chessBoardEl.classList.add('hidden');
    
    if (gameType === 'tictactoe') {
        arcadeGameTitle.innerText = 'NEON-TAC-TOE';
        arcadeBoard = ['', '', '', '', '', '', '', '', ''];
        currentArcadeTurn = 'X';
        ticTacToeBoard.classList.remove('hidden');
        renderArcadeBoard();
    } else if (gameType === 'pong') {
        arcadeGameTitle.innerText = 'CYBER-PONG';
        pongCanvas.classList.remove('hidden');
        myPongPaddle = (mark === 'X' ? 'host' : 'guest'); // X is inviter, O is invitee
        startPong();
    } else if (gameType === 'chess') {
        arcadeGameTitle.innerText = 'HOLO-CHESS';
        chessBoardEl.classList.remove('hidden');
        myChessColor = (mark === 'X' ? 'w' : 'b'); // X is inviter (white), O is invitee (black)
        startChess();
    }
    
    if (arcadeModal) arcadeModal.classList.remove('hidden');
}

// ----------------------------------------------------
// PONG LOGIC
// ----------------------------------------------------
function startPong() {
    pongState = {
        ballX: 300, ballY: 200, ballVX: 5, ballVY: 5,
        hostPaddleY: 150, guestPaddleY: 150,
        score1: 0, score2: 0,
        active: true, loopId: null
    };
    arcadeStatus.innerText = 'USE UP/DOWN ARROWS OR TOUCH';
    
    // Bind controls (only once ideally, but for simplicity we bind here and remove old ones if needed)
    // We'll just bind a global mouse/touch listener to the canvas
    pongCanvas.onmousemove = (e) => {
        if(!pongState.active) return;
        const rect = pongCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top - 50; // 50 is half paddle height
        if (myPongPaddle === 'host') pongState.hostPaddleY = Math.max(0, Math.min(300, y));
        else pongState.guestPaddleY = Math.max(0, Math.min(300, y));
        sendPongMove();
    };
    pongCanvas.ontouchmove = (e) => {
        if(!pongState.active) return;
        e.preventDefault();
        const rect = pongCanvas.getBoundingClientRect();
        const y = e.touches[0].clientY - rect.top - 50;
        if (myPongPaddle === 'host') pongState.hostPaddleY = Math.max(0, Math.min(300, y));
        else pongState.guestPaddleY = Math.max(0, Math.min(300, y));
        sendPongMove();
    };
    
    if (myPongPaddle === 'host') {
        // Host runs the physics loop
        pongState.loopId = requestAnimationFrame(pongPhysicsLoop);
    } else {
        // Guest just renders
        pongState.loopId = requestAnimationFrame(pongRenderLoop);
    }
}

function sendPongMove() {
    const moveData = { type: 'ARCADE_MOVE', gameType: 'pong', paddleY: myPongPaddle === 'host' ? pongState.hostPaddleY : pongState.guestPaddleY };
    sendArcadeData(moveData);
}

function sendArcadeData(data) {
    if (isHost) {
        const opponent = connections.find(c => c.peer === arcadeOpponentId);
        if (opponent) opponent.send(data);
    } else {
        if (hostConnection && hostConnection.open) hostConnection.send({ type: 'ARCADE_RELAY', targetId: arcadeOpponentId, data: data });
    }
}

function pongPhysicsLoop() {
    if (!pongState.active) return;
    
    pongState.ballX += pongState.ballVX;
    pongState.ballY += pongState.ballVY;
    
    // Top/Bottom bounce
    if (pongState.ballY <= 0 || pongState.ballY >= 390) pongState.ballVY *= -1;
    
    // Paddle bounce (Host is Left, Guest is Right)
    // Left paddle
    if (pongState.ballX <= 20 && pongState.ballX >= 10 && pongState.ballY + 10 >= pongState.hostPaddleY && pongState.ballY <= pongState.hostPaddleY + 100) {
        pongState.ballVX = Math.abs(pongState.ballVX);
        pongState.ballVY = (pongState.ballY - (pongState.hostPaddleY + 50)) * 0.1;
    }
    // Right paddle
    if (pongState.ballX >= 570 && pongState.ballX <= 580 && pongState.ballY + 10 >= pongState.guestPaddleY && pongState.ballY <= pongState.guestPaddleY + 100) {
        pongState.ballVX = -Math.abs(pongState.ballVX);
        pongState.ballVY = (pongState.ballY - (pongState.guestPaddleY + 50)) * 0.1;
    }
    
    // Scoring
    if (pongState.ballX < 0) { pongState.score2++; resetPongBall(); }
    if (pongState.ballX > 600) { pongState.score1++; resetPongBall(); }
    
    // Sync to guest at a stable rate (we can sync every frame or every few frames. For local p2p, every frame is usually fine if network is good, otherwise we'd decouple. Let's do every frame for now).
    sendArcadeData({ 
        type: 'ARCADE_MOVE', gameType: 'pong_sync', 
        ballX: pongState.ballX, ballY: pongState.ballY, 
        ballVX: pongState.ballVX, ballVY: pongState.ballVY,
        score1: pongState.score1, score2: pongState.score2,
        hostPaddleY: pongState.hostPaddleY // also sync host paddle so guest sees it
    });
    
    renderPong();
    pongState.loopId = requestAnimationFrame(pongPhysicsLoop);
}

function pongRenderLoop() {
    if (!pongState.active) return;
    renderPong();
    pongState.loopId = requestAnimationFrame(pongRenderLoop);
}

function resetPongBall() {
    pongState.ballX = 300;
    pongState.ballY = 200;
    pongState.ballVX = (Math.random() > 0.5 ? 5 : -5);
    pongState.ballVY = (Math.random() * 6) - 3;
}

function renderPong() {
    if (!pongCtx) return;
    pongCtx.fillStyle = '#000';
    pongCtx.fillRect(0, 0, 600, 400);
    
    pongCtx.fillStyle = '#39ff14';
    pongCtx.fillRect(10, pongState.hostPaddleY, 10, 100);
    pongCtx.fillRect(580, pongState.guestPaddleY, 10, 100);
    
    pongCtx.fillRect(pongState.ballX, pongState.ballY, 10, 100); // ball is 10x10
    // Actually make ball 10x10
    pongCtx.fillStyle = '#000';
    pongCtx.fillRect(pongState.ballX, pongState.ballY, 10, 100); // clear
    pongCtx.fillStyle = '#39ff14';
    pongCtx.fillRect(pongState.ballX, pongState.ballY, 10, 10);
    
    pongCtx.font = '24px monospace';
    pongCtx.fillText(pongState.score1, 150, 50);
    pongCtx.fillText(pongState.score2, 450, 50);
    
    // Center line
    for(let i=0; i<400; i+=20) {
        pongCtx.fillRect(299, i, 2, 10);
    }
}

// ----------------------------------------------------
// CHESS LOGIC
// ----------------------------------------------------
function startChess() {
    if (typeof Chess === 'undefined') {
        arcadeStatus.innerText = 'Chess library not loaded!';
        return;
    }
    chessGame = new Chess();
    selectedChessSquare = null;
    arcadeStatus.innerText = myChessColor === 'w' ? 'YOUR TURN (WHITE)' : (arcadeOpponentAlias + "'S TURN (WHITE)");
    renderChess();
}

function renderChess() {
    chessBoardEl.innerHTML = '';
    const board = chessGame.board(); // 8x8 array
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            // If playing black, flip the board rendering
            const renderR = myChessColor === 'b' ? 7 - r : r;
            const renderC = myChessColor === 'b' ? 7 - c : c;
            const sq = board[renderR][renderC];
            
            const files = 'abcdefgh';
            const squareName = files[renderC] + (8 - renderR);
            
            const cell = document.createElement('div');
            cell.style.width = '100%';
            cell.style.height = '100%';
            cell.style.display = 'flex';
            cell.style.justifyContent = 'center';
            cell.style.alignItems = 'center';
            cell.style.fontSize = '2rem';
            cell.style.cursor = 'pointer';
            
            const isLight = (renderR + renderC) % 2 === 0;
            cell.style.backgroundColor = isLight ? '#eee' : '#555';
            
            if (selectedChessSquare === squareName) {
                cell.style.backgroundColor = 'var(--neon-pink)';
            }
            
            if (sq) {
                // Map to unicode
                const pieceMap = {
                    'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
                    'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
                };
                const key = sq.color === 'w' ? sq.type.toUpperCase() : sq.type;
                cell.innerText = pieceMap[key];
                cell.style.color = sq.color === 'w' ? '#fff' : '#000';
                if (sq.color === 'w') cell.style.textShadow = '0 0 2px #000';
            }
            
            cell.addEventListener('click', () => handleChessClick(squareName));
            chessBoardEl.appendChild(cell);
        }
    }
    
    // Check status
    if (chessGame.in_checkmate()) {
        arcadeStatus.innerText = 'CHECKMATE! ' + (chessGame.turn() === myChessColor ? (arcadeOpponentAlias + ' WINS!') : 'YOU WIN!');
    } else if (chessGame.in_draw() || chessGame.in_stalemate()) {
        arcadeStatus.innerText = 'DRAW!';
    } else if (chessGame.in_check()) {
        arcadeStatus.innerText = 'CHECK! ' + (chessGame.turn() === myChessColor ? 'YOUR TURN' : (arcadeOpponentAlias + "'S TURN"));
    } else {
        arcadeStatus.innerText = chessGame.turn() === myChessColor ? 'YOUR TURN' : (arcadeOpponentAlias + "'S TURN");
    }
}

function handleChessClick(square) {
    if (chessGame.turn() !== myChessColor) return; // Not my turn
    
    if (selectedChessSquare) {
        // Try to move
        const move = chessGame.move({
            from: selectedChessSquare,
            to: square,
            promotion: 'q' // Always promote to queen for simplicity
        });
        
        if (move) {
            // Valid move!
            selectedChessSquare = null;
            renderChess();
            sendArcadeData({ type: 'ARCADE_MOVE', gameType: 'chess', fen: chessGame.fen() });
        } else {
            // Invalid move or clicking another piece to select
            selectedChessSquare = square;
            renderChess();
        }
    } else {
        selectedChessSquare = square;
        renderChess();
    }
}

function getMyAlias() {
    return (typeof profile !== 'undefined' && profile && profile.name) ? profile.name : ((typeof guestAlias !== 'undefined' && guestAlias) ? guestAlias : 'HOST');
}

function handleArcadeNetwork(data) {
    if (data.type === 'ARCADE_INVITE') {
        const inviterName = data.fromAlias || (data.fromId ? data.fromId.substring(0, 6) : "Peer");
        const gameName = data.gameType === 'pong' ? 'Cyber-Pong' : (data.gameType === 'chess' ? 'Holo-Chess' : 'Neon-Tac-Toe');
        
        if (confirm("Arcade Invite from " + inviterName + " to play " + gameName + ". Accept?")) {
            if (isHost) {
                const opponent = connections.find(c => c.peer === data.fromId);
                if (opponent) opponent.send({ type: 'ARCADE_ACCEPT', gameType: data.gameType, fromId: peer.id, fromAlias: getMyAlias() });
            } else {
                if (hostConnection) hostConnection.send({ type: 'ARCADE_RELAY', targetId: data.fromId, data: { type: 'ARCADE_ACCEPT', gameType: data.gameType, fromId: peer.id, fromAlias: getMyAlias() } });
            }
            openArcade(data.gameType, data.fromId, 'O', data.fromAlias || 'Opponent');
        } else {
            if (isHost) {
                const opponent = connections.find(c => c.peer === data.fromId);
                if (opponent) opponent.send({ type: 'ARCADE_DECLINE', fromId: peer.id });
            } else {
                if (hostConnection) hostConnection.send({ type: 'ARCADE_RELAY', targetId: data.fromId, data: { type: 'ARCADE_DECLINE', fromId: peer.id } });
            }
        }
    } else if (data.type === 'ARCADE_ACCEPT') {
        showToast((data.fromAlias || 'Opponent') + " accepted!");
        openArcade(data.gameType, data.fromId, 'X', data.fromAlias || 'Opponent');
    } else if (data.type === 'ARCADE_DECLINE') {
        alert("Arcade Invite declined.");
    } else if (data.type === 'ARCADE_MOVE') {
        if (data.gameType === 'tictactoe') {
            arcadeBoard = data.board;
            currentArcadeTurn = data.turn;
            renderArcadeBoard();
        } else if (data.gameType === 'pong') {
            if (myPongPaddle === 'host') pongState.guestPaddleY = data.paddleY;
            else pongState.hostPaddleY = data.paddleY;
        } else if (data.gameType === 'pong_sync') {
            if (myPongPaddle === 'guest') {
                pongState.ballX = data.ballX;
                pongState.ballY = data.ballY;
                pongState.ballVX = data.ballVX;
                pongState.ballVY = data.ballVY;
                pongState.score1 = data.score1;
                pongState.score2 = data.score2;
                pongState.hostPaddleY = data.hostPaddleY;
            }
        } else if (data.gameType === 'chess') {
            if (chessGame) {
                chessGame.load(data.fen);
                renderChess();
            }
        }
    } else if (data.type === 'ARCADE_RESET') {
        if (currentGameType === 'tictactoe') {
            arcadeBoard = ['', '', '', '', '', '', '', '', ''];
            currentArcadeTurn = 'X';
            renderArcadeBoard();
        } else if (currentGameType === 'pong') {
            resetPongBall();
            pongState.score1 = 0;
            pongState.score2 = 0;
        } else if (currentGameType === 'chess') {
            if (chessGame) chessGame.reset();
            renderChess();
        }
    }
}

if (btnCloseArcade) {
    btnCloseArcade.addEventListener('click', () => {
        arcadeModal.classList.add('hidden');
        isArcadeActive = false;
        pongState.active = false;
        if (pongState.loopId) cancelAnimationFrame(pongState.loopId);
        // Optionally send a surrender message
    });
}

tttCells.forEach((cell, idx) => {
    cell.addEventListener('click', () => {
        if (!isArcadeActive || currentArcadeTurn !== myArcadeMark || arcadeBoard[idx] !== '') return;
        if (checkArcadeWin('X') || checkArcadeWin('O')) return;
        
        arcadeBoard[idx] = myArcadeMark;
        currentArcadeTurn = myArcadeMark === 'X' ? 'O' : 'X';
        renderArcadeBoard();
        
        const moveData = { type: 'ARCADE_MOVE', board: arcadeBoard, turn: currentArcadeTurn };
        
        if (isHost) {
            const opponent = connections.find(c => c.peer === arcadeOpponentId);
            if (opponent) opponent.send(moveData);
        } else {
            if (hostConnection && hostConnection.open) hostConnection.send({ type: 'ARCADE_RELAY', targetId: arcadeOpponentId, data: moveData });
        }
    });
});

if (btnArcadeReset) {
    btnArcadeReset.addEventListener('click', () => {
        const resetData = { type: 'ARCADE_RESET', gameType: currentGameType };
        if (currentGameType === 'tictactoe') {
            arcadeBoard = ['', '', '', '', '', '', '', '', ''];
            currentArcadeTurn = 'X';
            renderArcadeBoard();
        } else if (currentGameType === 'pong') {
            resetPongBall();
            pongState.score1 = 0;
            pongState.score2 = 0;
        } else if (currentGameType === 'chess') {
            if (chessGame) chessGame.reset();
            renderChess();
        }
        
        if (isHost) {
            const opponent = connections.find(c => c.peer === arcadeOpponentId);
            if (opponent) opponent.send(resetData);
        } else {
            if (hostConnection && hostConnection.open) hostConnection.send({ type: 'ARCADE_RELAY', targetId: arcadeOpponentId, data: resetData });
        }
    });
}

if (btnCloseArcadeLobby) {
    btnCloseArcadeLobby.addEventListener('click', () => {
        arcadeLobbyModal.classList.add('hidden');
    });
}

btnArcadeGames.forEach(btn => {
    btn.addEventListener('click', () => {
        const gameType = btn.getAttribute('data-game');
        arcadeLobbyModal.classList.add('hidden');
        
        // Send Invite
        if (!currentRadarGuestId) return;
        if (isHost) {
            const opponent = connections.find(c => c.peer === currentRadarGuestId);
            if (opponent) opponent.send({ type: 'ARCADE_INVITE', gameType: gameType, fromId: peer.id, fromAlias: getMyAlias() });
        } else {
            if (hostConnection) hostConnection.send({ type: 'ARCADE_RELAY', targetId: currentRadarGuestId, data: { type: 'ARCADE_INVITE', gameType: gameType, fromId: peer.id, fromAlias: getMyAlias() } });
        }
        showToast("Arcade Invite sent to " + currentRadarGuestAlias + "!");
        const radarGuestModal = document.getElementById('radar-guest-modal');
        if (radarGuestModal) radarGuestModal.classList.add('hidden');
    });
});

// Add 'Invite to Arcade' to Guest Control Modal
const btnRadarArcade = document.getElementById('btn-radar-arcade');
if (btnRadarArcade) {
    btnRadarArcade.addEventListener('click', () => {
        if (!currentRadarGuestId) return;
        if (arcadeLobbyTargetName) arcadeLobbyTargetName.innerText = currentRadarGuestAlias;
        arcadeLobbyModal.classList.remove('hidden');
    });
}

// --- WEBTORRENT SWARM PROTOCOL ---
let swarmConnections = [];

function broadcastNetworkMap() {
    if (!isHost) return;
    const map = connections.map(c => c.peer);
    connections.forEach(c => {
        if (c.open && c.isAuthenticated) {
            c.send({ type: 'NETWORK_MAP', peers: map });
        }
    });
}

