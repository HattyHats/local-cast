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
const btnViewToggleClient = document.getElementById('btn-view-toggle-client');

const contextMenu = document.getElementById('context-menu');
const ctxRename = document.getElementById('ctx-rename');
const ctxDelete = document.getElementById('ctx-delete');
const ctxLock = document.getElementById('ctx-lock');
const ctxOpen = document.getElementById('ctx-open');
const ctxDownload = document.getElementById('ctx-download');
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
let isListViewHost = false;
let isListViewClient = false;
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
const btnUploadFiles = document.getElementById('btn-upload-files');
const btnUploadFolder = document.getElementById('btn-upload-folder');
const btnDownloadAllHost = document.getElementById('btn-download-all-host');

const btnBurn = document.getElementById('btn-burn');
const burnOverlay = document.getElementById('burn-overlay');
const burnCountdown = document.getElementById('burn-countdown');

const btnDownloadAllClient = document.getElementById('btn-download-all-client');
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

const toggleGuestUploads = document.getElementById('toggle-guest-uploads');
const btnUploadFilesClient = document.getElementById('btn-upload-files-client');
const btnUploadFolderClient = document.getElementById('btn-upload-folder-client');
const clientFileInput = document.getElementById('client-file-input');
const clientFolderInput = document.getElementById('client-folder-input');

// --- SPLASH SCREEN ---
const splashTitle = document.getElementById('splash-title');
const splashSubtitle = document.getElementById('splash-subtitle');
const splashLoader = document.getElementById('splash-loader');
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

function initMatrixCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
    
    function drawMatrix() {
        ctx.fillStyle = 'rgba(5, 5, 7, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#39ff14';
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    return setInterval(drawMatrix, 33);
}

window.addEventListener('resize', () => {
    if(canvas && document.body.contains(canvas)) {
        wbCanvas.width = window.innerWidth;
        wbCanvas.height = window.innerHeight;
    }
});

async function runBootSequence() {
    const matrixInterval = initMatrixCanvas();
    await new Promise(r => setTimeout(r, 500));
    splashTitle.classList.remove('hidden');
    await new Promise(r => setTimeout(r, 1500));
    splashSubtitle.classList.remove('hidden');
    await new Promise(r => setTimeout(r, 1500));
    splashLoader.classList.remove('hidden');
    await new Promise(r => setTimeout(r, 2000));
    
    bootSequence.classList.add('inactive');
    appWrapper.classList.remove('hidden');
    setTimeout(() => {
        clearInterval(matrixInterval);
        bootSequence.style.display = 'none';
        initApp();
    }, 800);
}


let burnTimerInterval = null;

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
if (btnCloseWhisper) {
    btnCloseWhisper.addEventListener('click', () => {
        whisperModal.classList.add('hidden');
    });
}

function openWhisper(targetId, alias, color) {
    whisperTarget = targetId;
    document.getElementById('whisper-target-name').innerText = 'Whispering: ' + alias;
    document.getElementById('whisper-target-name').style.color = color;
    whisperMessages.innerHTML = '';
    if(radarModal) radarModal.classList.add('hidden');
    whisperModal.classList.remove('hidden');
}

if (whisperForm) {
    whisperForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!whisperInput.value.trim() || !whisperTarget) return;
        const msg = whisperInput.value.trim();
        
        const div = document.createElement('div');
        div.className = 'whisper-message self';
        div.innerText = `You: ${msg}`;
        whisperMessages.appendChild(div);
        whisperMessages.scrollTop = whisperMessages.scrollHeight;
        
        if (isHost) {
            const conn = connections.find(c => c.peer === whisperTarget);
            if (conn && conn.open) {
                conn.send({ type: 'WHISPER', fromId: (peer ? peer.id : null), fromAlias: 'Host', fromColor: guestColor, msg });
            }
        } else {
            if (hostConnection && hostConnection.open) {
                hostConnection.send({ type: 'WHISPER_RELAY', targetId: whisperTarget, msg, fromId: (peer ? peer.id : null), fromAlias: guestAlias, fromColor: guestColor });
            }
        }
        
        whisperInput.value = '';
    });
}

