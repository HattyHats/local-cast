// --- DOM Elements ---
const bootSequence = document.getElementById('boot-sequence');
const appWrapper = document.getElementById('app-wrapper');

localforage.config({ name: "LocalCast" });
const CHUNK_SIZE = 256 * 1024;
const incomingTransfers = {};

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
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
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

async function triggerBurnSequence() {
    appWrapper.classList.add('hidden');
    bootSequence.classList.remove('inactive');
    bootSequence.style.display = 'flex';
    
    vfs.root = { id: 'root', name: 'Home', type: 'folder', children: [], parent: null };
    vfs.currentDir = vfs.root;
    saveVFSToDB();
    hostPassword = null;
    iconUnlocked.classList.remove('hidden');
    iconLocked.classList.add('hidden');
    
    connections.forEach(conn => {
        if(conn.open) {
            conn.send({ type: 'SERVER_BURNED' });
        }
    });
    setTimeout(() => {
        connections.forEach(conn => conn.close());
        connections = [];
    }, 200);
    
    splashTitle.setAttribute('data-text', 'FILES BURNED');
    splashTitle.textContent = 'FILES BURNED';
    splashSubtitle.classList.add('hidden');
    splashLoader.classList.add('hidden');
    
    const matrixInterval = initMatrixCanvas();
    
    await new Promise(r => setTimeout(r, 3000));
    
    splashTitle.setAttribute('data-text', 'Local-Cast');
    splashTitle.textContent = 'Local-Cast';
    
    bootSequence.classList.add('inactive');
    appWrapper.classList.remove('hidden');
    setTimeout(() => {
        clearInterval(matrixInterval);
        if (roomCode) {
            window.location.href = window.location.pathname;
        } else {
            bootSequence.style.display = 'none';
            renderHostExplorer();
        }
    }, 800);
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
    
    getTree(dir = this.root) {
        return {
            id: dir.id,
            name: dir.name,
            type: dir.type,
            children: dir.children.map(c => c.type === 'folder' ? this.getTree(c) : { id: c.id, name: c.name, type: 'file', size: c.size, mime: c.mime })
        };
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
                        conn.send({ type: 'TREE', tree: vfs.getTree() });
                    }
                });
            }
        }
    });

    peer = new Peer({ debug: 2 });
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
        conn.isAuthenticated = !hostPassword;
        
        conn.on('data', (data) => {
            if (data.type === 'AUTH_ATTEMPT') {
                if (data.password === hostPassword) {
                    conn.isAuthenticated = true;
                    conn.send({ type: 'AUTH_SUCCESS' });
                    conn.send({ type: 'TREE', tree: vfs.getTree() });
                } else {
                    conn.send({ type: 'AUTH_FAIL' });
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
                incomingTransfers[data.id] = { chunks: [], received: 0, total: data.totalChunks, name: data.name, mime: data.mime, size: data.size };
            } else if (data.type === 'CLIENT_UPLOAD_CHUNK') {
                const transfer = incomingTransfers[data.id];
                if (transfer) {
                    transfer.chunks[data.index] = data.chunk;
                    transfer.received++;
                    if (transfer.received === transfer.total) {
                        const fileBlob = new Blob(transfer.chunks, { type: transfer.mime });
                        const fileObj = new File([fileBlob], transfer.name, { type: transfer.mime });
                        const newId = 'file_' + Math.random().toString(36).substr(2);
                        vfs.currentDir.children.push({ id: newId, name: transfer.name, type: 'file', size: transfer.size, mime: transfer.mime, fileObj: fileObj, parent: vfs.currentDir });
                        saveVFSToDB();
                        renderHostExplorer();
                        broadcastTree();
                        delete incomingTransfers[data.id];
                        conn.send({ type: 'UPLOAD_COMPLETE' });
                    }
                }
            }
        });
        
        conn.on('open', () => {
            if (hostPassword) {
                conn.send({ type: 'AUTH_REQUIRED' });
            } else {
                conn.send({ type: 'TREE', tree: vfs.getTree() });
            }
        });
        
        conn.on('close', () => {
            connections = connections.filter(c => c !== conn);
        });
    });

    setupHostActions();
    renderHostExplorer();
}