if (radarCanvas) {
    radarCanvas.addEventListener('click', (e) => {
        const rect = radarCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        for (const blip of radarBlips) {
            const dx = x - blip.x;
            const dy = y - blip.y;
            if (Math.sqrt(dx*dx + dy*dy) < 20) {
                openWhisper(blip.id, blip.alias, blip.color);
                break;
            }
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
                
                radarBlips.push({ id, x, y, alias: data.alias, color: data.color });
                ctx.fillStyle = data.color || '#39ff14';
                ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.fillText(data.alias || 'Guest', x + 8, y + 4);
            }
        } catch(e) {
            console.error("Radar Error:", e);
        }
    }
    requestAnimationFrame(drawRadar);
}

function handleWhisper(data) {
    if (whisperModal.classList.contains('hidden') || whisperTarget !== data.fromId) {
        openWhisper(data.fromId, data.fromAlias, data.fromColor);
    }
    const div = document.createElement('div');
    div.className = 'whisper-message other';
    div.style.borderLeftColor = data.fromColor;
    div.innerText = `${data.fromAlias}: ${data.msg}`;
    whisperMessages.appendChild(div);
    whisperMessages.scrollTop = whisperMessages.scrollHeight;
}

function startBurnCountdown(seconds) {
    if (burnTimerInterval) clearInterval(burnTimerInterval);
    burnOverlay.classList.add('active');
    
    let left = seconds;
    burnCountdown.innerText = left.toFixed(2);
    
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
        burnCountdown.innerText = remaining.toFixed(2);
    }, 50);
}

// Modify triggerBurnSequence to be more aggressive
function triggerBurnSequence() {
    vfs = new VirtualFileSystem();
    if (typeof localforage !== 'undefined') localforage.clear();
    connections.forEach(conn => conn.close());
    connections = [];
    document.body.innerHTML = '<div style="background:#000; color:#f00; height:100vh; width:100vw; display:flex; justify-content:center; align-items:center; flex-direction:column;"><h1 style="font-size:10vw; margin:0; text-shadow: 0 0 50px #f00;">NETWORK DESTROYED</h1><p>All traces wiped from memory.</p></div>';
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
            fileObj: node.fileObj,
            children: node.children ? node.children.map(stripParents) : []
        };
    }
    await localforage.setItem("vfs_root", stripParents(vfs.root));
}

class VirtualFileSystem {
    constructor() {
        this.root = { id: 'root', name: 'Home', type: 'folder', children: [], parent: null };
        this.currentDir = this.root;
    }
    
    addFolder(name) {
        const id = 'folder_' + Math.random().toString(36).substr(2, 9);
        const folder = { id, name, type: 'folder', children: [], parent: this.currentDir };
        this.currentDir.children.push(folder);
        return folder;
    }
    
    getTree(unlockedSet = new Set()) {
        function clone(node) {
            if (node.isHidden && !showDeadDrops) return null;
            const isUnlocked = unlockedSet.has(node.id);
            const n = { id: node.id, type: node.type, name: node.name, size: node.size, mime: node.mime, isLocked: !!node.password, isUnlocked, isHidden: node.isHidden };
            if (node.children) {
                if (node.password && !isUnlocked) {
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

const vfs = new VirtualFileSystem();
let clientVFS = null; // Client's copy of the tree
let clientCurrentDir = null;

// State
let isHost = true;
let peer = null;
let connections = [];
let hostConnection = null;
let hostPassword = null;

const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('room');
if (roomCode) {
    isHost = false;
}

function initApp() {
    if (isHost) {
        hostView.classList.remove('hidden');
        initHost();
    } else {
        clientView.classList.remove('hidden');
        initClient();
    }
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
    btnLock.classList.remove('hidden');
    btnLock.addEventListener('click', () => {
        if (!hostPassword) {
            const pwd = prompt("Enter a password to lock this session:");
            if (pwd) {
                hostPassword = pwd;
                iconUnlocked.classList.add('hidden');
                iconLocked.classList.remove('hidden');
            }
        } else {
            if (confirm("Remove password protection?")) {
                hostPassword = null;
                iconUnlocked.classList.remove('hidden');
                iconLocked.classList.add('hidden');
                connections.forEach(conn => {
                    if (!conn.isAuthenticated) {
                        conn.isAuthenticated = true;
                        conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
                    }
                });
            }
        }
    });

    peer = new Peer({ debug: 2 });
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
        updateStatus('HOST ACTIVE', 'online');
        const connectUrl = `${window.location.origin}${window.location.pathname}?room=${id}`;
        
        qrPlaceholder.classList.add('hidden');
        new QRCode(qrcodeEl, { text: connectUrl, width: 130, height: 130, colorDark : "#00f0ff", colorLight : "#0a0b10", correctLevel : QRCode.CorrectLevel.L });
        joinInfo.classList.remove('hidden');
        joinUrl.textContent = connectUrl;
    });

    peer.on('connection', (conn) => {
        connections.push(conn);
        broadcastPeers();
        conn.isAuthenticated = !hostPassword;
        conn.unlockedFolders = new Set();
        
        conn.on('data', (data) => {
            if (data.type === 'AUTH_ATTEMPT') {
                if (data.password === hostPassword) {
                    conn.isAuthenticated = true;
                    conn.send({ type: 'AUTH_SUCCESS' });
                    conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
                    if (toggleGuestUploads) conn.send({ type: 'GUEST_UPLOAD_ENABLED', enabled: toggleGuestUploads.checked });
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
                conn.profile = { name: data.name, color: data.color };
                broadcastPeers();
                appendChatMessage('System', `${data.name} joined the network`, 'system', 'var(--text-muted)');
                Object.values(connections).forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated) {
                        c.send({ type: 'CHAT_MSG', sender: 'System', text: `${data.name} joined the network`, color: 'var(--text-muted)' });
                    }
                });
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
                    sendFileInChunks(conn, node.id, node.fileObj, node.name, node.mime, 'FILE_CHUNK');
                }
            } else if (data.type === 'REQUEST_ZIP_ALL' && conn.isAuthenticated) {
                generateZipBlob().then(blob => {
                    sendFileInChunks(conn, 'zip-all', blob, 'local-cast-backup.zip', 'application/zip', 'ZIP_CHUNK');
                });
            } else if (data.type === 'CLIENT_UPLOAD_CHUNK_START') {
                incomingTransfers[data.id] = { chunks: [], received: 0, total: data.totalChunks, name: data.name, mime: data.mime, size: data.size, path: data.path, targetFolderId: data.targetFolderId };
            } else if (data.type === 'CLIENT_UPLOAD_CHUNK') {
                const transfer = incomingTransfers[data.id];
                if (transfer) {
                    transfer.chunks[data.index] = data.chunk;
                    transfer.received++;
                    if (transfer.received === transfer.total) {
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
                        
                        current.children.push({ id: newId, name: transfer.name, type: 'file', size: transfer.size, mime: transfer.mime, fileObj: fileObj, parent: current });
                        saveVFSToDB();
                        renderHostExplorer();
                        broadcastTree();
                        delete incomingTransfers[data.id];
                        conn.send({ type: 'UPLOAD_COMPLETE' });
                        notifyFileAdded(transfer.name);
                    }
                }
            } else if (data.type === 'CLIENT_RENAME_NODE') {
                if (toggleGuestUploads && toggleGuestUploads.checked) {
                    const node = vfs.findNode(data.id);
                    if (node && !node.isLocked) {
                        node.name = data.newName;
                        saveVFSToDB();
                        renderHostExplorer();
                        broadcastTree();
                    }
                }
            } else if (data.type === 'CLIENT_DELETE_NODE') {
                if (toggleGuestUploads && toggleGuestUploads.checked) {
                    const node = vfs.findNode(data.id);
                    if (node && node.parent && !node.isLocked && !node.parent.isLocked) {
                        node.parent.children = node.parent.children.filter(c => c.id !== data.id);
                        saveVFSToDB();
                        renderHostExplorer();
                        broadcastTree();
                    }
                }
            }
        });
        
        conn.on('open', () => {
            if (hostPassword) {
                conn.send({ type: 'AUTH_REQUIRED' });
            } else {
                conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
                if (toggleGuestUploads) conn.send({ type: 'GUEST_UPLOAD_ENABLED', enabled: toggleGuestUploads.checked });
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
    const peers = connections.filter(c => c.open && c.profile).map(c => ({ id: c.peer, alias: c.profile.name, color: c.profile.color }));
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
        const name = prompt("Enter folder name:");
        if (name) {
            saveVFSToDB();
            vfs.addFolder(name);
            renderHostExplorer();
            broadcastTree();
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

    if (toggleGuestUploads) {
        toggleGuestUploads.addEventListener("change", (e) => {
            connections.forEach(conn => {
                if (conn.open) conn.send({ type: "GUEST_UPLOAD_ENABLED", enabled: e.target.checked });
            });
        });
    }

}

function processFiles(files) {
    files.forEach(file => {
        if (file.webkitRelativePath) {
            const parts = file.webkitRelativePath.split('/');
            let current = vfs.currentDir;
            for(let i=0; i<parts.length-1; i++) {
                let folderName = parts[i];
                let existing = current.children.find(c => c.type === 'folder' && c.name === folderName);
                if (!existing) {
                    existing = { id: 'folder_' + Math.random().toString(36).substr(2), name: folderName, type: 'folder', children: [], parent: current };
                    current.children.push(existing);
                }
                current = existing;
            }
            current.children.push({ id: 'file_' + Math.random().toString(36).substr(2), name: file.name, type: 'file', size: file.size, mime: file.type, fileObj: file, parent: current });
        } else {
            const id = 'file_' + Math.random().toString(36).substr(2);
            vfs.currentDir.children.push({ id, name: file.name, type: 'file', size: file.size, mime: file.type, fileObj: file, parent: vfs.currentDir });
        }
    });
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
    itemsToRender.forEach(child => {
        const item = document.createElement('div');
        item.className = `file-item ${child.type}`;
        
        const icon = child.type === 'folder' ? 
            `<svg class="item-icon folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>${child.isLocked || child.password ? '<rect x="15" y="15" width="8" height="8" fill="var(--bg-card)" stroke="none"></rect><rect x="16" y="18" width="6" height="4" rx="1" fill="var(--neon-red)" stroke="var(--neon-red)"></rect><path d="M17 18V16a2 2 0 0 1 4 0v2" stroke="var(--neon-red)"></path>' : ''}</svg>` : 
            `<svg class="item-icon file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
            
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
                vfs.currentDir = child;
                renderHostExplorer();
            });
        }
        
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            contextTargetId = child.id;
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.classList.remove('hidden');
            if (document.getElementById('ctx-deaddrop')) document.getElementById('ctx-deaddrop').style.display = 'block';
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
        } else if (child.type === 'file' && child.mime && (child.mime.startsWith('image/') || child.mime.startsWith('video/') || child.mime.startsWith('audio/'))) {
            item.addEventListener('dblclick', () => {
                if (child.fileObj) {
                    const url = URL.createObjectURL(child.fileObj);
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
                        mediaContainer.innerHTML = `<audio src="${url}" controls autoplay style="width:100%; margin: 2rem 0;"></audio>`;
                    } else {
                        mediaContainer.innerHTML = `<img src="${url}" style="width:100%; max-height:70vh; display:block; object-fit: contain;">`;
                    }
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
function initClient() {
    updateStatus('CONNECTING...', 'offline');
    
    peer = new Peer({ debug: 2 });
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
            if (data.type === 'AUTH_REQUIRED') {
                passwordModal.classList.remove('hidden');
            } else if (data.type === 'AUTH_SUCCESS') {
                passwordModal.classList.add('hidden');
                passwordError.classList.add('hidden');
            } else if (data.type === 'AUTH_FAIL') {
                passwordError.classList.remove('hidden');
            } else if (data.type === 'TREE') {
                hostConnection.send({ type: 'PROFILE_UPDATE', name: guestAlias, color: guestColor });
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
                incomingTransfers[data.id] = { chunks: [], received: 0, total: data.totalChunks, name: data.name, mime: data.mime, size: data.size };
                const pct = document.getElementById(data.type === 'ZIP_CHUNK_START' ? 'client-progress-text' : 'preview-progress-text');
                if (pct) pct.textContent = '0%';
            } else if (data.type === 'FILE_CHUNK' || data.type === 'ZIP_CHUNK') {
                const transfer = incomingTransfers[data.id];
                if (transfer) {
                    transfer.chunks[data.index] = data.chunk;
                    transfer.received++;
                    const pctVal = Math.floor((transfer.received / transfer.total) * 100);
                    const pct = document.getElementById(data.type === 'ZIP_CHUNK' ? 'client-progress-text' : 'preview-progress-text');
                    if (pct) pct.textContent = `${pctVal}%`;
                    
                    if (transfer.received === transfer.total) {
                        const blob = new Blob(transfer.chunks, { type: transfer.mime });
                        triggerDownload(blob, transfer.name, transfer.mime);
                        delete incomingTransfers[data.id];
                    }
                }
            } else if (data.type === 'GUEST_UPLOAD_ENABLED') {
                if (btnUploadFilesClient) btnUploadFilesClient.classList.toggle('hidden', !data.enabled);
                if (btnUploadFolderClient) btnUploadFolderClient.classList.toggle('hidden', !data.enabled);
            } else if (data.type === 'UPLOAD_COMPLETE') {
                clientDownloading.classList.add('hidden');
                alert("Upload complete!");
            } else if (data.type === 'WHITEBOARD_DRAW') {
                if (wbCtx) {
                    const w = wbCanvas.width; const h = wbCanvas.height;
                    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, false);
                }
            } else if (data.type === 'WHITEBOARD_CLEAR') {
                if (wbCtx) wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
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
                        } else if (data.type === 'PEER_LIST') {
                activePeers = {};
                data.peers.forEach(p => activePeers[p.id] = p);
            } else if (data.type === 'WHISPER') {
                handleWhisper(data);
} else if (data.type === 'CHAT_MSG') {
                appendChatMessage(data.sender, data.text, data.sender === 'System' ? 'system' : 'other', data.color);
            } else if (data.type === 'FILE_ADDED_TOAST') {
                showToast(`New file: ${data.filename}`);
            } else if (data.type === 'FOLDER_AUTH_SUCCESS') {
                folderPasswordModal.classList.add('hidden');
                autoEnterFolderId = activeAuthFolderId;
                // The updated TREE will arrive next and we can navigate in
            } else if (data.type === 'FOLDER_AUTH_FAIL') {
                folderPasswordError.classList.remove('hidden');
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
    
    async function processClientFiles(files) {
        if (!files.length || !hostConnection || !hostConnection.open) return;
        clientDownloading.classList.remove("hidden");
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            downloadFilename.textContent = `Uploading ${file.name} (${i + 1}/${files.length})`;
            document.getElementById("client-progress-text").textContent = "Starting...";
            const extraData = { targetFolderId: clientCurrentDir.id, path: file.webkitRelativePath || '' };
            await sendFileInChunks(hostConnection, "upload_" + Date.now() + "_" + i, file, file.name, file.type, "CLIENT_UPLOAD_CHUNK", extraData);
        }
    }
    
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
    itemsToRender.forEach(child => {
        const item = document.createElement('div');
        item.className = `file-item ${child.type}`;
        
        const icon = child.type === 'folder' ? 
            `<svg class="item-icon folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>${child.isLocked || child.password ? '<rect x="15" y="15" width="8" height="8" fill="var(--bg-card)" stroke="none"></rect><rect x="16" y="18" width="6" height="4" rx="1" fill="var(--neon-red)" stroke="var(--neon-red)"></rect><path d="M17 18V16a2 2 0 0 1 4 0v2" stroke="var(--neon-red)"></path>' : ''}</svg>` : 
            `<svg class="item-icon file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
            
        const sizeText = child.size ? `<div class="item-meta">${(child.size / 1024 / 1024).toFixed(2)} MB</div>` : '';
        item.innerHTML = `${icon}<div class="item-name" title="${child.name}">${child.name}</div>${sizeText}`;
        
        item.addEventListener('click', () => {
            if (child.type === 'folder') {
                if (child.isLocked && !child.isUnlocked) {
                    activeAuthFolderId = child.id;
                    folderPasswordInput.value = '';
                    folderPasswordError.classList.add('hidden');
                    folderPasswordModal.classList.remove('hidden');
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
            if (btnUploadFilesClient && !btnUploadFilesClient.classList.contains('hidden')) {
                e.preventDefault();
                contextTargetId = child.id;
                contextMenu.style.left = `${e.clientX}px`;
                contextMenu.style.top = `${e.clientY}px`;
                contextMenu.classList.remove('hidden');
                
                // Hide host-only options
                if (document.getElementById('ctx-deaddrop')) document.getElementById('ctx-deaddrop').style.display = 'none';
            }
        });
        
        clientExplorerGrid.appendChild(item);
    });
}


async function triggerDownload(fileData, name, mime) {
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
        
        const lowerName = name.toLowerCase();
        const isMedia = (mime && (mime.startsWith('video/') || mime.startsWith('audio/') || mime.startsWith('image/'))) || 
                        lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.ogg') ||
                        lowerName.endsWith('.mp3') || lowerName.endsWith('.wav') ||
                        lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.gif');
        
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
    const totalChunks = Math.ceil(fileBlob.size / CHUNK_SIZE);
    conn.send({ type: typeStr + '_START', id: fileId, name: fileName, mime: fileMime, size: fileBlob.size, totalChunks, ...extraData });
    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileBlob.size);
        const chunk = fileBlob.slice(start, end);
        const arrayBuffer = await chunk.arrayBuffer();
        conn.send({ type: typeStr, id: fileId, index: i, chunk: arrayBuffer });
        await new Promise(r => setTimeout(r, 10)); // Prevent WebRTC buffer overflow
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
    notifyFileAdded(name);
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.context-menu')) contextMenu.classList.add('hidden');
});

if (ctxOpen) {
    ctxOpen.addEventListener('click', async () => {
        if (!contextTargetId) return;
        const node = vfs.findNode(contextTargetId);
        if (node && node.type === 'file') {
            if (node.mime && (node.mime.startsWith('image/') || node.mime.startsWith('video/') || node.mime.startsWith('audio/'))) {
                const url = URL.createObjectURL(node.fileObj);
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
            } else if (node.name.endsWith('.txt') || node.name.endsWith('.md')) {
                if (node.fileObj) {
                    const text = await node.fileObj.text();
                    editorFilename.value = node.name;
                    editorTextarea.value = text;
                    editorModal.classList.remove('hidden');
                }
            } else {
                alert("Cannot preview this file type.");
            }
        } else if (node && node.type === 'folder') {
            // For folders on mobile, open acts like double click
            vfs.currentDir = node;
            renderHostExplorer();
        }
        contextTargetId = null;
        contextMenu.classList.add('hidden');
    });
}

if (ctxDownload) {
    ctxDownload.addEventListener('click', () => {
        if (!contextTargetId) return;
        const node = vfs.findNode(contextTargetId);
        if (node && node.type === 'file' && node.fileObj) {
            triggerDownload(node.fileObj, node.name, node.mime);
        } else if (node && node.type === 'folder') {
            alert("Folder download via context menu not implemented. Use 'Download Backup' for now.");
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

window.onload = runBootSequence;

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
        '--neon-blue': '#00f0ff',
        '--neon-green': '#39ff14',
        '--neon-red': '#ff003c',
        '--border-glow': 'rgba(0, 240, 255, 0.2)'
    },
    matrix: {
        '--bg-dark': '#000000',
        '--bg-card': '#001100',
        '--bg-card-hover': '#002200',
        '--neon-blue': '#39ff14',
        '--neon-green': '#39ff14',
        '--neon-red': '#39ff14',
        '--border-glow': 'rgba(57, 255, 20, 0.2)'
    },
    nightcity: {
        '--bg-dark': '#0f0f1a',
        '--bg-card': '#1a0b1c',
        '--bg-card-hover': '#2a112c',
        '--neon-blue': '#fce205', // Yellow
        '--neon-green': '#00f0ff',
        '--neon-red': '#ff00ff', // Pink
        '--border-glow': 'rgba(255, 0, 255, 0.2)'
    },
    bloodmoon: {
        '--bg-dark': '#050000',
        '--bg-card': '#1a0000',
        '--bg-card-hover': '#330000',
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
    'default': 'linear-gradient(rgba(10, 10, 15, 0.9), rgba(10, 10, 15, 0.9)), linear-gradient(0deg, transparent 24%, var(--border-glow) 25%, var(--border-glow) 26%, transparent 27%, transparent 74%, var(--border-glow) 75%, var(--border-glow) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, var(--border-glow) 25%, var(--border-glow) 26%, transparent 27%, transparent 74%, var(--border-glow) 75%, var(--border-glow) 76%, transparent 77%, transparent)',
    'circuit': 'radial-gradient(circle at 50% 50%, rgba(10, 10, 15, 0.9) 0%, rgba(5, 5, 10, 1) 100%), repeating-linear-gradient(45deg, var(--border-glow) 0, var(--border-glow) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(-45deg, var(--border-glow) 0, var(--border-glow) 1px, transparent 1px, transparent 20px)',
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