function broadcastTree() {
    const tree = vfs.getTree();
    connections.forEach(conn => {
        if (conn.open && conn.isAuthenticated) {
            conn.send({ type: 'TREE', tree: tree });
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
        if (confirm("WARNING: This will instantly destroy the server and wipe all files. Are you sure?")) {
            triggerBurnSequence();
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

    // Global Drop Zone
    document.body.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    document.body.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.items) {
            const files = [];
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                if (e.dataTransfer.items[i].kind === 'file') {
                    files.push(e.dataTransfer.items[i].getAsFile());
                }
            }
            processFiles(files);
        }
    });
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

function moveNode(nodeId, targetFolderId) {
    const node = vfs.findNode(nodeId);
    const target = vfs.findNode(targetFolderId);
    
    if (!node || !target || target.type !== 'folder') return;
    
    // Prevent moving into itself or its descendants
    let curr = target;
    while(curr) {
        if(curr.id === node.id) return;
        curr = curr.parent;
    }
    
    // Remove from old parent
    if (node.parent) {
        node.parent.children = node.parent.children.filter(c => c.id !== node.id);
    }
    
    // Add to new parent
    saveVFSToDB();
    node.parent = target;
    target.children.push(node);
    
    renderHostExplorer();
    broadcastTree();
}

function renderHostExplorer() {
    renderBreadcrumbs(vfs.currentDir, hostBreadcrumbs, (node) => {
        vfs.currentDir = node;
        renderHostExplorer();
    });
    
    hostExplorerGrid.innerHTML = '';
    vfs.currentDir.children.forEach(child => {
        const item = document.createElement('div');
        item.className = `file-item ${child.type}`;
        
        const icon = child.type === 'folder' ? 
            `<svg class="item-icon folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>` : 
            `<svg class="item-icon file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
            
        item.innerHTML = `${icon}<div class="item-name" title="${child.name}">${child.name}</div>`;
        item.draggable = true;
        
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', child.id);
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
                const draggedId = e.dataTransfer.getData('text/plain');
                if (draggedId && draggedId !== child.id) {
                    moveNode(draggedId, child.id);
                }
            });
            
            item.addEventListener('dblclick', () => {
                vfs.currentDir = child;
                renderHostExplorer();
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
            const draggedId = e.dataTransfer.getData('text/plain');
            if (draggedId && draggedId !== node.id) {
                moveNode(draggedId, node.id);
            }
        });
        
        container.appendChild(crumb);
    });
}

// --- CLIENT LOGIC ---
function initClient() {
    updateStatus('CONNECTING...', 'offline');
    
    peer = new Peer({ debug: 2 });
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
                if (btnUploadClient) btnUploadClient.classList.toggle('hidden', !data.enabled);
            } else if (data.type === 'UPLOAD_COMPLETE') {
                clientDownloading.classList.add('hidden');
                alert("Upload complete!");
            } else if (data.type === 'SERVER_BURNED') {
                triggerBurnSequence();
            }
        });
        
        hostConnection.on('close', () => {
            updateStatus('HOST DISCONNECTED', 'offline');
        });
    });
    
    btnSubmitPassword.addEventListener('click', () => {
        const pwd = clientPasswordInput.value;
        if (pwd && hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'AUTH_ATTEMPT', password: pwd });
        }
    });
    
    if(btnUploadClient) btnUploadClient.addEventListener("click", () => clientFileInput.click());
    if(clientFileInput) clientFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file && hostConnection && hostConnection.open) {
            clientDownloading.classList.remove("hidden");
            downloadFilename.textContent = "Uploading " + file.name;
            document.getElementById("client-progress-text").textContent = "Starting...";
            sendFileInChunks(hostConnection, "upload_" + Date.now(), file, file.name, file.type, "CLIENT_UPLOAD_CHUNK");
        }
    });
    
    btnDownloadAllClient.addEventListener('click', () => {
        if (hostConnection && hostConnection.open) {
            clientDownloading.classList.remove('hidden');
            downloadFilename.textContent = 'local-cast-backup.zip (Zipping on Host...)';
            hostConnection.send({ type: 'REQUEST_ZIP_ALL' });
        }
    });
    
    btnClosePreview.addEventListener('click', () => {
        previewModal.classList.add('hidden');
        btnDownloadDirect.classList.add('hidden');
        btnDownloadDirect.style.display = "none";
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
}

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
    
    clientCurrentDir.children.forEach(child => {
        const item = document.createElement('div');
        item.className = `file-item ${child.type}`;
        
        const icon = child.type === 'folder' ? 
            `<svg class="item-icon folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>` : 
            `<svg class="item-icon file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
            
        const sizeText = child.size ? `<div class="item-meta">${(child.size / 1024 / 1024).toFixed(2)} MB</div>` : '';
        item.innerHTML = `${icon}<div class="item-name" title="${child.name}">${child.name}</div>${sizeText}`;
        
        item.addEventListener('click', () => {
            if (child.type === 'folder') {
                clientCurrentDir = child;
                renderClientExplorer();
            } else {
                // Open Preview Modal
                activePreviewFileId = child.id;
                previewFilename.textContent = child.name;
                previewMeta.textContent = `${(child.size / 1024 / 1024).toFixed(2)} MB  •  ${child.mime || 'Unknown Type'}`;
                
                btnDownloadDirect.classList.add('hidden');
                btnDownloadDirect.style.display = "none";
                btnRequestFile.classList.remove("hidden");
                document.getElementById("preview-loader-container").classList.add("hidden");
                document.getElementById("preview-icon").innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 80px; height: 80px; color: var(--neon-blue);"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
                
                previewModal.classList.remove('hidden');
            }
        });
        
        clientExplorerGrid.appendChild(item);
    });
}

function triggerDownload(fileData, name, mime) {
    if (name === 'local-cast-backup.zip') {
        // Handle Download All
        clientDownloading.classList.add('hidden');
        const blob = fileData;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    } else {
        // Handle Single File Preview Download
        const url = URL.createObjectURL(fileData); // fileData is already a Blob from chunks
        const loaderContainer = document.getElementById('preview-loader-container');
        if (loaderContainer) loaderContainer.classList.add('hidden');
        btnDownloadDirect.href = url;
        btnDownloadDirect.download = name;
        btnDownloadDirect.classList.remove('hidden');
        btnDownloadDirect.style.display = 'block';
        
        const previewIconContainer = document.getElementById('preview-icon');
        if (mime.startsWith('image/')) {
            previewIconContainer.innerHTML = `<img src="${url}" style="max-width: 100%; max-height: 250px; border-radius: 8px;">`;
        } else if (mime.startsWith('video/')) {
            previewIconContainer.innerHTML = `<video src="${url}" controls style="max-width: 100%; max-height: 250px; border-radius: 8px;"></video>`;
        } else if (mime.startsWith('audio/')) {
            previewIconContainer.innerHTML = `<audio src="${url}" controls style="width: 100%;"></audio>`;
        }
    }
}

// --- UTILS ---
async function sendFileInChunks(conn, fileId, fileBlob, fileName, fileMime, typeStr) {
    const totalChunks = Math.ceil(fileBlob.size / CHUNK_SIZE);
    conn.send({ type: typeStr + '_START', id: fileId, name: fileName, mime: fileMime, size: fileBlob.size, totalChunks });
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

window.onload = runBootSequence;
