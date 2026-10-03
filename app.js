// --- DOM Elements & Global State ---
let isListView = localStorage.getItem('localcast_listview') === 'true';
let contextTargetId = null;
let hostSearchQuery = '';
let clientSearchQuery = '';

// --- SECURITY & SANITIZATION UTILITIES ---
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeCssColor(color) {
    if (typeof color !== 'string') return 'var(--neon-blue)';
    const trimmed = color.trim();
    if (/^#([0-9a-fA-F]{3,8})$/.test(trimmed) || 
        /^rgba?\([0-9,.\s%]+\)$/.test(trimmed) || 
        /^hsla?\([0-9,.\s%]+\)$/.test(trimmed) || 
        /^var\(--[a-zA-Z0-9_-]+\)$/.test(trimmed) ||
        /^[a-zA-Z]{3,20}$/.test(trimmed)) {
        return trimmed;
    }
    return 'var(--neon-blue)';
}

function sanitizeThumbnailUrl(thumb) {
    if (typeof thumb !== 'string') return null;
    const trimmed = thumb.trim();
    if (trimmed.startsWith('data:image/png;base64,') || 
        trimmed.startsWith('data:image/jpeg;base64,') || 
        trimmed.startsWith('data:image/webp;base64,') ||
        trimmed.startsWith('data:image/gif;base64,')) {
        return trimmed;
    }
    return null;
}

function sanitizeFilename(name) {
    if (typeof name !== 'string') return 'file';
    let clean = name.replace(/[\/\\]/g, '_').replace(/[\x00-\x1F\x7F<>:"|?*]/g, '').trim();
    if (clean === '.' || clean === '..' || clean === '') clean = 'file_' + Date.now();
    return clean.substring(0, 255);
}

// --- CYBER DIALOG SYSTEM (Non-blocking replacements for alert, confirm, prompt) ---
const cyberDialogModal = document.getElementById('cyber-dialog-modal');
const cyberDialogTitle = document.getElementById('cyber-dialog-title');
const cyberDialogMessage = document.getElementById('cyber-dialog-message');
const cyberDialogInputContainer = document.getElementById('cyber-dialog-input-container');
const cyberDialogInput = document.getElementById('cyber-dialog-input');
const btnCyberConfirm = document.getElementById('btn-cyber-confirm');
const btnCyberCancel = document.getElementById('btn-cyber-cancel');
const cyberDialogIcon = document.getElementById('cyber-dialog-icon');

function playCyberChime(freq = 880, type = 'sine', duration = 0.25) {
    try {
        if (localStorage.getItem('localcast_sound_muted') === 'true') return;
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + duration);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function cyberAlert(message, title = 'SECURITY NOTICE', isDanger = false) {
    return new Promise((resolve) => {
        if (!cyberDialogModal) {
            showToast(message);
            return resolve();
        }
        cyberDialogTitle.textContent = title;
        cyberDialogMessage.textContent = message;
        if (cyberDialogInputContainer) cyberDialogInputContainer.classList.add('hidden');
        if (btnCyberCancel) btnCyberCancel.classList.add('hidden');
        if (btnCyberConfirm) {
            btnCyberConfirm.textContent = 'ACKNOWLEDGE';
            if (isDanger) {
                btnCyberConfirm.style.borderColor = 'var(--neon-red)';
                btnCyberConfirm.style.color = 'var(--neon-red)';
            } else {
                btnCyberConfirm.style.borderColor = 'var(--neon-blue)';
                btnCyberConfirm.style.color = 'var(--neon-blue)';
            }
        }
        if (cyberDialogIcon) {
            if (isDanger) cyberDialogIcon.classList.add('danger');
            else cyberDialogIcon.classList.remove('danger');
        }
        cyberDialogModal.classList.remove('hidden');
        playCyberChime(440, 'triangle', 0.2);

        const onConfirm = () => {
            btnCyberConfirm.removeEventListener('click', onConfirm);
            cyberDialogModal.classList.add('hidden');
            setTimeout(resolve, 80);
        };
        if (btnCyberConfirm) btnCyberConfirm.addEventListener('click', onConfirm, { once: true });
        else setTimeout(resolve, 80);
    });
}

function cyberConfirm(message, title = 'SECURITY CONFIRMATION', isDanger = false) {
    return new Promise((resolve) => {
        if (!cyberDialogModal) {
            return resolve(window.confirm(message));
        }
        cyberDialogTitle.textContent = title;
        cyberDialogMessage.textContent = message;
        if (cyberDialogInputContainer) cyberDialogInputContainer.classList.add('hidden');
        if (btnCyberCancel) {
            btnCyberCancel.classList.remove('hidden');
            btnCyberCancel.textContent = 'CANCEL';
        }
        if (btnCyberConfirm) {
            btnCyberConfirm.textContent = 'PROCEED';
            if (isDanger) {
                btnCyberConfirm.style.borderColor = 'var(--neon-red)';
                btnCyberConfirm.style.color = 'var(--neon-red)';
            } else {
                btnCyberConfirm.style.borderColor = 'var(--neon-blue)';
                btnCyberConfirm.style.color = 'var(--neon-blue)';
            }
        }
        if (cyberDialogIcon) {
            if (isDanger) cyberDialogIcon.classList.add('danger');
            else cyberDialogIcon.classList.remove('danger');
        }
        cyberDialogModal.classList.remove('hidden');
        playCyberChime(520, 'sine', 0.15);

        const cleanup = (result) => {
            if (btnCyberConfirm) btnCyberConfirm.removeEventListener('click', onConfirm);
            if (btnCyberCancel) btnCyberCancel.removeEventListener('click', onCancel);
            cyberDialogModal.classList.add('hidden');
            setTimeout(() => resolve(result), 80);
        };
        const onConfirm = () => cleanup(true);
        const onCancel = () => cleanup(false);

        if (btnCyberConfirm) btnCyberConfirm.addEventListener('click', onConfirm);
        if (btnCyberCancel) btnCyberCancel.addEventListener('click', onCancel);
    });
}

function cyberPrompt(message, defaultValue = '', title = 'INPUT REQUIRED') {
    return new Promise((resolve) => {
        if (!cyberDialogModal) {
            return resolve(window.prompt(message, defaultValue));
        }
        cyberDialogTitle.textContent = title;
        cyberDialogMessage.textContent = message;
        if (cyberDialogInputContainer) cyberDialogInputContainer.classList.remove('hidden');
        if (cyberDialogInput) cyberDialogInput.value = defaultValue;
        if (btnCyberCancel) {
            btnCyberCancel.classList.remove('hidden');
            btnCyberCancel.textContent = 'CANCEL';
        }
        if (btnCyberConfirm) {
            btnCyberConfirm.textContent = 'SUBMIT';
            btnCyberConfirm.style.borderColor = 'var(--neon-blue)';
            btnCyberConfirm.style.color = 'var(--neon-blue)';
        }
        if (cyberDialogIcon) cyberDialogIcon.classList.remove('danger');
        cyberDialogModal.classList.remove('hidden');
        if (cyberDialogInput) {
            cyberDialogInput.value = defaultValue;
            setTimeout(() => cyberDialogInput.focus(), 50);
        }
        playCyberChime(600, 'sine', 0.15);

        const cleanup = (val) => {
            if (btnCyberConfirm) btnCyberConfirm.removeEventListener('click', onConfirm);
            if (btnCyberCancel) btnCyberCancel.removeEventListener('click', onCancel);
            if (cyberDialogInput) cyberDialogInput.removeEventListener('keydown', onKey);
            cyberDialogModal.classList.add('hidden');
            setTimeout(() => resolve(val), 80);
        };
        const onConfirm = () => cleanup(cyberDialogInput ? cyberDialogInput.value : '');
        const onCancel = () => cleanup(null);
        const onKey = (e) => {
            if (e.key === 'Enter') cleanup(cyberDialogInput ? cyberDialogInput.value : '');
            if (e.key === 'Escape') cleanup(null);
        };

        if (btnCyberConfirm) btnCyberConfirm.addEventListener('click', onConfirm);
        if (btnCyberCancel) btnCyberCancel.addEventListener('click', onCancel);
        if (cyberDialogInput) cyberDialogInput.addEventListener('keydown', onKey);
    });
}

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

if (btnViewToggleHost) {
    btnViewToggleHost.addEventListener('click', () => {
        isListView = !isListView;
        localStorage.setItem('localcast_listview', isListView);
        renderHostExplorer();
    });
}

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

if (btnViewToggleClient) {
    btnViewToggleClient.addEventListener('click', () => {
        isListView = !isListView;
        localStorage.setItem('localcast_listview', isListView);
        renderClientExplorer();
    });
}

function sortNodes(nodes, criteria) {
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
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    // Play a subtle ding sound
    playCyberChime(880, 'sine', 0.15);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function notifyFileAdded(filename) {
    showToast(`New file: ${filename}`);
    if (isHost) {
        connections.forEach(c => {
            if (c.open && c.isAuthenticated) c.send({ type: 'FILE_ADDED_TOAST', filename });
        });
    }
}

const bootSequence = document.getElementById('boot-sequence');
const appWrapper = document.getElementById('app-wrapper');

try {
    if (typeof localforage !== 'undefined') {
        localforage.config({ name: "LocalCast" });
    }
} catch (e) {
    console.warn("LocalForage config failed:", e);
}
const CHUNK_SIZE = 32 * 1024; // 32 KB for high-throughput WebRTC data delivery
const incomingTransfers = {};
let selectedNodes = new Set();
let clientSelectedNodes = new Set();
let isSelectModeHost = false;
let isSelectModeClient = false;
let lastSelectedHostIndex = -1;
let lastSelectedClientIndex = -1;

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

const btnStartCall = document.getElementById('btn-start-call');
const btnEndCall = document.getElementById('btn-end-call');
const activeCallBanner = document.getElementById('active-call-banner');
const commLinkAudio = document.getElementById('comm-link-audio');
let currentCall = null;
let localMediaStream = null;

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
let activePreviewFileId = null;

// Host Action Elements
const shareModal = document.getElementById('share-modal');
const btnShareServer = document.getElementById('btn-share-server');
const btnCloseShare = document.getElementById('btn-close-share');
const btnDoneShare = document.getElementById('btn-done-share');
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
const btnVaultBiometric = document.getElementById('btn-vault-biometric');
const vaultBiometricLabel = document.getElementById('vault-biometric-label');

let unlockedVaults = {}; // mapping: folderId -> password
let activeNuclearVotes = {}; // mapping: folderId -> Set of peerIds
let nuclearVoteTimers = {}; // mapping: folderId_peerId -> timeoutId

// --- BIOMETRIC / WEBAUTHN UNLOCK & FOLDER SECURITY LOGIC ---
const vaultPasswordModalTitle = document.getElementById('vault-password-modal-title');
const btnFolderBiometric = document.getElementById('btn-folder-biometric');
const folderBiometricLabel = document.getElementById('folder-biometric-label');
const btnCloseFolderPasswordTop = document.getElementById('btn-close-folder-password-top');

const setFolderPasswordModal = document.getElementById('set-folder-password-modal');
const setFolderPasswordTitle = document.getElementById('set-folder-password-title');
const setFolderPasswordDesc = document.getElementById('set-folder-password-desc');
const setFolderPasswordInput = document.getElementById('set-folder-password-input');
const btnConfirmSetFolderPassword = document.getElementById('btn-confirm-set-folder-password');
const btnSetFolderBiometric = document.getElementById('btn-set-folder-biometric');
const setFolderBiometricLabel = document.getElementById('set-folder-biometric-label');
const setFolderRemoveContainer = document.getElementById('set-folder-remove-container');
const btnRemoveFolderPassword = document.getElementById('btn-remove-folder-password');
const btnCloseSetFolderPassword = document.getElementById('btn-close-set-folder-password');
let targetLockFolderNode = null;

function isWebAuthnSupported() {
    return !!(window.isSecureContext && window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);
}

function updateVaultBiometricUI(isSetupMode = false) {
    if (!btnVaultBiometric || !vaultBiometricLabel) return;
    btnVaultBiometric.style.display = 'flex';
    const hasEnrollment = !!localStorage.getItem('localcast_vault_biometric');
    if (!isWebAuthnSupported()) {
        vaultBiometricLabel.textContent = "TOUCH ID / FACE ID (SECURE CONTEXT ONLY)";
        btnVaultBiometric.style.borderColor = "var(--border-color)";
        btnVaultBiometric.style.color = "var(--text-muted)";
    } else if (hasEnrollment) {
        vaultBiometricLabel.textContent = isSetupMode ? "USE SAVED BIOMETRICS" : "TOUCH ID / FACE ID UNLOCK";
        btnVaultBiometric.style.borderColor = "var(--neon-green)";
        btnVaultBiometric.style.color = "var(--neon-green)";
    } else {
        vaultBiometricLabel.textContent = "LINK TOUCH ID / FACE ID";
        btnVaultBiometric.style.borderColor = "var(--neon-blue)";
        btnVaultBiometric.style.color = "var(--neon-blue)";
    }
}

function updateFolderBiometricUI() {
    if (!btnFolderBiometric || !folderBiometricLabel) return;
    btnFolderBiometric.style.display = 'flex';
    const hasEnrollment = !!localStorage.getItem('localcast_vault_biometric');
    if (!isWebAuthnSupported()) {
        folderBiometricLabel.textContent = "TOUCH ID / FACE ID (SECURE CONTEXT ONLY)";
        btnFolderBiometric.style.borderColor = "var(--border-color)";
        btnFolderBiometric.style.color = "var(--text-muted)";
    } else if (hasEnrollment) {
        folderBiometricLabel.textContent = "TOUCH ID / FACE ID UNLOCK";
        btnFolderBiometric.style.borderColor = "var(--neon-green)";
        btnFolderBiometric.style.color = "var(--neon-green)";
    } else {
        folderBiometricLabel.textContent = "LINK TOUCH ID / FACE ID";
        btnFolderBiometric.style.borderColor = "var(--neon-blue)";
        btnFolderBiometric.style.color = "var(--neon-blue)";
    }
}

function updateSetFolderBiometricUI() {
    if (!btnSetFolderBiometric || !setFolderBiometricLabel) return;
    btnSetFolderBiometric.style.display = 'flex';
    const hasEnrollment = !!localStorage.getItem('localcast_vault_biometric');
    if (!isWebAuthnSupported()) {
        setFolderBiometricLabel.textContent = "TOUCH ID / FACE ID (SECURE CONTEXT ONLY)";
        btnSetFolderBiometric.style.borderColor = "var(--border-color)";
        btnSetFolderBiometric.style.color = "var(--text-muted)";
    } else if (hasEnrollment) {
        setFolderBiometricLabel.textContent = "USE SAVED BIOMETRICS";
        btnSetFolderBiometric.style.borderColor = "var(--neon-green)";
        btnSetFolderBiometric.style.color = "var(--neon-green)";
    } else {
        setFolderBiometricLabel.textContent = "LINK TOUCH ID / FACE ID";
        btnSetFolderBiometric.style.borderColor = "var(--neon-blue)";
        btnSetFolderBiometric.style.color = "var(--neon-blue)";
    }
}

async function enrollVaultBiometric(password) {
    if (!isWebAuthnSupported()) {
        await cyberAlert("Biometric registration (Touch ID / Face ID) requires accessing LocalCast via localhost or HTTPS. In plain HTTP, browsers restrict biometric APIs.", "SECURITY REQUIREMENT");
        return false;
    }
    try {
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const userId = crypto.getRandomValues(new Uint8Array(16));
        const credential = await navigator.credentials.create({
            publicKey: {
                challenge,
                rp: { name: "LocalCast Mesh Security", id: window.location.hostname || "localhost" },
                user: { id: userId, name: "localcast_user", displayName: "LocalCast Master" },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "preferred"
                },
                timeout: 60000
            }
        });
        if (credential) {
            const enc = new TextEncoder();
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const rawKey = await crypto.subtle.digest('SHA-256', enc.encode(credential.id));
            const cryptoKey = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);
            const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc.encode(password));
            
            const record = {
                credId: credential.id,
                iv: Array.from(iv),
                salt: Array.from(salt),
                cipher: Array.from(new Uint8Array(encrypted))
            };
            localStorage.setItem('localcast_vault_biometric', JSON.stringify(record));
            updateVaultBiometricUI();
            updateFolderBiometricUI();
            updateSetFolderBiometricUI();
            return true;
        }
    } catch(err) {
        console.warn("Biometric enrollment error:", err);
    }
    return false;
}

async function authenticateVaultBiometric() {
    if (!isWebAuthnSupported()) {
        await cyberAlert("Biometric unlock requires accessing LocalCast securely via localhost or HTTPS.", "SECURITY REQUIREMENT");
        return null;
    }
    const raw = localStorage.getItem('localcast_vault_biometric');
    if (!raw) return null;
    let record;
    try {
        record = JSON.parse(raw);
    } catch(e) {
        return null;
    }
    try {
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge,
                userVerification: "preferred",
                timeout: 60000
            }
        });
        if (assertion) {
            const enc = new TextEncoder();
            const rawKey = await crypto.subtle.digest('SHA-256', enc.encode(record.credId));
            const cryptoKey = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['decrypt']);
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(record.iv) },
                cryptoKey,
                new Uint8Array(record.cipher)
            );
            return new TextDecoder().decode(decrypted);
        }
    } catch(err) {
        console.warn("Biometric authentication error:", err);
        showToast("Biometric verification cancelled or not recognized.", "warning");
    }
    return null;
}

if (btnVaultBiometric) {
    btnVaultBiometric.addEventListener('click', async () => {
        if (!isWebAuthnSupported()) {
            await cyberAlert("Biometric authentication (Touch ID / Face ID) is supported when LocalCast is accessed via localhost or HTTPS. On plain HTTP over LAN, please enter the password directly.", "BIOMETRIC NOT AVAILABLE ON HTTP");
            return;
        }
        const hasEnrollment = !!localStorage.getItem('localcast_vault_biometric');
        if (hasEnrollment) {
            showToast("Verifying Touch ID / Face ID...", "info");
            const pass = await authenticateVaultBiometric();
            if (pass) {
                vaultPasswordInput.value = pass;
                btnConfirmVaultPassword.click();
                showToast("🔓 Vault unlocked via Biometrics!", "success");
            }
        } else {
            const pass = vaultPasswordInput.value.trim();
            if (!pass) {
                await cyberAlert("Enter your vault password once in the field above, then tap this button to link Touch ID / Face ID for 1-tap unlocking in the future!", "BIOMETRIC ENROLLMENT");
                return;
            }
            showToast("Linking Touch ID / Face ID...", "info");
            const ok = await enrollVaultBiometric(pass);
            if (ok) {
                showToast("🔐 Touch ID / Face ID linked! Unlocking vault...", "success");
                btnConfirmVaultPassword.click();
            } else {
                showToast("Biometric enrollment cancelled.", "warning");
            }
        }
    });
}

if (btnFolderBiometric) {
    btnFolderBiometric.addEventListener('click', async () => {
        if (!isWebAuthnSupported()) {
            await cyberAlert("Biometric authentication requires localhost or HTTPS. On plain HTTP over LAN, please enter the folder password directly.", "BIOMETRIC NOT AVAILABLE ON HTTP");
            return;
        }
        const hasEnrollment = !!localStorage.getItem('localcast_vault_biometric');
        if (hasEnrollment) {
            showToast("Verifying Touch ID / Face ID...", "info");
            const pass = await authenticateVaultBiometric();
            if (pass) {
                folderPasswordInput.value = pass;
                btnSubmitFolderPassword.click();
                showToast("🔓 Folder unlocked via Biometrics!", "success");
            }
        } else {
            const pass = folderPasswordInput.value.trim();
            if (!pass) {
                await cyberAlert("Enter the folder password once in the field above, then tap this button to link Touch ID / Face ID for 1-tap unlocking in the future!", "BIOMETRIC ENROLLMENT");
                return;
            }
            showToast("Linking Touch ID / Face ID...", "info");
            const ok = await enrollVaultBiometric(pass);
            if (ok) {
                showToast("🔐 Touch ID / Face ID linked! Unlocking folder...", "success");
                btnSubmitFolderPassword.click();
            } else {
                showToast("Biometric enrollment cancelled.", "warning");
            }
        }
    });
}

if (btnCloseFolderPasswordTop) {
    btnCloseFolderPasswordTop.addEventListener('click', () => {
        if (folderPasswordModal) folderPasswordModal.classList.add('hidden');
    });
}

if (btnSetFolderBiometric) {
    btnSetFolderBiometric.addEventListener('click', async () => {
        if (!isWebAuthnSupported()) {
            await cyberAlert("Biometric authentication requires localhost or HTTPS. On plain HTTP over LAN, please type the password directly.", "BIOMETRIC NOT AVAILABLE ON HTTP");
            return;
        }
        const hasEnrollment = !!localStorage.getItem('localcast_vault_biometric');
        if (hasEnrollment) {
            showToast("Verifying Touch ID / Face ID...", "info");
            const pass = await authenticateVaultBiometric();
            if (pass) {
                setFolderPasswordInput.value = pass;
                showToast("🔑 Password filled from Biometrics!", "success");
            }
        } else {
            const pass = setFolderPasswordInput.value.trim();
            if (!pass) {
                await cyberAlert("Enter a password for this folder in the field above, then tap this button to link Touch ID / Face ID!", "BIOMETRIC ENROLLMENT");
                return;
            }
            showToast("Linking Touch ID / Face ID...", "info");
            const ok = await enrollVaultBiometric(pass);
            if (ok) {
                showToast("🔐 Touch ID / Face ID linked for folder protection!", "success");
            } else {
                showToast("Biometric enrollment cancelled.", "warning");
            }
        }
    });
}

if (btnConfirmSetFolderPassword) {
    btnConfirmSetFolderPassword.addEventListener('click', () => {
        if (!targetLockFolderNode) return;
        const pass = setFolderPasswordInput.value.trim();
        if (!pass && !targetLockFolderNode.password) {
            cyberAlert("Please enter a password to lock this folder.", "PASSWORD REQUIRED", true);
            return;
        }
        if (pass) {
            targetLockFolderNode.password = pass;
            showToast(`🔒 Folder "${targetLockFolderNode.name}" locked with password`, "success");
        }
        if (setFolderPasswordModal) setFolderPasswordModal.classList.add('hidden');
        saveVFSToDB();
        renderHostExplorer();
        broadcastTree();
    });
}

if (btnRemoveFolderPassword) {
    btnRemoveFolderPassword.addEventListener('click', async () => {
        if (!targetLockFolderNode) return;
        if (await cyberConfirm(`Remove password protection from "${targetLockFolderNode.name}"?`, "UNLOCK FOLDER")) {
            delete targetLockFolderNode.password;
            delete unlockedVaults[targetLockFolderNode.id];
            connections.forEach(c => {
                if (c.unlockedFolders) c.unlockedFolders.delete(targetLockFolderNode.id);
            });
            if (setFolderPasswordModal) setFolderPasswordModal.classList.add('hidden');
            showToast("Folder password removed", "info");
            saveVFSToDB();
            renderHostExplorer();
            broadcastTree();
        }
    });
}

if (btnCloseSetFolderPassword) {
    btnCloseSetFolderPassword.addEventListener('click', () => {
        if (setFolderPasswordModal) setFolderPasswordModal.classList.add('hidden');
    });
}

if (vaultPasswordModal) {
    const obs = new MutationObserver(() => {
        if (!vaultPasswordModal.classList.contains('hidden')) {
            updateVaultBiometricUI();
        }
    });
    obs.observe(vaultPasswordModal, { attributes: true, attributeFilter: ['class'] });
}

if (folderPasswordModal) {
    const fObs = new MutationObserver(() => {
        if (!folderPasswordModal.classList.contains('hidden')) {
            updateFolderBiometricUI();
        }
    });
    fObs.observe(folderPasswordModal, { attributes: true, attributeFilter: ['class'] });
}
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

async function encryptFile(buffer, password, customSalt = null, customIv = null) {
    const salt = customSalt || crypto.getRandomValues(new Uint8Array(16));
    const iv = customIv || crypto.getRandomValues(new Uint8Array(12));
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
        await cyberAlert("Cannot decrypt file: Vault is locked!", "VAULT LOCKED", true);
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
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
});
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
function createTransferItem(id, name, type, extra = {}) { // type: 'upload' or 'download'
    if (transferDashboard) {
        transferDashboard.classList.remove('hidden');
    }
    const el = document.createElement('div');
    const isSwarm = extra.isSwarm || (typeof swarmConnections !== 'undefined' && swarmConnections.length > 0) || type === 'download';
    el.className = 'transfer-item ' + type + (isSwarm ? ' swarm' : '');
    const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '');
    const safeName = escapeHtml(name);
    const totalChunks = extra.totalChunks || 24;
    const numCells = Math.min(32, Math.max(12, totalChunks));
    let matrixCellsHtml = '';
    if (isSwarm) {
        for (let i = 0; i < numCells; i++) {
            matrixCellsHtml += `<div class="swarm-chunk-cell" id="cell-${safeId}-${i}"></div>`;
        }
    }
    
    el.innerHTML = `
        <div class="transfer-header">
            <div class="transfer-title-group">
                <span class="transfer-filename" title="${safeName}">${safeName}</span>
                ${isSwarm ? `
                <span class="swarm-badge" id="swarm-badge-${safeId}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                    <span>SWARM</span>
                </span>` : ''}
            </div>
            <span class="transfer-speed" id="speed-${safeId}">0 MB/s</span>
        </div>
        <div class="transfer-progress-bg">
            <div class="transfer-progress-fill" id="prog-${safeId}"></div>
        </div>
        ${isSwarm ? `
        <div class="swarm-matrix-track" id="matrix-${safeId}" title="Swarm Chunk Bitfield Matrix">
            ${matrixCellsHtml}
        </div>
        <div class="swarm-telemetry-row">
            <span class="swarm-stat-sources" id="sources-${safeId}">
                ⚡ ${typeof swarmConnections !== 'undefined' && swarmConnections.length > 0 ? (swarmConnections.length + 1) + ' Sources (Host + ' + swarmConnections.length + ' Peers)' : 'Initial Seeder (Host)'}
            </span>
            <span class="swarm-stat-eta" id="eta-${safeId}">Calculating ETA...</span>
        </div>` : ''}
    `;
    if (transferList) {
        transferList.prepend(el); // newest on top
    }
    activeTransfers[id] = {
        el,
        bytes: 0,
        lastBytes: 0,
        lastTime: Date.now(),
        speedEl: el.querySelector('#speed-' + safeId),
        progEl: el.querySelector('#prog-' + safeId),
        sourcesEl: el.querySelector('#sources-' + safeId),
        etaEl: el.querySelector('#eta-' + safeId),
        matrixTrack: el.querySelector('#matrix-' + safeId),
        totalChunks: totalChunks,
        numCells: numCells,
        totalSize: extra.totalSize || 1
    };
}
function updateTransferProgress(id, newBytesSent, totalSize, chunkIndex = null) {
    const t = activeTransfers[id];
    if (!t) return;
    t.bytes += newBytesSent;
    t.totalSize = totalSize;
    
    const now = Date.now();
    const dt = now - t.lastTime;
    if (dt >= 400) { // Update speed & telemetry every 400ms
        const dBytes = t.bytes - t.lastBytes;
        const speedBps = dBytes / (dt / 1000);
        const speedMBps = speedBps / (1024 * 1024);
        if (t.speedEl) t.speedEl.textContent = speedMBps.toFixed(2) + ' MB/s';
        
        if (t.etaEl && speedBps > 0) {
            const remainingBytes = Math.max(0, totalSize - t.bytes);
            const etaSec = Math.ceil(remainingBytes / speedBps);
            t.etaEl.textContent = etaSec > 60 ? `ETA: ${Math.floor(etaSec / 60)}m ${etaSec % 60}s` : `ETA: ${etaSec}s`;
        }
        
        if (t.sourcesEl && typeof swarmConnections !== 'undefined') {
            const activeCount = swarmConnections.filter(c => c && c.open).length;
            t.sourcesEl.textContent = activeCount > 0 
                ? `⚡ ${activeCount + 1} Sources (Host + ${activeCount} Peers)` 
                : `⚡ 1 Source (Host)`;
        }

        t.lastBytes = t.bytes;
        t.lastTime = now;
    }
    const percent = Math.min(100, (t.bytes / totalSize) * 100);
    if (t.progEl) t.progEl.style.width = percent + '%';

    // Illuminate chunk in visual bitfield matrix
    if (t.matrixTrack && chunkIndex !== null && t.totalChunks) {
        const cellIdx = Math.floor((chunkIndex / t.totalChunks) * t.numCells);
        const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '');
        const cell = t.matrixTrack.querySelector(`#cell-${safeId}-${cellIdx}`);
        if (cell) {
            cell.classList.remove('inflight');
            cell.classList.add('completed');
        }
    }
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
function failTransfer(id, reason = 'FAILED') {
    const t = activeTransfers[id];
    if (t) {
        t.progEl.style.width = '100%';
        t.progEl.style.background = 'var(--neon-red, #ff0055)';
        t.speedEl.textContent = reason;
        t.speedEl.style.color = 'var(--neon-red, #ff0055)';
        setTimeout(() => {
            if (t.el.parentNode) t.el.parentNode.removeChild(t.el);
            delete activeTransfers[id];
            if (Object.keys(activeTransfers).length === 0 && transferDashboard) {
                transferDashboard.classList.add('hidden');
            }
        }, 4000);
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

let burnTimerInterval = null;
let isBurnSequenceActive = false;
let isServerBurned = false;

function playBurnAlarm() {
    try {
        if (localStorage.getItem('localcast_sound_muted') === 'true') return;
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {}
}

function renderBurnedScreen() {
    if (document.getElementById('burned-screen-wrapper')) return;
    document.body.style.overflow = 'hidden';
    document.body.innerHTML = `
    <div id="burned-screen-wrapper" class="burned-screen-wrapper">
        <div class="burned-screen-scanlines"></div>
        <div style="position: relative; z-index: 2; max-width: 620px; display: flex; flex-direction: column; align-items: center;">
            <div class="burned-icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="#ff0055" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 46px; height: 46px; filter: drop-shadow(0 0 8px #ff0055);">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"></path>
                </svg>
            </div>
            <div class="burned-badge">
                ⚠️ EMERGENCY BURN SEQUENCE EXECUTED
            </div>
            <h1 class="burned-title">
                SERVER BURNED
            </h1>
            <p class="burned-desc">
                The Host has executed an Emergency Burn Notice. All active peer-to-peer channels have been severed, and all shared files, encryption keys, and session data have been permanently wiped from memory.
            </p>
            <div class="burned-stats-bar">
                <div>STATUS: <span style="color: #ff0055; font-weight: bold;">DESTROYED</span></div>
                <div>•</div>
                <div>DATA: <span style="color: #ff0055; font-weight: bold;">PURGED</span></div>
                <div>•</div>
                <div>CHANNELS: <span style="color: #ff0055; font-weight: bold;">CLOSED</span></div>
            </div>
            <button id="btn-burned-reload" class="burned-action-btn" onclick="window.location.href = window.location.origin + window.location.pathname;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                ENTER NEW SESSION
            </button>
        </div>
    </div>`;
}

function startBurnCountdown(seconds) {
    if (burnTimerInterval) clearInterval(burnTimerInterval);
    isBurnSequenceActive = true;
    if (burnOverlay) burnOverlay.style.display = 'flex';
    
    let left = seconds;
    if (burnCountdown) burnCountdown.innerText = left.toFixed(2);
    
    const start = Date.now();
    const target = start + (seconds * 1000);
    
    burnTimerInterval = setInterval(async () => {
        const now = Date.now();
        let remaining = (target - now) / 1000;
        if (remaining <= 0) {
            remaining = 0;
            clearInterval(burnTimerInterval);
            burnTimerInterval = null;
            if (burnOverlay) burnOverlay.style.display = 'none';
            if (isHost && Array.isArray(connections)) {
                connections.forEach(c => {
                    try { c.send({ type: 'SERVER_BURNED' }); } catch (e) {}
                });
                await new Promise(r => setTimeout(r, 250));
            }
            triggerBurnSequence();
        }
        if (burnCountdown) burnCountdown.innerText = remaining.toFixed(2);
    }, 10);
}

function triggerBurnSequence() {
    isServerBurned = true;
    isBurnSequenceActive = false;
    if (burnTimerInterval) {
        clearInterval(burnTimerInterval);
        burnTimerInterval = null;
    }
    if (burnOverlay) burnOverlay.style.display = 'none';

    playBurnAlarm();

    try {
        if (window.localMediaStream) {
            window.localMediaStream.getTracks().forEach(t => t.stop());
            window.localMediaStream = null;
        }
        if (window.commLinkStream) {
            window.commLinkStream.getTracks().forEach(t => t.stop());
            window.commLinkStream = null;
        }
        const commAudio = document.getElementById('comm-link-audio');
        if (commAudio) { commAudio.pause(); commAudio.srcObject = null; }
    } catch (e) {}

    try {
        vfs = new VirtualFileSystem();
    } catch (e) {}

    try {
        if (typeof localforage !== 'undefined') localforage.clear();
    } catch (e) {}

    try {
        if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
    } catch (e) {}

    try {
        if (Array.isArray(connections)) {
            connections.forEach(conn => { try { conn.close(); } catch(err) {} });
            connections = [];
        }
        if (typeof hostConnection !== 'undefined' && hostConnection) {
            try { hostConnection.close(); } catch(err) {}
            hostConnection = null;
        }
        if (typeof swarmConnections !== 'undefined' && Array.isArray(swarmConnections)) {
            swarmConnections.forEach(c => { try { c.close(); } catch(err) {} });
            swarmConnections = [];
        }
        if (typeof peer !== 'undefined' && peer) {
            try { peer.destroy(); } catch(err) {}
        }
    } catch (e) {}

    renderBurnedScreen();
}



// --- VIRTUAL FILE SYSTEM ---
let saveVFSTimer = null;

async function doSaveVFSToDB() {
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
    try {
        await localforage.setItem("vfs_root", stripParents(vfs.root));
    } catch(e) {
        console.warn("doSaveVFSToDB error:", e);
    }
}

async function saveVFSToDB(immediate = false) {
    if (!isHost) return;
    if (immediate) {
        if (saveVFSTimer) { clearTimeout(saveVFSTimer); saveVFSTimer = null; }
        return await doSaveVFSToDB();
    }
    return new Promise(resolve => {
        if (saveVFSTimer) clearTimeout(saveVFSTimer);
        saveVFSTimer = setTimeout(async () => {
            saveVFSTimer = null;
            await doSaveVFSToDB();
            resolve();
        }, 250);
    });
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
                await cyberAlert("Native Vault is not supported in this browser. Please use Chrome, Edge, or Brave.", "BROWSER COMPATIBILITY");
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
            const isUnlocked = unlockedSet && unlockedSet.has(node.id);
            const n = { 
                id: node.id, type: node.type, name: node.name, size: node.size, mime: node.mime, thumbnail: node.thumbnail,
                isLocked: !!node.password, isVault: !!node.isVault, isUnlocked, isHidden: node.isHidden,
                isEncrypted: node.isEncrypted, salt: node.salt, iv: node.iv,
                isBurn: !!node.isBurn,
                isNuclear: !!node.isNuclear,
                nuclearVotesRequired: node.nuclearVotesRequired
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
let myPermissions = { upload: false, chat: true, delete: false, edit: false, whiteboard: false, scratchpad: false };

function isNodeAuthorizedForConnection(node, conn) {
    if (!node) return false;
    if (isHost && !conn) return true; // Host local access
    if (!conn || !conn.isAuthenticated) return false;
    
    // Walk up the parent hierarchy
    let current = node;
    while (current && current.id !== 'root') {
        if (current.password || current.isVault) {
            if (!conn.unlockedFolders || !conn.unlockedFolders.has(current.id)) {
                return false;
            }
        }
        if (current.isNative || current.isNativeRoot) {
            if (!conn.unlockedFolders || !conn.unlockedFolders.has(current.id)) {
                return false;
            }
        }
        current = current.parent;
    }
    return true;
}

// State
let isHost = true;
let peer = null;
let connections = [];
let swarmConnections = [];
let hostConnection = null;
let hostPassword = null;

// Subsystems State: E2EE, Resumable Cache, Swarm & Streaming
let myEcdhKeyPair = null;
const peerEcdhSharedKeys = new Map(); // peerId -> CryptoKey (AES-GCM-256)
const activeSwarmDownloads = new Map(); // fileId -> SwarmDownloader
const swarmBitfields = new Map(); // `${peerId}:${fileId}` -> Set<number>
const localFileBitfields = new Map(); // fileId -> Set<number>
let activeMediaStreamDownloader = null;

function generatePeerId(prefix = 'lc_') {
    try {
        const bytes = new Uint8Array(10);
        crypto.getRandomValues(bytes);
        return prefix + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    } catch(e) {
        return prefix + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    }
}

let setupHostPeer = () => {};
let setupClientPeer = () => {};

function renderHostQR(url, attempts = 0) {
    if (!qrcodeEl) return;
    if (typeof QRCode !== 'undefined') {
        try {
            qrcodeEl.innerHTML = '';
            new QRCode(qrcodeEl, { 
                text: url, 
                width: 130, 
                height: 130, 
                colorDark : "#00f0ff", 
                colorLight : "#0a0b10", 
                correctLevel : QRCode.CorrectLevel.L 
            });
            if (qrPlaceholder) qrPlaceholder.classList.add('hidden');
        } catch(err) {
            console.error("QR Render Error:", err);
        }
    } else if (attempts < 20) {
        setTimeout(() => renderHostQR(url, attempts + 1), 200);
    }
}

function getPeerConfig() {
    return {
        debug: 1,
        host: '0.peerjs.com',
        port: 443,
        path: '/',
        secure: true,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ]
        }
    };
}

const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('room');
const magicPeerId = urlParams.get('peer');
const magicFileId = urlParams.get('file');

if (roomCode) {
    isHost = false;
}

function initApp() {
    try {
        if (magicPeerId && magicFileId) {
            initMagicPeer(magicPeerId, magicFileId);
        } else if (isHost) {
            hostView.classList.remove('hidden');
            initHost().catch(err => {
                console.error("Host init error:", err);
                setupHostPeer();
            });
        } else {
            clientView.classList.remove('hidden');
            initClient().catch(err => {
                console.error("Client init error:", err);
                setupClientPeer();
            });
        }
    } catch(err) {
        console.error("initApp fatal error:", err);
        try {
            if (isHost) setupHostPeer(); else setupClientPeer();
        } catch(e) {}
    }
}

async function initMagicPeer(targetPeerId, targetFileId) {
    document.getElementById('magic-link-modal').classList.remove('hidden');
    const magicStatus = document.getElementById('magic-status');
    const magicProgressBar = document.getElementById('magic-progress-fill');
    const magicProgressText = document.getElementById('magic-progress-text');
    const magicFilename = document.getElementById('magic-filename');
    
    const magicPeer = new Peer(generatePeerId('magic_'), getPeerConfig());
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
                            (async () => {
                                const pwd = await cyberPrompt("This file is encrypted. Enter Vault Password:", "", "VAULT DECRYPTION");
                                if (!pwd) {
                                    magicStatus.textContent = 'Decryption cancelled.';
                                    magicStatus.style.color = 'var(--neon-red)';
                                    return;
                                }
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

// --- COMM-LINK VOICE CALL ENGINE ---
function setupCallHandlers(call) {
    if (!call) return;
    if (activeCallBanner) activeCallBanner.classList.remove('hidden');
    
    call.on('stream', (remoteStream) => {
        if (commLinkAudio) {
            commLinkAudio.srcObject = remoteStream;
            commLinkAudio.play().catch(e => {
                console.warn("Autoplay audio blocked, user click will unlock:", e);
                const unlock = () => {
                    if (commLinkAudio) commLinkAudio.play().catch(() => {});
                    window.removeEventListener('click', unlock);
                };
                window.addEventListener('click', unlock);
            });
        }
    });
    
    call.on('close', () => {
        showToast("Comm-Link ended.");
        endCommLink();
    });

    call.on('error', (err) => {
        console.error("Comm-Link call error:", err);
        showToast("Comm-Link disconnected.");
        endCommLink();
    });
}

function endCommLink() {
    if (currentCall) {
        try { currentCall.close(); } catch(e) {}
        currentCall = null;
    }
    if (localMediaStream) {
        try { localMediaStream.getTracks().forEach(t => t.stop()); } catch(e) {}
        localMediaStream = null;
    }
    if (commLinkAudio) commLinkAudio.srcObject = null;
    if (activeCallBanner) activeCallBanner.classList.add('hidden');
}

async function handleIncomingCall(call) {
    if (call.metadata && call.metadata.type === 'SCREEN_SHARE') {
        call.answer();

        const attachStream = (remoteStream) => {
            if (!remoteStream) return;
            if (typeof openScreenShareViewer === 'function') {
                openScreenShareViewer(remoteStream, call.metadata.sharerName || 'Peer', call.peer, false);
            }
        };

        if (call.remoteStream) {
            attachStream(call.remoteStream);
        }

        call.on('stream', (remoteStream) => {
            attachStream(remoteStream);
            if (typeof isHost !== 'undefined' && isHost) {
                connections.filter(c => c.open && c.isAuthenticated && c.peer !== call.peer).forEach(c => {
                    const relayCall = peer.call(c.peer, remoteStream, {
                        metadata: { type: 'SCREEN_SHARE', sharerName: call.metadata.sharerName, sharerId: call.metadata.sharerId }
                    });
                    if (relayCall) {
                        activeScreenCalls[c.peer] = relayCall;
                        if (typeof optimizeScreenShareCall === 'function') optimizeScreenShareCall(relayCall);
                    }
                });
            }
        });
        call.on('close', () => {
            if (typeof closeScreenShareViewer === 'function') closeScreenShareViewer();
            showToast("Screen stream ended by presenter.", "info");
        });
        call.on('error', (err) => {
            console.warn("Screen share call error:", err);
        });
        return;
    }

    if (call.metadata && call.metadata.type === 'EMULATOR') {
        call.answer();
        call.on('stream', (remoteStream) => {
            if (window.handleEmulatorStream) {
                window.handleEmulatorStream(remoteStream);
            }
        });
        return;
    }

    if (inIntercom) {
        if (localAudioStream) {
            call.answer(localAudioStream);
            call.on('stream', (remoteStream) => playAudioStream(remoteStream, call.peer));
            call.on('close', () => cleanupAudio(call.peer));
            activeCalls[call.peer] = call;
        } else {
            try { call.close(); } catch(e) {}
        }
        return;
    }

    const callerName = (call.metadata && call.metadata.callerName) ||
                       (activePeers[call.peer] && activePeers[call.peer].alias) ||
                       (isHost ? 'Guest' : 'Host');

    playCyberChime(580, 'sine', 0.25);
    setTimeout(() => playCyberChime(720, 'sine', 0.3), 300);

    const accept = await cyberConfirm(
        `Incoming encrypted voice Comm-Link from "${callerName}". Would you like to connect?`,
        `INCOMING COMM-LINK: ${callerName}`
    );

    if (!accept) {
        try { call.close(); } catch(e) {}
        showToast(`Comm-Link from ${callerName} declined.`);
        return;
    }

    let replyStream = null;
    try {
        replyStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localMediaStream = replyStream;
    } catch(err) {
        console.warn("Receiver microphone unavailable, connecting in Listen-Only mode:", err);
        showToast("Connected in Listen-Only mode (Microphone unavailable).");
    }

    try {
        if (replyStream) {
            call.answer(replyStream);
        } else {
            call.answer();
        }
        currentCall = call;
        openWhisper(call.peer, callerName, 'var(--neon-green)');
        setupCallHandlers(call);
        showToast(`Comm-Link established with ${callerName}!`);
    } catch(e) {
        console.error("Failed to answer call:", e);
        try { call.close(); } catch(err) {}
        showToast("Comm-Link connection failed.");
    }
}

async function initiateCommLink(targetId, targetAlias = 'Peer', targetColor = 'var(--neon-green)') {
    if (!targetId) {
        showToast("No target peer selected for Comm-Link.");
        return;
    }
    if (targetId === (peer ? peer.id : null)) {
        showToast("Cannot call yourself.");
        return;
    }

    if (currentCall) {
        const dropCurrent = await cyberConfirm("A call is already active. Disconnect and start a new Comm-Link?", "CALL IN PROGRESS");
        if (!dropCurrent) return;
        endCommLink();
    }

    try {
        localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch(e) {
        console.error("Microphone access denied:", e);
        await cyberAlert("Microphone access is required to transmit your voice. Please enable microphone permissions in your browser.", "COMM-LINK ACCESS DENIED", true);
        return;
    }

    openWhisper(targetId, targetAlias, targetColor);
    showToast(`Calling ${targetAlias}... Waiting for response.`);

    try {
        currentCall = peer.call(targetId, localMediaStream, {
            metadata: {
                type: 'comm_link',
                callerId: peer.id,
                callerName: getMyAlias()
            }
        });
        setupCallHandlers(currentCall);
    } catch(e) {
        console.error("peer.call failed:", e);
        await cyberAlert("Failed to establish P2P call: " + e.message, "COMM-LINK ERROR", true);
        endCommLink();
    }
}

// --- HOST LOGIC ---
async function initHost() {
    updateStatus('CONNECTING...', 'offline');
    
    setupHostActions();
    renderHostExplorer();
    
    try {
        const savedRoot = await localforage.getItem("vfs_root");
        if (savedRoot) {
            function linkParents(node, parent) {
                node.parent = parent;
                if (node.children) node.children.forEach(c => linkParents(c, node));
            }
            linkParents(savedRoot, null);
            vfs.root = savedRoot;
            vfs.currentDir = vfs.root;

            // Backfill missing thumbnails for existing media files
            (async () => {
                let updated = false;
                async function backfill(node) {
                    if (node.type === 'file' && !node.thumbnail && node.fileObj) {
                        const isMedia = (node.mime && (node.mime.startsWith('image/') || node.mime.startsWith('video/'))) ||
                                        (node.name && node.name.match(/\.(jpe?g|png|gif|webp|svg|bmp|mp4|webm|mov)$/i));
                        if (isMedia) {
                            try {
                                const thumb = await generateThumbnail(node.fileObj);
                                if (thumb) {
                                    node.thumbnail = thumb;
                                    updated = true;
                                }
                            } catch(e) {}
                        }
                    }
                    if (node.children) {
                        for (const c of node.children) await backfill(c);
                    }
                }
                await backfill(vfs.root);
                if (updated) {
                    saveVFSToDB();
                    renderHostExplorer();
                    broadcastTree();
                }
            })();
        }
    } catch(e) {
        console.warn("VFS restore warning:", e);
    }
    
    try {
        const savedHostPass = await localforage.getItem("host_password");
        if (savedHostPass) {
            hostPassword = savedHostPass;
            if (iconUnlocked) iconUnlocked.classList.add('hidden');
            if (iconLocked) iconLocked.classList.remove('hidden');
        }
    } catch(e) {
        console.warn("Host password restore warning:", e);
    }

    if (btnLock) {
        btnLock.classList.remove('hidden');
        btnLock.addEventListener('click', async () => {
            if (!hostPassword) {
                const pwd = await cyberPrompt("Enter a password to lock this session:", "", "SESSION LOCK");
                if (pwd) {
                    hostPassword = pwd;
                    try { await localforage.setItem("host_password", hostPassword); } catch(e) {}
                    if (iconUnlocked) iconUnlocked.classList.add('hidden');
                    if (iconLocked) iconLocked.classList.remove('hidden');
                    showToast("Session locked");
                    connections.forEach(conn => {
                        if (!conn.isAuthenticated) {
                            conn.send({ type: 'AUTH_REQUIRED' });
                        }
                    });
                }
            } else {
                if (await cyberConfirm("Remove password protection from this session?", "SECURITY PROTOCOL")) {
                    hostPassword = null;
                    try { await localforage.removeItem("host_password"); } catch(e) {}
                    if (iconUnlocked) iconUnlocked.classList.remove('hidden');
                    if (iconLocked) iconLocked.classList.add('hidden');
                    showToast("Session lock removed");
                    connections.forEach(conn => {
                        if (!conn.isAuthenticated) {
                            conn.isAuthenticated = true;
                            conn.send({ type: 'AUTH_SUCCESS' });
                            conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
                            conn.send({ type: 'GUEST_PERMISSIONS', permissions: conn.permissions });
                        }
                    });
                    broadcastPeers();
                }
            }
        });
    }

    try {
        await localforage.removeItem("host_peer_id");
    } catch(e) {}
    setupHostPeer = function(attempts = 0) {
        if (typeof Peer === 'undefined') {
            if (attempts < 25) {
                setTimeout(() => setupHostPeer(attempts + 1), 200);
                return;
            }
            updateStatus('PEERJS ERROR', 'offline');
            showToast("WebRTC library loading failed. Please refresh.");
            return;
        }

        if (peer && !peer.destroyed) {
            try { peer.destroy(); } catch(e) {}
        }

        const freshHostId = generatePeerId('host_');
        peer = new Peer(freshHostId, getPeerConfig());

        let hostOpenTimeout = setTimeout(() => {
            if (isServerBurned) return;
            if (!peer || !peer.open) {
                console.warn("Signaling broker handshake timeout, rotating ID...");
                updateStatus('RECONNECTING...', 'offline');
                setupHostPeer();
            }
        }, 10000);

        peer.on('error', (err) => {
            if (isServerBurned) return;
            clearTimeout(hostOpenTimeout);
            console.error("PeerJS Host Error:", err);
            if (err.type === 'unavailable-id' || err.type === 'server-error' || err.type === 'socket-error' || err.type === 'network' || err.type === 'socket-closed') {
                updateStatus('RETRYING...', 'offline');
                setTimeout(() => setupHostPeer(), 1000);
            } else if (err.type === 'peer-unavailable') {
                // Ignore transient peer disconnect
            } else {
                updateStatus('OFFLINE', 'offline');
                setTimeout(() => {
                    if (!peer || !peer.open) {
                        updateStatus('RECONNECTING...', 'offline');
                        setupHostPeer();
                    }
                }, 3000);
            }
        });

        peer.on('call', handleIncomingCall);


        peer.on('open', (id) => {
            clearTimeout(hostOpenTimeout);
            updateStatus('HOST ACTIVE', 'online');
            const connectUrl = `${window.location.origin}${window.location.pathname}?room=${id}`;
            
            renderHostQR(connectUrl);
            if (joinInfo) joinInfo.classList.remove('hidden');
            if (joinUrl) joinUrl.textContent = connectUrl;
            
            const btnCopyUrl = document.getElementById('btn-copy-url');
            if (btnCopyUrl) {
                btnCopyUrl.onclick = async () => {
                    try {
                        await navigator.clipboard.writeText(connectUrl);
                    } catch(e) {
                        const temp = document.createElement('textarea');
                        temp.value = connectUrl;
                        document.body.appendChild(temp);
                        temp.select();
                        document.execCommand('copy');
                        document.body.removeChild(temp);
                    }
                    btnCopyUrl.classList.add('copied');
                    const copyText = btnCopyUrl.querySelector('.copy-text');
                    if (copyText) copyText.textContent = 'COPIED!';
                    showToast("Connection URL copied to clipboard!");
                    setTimeout(() => {
                        btnCopyUrl.classList.remove('copied');
                        if (copyText) copyText.textContent = 'COPY';
                    }, 2000);
                };
            }
        });

        peer.on('connection', (conn) => {
            conn.isAuthenticated = !hostPassword;
            connections.push(conn);
            conn.unlockedFolders = new Set();
            conn.permissions = { upload: false, chat: true, delete: false, edit: false, whiteboard: false, scratchpad: false };

            const handleOpen = () => {
                sendEcdhHandshake(conn);
                if (hostPassword && !conn.isAuthenticated) {
                    conn.send({ type: 'AUTH_REQUIRED' });
                } else {
                    conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
                    conn.send({ type: 'GUEST_PERMISSIONS', permissions: conn.permissions });
                    broadcastPeers();
                    broadcastNetworkMap();
                }
            };

            if (conn.open) {
                handleOpen();
            } else {
                conn.on('open', handleOpen);
            }
        
        conn.on('data', (data) => {
            if (window.handlePluginMessage) window.handlePluginMessage(data);
            if (data.type === 'ECDH_KEY_EXCHANGE') {
                handlePeerEcdhKey(conn.peer, data.publicKey).then(key => {
                    if (key && !conn._ecdhSent) {
                        conn._ecdhSent = true;
                        sendEcdhHandshake(conn);
                    }
                });
                return;
            }
            if (data.type === 'SWARM_REQUEST_CHUNK') {
                if (!conn.isAuthenticated) return;
                const node = vfs.findNode(data.fileId);
                if (!node || node.type !== 'file' || !isNodeAuthorizedForConnection(node, conn)) return;
                handleHostSwarmChunkRequest(conn, data.fileId, data.chunkIndex);
                return;
            }
            if (data.type === 'SWARM_HAVE') {
                registerSwarmHave(conn.peer, data.fileId, data.chunkIndex);
                return;
            }
            if (data.type === 'SWARM_HAVES') {
                if (Array.isArray(data.chunkIndices)) {
                    registerSwarmHaves(conn.peer, data.fileId, data.chunkIndices);
                }
                return;
            }
            if (data.type === 'REQUEST_MAGIC_FILE') {
                const node = vfs.findNode(data.fileId);
                if (node && node.type === 'file') {
                    // Check if file or any ancestor folder is locked, vault, or native
                    let isProtected = !!(node.isLocked || node.password || node.isNative);
                    let cur = node.parent;
                    while (cur && cur.id !== 'root') {
                        if (cur.password || cur.isVault || cur.isNative || cur.isNativeRoot) {
                            isProtected = true;
                            break;
                        }
                        cur = cur.parent;
                    }
                    if (isProtected) {
                        conn.send({ type: 'MAGIC_FILE_ERROR', message: 'File is locked or requires host authentication.' });
                    } else {
                        sendFileInChunks(conn, node.id, node.fileObj, node.name, node.mime, 'CLIENT_UPLOAD_CHUNK', { isEncrypted: node.isEncrypted, salt: node.salt, iv: node.iv });
                    }
                } else {
                    conn.send({ type: 'MAGIC_FILE_ERROR', message: 'File not found or access denied.' });
                }
                return;
            }
            if (data.type === 'AUTH_ATTEMPT') {
                if (conn.isLockedOut) {
                    conn.send({ type: 'AUTH_FAIL', message: 'Maximum attempts exceeded. Connection locked out.' });
                    setTimeout(() => conn.close(), 500);
                    return;
                }
                if (conn.isAuthenticated) {
                    conn.send({ type: 'AUTH_SUCCESS' });
                    conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
                    conn.send({ type: 'GUEST_PERMISSIONS', permissions: conn.permissions });
                    broadcastPeers();
                    broadcastNetworkMap();
                    return;
                }
                if (data.password === hostPassword) {
                    conn.isAuthenticated = true;
                    conn.authFailures = 0;
                    conn.send({ type: 'AUTH_SUCCESS' });
                    conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
                    conn.send({ type: 'GUEST_PERMISSIONS', permissions: conn.permissions });
                    broadcastPeers();
                    broadcastNetworkMap();

                    if (isScreenSharing && localScreenStream) {
                        const call = peer.call(conn.peer, localScreenStream, {
                            metadata: { type: 'SCREEN_SHARE', sharerName: getMyAlias(), sharerId: peer.id }
                        });
                        if (call) {
                            activeScreenCalls[conn.peer] = call;
                            if (typeof optimizeScreenShareCall === 'function') optimizeScreenShareCall(call);
                        }
                        try { conn.send({ type: 'SCREEN_SHARE_STARTED', sharerName: getMyAlias(), sharerId: peer.id }); } catch(e) {}
                    }
                } else {
                    conn.authFailures = (conn.authFailures || 0) + 1;
                    if (conn.authFailures >= 5) {
                        conn.isLockedOut = true;
                        conn.send({ type: 'AUTH_FAIL', message: 'Maximum attempts exceeded. Connection terminated.' });
                        setTimeout(() => conn.close(), 500);
                    } else {
                        conn.send({ type: 'AUTH_FAIL' });
                    }
                }
                return;
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
                if (!conn.permissions || !conn.permissions.scratchpad) return;
                globalScratchpadContent = data.text;
                if (scratchpadModal && !scratchpadModal.classList.contains('hidden') && scratchpadTextarea.value !== data.text) {
                    const start = scratchpadTextarea.selectionStart;
                    const end = scratchpadTextarea.selectionEnd;
                    scratchpadTextarea.value = data.text;
                    scratchpadTextarea.setSelectionRange(start, end);
                }
                connections.forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated && c.permissions && c.permissions.scratchpad) {
                        c.send({ type: 'SCRATCHPAD_UPDATE', text: data.text });
                    }
                });
            } else if (data.type === 'REQUEST_SCRATCHPAD' && conn.isAuthenticated) {
                if (conn.permissions && conn.permissions.scratchpad) {
                    conn.send({ type: 'SCRATCHPAD_UPDATE', text: globalScratchpadContent });
                } else {
                    conn.send({ type: 'SCRATCHPAD_DENIED', message: 'Scratchpad permission required.' });
                }
            } else if (data.type === 'SCREEN_SHARE_STOPPED') {
                if (typeof closeScreenShareViewer === 'function') closeScreenShareViewer();
                showToast("Screen stream ended by presenter.", "info");
                connections.forEach(c => {
                    if (c.id !== conn.id && c.open) {
                        try { c.send(data); } catch(e) {}
                    }
                });
            } else if (data.type === 'WHITEBOARD_DRAW' && conn.isAuthenticated) {
                if (!conn.permissions || !conn.permissions.whiteboard) return;
                if (typeof drawLine === 'function' && wbCanvas) {
                    const w = wbCanvas.width; const h = wbCanvas.height;
                    if (w > 0 && h > 0) {
                        drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.size, data.tool, false);
                    }
                }
                connections.forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                        c.send(data);
                    }
                });
            } else if (data.type === 'WHITEBOARD_SHAPE' && conn.isAuthenticated) {
                if (!conn.permissions || !conn.permissions.whiteboard) return;
                if (typeof commitShape === 'function' && wbCanvas) {
                    const w = wbCanvas.width; const h = wbCanvas.height;
                    if (w > 0 && h > 0) {
                        commitShape(data.shape, data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.size, data.tool, false);
                    }
                }
                connections.forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                        c.send(data);
                    }
                });
            } else if (data.type === 'WHITEBOARD_TEXT' && conn.isAuthenticated) {
                if (!conn.permissions || !conn.permissions.whiteboard) return;
                if (typeof commitText === 'function' && wbCanvas) {
                    const w = wbCanvas.width; const h = wbCanvas.height;
                    if (w > 0 && h > 0) {
                        commitText(data.x * w, data.y * h, data.text, data.color, data.size, false);
                    }
                }
                connections.forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                        c.send(data);
                    }
                });
            } else if (data.type === 'WHITEBOARD_STAMP' && conn.isAuthenticated) {
                if (!conn.permissions || !conn.permissions.whiteboard) return;
                if (typeof stampImageOnWhiteboard === 'function' && wbCanvas) {
                    stampImageOnWhiteboard(data.image, data.x, data.y, data.w, data.h, false);
                }
                connections.forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                        c.send(data);
                    }
                });
            } else if (data.type === 'WHITEBOARD_LASER' && conn.isAuthenticated) {
                if (!conn.permissions || !conn.permissions.whiteboard) return;
                if (typeof handleLaserPoint === 'function' && wbCanvas) {
                    const w = wbCanvas.width; const h = wbCanvas.height;
                    if (w > 0 && h > 0) {
                        handleLaserPoint(data.x * w, data.y * h, data.color, data.peerName || 'Peer');
                    }
                }
                connections.forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                        c.send(data);
                    }
                });
            } else if (data.type === 'WHITEBOARD_THEME' && conn.isAuthenticated) {
                if (!conn.permissions || !conn.permissions.whiteboard) return;
                if (typeof setWbTheme === 'function') {
                    setWbTheme(data.theme, false);
                }
                connections.forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                        c.send(data);
                    }
                });
            } else if (data.type === 'WHITEBOARD_UNDO' && conn.isAuthenticated) {
                if (!conn.permissions || !conn.permissions.whiteboard) return;
                if (typeof undoWb === 'function') {
                    undoWb(true);
                }
            } else if (data.type === 'WHITEBOARD_REDO' && conn.isAuthenticated) {
                if (!conn.permissions || !conn.permissions.whiteboard) return;
                if (typeof redoWb === 'function') {
                    redoWb(true);
                }
            } else if (data.type === 'WHITEBOARD_CLEAR' && conn.isAuthenticated) {
                if (!conn.permissions || !conn.permissions.whiteboard) return;
                if (typeof clearWhiteboard === 'function') {
                    clearWhiteboard(false);
                } else if (wbCtx && wbCanvas) {
                    wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
                }
                connections.forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                        c.send(data);
                    }
                });
            } else if (data.type === 'REQUEST_WHITEBOARD' && conn.isAuthenticated) {
                if (conn.permissions && conn.permissions.whiteboard) {
                    if (wbCanvas && wbCanvas.width > 0 && wbCanvas.height > 0) {
                        conn.send({ 
                            type: 'WHITEBOARD_SYNC', 
                            image: wbCanvas.toDataURL(),
                            theme: typeof currentWbTheme !== 'undefined' ? currentWbTheme : 'cyber'
                        });
                    }
                } else {
                    conn.send({ type: 'WHITEBOARD_DENIED', message: 'Whiteboard permission required.' });
                }
            } else if (data.type === 'INTERCOM_JOIN' && conn.isAuthenticated) {
                intercomUsers.add(data.peerId);
                const others = Array.from(intercomUsers).filter(id => id !== data.peerId);
                conn.send({ type: 'INTERCOM_LIST', users: others });
            } else if (data.type === 'INTERCOM_LEAVE' && conn.isAuthenticated) {
                intercomUsers.delete(data.peerId);
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
                conn.folderAuthAttempts = conn.folderAuthAttempts || {};
                const attempts = (conn.folderAuthAttempts[data.folderId] || 0) + 1;
                conn.folderAuthAttempts[data.folderId] = attempts;
                if (attempts > 5) {
                    conn.send({ type: 'FOLDER_AUTH_FAIL', folderId: data.folderId, locked: true });
                    return;
                }
                const node = vfs.findNode(data.folderId);
                if (node && node.type === 'folder') {
                    if (node.password === data.password) {
                        conn.folderAuthAttempts[data.folderId] = 0;
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
                if (node && node.type === 'file' && isNodeAuthorizedForConnection(node, conn)) {
                    if (node.isNative) {
                        getDecryptedFileObj(node).then(blob => {
                            sendFileInChunks(conn, node.id, blob, node.name, node.mime, 'FILE_CHUNK', { isEncrypted: false });
                        }).catch(e => console.error('Native read error:', e));
                    } else {
                        sendFileInChunks(conn, node.id, node.fileObj, node.name, node.mime, 'FILE_CHUNK', { isEncrypted: node.isEncrypted, salt: node.salt, iv: node.iv });
                    }
                } else {
                    conn.send({ type: 'ALERT', message: 'Access denied: protected file or unauthorized folder.' });
                }
            } else if (data.type === 'REQUEST_ZIP_ALL' && conn.isAuthenticated) {
                generateZipBlob(conn).then(blob => {
                    sendFileInChunks(conn, 'zip-all', blob, 'local-cast-backup.zip', 'application/zip', 'ZIP_CHUNK');
                });
            } else if (data.type === 'CLIENT_UPLOAD_CHUNK_START') {
                if (conn.permissions && conn.permissions.upload) {
                    const safeName = sanitizeFilename(data.name);
                    const safeThumb = sanitizeThumbnailUrl(data.thumbnail);
                    incomingTransfers[data.id] = { chunks: [], received: 0, total: data.totalChunks, name: safeName, mime: data.mime, size: data.size || (data.totalChunks * CHUNK_SIZE), path: data.path, targetFolderId: data.targetFolderId, thumbnail: safeThumb };
                    createTransferItem(data.id, safeName, 'download');
                }
            } else if (data.type === 'CLIENT_UPLOAD_CHUNK') {
                if (!conn.permissions || !conn.permissions.upload) return;
                const transfer = incomingTransfers[data.id];
                if (transfer) {
                    transfer.chunks[data.index] = data.chunk;
                    transfer.received++;
                    updateTransferProgress(data.id, data.chunk.byteLength, transfer.size);
                    const now = Date.now();
                    if (window.triggerCyberspaceBeam && (!transfer.lastBeamTime || now - transfer.lastBeamTime > 250)) {
                        transfer.lastBeamTime = now;
                        window.triggerCyberspaceBeam(conn.peer, 'host', '#00f0ff');
                    }
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
                        if (!isNodeAuthorizedForConnection(current, conn)) {
                            delete incomingTransfers[data.id];
                            conn.send({ type: 'ALERT', message: 'Upload rejected: Target folder is locked or unauthorized.' });
                            return;
                        }
                        
                        if (transfer.path && typeof transfer.path === 'string') {
                            const parts = transfer.path.split('/').map(p => p.trim()).filter(p => p && p !== '.' && p !== '..');
                            for(let i=0; i<parts.length-1; i++) {
                                let folderName = sanitizeFilename(parts[i]);
                                if (!folderName) continue;
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
            } else if (data.type === 'BURN_CONSUMED') {
                const node = vfs.findNode(data.fileId);
                if (node && node.isBurn && node.parent) {
                    node.parent.children = node.parent.children.filter(c => c.id !== data.fileId);
                    saveVFSToDB();
                    renderHostExplorer();
                    broadcastTree();
                    
                    showToast(`🔥 Burn Protocol Activated: ${node.name} has self-destructed.`);
                    
                    // Force the screen to flash red
                    document.body.style.transition = 'none';
                    document.body.style.backgroundColor = 'rgba(255, 0, 0, 0.4)';
                    setTimeout(() => {
                        document.body.style.transition = 'background-color 2s ease-out';
                        document.body.style.backgroundColor = '';
                    }, 50);
                }
            } else if (data.type === 'CLIENT_MOVE_NODE') {
                if (conn.permissions && conn.permissions.delete) {
                    const node = vfs.findNode(data.id);
                    const target = vfs.findNode(data.targetFolderId);
                    if (node && target && isNodeAuthorizedForConnection(node, conn) && isNodeAuthorizedForConnection(target, conn)) {
                        if (moveNode(data.id, data.targetFolderId)) {
                            saveVFSToDB();
                            renderHostExplorer();
                            broadcastTree();
                        } else {
                            conn.send({ type: 'ALERT', message: 'Move failed: Invalid node or target.' });
                        }
                    } else {
                        conn.send({ type: 'ALERT', message: 'Move failed: Target or source is locked or unauthorized.' });
                    }
                } else {
                    conn.send({ type: 'ALERT', message: 'Move failed: No delete permission on Host.' });
                }
            } else if (data.type === 'CLIENT_RENAME_NODE') {
                if (conn.permissions && conn.permissions.delete) {
                    const node = vfs.findNode(data.id);
                    if (node && !node.isLocked && isNodeAuthorizedForConnection(node, conn)) {
                        node.name = sanitizeFilename(data.newName);
                        saveVFSToDB();
                        renderHostExplorer();
                        broadcastTree();
                    } else {
                        conn.send({ type: 'ALERT', message: 'Rename failed: Node not found or locked.' });
                    }
                } else {
                    conn.send({ type: 'ALERT', message: 'Rename failed: No delete permission on Host. Permissions object: ' + JSON.stringify(conn.permissions) });
                }
            } else if (data.type === 'CLIENT_TOGGLE_BURN') {
                if (conn.permissions && (conn.permissions.upload || conn.permissions.edit)) {
                    const node = vfs.findNode(data.id);
                    if (node && node.type === 'file' && !node.isLocked && isNodeAuthorizedForConnection(node, conn)) {
                        if (node.isBurn) {
                            delete node.isBurn;
                        } else {
                            node.isBurn = true;
                        }
                        saveVFSToDB();
                        renderHostExplorer();
                        broadcastTree();
                    }
                } else {
                    conn.send({ type: 'ALERT', message: 'Action failed: No upload or edit permission.' });
                }
            } else if (data.type === 'NUCLEAR_VOTE') {
                handleNuclearVote(data.folderId, conn.peer, data.pin);
            } else if (data.type === 'CLIENT_DELETE_NODE') {
                if (conn.permissions && conn.permissions.delete) {
                    const node = vfs.findNode(data.id);
                    if (node && node.parent && !node.isLocked && !node.parent.isLocked && isNodeAuthorizedForConnection(node, conn)) {
                        node.parent.children = node.parent.children.filter(c => c.id !== data.id);
                        saveVFSToDB();
                        renderHostExplorer();
                        broadcastTree();
                    }
                }
            } else if (data.type === 'TEXT_EDIT_SYNC') {
                if (conn.permissions && conn.permissions.edit) {
                    const node = vfs.findNode(data.fileId);
                    if (node && !node.isLocked && isNodeAuthorizedForConnection(node, conn)) {
                        (async () => {
                            let fileBlob = new Blob([data.text], { type: 'text/plain' });
                            if (node.isEncrypted) {
                                let vaultDir = node.parent;
                                while (vaultDir && !vaultDir.isVault && vaultDir.parent) vaultDir = vaultDir.parent;
                                if (vaultDir && vaultDir.isVault) {
                                    const pass = unlockedVaults[vaultDir.id];
                                    if (pass) {
                                        const buffer = await fileBlob.arrayBuffer();
                                        const encData = await encryptFile(buffer, pass, node.salt);
                                        fileBlob = new Blob([encData.encrypted], { type: 'text/plain' });
                                        node.iv = encData.iv;
                                        node.salt = encData.salt;
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
        
        conn.on('close', () => {
            connections = connections.filter(c => c !== conn);
            broadcastPeers();
        });
    });
    };

    setupHostPeer();

    if (hostExplorerGrid) {
        hostExplorerGrid.addEventListener('click', (e) => {
            if (e.target === hostExplorerGrid) {
                selectedNodes.clear();
                document.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
            }
        });
    }
}


function broadcastNuclearUpdate(folderId, current, required) {
    const msg = { type: 'NUCLEAR_VOTE_UPDATE', folderId, current, required };
    if (typeof updateNuclearModalUI === 'function') updateNuclearModalUI(folderId, current, required);
    connections.forEach(c => {
        if (c.open && c.isAuthenticated) c.send(msg);
    });
}

function handleNuclearVote(folderId, peerId, pin) {
    const node = vfs.findNode(folderId);
    if (!node || !node.isNuclear) return false;
    if (node.password !== pin) {
        if (peerId === 'host') {
            showToast("❌ Incorrect Nuclear Launch Code", "error");
        } else {
            const c = connections.find(conn => conn.peer === peerId);
            if (c && c.open) c.send({ type: 'ALERT', message: '❌ Incorrect Nuclear Launch Code. Authorization rejected.' });
        }
        return false;
    }
    
    if (!activeNuclearVotes[folderId]) activeNuclearVotes[folderId] = new Set();
    activeNuclearVotes[folderId].add(peerId);
    
    const currentVotes = activeNuclearVotes[folderId].size;
    const requiredVotes = node.nuclearVotesRequired;
    
    broadcastNuclearUpdate(folderId, currentVotes, requiredVotes);
    
    // Set 60-second timer to remove vote
    const voteKey = folderId + '_' + peerId;
    if (nuclearVoteTimers[voteKey]) clearTimeout(nuclearVoteTimers[voteKey]);
    nuclearVoteTimers[voteKey] = setTimeout(() => {
        if (activeNuclearVotes[folderId]) {
            activeNuclearVotes[folderId].delete(peerId);
            broadcastNuclearUpdate(folderId, activeNuclearVotes[folderId].size, requiredVotes);
        }
    }, 60000);
    
    // Check if unlocked
    if (currentVotes >= requiredVotes) {
        // Unlock it globally for this session
        unlockedVaults[folderId] = pin;
        connections.forEach(c => {
            if (c.open && c.isAuthenticated) c.unlockedFolders.add(folderId);
        });
        
        // Notify success
        const successMsg = { type: 'NUCLEAR_UNLOCK_SUCCESS', folderId, pin };
        if (typeof handleNuclearUnlockSuccess === 'function') handleNuclearUnlockSuccess(folderId, pin);
        connections.forEach(c => {
            if (c.open && c.isAuthenticated) c.send(successMsg);
        });
        
        broadcastTree();
        if (typeof renderHostExplorer === 'function') renderHostExplorer();
        return true;
    }
    return false;
}

function broadcastPeers() {
    if (!isHost) return;
    const peers = connections.filter(c => c.open && c.profile && c.isAuthenticated).map(c => ({ id: c.peer, alias: c.profile.name, color: c.profile.color, avatar: c.profile.avatar }));
    const hostInfo = {
        id: (peer ? peer.id : 'host'),
        alias: (typeof getMyAlias === 'function' ? getMyAlias() : 'HOST'),
        color: '#39ff14',
        avatar: localStorage.getItem('localcast_avatar') || 'hat-logo.png'
    };
    connections.forEach(c => {
        if (c.open && c.isAuthenticated) c.send({ type: 'PEER_LIST', peers, host: hostInfo });
    });
    // Update host's own list
    activePeers = {};
    peers.forEach(p => activePeers[p.id] = p);

    const countEl = document.getElementById('telemetry-peer-count');
    if (countEl) countEl.textContent = `${peers.length} ${peers.length === 1 ? 'PEER' : 'PEERS'}`;
    if (typeof renderWbGuestList === 'function') renderWbGuestList();
    if (typeof renderSpGuestList === 'function') renderSpGuestList();
}

let broadcastTreeTimer = null;

function doBroadcastTree() {
    connections.forEach(conn => {
        if (conn.open && conn.isAuthenticated) {
            try {
                conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });
            } catch (err) {
                console.warn("broadcastTree failed to send to peer:", conn.peer, err);
            }
        }
    });
}

function broadcastTree(immediate = false) {
    if (immediate) {
        if (broadcastTreeTimer) { clearTimeout(broadcastTreeTimer); broadcastTreeTimer = null; }
        doBroadcastTree();
        return;
    }
    if (broadcastTreeTimer) clearTimeout(broadcastTreeTimer);
    broadcastTreeTimer = setTimeout(() => {
        broadcastTreeTimer = null;
        doBroadcastTree();
    }, 150);
}

async function generateZipBlob(targetConn = null) {
    const zip = new JSZip();
    
    function addNodeToZip(node, currentZipFolder) {
        node.children.forEach(child => {
            if (targetConn && !isNodeAuthorizedForConnection(child, targetConn)) {
                return; // Skip unauthorized files or locked folders for guest download
            }
            if (child.type === 'folder') {
                const newFolder = currentZipFolder.folder(child.name);
                addNodeToZip(child, newFolder);
            } else if (child.type === 'file' && child.fileObj) {
                currentZipFolder.file(child.name, child.fileObj);
            }
        });
    }
    
    addNodeToZip(vfs.root, zip);
    return await zip.generateAsync({ type: 'blob' });
}

function setupHostActions() {
    if (btnShareServer) {
        btnShareServer.addEventListener('click', () => {
            if (shareModal) shareModal.classList.remove('hidden');
            if (peer && peer.id) {
                const connectUrl = `${window.location.origin}${window.location.pathname}?room=${peer.id}`;
                renderHostQR(connectUrl);
                if (joinInfo) joinInfo.classList.remove('hidden');
                if (joinUrl) joinUrl.textContent = connectUrl;
            } else {
                if (!peer || !peer.open) {
                    updateStatus('CONNECTING...', 'offline');
                    setupHostPeer();
                }
            }
        });
    }

    if (btnCloseShare) {
        btnCloseShare.addEventListener('click', () => {
            if (shareModal) shareModal.classList.add('hidden');
        });
    }

    if (btnDoneShare) {
        btnDoneShare.addEventListener('click', () => {
            if (shareModal) shareModal.classList.add('hidden');
        });
    }

    if (shareModal) {
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.classList.add('hidden');
            }
        });
    }

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
            if (vaultPasswordModalTitle) vaultPasswordModalTitle.textContent = "Create Secure Vault: " + name;
            if (vaultPasswordDesc) vaultPasswordDesc.textContent = "Set a strong master password to encrypt this vault. You can link Touch ID / Face ID below for 1-tap unlocking.";
            if (btnConfirmVaultPassword) btnConfirmVaultPassword.textContent = "CONFIRM & CREATE";
            vaultPasswordModal.classList.remove('hidden');
            vaultPasswordInput.value = '';
            updateVaultBiometricUI(true);
            
            const handleVaultSubmit = async () => {
                const pass = vaultPasswordInput.value;
                if (!pass) return await cyberAlert("Password required for Vault!", "VAULT SECURITY", true);
                
                // Remove listener so it doesn't fire multiple times
                btnConfirmVaultPassword.removeEventListener('click', handleVaultSubmit);
                vaultPasswordModal.classList.add('hidden');
                if (btnConfirmVaultPassword) btnConfirmVaultPassword.textContent = "UNLOCK";
                if (vaultPasswordModalTitle) vaultPasswordModalTitle.textContent = "Vault Password";
                
                // Create a dummy salt for the folder (files will have their own)
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const folder = vfs.addFolder(name, true, salt);
                unlockedVaults[folder.id] = pass; // auto-unlock for host on creation
                
                saveVFSToDB();
                renderHostExplorer();
                broadcastTree();
                showToast(`🔐 Secure Vault "${name}" created!`, "success");
            };
            
            btnConfirmVaultPassword.addEventListener('click', handleVaultSubmit);
            btnCloseVaultModal.addEventListener('click', () => {
                btnConfirmVaultPassword.removeEventListener('click', handleVaultSubmit);
                if (btnConfirmVaultPassword) btnConfirmVaultPassword.textContent = "UNLOCK";
                if (vaultPasswordModalTitle) vaultPasswordModalTitle.textContent = "Vault Password";
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
    
    btnBurn.addEventListener('click', async () => {
        const time = await cyberPrompt("SET BURN TIMER (seconds) or 0 for instant destruction:", "10", "EMERGENCY BURN NOTICE");
        if (time !== null && !isNaN(time)) {
            const seconds = Math.max(0, parseInt(time, 10));
            if (seconds === 0) {
                connections.forEach(c => {
                    try { c.send({ type: 'SERVER_BURNED' }); } catch (e) {}
                });
                if (typeof swarmConnections !== 'undefined' && Array.isArray(swarmConnections)) {
                    swarmConnections.forEach(c => {
                        try { c.send({ type: 'SERVER_BURNED' }); } catch (e) {}
                    });
                }
                playBurnAlarm();
                await new Promise(r => setTimeout(r, 250));
                triggerBurnSequence();
            } else {
                connections.forEach(c => {
                    try { c.send({ type: 'BURN_NOTICE', seconds: seconds }); } catch (e) {}
                });
                if (typeof swarmConnections !== 'undefined' && Array.isArray(swarmConnections)) {
                    swarmConnections.forEach(c => {
                        try { c.send({ type: 'BURN_NOTICE', seconds: seconds }); } catch (e) {}
                    });
                }
                playBurnAlarm();
                startBurnCountdown(seconds);
            }
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
    if (!file) return null;
    let mime = file.type || '';
    if (!mime && file.name) {
        const ext = file.name.split('.').pop().toLowerCase();
        const mimeMap = {
            jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
            gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
            bmp: 'image/bmp', avif: 'image/avif',
            mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
            m4v: 'video/mp4', mkv: 'video/x-matroska'
        };
        mime = mimeMap[ext] || '';
    }
    if (!mime) return null;

    return new Promise((resolve) => {
        let timeout = setTimeout(() => { resolve(null); }, 2500);
        try {
            if (mime.startsWith('image/')) {
                const img = new Image();
                const url = URL.createObjectURL(file);
                img.onload = () => {
                    clearTimeout(timeout);
                    try {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 96;
                        let width = img.naturalWidth || img.width || 96;
                        let height = img.naturalHeight || img.height || 96;
                        if (width > height) {
                            if (width > MAX_SIZE) { height = Math.round(height * (MAX_SIZE / width)); width = MAX_SIZE; }
                        } else {
                            if (height > MAX_SIZE) { width = Math.round(width * (MAX_SIZE / height)); height = MAX_SIZE; }
                        }
                        canvas.width = Math.max(width, 16);
                        canvas.height = Math.max(height, 16);
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        URL.revokeObjectURL(url);
                        resolve(canvas.toDataURL('image/jpeg', 0.5));
                    } catch(e) { resolve(null); }
                };
                img.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(url); resolve(null); };
                img.src = url;
            } else if (mime.startsWith('video/')) {
                const video = document.createElement('video');
                const url = URL.createObjectURL(file);
                video.src = url;
                video.muted = true;
                video.playsInline = true;
                
                const processVideo = () => {
                    clearTimeout(timeout);
                    try {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 96;
                        let width = video.videoWidth || 96;
                        let height = video.videoHeight || 96;
                        if (width > height) {
                            if (width > MAX_SIZE) { height = Math.round(height * (MAX_SIZE / width)); width = MAX_SIZE; }
                        } else {
                            if (height > MAX_SIZE) { width = Math.round(width * (MAX_SIZE / height)); height = MAX_SIZE; }
                        }
                        canvas.width = Math.max(width, 16);
                        canvas.height = Math.max(height, 16);
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        URL.revokeObjectURL(url);
                        resolve(canvas.toDataURL('image/jpeg', 0.5));
                    } catch(e) { resolve(null); }
                };

                video.onloadedmetadata = () => {
                    video.currentTime = Math.min(1, (video.duration || 2) / 2);
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
            await cyberAlert("Please unlock this Vault before adding files.", "VAULT LOCKED", true);
            return;
        }
    }
    if (isNativeDir && !nativeVaultPassword) {
        await cyberAlert("Native Vault is locked! Please authenticate first.", "NATIVE VAULT LOCKED", true);
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
        
        const safeName = escapeHtml(child.name);
        const safeThumb = sanitizeThumbnailUrl(child.thumbnail);
        const icon = safeThumb ? `<div class="item-thumbnail" style="background-image: url('${safeThumb}');"></div>` : (child.type === 'folder' ? 
            `<svg class="item-icon folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>${child.isLocked || child.password || child.isVault ? '<rect x="15" y="15" width="8" height="8" fill="var(--bg-card)" stroke="none"></rect><rect x="16" y="18" width="6" height="4" rx="1" fill="var(--neon-red)" stroke="var(--neon-red)"></rect><path d="M17 18V16a2 2 0 0 1 4 0v2" stroke="var(--neon-red)"></path>' : ''}</svg>` : 
            `<svg class="item-icon file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`);
            
        const burnIcon = child.isBurn ? '🔥 ' : '';
        const nuclearIcon = child.isNuclear ? '☢️ ' : '';
        const checkboxHtml = `<div class="item-select-checkbox" data-id="${child.id}" title="Select"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`;
        item.innerHTML = `${checkboxHtml}${icon}<div class="item-name" title="${safeName}">${burnIcon}${nuclearIcon}${safeName}</div>`;
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

        const chk = item.querySelector('.item-select-checkbox');
        if (chk) {
            chk.addEventListener('click', (e) => {
                e.stopPropagation();
                if (selectedNodes.has(child.id)) {
                    selectedNodes.delete(child.id);
                    item.classList.remove('selected');
                } else {
                    selectedNodes.add(child.id);
                    item.classList.add('selected');
                }
                lastSelectedHostIndex = itemsToRender.indexOf(child);
                updateBatchBar();
            });
        }
        
        item.addEventListener('click', (e) => {
            const curIdx = itemsToRender.indexOf(child);
            if (isSelectModeHost) {
                if (selectedNodes.has(child.id)) {
                    selectedNodes.delete(child.id);
                    item.classList.remove('selected');
                } else {
                    selectedNodes.add(child.id);
                    item.classList.add('selected');
                }
                lastSelectedHostIndex = curIdx;
                updateBatchBar();
                return;
            }

            if (e.shiftKey && lastSelectedHostIndex !== -1) {
                const start = Math.min(lastSelectedHostIndex, curIdx);
                const end = Math.max(lastSelectedHostIndex, curIdx);
                for (let i = start; i <= end; i++) {
                    selectedNodes.add(itemsToRender[i].id);
                }
                const domItems = hostExplorerGrid.querySelectorAll('.file-item');
                domItems.forEach((el, idx) => {
                    if (idx >= start && idx <= end) el.classList.add('selected');
                });
                updateBatchBar();
            } else if (e.metaKey || e.ctrlKey) {
                if (selectedNodes.has(child.id)) {
                    selectedNodes.delete(child.id);
                    item.classList.remove('selected');
                } else {
                    selectedNodes.add(child.id);
                    item.classList.add('selected');
                }
                lastSelectedHostIndex = curIdx;
                updateBatchBar();
            } else {
                selectedNodes.clear();
                document.querySelectorAll('#host-file-grid .file-item.selected').forEach(el => el.classList.remove('selected'));
                selectedNodes.add(child.id);
                item.classList.add('selected');
                lastSelectedHostIndex = curIdx;
                updateBatchBar();
            }
        });
        
        item.addEventListener('dragstart', (e) => {
            if (!selectedNodes.has(child.id)) {
                selectedNodes.clear();
                document.querySelectorAll('#host-file-grid .file-item.selected').forEach(el => el.classList.remove('selected'));
                selectedNodes.add(child.id);
                item.classList.add('selected');
                updateBatchBar();
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
                if (child.isNuclear && !unlockedVaults[child.id]) {
                    openNuclearModal(child);
                } else if (child.isVault && !unlockedVaults[child.id]) {
                    vaultPasswordModal.classList.remove('hidden');
                    vaultPasswordInput.value = '';
                    
                    const handleUnlock = async () => {
                        const pass = vaultPasswordInput.value;
                        if (!pass) return await cyberAlert("Password required to access this Vault", "VAULT SECURITY", true);
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
            if (!selectedNodes.has(child.id)) {
                selectedNodes.clear();
                document.querySelectorAll('#host-file-grid .file-item.selected').forEach(el => el.classList.remove('selected'));
                selectedNodes.add(child.id);
                item.classList.add('selected');
                updateBatchBar();
            }
            const delLabel = document.getElementById('ctx-delete-label');
            if (delLabel) {
                delLabel.textContent = selectedNodes.size > 1 ? `Delete (${selectedNodes.size} items)` : 'Delete';
            }
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.classList.remove('hidden');
            if (document.getElementById('ctx-deaddrop')) document.getElementById('ctx-deaddrop').style.display = child.type === 'folder' ? 'flex' : 'none';
            if (document.getElementById('ctx-magic-link')) document.getElementById('ctx-magic-link').style.display = child.type === 'file' ? 'flex' : 'none';
            if (document.getElementById('ctx-multisig')) {
                const el = document.getElementById('ctx-multisig');
                el.style.display = child.type === 'folder' ? 'flex' : 'none';
                if (child.type === 'folder') {
                    el.innerHTML = child.isNuclear 
                        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Disarm Nuclear Vault`
                        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Make Nuclear Vault`;
                }
            }
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
                        await cyberAlert("Failed to decrypt: " + e.message, "DECRYPTION ERROR", true);
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
                        await cyberAlert("Failed to decrypt: " + e.message, "DECRYPTION ERROR", true);
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
                        await cyberAlert("Failed to decrypt: " + e.message, "DECRYPTION ERROR", true);
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

function setupSwarmPeerConnection(conn) {
    if (!conn) return;
    const handleOpen = () => {
        if (!swarmConnections.find(c => c.peer === conn.peer)) {
            swarmConnections.push(conn);
            printCli('⚡ Swarm peer connected: ' + conn.peer, 'var(--neon-green)');
            sendEcdhHandshake(conn);
            // Immediately broadcast local bitfields so peer knows what we have
            if (typeof localFileBitfields !== 'undefined') {
                localFileBitfields.forEach((bitfield, fileId) => {
                    bitfield.forEach(chunkIdx => {
                        try { conn.send({ type: 'SWARM_HAVE', fileId, chunkIndex: chunkIdx }); } catch(e) {}
                    });
                });
            }
            if (window.triggerCyberspaceBeam && peer) {
                window.triggerCyberspaceBeam(peer.id, conn.peer, '#00f0ff');
            }
        }
    };
    if (conn.open) handleOpen();
    else conn.on('open', handleOpen);

    conn.on('data', (data) => {
        if (data.type === 'ECDH_KEY_EXCHANGE') {
            handlePeerEcdhKey(conn.peer, data.publicKey).then(key => {
                if (key && !conn._ecdhSent) {
                    conn._ecdhSent = true;
                    sendEcdhHandshake(conn);
                }
            });
        } else if (data.type === 'SWARM_REQUEST_CHUNK') {
            handleGuestSwarmChunkRequest(conn, data.fileId, data.chunkIndex);
        } else if (data.type === 'SWARM_CHUNK_DATA') {
            handleIncomingSwarmChunk(data.fileId, data.chunkIndex, data.chunk, conn.peer);
        } else if (data.type === 'SWARM_HAVE') {
            registerSwarmHave(conn.peer, data.fileId, data.chunkIndex);
        } else if (data.type === 'SWARM_HAVES') {
            if (Array.isArray(data.chunkIndices)) {
                registerSwarmHaves(conn.peer, data.fileId, data.chunkIndices);
            }
        } else if (['ARCADE_INVITE', 'ARCADE_ACCEPT', 'ARCADE_DECLINE', 'ARCADE_MOVE', 'ARCADE_RESET'].includes(data.type)) {
            handleArcadeNetwork(data);
        }
    });

    conn.on('close', () => {
        swarmConnections = swarmConnections.filter(c => c.peer !== conn.peer);
    });
    conn.on('error', (err) => {
        console.warn('Swarm peer error:', conn.peer, err);
        swarmConnections = swarmConnections.filter(c => c.peer !== conn.peer);
    });
}

// --- CLIENT LOGIC ---
async function initClient() {
    updateStatus('CONNECTING...', 'offline');
    
    setupClientPeer = function(attempts = 0) {
        if (typeof Peer === 'undefined') {
            if (attempts < 25) {
                setTimeout(() => setupClientPeer(attempts + 1), 200);
                return;
            }
            updateStatus('PEERJS ERROR', 'offline');
            showToast("WebRTC library loading failed. Please refresh.");
            return;
        }

        if (peer && !peer.destroyed) {
            try { peer.destroy(); } catch(e) {}
        }

        const freshGuestId = generatePeerId('guest_');
        peer = new Peer(freshGuestId, getPeerConfig());

        let clientOpenTimeout = setTimeout(() => {
            if (isServerBurned) return;
            if (!peer || !peer.open) {
                console.warn("Client signaling broker handshake timeout, retrying...");
                updateStatus('RECONNECTING...', 'offline');
                setupClientPeer();
            }
        }, 10000);

        peer.on("error", err => {
            if (isServerBurned) return;
            clearTimeout(clientOpenTimeout);
            console.error("PeerJS Client Error:", err);
            if (err.type === 'unavailable-id' || err.type === 'server-error' || err.type === 'socket-error' || err.type === 'network' || err.type === 'socket-closed') {
                updateStatus('RETRYING...', 'offline');
                setTimeout(() => setupClientPeer(), 1000);
            } else if (err.type === 'peer-unavailable') {
                updateStatus('HOST NOT FOUND', 'offline');
                showToast("Host room unavailable or offline.");
            } else {
                updateStatus('HOST OFFLINE', 'offline');
            }
        });
        
        // Intercept incoming connections for Swarm
        peer.on('connection', (conn) => {
            if (!isHost) {
                setupSwarmPeerConnection(conn);
            }
        });

        peer.on('call', handleIncomingCall);


        peer.on('open', () => {
            clearTimeout(clientOpenTimeout);
            updateStatus('CONNECTING TO HOST...', 'offline');
            
            let connectionTimeout = setTimeout(() => {
                if (!hostConnection || !hostConnection.open) {
                    updateStatus('HOST OFFLINE', 'offline');
                    showToast("Host room unavailable. Click 'START AS HOST' to begin your own session.");
                }
            }, 7000);

            hostConnection = peer.connect(roomCode, { reliable: true });
            
            hostConnection.on('open', () => {
                clearTimeout(connectionTimeout);
                updateStatus('CONNECTED TO HOST', 'online');
                showToast("Connected to host mesh!");
                sendEcdhHandshake(hostConnection);
            });

            hostConnection.on('error', () => {
                clearTimeout(connectionTimeout);
                updateStatus('CONNECTION FAILED', 'offline');
            });

            hostConnection.on('close', () => {
                clearTimeout(connectionTimeout);
                updateStatus('DISCONNECTED', 'offline');
            });
        
        hostConnection.on('data', (data) => {
            if (window.handlePluginMessage) window.handlePluginMessage(data);
            if (data.type === 'ECDH_KEY_EXCHANGE') {
                handlePeerEcdhKey(hostConnection.peer || roomCode, data.publicKey).then(key => {
                    if (key && !hostConnection._ecdhSent) {
                        hostConnection._ecdhSent = true;
                        sendEcdhHandshake(hostConnection);
                    }
                });
                return;
            } else if (data.type === 'SWARM_REQUEST_CHUNK') {
                handleGuestSwarmChunkRequest(hostConnection, data.fileId, data.chunkIndex);
                return;
            } else if (data.type === 'SWARM_CHUNK_DATA') {
                handleIncomingSwarmChunk(data.fileId, data.chunkIndex, data.chunk, hostConnection.peer);
                return;
            } else if (data.type === 'SWARM_HAVE') {
                registerSwarmHave(hostConnection.peer, data.fileId, data.chunkIndex);
                return;
            } else if (data.type === 'SWARM_HAVES') {
                if (Array.isArray(data.chunkIndices)) {
                    registerSwarmHaves(hostConnection.peer, data.fileId, data.chunkIndices);
                }
                return;
            } else if (data.type === 'SWARM_ANNOUNCE') {
                registerSwarmAnnounce(hostConnection.peer, data.fileId, data.totalChunks, data.name, data.mime, data.size);
                return;
            } else if (['ARCADE_INVITE', 'ARCADE_ACCEPT', 'ARCADE_DECLINE', 'ARCADE_MOVE', 'ARCADE_RESET'].includes(data.type)) {
                handleArcadeNetwork(data);
            } else if (data.type === 'AUTH_REQUIRED') {
                passwordModal.classList.remove('hidden');
                passwordError.classList.add('hidden');
                updateStatus('PASSWORD REQUIRED', 'offline');
                setTimeout(() => { if (clientPasswordInput) clientPasswordInput.focus(); }, 150);
            } else if (data.type === 'AUTH_SUCCESS') {
                passwordModal.classList.add('hidden');
                passwordError.classList.add('hidden');
                updateStatus('CONNECTED TO HOST', 'online');
                showToast("Access granted! Session unlocked.");
            } else if (data.type === 'AUTH_FAIL') {
                passwordError.classList.remove('hidden');
                showToast("Incorrect session password. Access denied.");
                if (clientPasswordInput) {
                    clientPasswordInput.value = '';
                    clientPasswordInput.focus();
                }
            } else if (data.type === 'TREE') {
                hostConnection.send({ type: 'PROFILE_UPDATE', name: guestAlias, color: guestColor, avatar: guestAvatar });
                clientVFS = data.tree;
                
                // Reconstruct parent links for client navigation
                function linkParents(node, parent) {
                    node.parent = parent;
                    if (node.isNuclear && !node.isUnlocked && typeof clientUnlockedVaults !== 'undefined') {
                        delete clientUnlockedVaults[node.id];
                    }
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
                    const now = Date.now();
                    if (window.triggerCyberspaceBeam && (!transfer.lastBeamTime || now - transfer.lastBeamTime > 250)) {
                        transfer.lastBeamTime = now;
                        window.triggerCyberspaceBeam('host', peer ? peer.id : 'unknown', '#39ff14');
                    }
                    saveChunkToCache(data.id, data.index, data.chunk, transfer);
                    broadcastSwarmHave(data.id, data.index, transfer.total);
                    if (activeMediaStreamDownloader && activeMediaStreamDownloader.fileId === data.id) {
                        activeMediaStreamDownloader.receiveChunk(data.index, data.chunk, 'host');
                    }
                    if (activeSwarmDownloads.has(data.id)) {
                        activeSwarmDownloads.get(data.id).receiveChunk(data.index, data.chunk, 'host');
                    }
                    const pctVal = Math.floor((transfer.received / transfer.total) * 100);
                    const pct = document.getElementById(data.type === 'ZIP_CHUNK' ? 'client-progress-text' : 'preview-progress-text');
                    if (pct) pct.textContent = `${pctVal}%`;
                    
                    if (transfer.received === transfer.total) {
                        finishTransfer(data.id);
                        clearCachedTransfer(data.id, transfer.total);
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
                                        cyberAlert("Decryption failed: " + e.message, "DECRYPTION ERROR", true);
                                    }
                                })();
                            } else {
                                vaultPasswordModal.classList.remove('hidden');
                                vaultPasswordInput.value = '';
                                
                                const handleClientDecrypt = async () => {
                                    const manualPass = vaultPasswordInput.value;
                                    if (!manualPass) return cyberAlert("Password required to decrypt!", "SECURITY NOTICE", true);
                                    btnConfirmVaultPassword.removeEventListener('click', handleClientDecrypt);
                                    vaultPasswordModal.classList.add('hidden');
                                    
                                    try {
                                        const buffer = await blob.arrayBuffer();
                                        const decryptedBuffer = await decryptFile(buffer, manualPass, transfer.salt, transfer.iv);
                                        const decryptedBlob = new Blob([decryptedBuffer], { type: transfer.mime });
                                        triggerDownload(decryptedBlob, transfer.name, transfer.mime, data.id);
                                    } catch (e) {
                                        cyberAlert("Decryption failed: " + e.message, "DECRYPTION ERROR", true);
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
                cyberAlert(data.message, "HOST BROADCAST");
            } else if (data.type === 'GUEST_PERMISSIONS') {
                const prevWb = (typeof myPermissions !== 'undefined' && myPermissions) ? !!myPermissions.whiteboard : false;
                const prevSp = (typeof myPermissions !== 'undefined' && myPermissions) ? !!myPermissions.scratchpad : false;
                myPermissions = data.permissions || {};
                if (btnUploadFilesClient) btnUploadFilesClient.classList.toggle('hidden', !myPermissions.upload);
                if (btnUploadFolderClient) btnUploadFolderClient.classList.toggle('hidden', !myPermissions.upload);
                if (btnChatToggle) btnChatToggle.classList.toggle('hidden', myPermissions.chat === false);
                if (chatSidebar && myPermissions.chat === false) chatSidebar.classList.add('hidden');
                
                // Hide context menu rename/delete buttons if not allowed
                const ctxRename = document.getElementById('ctx-rename');
                const ctxDelete = document.getElementById('ctx-delete');
                if (ctxRename) ctxRename.style.display = myPermissions.delete ? 'flex' : 'none';
                if (ctxDelete) ctxDelete.style.display = myPermissions.delete ? 'flex' : 'none';

                // Whiteboard Permission Handling
                const btnWbClient = document.getElementById('btn-whiteboard-client');
                if (btnWbClient) btnWbClient.classList.toggle('hidden', !myPermissions.whiteboard);
                const btnWbHeader = document.getElementById('btn-whiteboard-header');
                if (btnWbHeader) btnWbHeader.classList.toggle('hidden', !myPermissions.whiteboard);

                if (myPermissions.whiteboard && !prevWb) {
                    showToast("🎨 Whiteboard access granted by Host!", "success");
                    cyberConfirm("The Host has granted you access to the Collaborative Whiteboard. Would you like to open it now?", "WHITEBOARD ACCESS").then(join => {
                        if (join && typeof openWhiteboardModal === 'function') openWhiteboardModal();
                    });
                } else if (!myPermissions.whiteboard && prevWb) {
                    if (whiteboardModal && !whiteboardModal.classList.contains('hidden')) {
                        whiteboardModal.classList.add('hidden');
                    }
                    showToast("Whiteboard access was revoked by Host.", "warning");
                }

                // Scratchpad Permission Handling
                const btnSpClient = document.getElementById('btn-scratchpad-client');
                if (btnSpClient) btnSpClient.classList.toggle('hidden', !myPermissions.scratchpad);
                const btnSpHeader = document.getElementById('btn-scratchpad-header');
                if (btnSpHeader) btnSpHeader.classList.toggle('hidden', !myPermissions.scratchpad);

                if (myPermissions.scratchpad && !prevSp) {
                    showToast("📝 Scratchpad access granted by Host!", "success");
                    cyberConfirm("The Host has granted you access to the Live Scratchpad. Would you like to open it now?", "SCRATCHPAD ACCESS").then(join => {
                        if (join && typeof openScratchpadModal === 'function') openScratchpadModal();
                    });
                } else if (!myPermissions.scratchpad && prevSp) {
                    if (scratchpadModal && !scratchpadModal.classList.contains('hidden')) {
                        scratchpadModal.classList.add('hidden');
                    }
                    showToast("Scratchpad access was revoked by Host.", "warning");
                }
            } else if (data.type === 'WHITEBOARD_INVITE') {
                if (typeof myPermissions !== 'undefined') myPermissions.whiteboard = true;
                const btnWbClient = document.getElementById('btn-whiteboard-client');
                if (btnWbClient) btnWbClient.classList.remove('hidden');
                const btnWbHeader = document.getElementById('btn-whiteboard-header');
                if (btnWbHeader) btnWbHeader.classList.remove('hidden');
                showToast("🎨 Whiteboard access granted by Host!", "success");
                cyberConfirm("The Host has invited you to the Collaborative Whiteboard. Would you like to open it now?", "WHITEBOARD INVITATION").then(join => {
                    if (join && typeof openWhiteboardModal === 'function') openWhiteboardModal();
                });
            } else if (data.type === 'WHITEBOARD_REVOKED') {
                if (typeof myPermissions !== 'undefined') myPermissions.whiteboard = false;
                const btnWbClient = document.getElementById('btn-whiteboard-client');
                if (btnWbClient) btnWbClient.classList.add('hidden');
                const btnWbHeader = document.getElementById('btn-whiteboard-header');
                if (btnWbHeader) btnWbHeader.classList.add('hidden');
                if (whiteboardModal && !whiteboardModal.classList.contains('hidden')) {
                    whiteboardModal.classList.add('hidden');
                }
                showToast("Whiteboard access was revoked by Host.", "warning");
            } else if (data.type === 'SCRATCHPAD_INVITE') {
                if (typeof myPermissions !== 'undefined') myPermissions.scratchpad = true;
                const btnSpClient = document.getElementById('btn-scratchpad-client');
                if (btnSpClient) btnSpClient.classList.remove('hidden');
                const btnSpHeader = document.getElementById('btn-scratchpad-header');
                if (btnSpHeader) btnSpHeader.classList.remove('hidden');
                if (typeof data.text === 'string') {
                    globalScratchpadContent = data.text;
                    if (scratchpadTextarea) scratchpadTextarea.value = data.text;
                }
                showToast("📝 Scratchpad access granted by Host!", "success");
                cyberConfirm("The Host has invited you to the Live Scratchpad. Would you like to open it now?", "SCRATCHPAD INVITATION").then(join => {
                    if (join && typeof openScratchpadModal === 'function') openScratchpadModal();
                });
            } else if (data.type === 'SCRATCHPAD_REVOKED') {
                if (typeof myPermissions !== 'undefined') myPermissions.scratchpad = false;
                const btnSpClient = document.getElementById('btn-scratchpad-client');
                if (btnSpClient) btnSpClient.classList.add('hidden');
                const btnSpHeader = document.getElementById('btn-scratchpad-header');
                if (btnSpHeader) btnSpHeader.classList.add('hidden');
                if (scratchpadModal && !scratchpadModal.classList.contains('hidden')) {
                    scratchpadModal.classList.add('hidden');
                }
                showToast("Scratchpad access was revoked by Host.", "warning");
            } else if (data.type === 'NUCLEAR_VOTE_UPDATE') {
                if (typeof updateNuclearModalUI === 'function') {
                    updateNuclearModalUI(data.folderId, data.current, data.required);
                }
            } else if (data.type === 'NUCLEAR_UNLOCK_SUCCESS') {
                if (typeof handleNuclearUnlockSuccess === 'function') {
                    handleNuclearUnlockSuccess(data.folderId, data.pin);
                }
            } else if (data.type === 'NUCLEAR_VAULT_RESET') {
                if (typeof clientUnlockedVaults !== 'undefined' && clientUnlockedVaults) {
                    delete clientUnlockedVaults[data.folderId];
                }
                if (typeof activeNuclearFolderId !== 'undefined' && activeNuclearFolderId === data.folderId) {
                    const m = document.getElementById('nuclear-vote-modal');
                    if (m) m.classList.add('hidden');
                    activeNuclearFolderId = null;
                }
                renderClientExplorer();
            } else if (data.type === 'UPLOAD_COMPLETE') {
                // Let the processClientFiles loop handle the UI and final alert
            } else if (data.type === 'WHITEBOARD_DRAW') {
                if (typeof drawLine === 'function' && wbCanvas) {
                    const w = wbCanvas.width; const h = wbCanvas.height;
                    if (w > 0 && h > 0) {
                        drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.size, data.tool, false);
                    }
                }
            } else if (data.type === 'WHITEBOARD_SHAPE') {
                if (typeof commitShape === 'function' && wbCanvas) {
                    const w = wbCanvas.width; const h = wbCanvas.height;
                    if (w > 0 && h > 0) {
                        commitShape(data.shape, data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.size, data.tool, false);
                    }
                }
            } else if (data.type === 'WHITEBOARD_TEXT') {
                if (typeof commitText === 'function' && wbCanvas) {
                    const w = wbCanvas.width; const h = wbCanvas.height;
                    if (w > 0 && h > 0) {
                        commitText(data.x * w, data.y * h, data.text, data.color, data.size, false);
                    }
                }
            } else if (data.type === 'WHITEBOARD_STAMP') {
                if (typeof stampImageOnWhiteboard === 'function' && wbCanvas) {
                    stampImageOnWhiteboard(data.image, data.x, data.y, data.w, data.h, false);
                }
            } else if (data.type === 'WHITEBOARD_LASER') {
                if (typeof handleLaserPoint === 'function' && wbCanvas) {
                    const w = wbCanvas.width; const h = wbCanvas.height;
                    if (w > 0 && h > 0) {
                        handleLaserPoint(data.x * w, data.y * h, data.color, data.peerName || 'Host');
                    }
                }
            } else if (data.type === 'WHITEBOARD_THEME') {
                if (typeof setWbTheme === 'function') {
                    setWbTheme(data.theme, false);
                }
            } else if (data.type === 'WHITEBOARD_CLEAR') {
                if (typeof clearWhiteboard === 'function') {
                    clearWhiteboard(false);
                } else if (wbCtx && wbCanvas) {
                    wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
                }
            } else if (data.type === 'SCREEN_SHARE_STARTED') {
                showToast(`🖥️ ${data.sharerName || 'Peer'} started screen sharing`, 'info');
            } else if (data.type === 'SCREEN_SHARE_STOPPED') {
                if (typeof closeScreenShareViewer === 'function') closeScreenShareViewer();
                showToast("Screen stream ended by presenter.", "info");
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
                if (data.theme && typeof setWbTheme === 'function') {
                    setWbTheme(data.theme, false);
                }
                if (wbCtx && data.image) {
                    if (typeof initWbCanvasResolution === 'function') initWbCanvasResolution();
                    const img = new Image();
                    img.onload = () => {
                        wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
                        wbCtx.imageSmoothingEnabled = true;
                        wbCtx.imageSmoothingQuality = 'high';
                        wbCtx.drawImage(img, 0, 0, wbCanvas.width, wbCanvas.height);
                        if (typeof saveWbState === 'function') saveWbState(false);
                    };
                    img.src = data.image;
                }
            } else if (data.type === 'WHITEBOARD_DENIED') {
                if (whiteboardModal && !whiteboardModal.classList.contains('hidden')) {
                    whiteboardModal.classList.add('hidden');
                }
                showToast("Host has not granted whiteboard permission.", "warning");
            } else if (data.type === 'SCRATCHPAD_DENIED') {
                if (scratchpadModal && !scratchpadModal.classList.contains('hidden')) {
                    scratchpadModal.classList.add('hidden');
                }
                showToast("Host has not granted scratchpad permission.", "warning");
            } else if (data.type === 'SCRATCHPAD_UPDATE') {
                globalScratchpadContent = data.text;
                if (scratchpadModal && !scratchpadModal.classList.contains('hidden') && scratchpadTextarea && scratchpadTextarea.value !== data.text) {
                    const start = scratchpadTextarea.selectionStart;
                    const end = scratchpadTextarea.selectionEnd;
                    scratchpadTextarea.value = data.text;
                    scratchpadTextarea.setSelectionRange(start, end);
                }
            
            } else if (data.type === 'NETWORK_MAP') {
                const map = data.peers;
                map.forEach(peerId => {
                    if (peerId !== peer.id && !swarmConnections.find(c => c.peer === peerId)) {
                        // Deterministic initiator: only connect if my peer.id is alphabetically less than peerId
                        if (peer.id < peerId) {
                            const conn = peer.connect(peerId, { reliable: true });
                            setupSwarmPeerConnection(conn);
                        }
                    }
                });
            } else if (data.type === 'KICK') {
                if (peer && !peer.destroyed) {
                    try { peer.destroy(); } catch(e) {}
                }
                alert("You have been disconnected from the session by the host.");
                window.location.href = window.location.origin + window.location.pathname;
            } else if (data.type === 'PEER_LIST') {
                activePeers = {};
                data.peers.forEach(p => activePeers[p.id] = p);
                if (data.host) window.hostPeerInfo = data.host;
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
                cyberAlert("Incorrect Native Vault PIN.", "AUTH ERROR", true);
            } else if (data.type === 'NATIVE_VAULT_ACCESS_DENIED') {
                cyberAlert("The Host denied your request to access the Native Vault.", "ACCESS DENIED", true);
                guestOtpEntryModal.classList.add('hidden');
            } else if (data.type === 'FOLDER_AUTH_SUCCESS') {
                folderPasswordModal.classList.add('hidden');
                autoEnterFolderId = activeAuthFolderId;
                // The updated TREE will arrive next and we can navigate in
            } else if (data.type === 'FOLDER_AUTH_FAIL') {
                folderPasswordError.classList.remove('hidden');
            } else if (data.type === 'BURN_NOTICE') {
                isBurnSequenceActive = true;
                playBurnAlarm();
                startBurnCountdown(data.seconds);
            } else if (data.type === 'HONEYPOT_LOCKDOWN') {
                document.getElementById('lockdown-overlay').classList.remove('hidden');
            } else if (data.type === 'SERVER_BURNED') {
                isServerBurned = true;
                if (burnTimerInterval) {
                    clearInterval(burnTimerInterval);
                    burnTimerInterval = null;
                }
                if (burnOverlay) burnOverlay.style.display = 'none';
                triggerBurnSequence();
            }
        });
        
        hostConnection.on('close', () => {
            if (isServerBurned || isBurnSequenceActive) {
                triggerBurnSequence();
                return;
            }
            updateStatus('HOST DISCONNECTED', 'offline');
        });
    });
    }

    setupClientPeer();

    const btnSwitchToHost = document.getElementById('btn-switch-to-host');
    if (btnSwitchToHost) {
        btnSwitchToHost.addEventListener('click', () => {
            window.location.href = window.location.origin + window.location.pathname;
        });
    }
    
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

    if (clientPasswordInput) {
        clientPasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                btnSubmitPassword.click();
            }
        });
    }
    
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
        await cyberAlert("The host has disabled guest uploads.", "PERMISSION RESTRICTED", true);
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
        if (activeMediaStreamDownloader) {
            activeMediaStreamDownloader.abort();
            activeMediaStreamDownloader = null;
        }
        mediaModal.classList.add('hidden');
        mediaContainer.innerHTML = ''; // Stop playback
        const bufferContainer = document.getElementById('stream-buffer-container');
        if (bufferContainer) bufferContainer.classList.add('hidden');
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

btnRequestFile.addEventListener('click', async () => {
    if (activePreviewFileId) {
        btnRequestFile.classList.add("hidden");
        const loaderContainer = document.getElementById("preview-loader-container");
        if (loaderContainer) loaderContainer.classList.remove("hidden");

        const cachedMeta = await getCachedTransferMeta(activePreviewFileId);
        if (cachedMeta && cachedMeta.receivedIndices && cachedMeta.receivedIndices.length > 0 && cachedMeta.receivedIndices.length < cachedMeta.totalChunks) {
            showToast(`Resuming transfer: ${cachedMeta.receivedIndices.length}/${cachedMeta.totalChunks} chunks in cache`);
        }

        startSwarmDownload(activePreviewFileId);
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
        
        const safeName = escapeHtml(child.name);
        const safeThumb = sanitizeThumbnailUrl(child.thumbnail);
        const icon = safeThumb ? `<div class="item-thumbnail" style="background-image: url('${safeThumb}');"></div>` : (child.type === 'folder' ? 
            `<svg class="item-icon folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>${child.isLocked || child.password ? '<rect x="15" y="15" width="8" height="8" fill="var(--bg-card)" stroke="none"></rect><rect x="16" y="18" width="6" height="4" rx="1" fill="var(--neon-red)" stroke="var(--neon-red)"></rect><path d="M17 18V16a2 2 0 0 1 4 0v2" stroke="var(--neon-red)"></path>' : ''}</svg>` : 
            `<svg class="item-icon file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`);
            
        const sizeText = (typeof child.size === 'number' && child.size > 0) ? `<div class="item-meta">${(child.size / 1024 / 1024).toFixed(2)} MB</div>` : '';
        const burnIcon = child.isBurn ? '🔥 ' : '';
        const nuclearIcon = child.isNuclear ? '☢️ ' : '';
        const checkboxHtml = `<div class="item-select-checkbox" data-id="${child.id}" title="Select"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`;
        item.innerHTML = `${checkboxHtml}${icon}<div class="item-name" title="${safeName}">${burnIcon}${nuclearIcon}${safeName}</div>${sizeText}`;
        item.draggable = true;

        if (clientSelectedNodes.has(child.id)) item.classList.add('selected');

        const chk = item.querySelector('.item-select-checkbox');
        if (chk) {
            chk.addEventListener('click', (e) => {
                e.stopPropagation();
                if (clientSelectedNodes.has(child.id)) {
                    clientSelectedNodes.delete(child.id);
                    item.classList.remove('selected');
                } else {
                    clientSelectedNodes.add(child.id);
                    item.classList.add('selected');
                }
                lastSelectedClientIndex = itemsToRender.indexOf(child);
                updateBatchBar();
            });
        }
        
        item.addEventListener('dragstart', (e) => {
            if (!myPermissions || !myPermissions.delete) { e.preventDefault(); return; }
            if (!clientSelectedNodes.has(child.id)) {
                clientSelectedNodes.clear();
                document.querySelectorAll('#client-file-grid .file-item.selected').forEach(el => el.classList.remove('selected'));
                clientSelectedNodes.add(child.id);
                item.classList.add('selected');
                updateBatchBar();
            }
            e.dataTransfer.setData('application/json', JSON.stringify(Array.from(clientSelectedNodes)));
            e.dataTransfer.setData('text/plain', child.id);
            e.dataTransfer.effectAllowed = 'move';
        });

        if (child.type === 'folder') {
            item.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; item.style.background = 'rgba(255,255,255,0.1)'; });
            item.addEventListener('dragleave', () => item.style.background = 'transparent');
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.style.background = 'transparent';
                if (!myPermissions || !myPermissions.delete) return;
                try {
                    const ids = JSON.parse(e.dataTransfer.getData('application/json'));
                    if (Array.isArray(ids) && hostConnection && hostConnection.open) {
                        ids.forEach(id => {
                            if (id !== child.id) {
                                hostConnection.send({ type: 'CLIENT_MOVE_NODE', id, targetFolderId: child.id });
                            }
                        });
                        clientSelectedNodes.clear();
                        updateBatchBar();
                        return;
                    }
                } catch(err) {}
                const nodeId = e.dataTransfer.getData('text/plain');
                if (nodeId && nodeId !== child.id && hostConnection && hostConnection.open) {
                    hostConnection.send({ type: 'CLIENT_MOVE_NODE', id: nodeId, targetFolderId: child.id });
                }
            });
        }
        
        item.addEventListener('click', (e) => {
            const curIdx = itemsToRender.indexOf(child);
            if (isSelectModeClient) {
                if (clientSelectedNodes.has(child.id)) {
                    clientSelectedNodes.delete(child.id);
                    item.classList.remove('selected');
                } else {
                    clientSelectedNodes.add(child.id);
                    item.classList.add('selected');
                }
                lastSelectedClientIndex = curIdx;
                updateBatchBar();
                return;
            }

            if (e.shiftKey && lastSelectedClientIndex !== -1) {
                const start = Math.min(lastSelectedClientIndex, curIdx);
                const end = Math.max(lastSelectedClientIndex, curIdx);
                for (let i = start; i <= end; i++) {
                    clientSelectedNodes.add(itemsToRender[i].id);
                }
                const domItems = clientExplorerGrid.querySelectorAll('.file-item');
                domItems.forEach((el, idx) => {
                    if (idx >= start && idx <= end) el.classList.add('selected');
                });
                updateBatchBar();
                return;
            }

            if (e.metaKey || e.ctrlKey) {
                if (clientSelectedNodes.has(child.id)) {
                    clientSelectedNodes.delete(child.id);
                    item.classList.remove('selected');
                } else {
                    clientSelectedNodes.add(child.id);
                    item.classList.add('selected');
                }
                lastSelectedClientIndex = curIdx;
                updateBatchBar();
                return;
            }

            if (clientSelectedNodes.size > 0) {
                clientSelectedNodes.clear();
                document.querySelectorAll('#client-file-grid .file-item.selected').forEach(el => el.classList.remove('selected'));
                updateBatchBar();
            }
            if (child.type === 'folder') {
                if (child.isNuclear && !clientUnlockedVaults[child.id]) {
                    openNuclearModal(child);
                } else if (child.isLocked && !child.isUnlocked) {
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
                    
                    const handleClientVaultUnlock = async () => {
                        const pass = vaultPasswordInput.value;
                        if (!pass) return await cyberAlert("Password required to access this Vault", "VAULT SECURITY", true);
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
                btnRequestFile.classList.remove("hidden");
                btnRequestFile.textContent = "DOWNLOAD FILE";

                const lowerName = child.name.toLowerCase();
                const isMedia = (child.mime && (child.mime.startsWith('video/') || child.mime.startsWith('audio/'))) || 
                                lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.ogg') ||
                                lowerName.endsWith('.mp3') || lowerName.endsWith('.wav') || lowerName.endsWith('.m4a');

                if (btnStreamDirect) {
                    if (isMedia) {
                        btnStreamDirect.classList.remove('hidden');
                        btnStreamDirect.style.display = 'block';
                        btnStreamDirect.textContent = "⚡ STREAM MEDIA (TORRENT PLAYER)";
                        btnStreamDirect.onclick = () => {
                            startMediaStream(child.id, child.name, child.mime, child.size);
                        };
                    } else {
                        btnStreamDirect.classList.add('hidden');
                        btnStreamDirect.style.display = 'none';
                    }
                }

                const previewIconEl = document.getElementById("preview-icon");
                const safeThumb = sanitizeThumbnailUrl(child.thumbnail);
                if (safeThumb) {
                    previewIconEl.innerHTML = `<div style="width: 100px; height: 100px; margin: 0 auto; background-image: url('${safeThumb}'); background-size: cover; background-position: center; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 16px rgba(0,0,0,0.5);"></div>`;
                } else {
                    previewIconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 80px; height: 80px; color: var(--neon-blue);"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
                }
                
                previewModal.classList.remove('hidden');
            }
        });

        item.addEventListener('dblclick', () => {
            if (child.type === 'file') {
                const lowerName = child.name.toLowerCase();
                const isMedia = (child.mime && (child.mime.startsWith('video/') || child.mime.startsWith('audio/'))) || 
                                lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.ogg') ||
                                lowerName.endsWith('.mp3') || lowerName.endsWith('.wav') || lowerName.endsWith('.m4a');
                if (isMedia) {
                    startMediaStream(child.id, child.name, child.mime, child.size);
                }
            }
        });
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            contextTargetId = child.id;
            if (!clientSelectedNodes.has(child.id)) {
                clientSelectedNodes.clear();
                document.querySelectorAll('#client-file-grid .file-item.selected').forEach(el => el.classList.remove('selected'));
                clientSelectedNodes.add(child.id);
                item.classList.add('selected');
                updateBatchBar();
            }
            const delLabel = document.getElementById('ctx-delete-label');
            if (delLabel) {
                delLabel.textContent = clientSelectedNodes.size > 1 ? `Delete (${clientSelectedNodes.size} items)` : 'Delete';
            }
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.classList.remove('hidden');
            
            // Hide host-only options
            if (document.getElementById('ctx-deaddrop')) document.getElementById('ctx-deaddrop').style.display = 'none';
            if (document.getElementById('ctx-magic-link')) document.getElementById('ctx-magic-link').style.display = 'none';
            if (document.getElementById('ctx-lock')) document.getElementById('ctx-lock').style.display = 'none';
            if (document.getElementById('ctx-honeypot')) document.getElementById('ctx-honeypot').style.display = 'none';
            if (document.getElementById('ctx-multisig')) document.getElementById('ctx-multisig').style.display = 'none';
            
            const hasPrivileges = myPermissions && (myPermissions.upload || myPermissions.edit);
            if (document.getElementById('ctx-burn')) document.getElementById('ctx-burn').style.display = hasPrivileges ? 'flex' : 'none';
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
            
            // Check for BURN-AFTER-READING
            if (fileId && hostConnection && hostConnection.open) {
                const node = findClientNode(clientVFS, fileId);
                if (node && node.isBurn) {
                    hostConnection.send({ type: 'BURN_CONSUMED', fileId: fileId });
                }
            }
            return;
        }
        
        // If preview mode
        if (fileId && hostConnection && hostConnection.open) {
            const node = findClientNode(clientVFS, fileId);
            if (node && node.isBurn) {
                hostConnection.send({ type: 'BURN_CONSUMED', fileId: fileId });
            }
        }
        
        const lowerName = name.toLowerCase();
        const isMedia = (mime && (mime.startsWith('video/') || mime.startsWith('audio/') || mime.startsWith('image/'))) || 
                        lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.ogg') ||
                        lowerName.endsWith('.mp3') || lowerName.endsWith('.wav') ||
                        lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.gif');
        const isText = lowerName.endsWith('.txt') || lowerName.endsWith('.md');
        
        if (isMedia) {
            btnDownloadDirect.href = url;
            btnDownloadDirect.download = name;
            btnDownloadDirect.classList.remove('hidden');
            btnDownloadDirect.style.display = "block";
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

    const dc = conn.dataChannel || conn._dc;
    const HIGH_WATER_MARK = 512 * 1024; // 512 KB pipelined buffer
    const LOW_WATER_MARK = 128 * 1024;  // 128 KB resume threshold

    if (dc && typeof dc.bufferedAmount === 'number') {
        try {
            dc.bufferedAmountLowThreshold = LOW_WATER_MARK;
        } catch(e) {}
    }

    let lastBeamTime = 0;

    for (let i = 0; i < totalChunks; i++) {
        if (!conn.open || isServerBurned) {
            console.warn("Connection closed during transfer, aborting:", fileId);
            failTransfer(fileId, 'DISCONNECTED');
            break;
        }

        // High-efficiency event-driven flow control:
        // If data channel buffer exceeds high water mark, wait until it drains below low water mark
        if (dc && typeof dc.bufferedAmount === 'number' && dc.bufferedAmount > HIGH_WATER_MARK) {
            await new Promise(resolve => {
                let resolved = false;
                const onBufferedAmountLow = () => {
                    if (!resolved) {
                        resolved = true;
                        if (dc.removeEventListener) {
                            dc.removeEventListener('bufferedamountlow', onBufferedAmountLow);
                        }
                        resolve();
                    }
                };
                if (dc.addEventListener) {
                    dc.addEventListener('bufferedamountlow', onBufferedAmountLow, { once: true });
                }
                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        if (dc.removeEventListener) {
                            dc.removeEventListener('bufferedamountlow', onBufferedAmountLow);
                        }
                        resolve();
                    }
                }, 80);
            });
            if (!conn.open || isServerBurned) break;
        }

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileBlob.size);
        const chunk = fileBlob.slice(start, end);
        const arrayBuffer = await chunk.arrayBuffer();

        try {
            conn.send({ type: typeStr, id: fileId, index: i, chunk: arrayBuffer });
            updateTransferProgress(fileId, arrayBuffer.byteLength, fileBlob.size);

            const now = Date.now();
            if (window.triggerCyberspaceBeam && (now - lastBeamTime > 250)) {
                lastBeamTime = now;
                const isH = typeof isHost !== 'undefined' && isHost;
                const fromId = isH ? 'host' : (peer ? peer.id : 'unknown');
                const toId = isH ? conn.peer : 'host';
                window.triggerCyberspaceBeam(fromId, toId, isH ? '#39ff14' : '#00f0ff');
            }
            if (i === totalChunks - 1) finishTransfer(fileId);
        } catch (e) {
            console.warn("Chunk send error, retrying...", e);
            try {
                await new Promise(r => setTimeout(r, 200));
                if (!conn.open || isServerBurned) { failTransfer(fileId, 'ABORTED'); break; }
                conn.send({ type: typeStr, id: fileId, index: i, chunk: arrayBuffer });
                updateTransferProgress(fileId, arrayBuffer.byteLength, fileBlob.size);
                if (i === totalChunks - 1) finishTransfer(fileId);
            } catch (err) {
                console.error("Unrecoverable chunk error", err);
                failTransfer(fileId, 'FAILED');
                break;
            }
        }

        // Cooperatively yield event loop every 8 chunks to preserve 60 FPS UI
        if (i % 8 === 0) {
            await new Promise(r => setTimeout(r, 0));
        }
    }
}


function updateStatus(text, state) {
    if (isServerBurned || !statusText || !statusDot) return;
    statusText.textContent = text;
    statusDot.className = `status-dot ${state}`;
}


// --- V14 LOGIC ---
btnChatToggle.addEventListener('click', () => { chatSidebar.classList.toggle('hidden'); chatBadge.classList.add('hidden'); });
btnCloseChat.addEventListener('click', () => chatSidebar.classList.add('hidden'));

function appendChatMessage(sender, text, type, color = 'var(--neon-blue)') {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    
    const senderDiv = document.createElement('div');
    senderDiv.className = 'sender';
    senderDiv.style.color = sanitizeCssColor(color);
    senderDiv.textContent = sender || 'Guest';
    
    const textDiv = document.createElement('div');
    textDiv.textContent = text || '';
    
    msg.appendChild(senderDiv);
    msg.appendChild(textDiv);
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
                            const encData = await encryptFile(buffer, pass, node.salt);
                            fileBlob = new Blob([encData.encrypted], { type: 'text/plain' });
                            node.iv = encData.iv;
                            node.salt = encData.salt;
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
                        const encData = await encryptFile(buffer, pass, existing.salt);
                        finalBlob = new Blob([encData.encrypted], { type: file.type });
                        existing.iv = encData.iv;
                        existing.salt = encData.salt;
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
                        const buffer = await file.arrayBuffer();
                        const encData = await encryptFile(buffer, pass);
                        const encryptedBlob = new Blob([encData.encrypted], { type: file.type });
                        
                        node.fileObj = new File([encryptedBlob], name, { type: file.type });
                        node.size = encryptedBlob.size;
                        node.isEncrypted = true;
                        node.salt = encData.salt;
                        node.iv = encData.iv;
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
                cyberAlert("You do not have permission to upload files.", "PERMISSION RESTRICTED", true);
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
                        await cyberAlert("Failed to decrypt: " + e.message, "DECRYPTION ERROR", true);
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
                            await cyberAlert("Failed to decrypt: " + e.message, "DECRYPTION ERROR", true);
                        }
                    }
                } else {
                    await cyberAlert("Cannot preview this file type.", "PREVIEW NOT AVAILABLE");
                }
            } else if (node.type === 'folder') {
                if (node.isVault && !unlockedVaults[node.id]) {
                    vaultPasswordModal.classList.remove('hidden');
                    vaultPasswordInput.value = '';
                    const handleUnlock = async () => {
                        const pass = vaultPasswordInput.value;
                        if (!pass) return await cyberAlert("Password required", "VAULT SECURITY", true);
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
                btnRequestFile.classList.remove("hidden");
                btnRequestFile.textContent = "DOWNLOAD FILE";

                const lowerName = node.name.toLowerCase();
                const isMedia = (node.mime && (node.mime.startsWith('video/') || node.mime.startsWith('audio/'))) || 
                                lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.ogg') ||
                                lowerName.endsWith('.mp3') || lowerName.endsWith('.wav') || lowerName.endsWith('.m4a');

                if (btnStreamDirect) {
                    if (isMedia) {
                        btnStreamDirect.classList.remove('hidden');
                        btnStreamDirect.style.display = 'block';
                        btnStreamDirect.textContent = "⚡ STREAM MEDIA (TORRENT PLAYER)";
                        btnStreamDirect.onclick = () => {
                            startMediaStream(node.id, node.name, node.mime, node.size);
                        };
                    } else {
                        btnStreamDirect.classList.add('hidden');
                        btnStreamDirect.style.display = 'none';
                    }
                }

                const previewIconEl = document.getElementById("preview-icon");
                const safeThumb = sanitizeThumbnailUrl(node.thumbnail);
                if (safeThumb) {
                    previewIconEl.innerHTML = `<div style="width: 100px; height: 100px; margin: 0 auto; background-image: url('${safeThumb}'); background-size: cover; background-position: center; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 16px rgba(0,0,0,0.5);"></div>`;
                } else {
                    previewIconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 80px; height: 80px; color: var(--neon-blue);"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
                }
                previewModal.classList.remove('hidden');
            } else if (node.type === 'folder') {
                if (node.isVault && !clientUnlockedVaults[node.id]) {
                    vaultPasswordModal.classList.remove('hidden');
                    vaultPasswordInput.value = '';
                    const handleClientVaultUnlock = async () => {
                        const pass = vaultPasswordInput.value;
                        if (!pass) return await cyberAlert("Password required", "VAULT SECURITY", true);
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
                    await cyberAlert("Failed to decrypt: " + e.message, "DECRYPTION ERROR", true);
                }
            } else if (node && node.type === 'folder') {
                try {
                    showToast("Zipping folder: " + node.name + "...");
                    const zip = new JSZip();
                    async function addNodeToZip(curNode, curZip) {
                        for (const child of (curNode.children || [])) {
                            if (child.type === 'folder') {
                                const subZip = curZip.folder(child.name);
                                await addNodeToZip(child, subZip);
                            } else if (child.type === 'file') {
                                const fileData = await getDecryptedFileObj(child);
                                if (fileData) curZip.file(child.name, fileData);
                            }
                        }
                    }
                    await addNodeToZip(node, zip);
                    const blob = await zip.generateAsync({ type: 'blob' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${node.name || 'folder'}.zip`;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
                } catch (err) {
                    console.error("Folder zip error:", err);
                    await cyberAlert("Failed to zip folder: " + err.message, "DOWNLOAD ERROR", true);
                }
            }
        } else {
            // Guest logic
            const node = findClientNode(clientVFS, contextTargetId);
            if (node && node.type === 'file') {
                activePreviewFileId = null; // We are just downloading, not editing
                startSwarmDownload(node.id);
            }
        }
        
        contextTargetId = null;
        contextMenu.classList.add('hidden');
    });
}


ctxLock.addEventListener('click', async () => {
    if (!contextTargetId) return;
    const node = vfs.findNode(contextTargetId);
    contextTargetId = null;
    contextMenu.classList.add('hidden');

    if (node && node.type === 'folder') {
        targetLockFolderNode = node;
        if (setFolderPasswordModal) {
            if (node.password) {
                if (setFolderPasswordTitle) setFolderPasswordTitle.textContent = "Folder Security: " + node.name;
                if (setFolderPasswordDesc) setFolderPasswordDesc.textContent = "This folder is currently password-protected. You can update its password, link Touch ID / Face ID, or remove the lock entirely.";
                if (setFolderPasswordInput) {
                    setFolderPasswordInput.value = '';
                    setFolderPasswordInput.placeholder = "Enter new password (or leave blank)";
                }
                if (btnConfirmSetFolderPassword) btnConfirmSetFolderPassword.textContent = "UPDATE PASSWORD";
                if (setFolderRemoveContainer) setFolderRemoveContainer.classList.remove('hidden');
            } else {
                if (setFolderPasswordTitle) setFolderPasswordTitle.textContent = "Lock Folder: " + node.name;
                if (setFolderPasswordDesc) setFolderPasswordDesc.textContent = "Set a password to lock this folder. Guests will need this password or linked Biometrics to access its contents.";
                if (setFolderPasswordInput) {
                    setFolderPasswordInput.value = '';
                    setFolderPasswordInput.placeholder = "Enter Folder Password";
                }
                if (btnConfirmSetFolderPassword) btnConfirmSetFolderPassword.textContent = "LOCK FOLDER";
                if (setFolderRemoveContainer) setFolderRemoveContainer.classList.add('hidden');
            }
            updateSetFolderBiometricUI();
            setFolderPasswordModal.classList.remove('hidden');
            if (setFolderPasswordInput) setTimeout(() => setFolderPasswordInput.focus(), 60);
        }
    } else {
        await cyberAlert("You can only lock folders.", "NOTICE");
    }
});

const ctxMultisig = document.getElementById('ctx-multisig');
if (ctxMultisig) {
    ctxMultisig.addEventListener('click', async () => {
        if (!contextTargetId) return;
        const targetId = contextTargetId;
        contextTargetId = null;
        contextMenu.classList.add('hidden');

        const node = vfs.findNode(targetId);
        if (node && node.type === 'folder') {
            if (node.isNuclear) {
                const confirmed = await cyberConfirm("Disarm this Nuclear Vault?", "NUCLEAR PROTOCOL");
                if (confirmed) {
                    delete node.isNuclear;
                    delete node.nuclearVotesRequired;
                    delete node.password;
                    delete unlockedVaults[node.id];
                    if (activeNuclearVotes[node.id]) delete activeNuclearVotes[node.id];
                    connections.forEach(c => {
                        if (c.unlockedFolders) c.unlockedFolders.delete(node.id);
                        if (c.open) {
                            try { c.send({ type: 'NUCLEAR_VAULT_RESET', folderId: node.id }); } catch(e) {}
                        }
                    });
                    showToast("Nuclear Vault Disarmed");
                    saveVFSToDB();
                    renderHostExplorer();
                    broadcastTree();
                }
            } else {
                const activeGuests = connections.filter(c => c && c.open).length;
                let required = 1;
                if (activeGuests > 1) {
                    const requiredStr = await cyberPrompt(`You have ${activeGuests} guests connected. How many Guest approvals are required to unlock?`, "2", "NUCLEAR PROTOCOL");
                    if (requiredStr === null) return;
                    required = Math.max(1, Math.min(parseInt(requiredStr, 10) || 1, activeGuests));
                    await new Promise(r => setTimeout(r, 80));
                }

                const promptMsg = activeGuests <= 1 
                    ? "Enter Nuclear Launch Code (1 Guest approval required):" 
                    : `Enter Nuclear Launch Code (${required} Guest approvals required):`;
                const pwd = await cyberPrompt(promptMsg, "", "ARM NUCLEAR VAULT");
                if (pwd && pwd.trim()) {
                    node.isNuclear = true;
                    node.nuclearVotesRequired = required;
                    node.password = pwd.trim();
                    delete unlockedVaults[node.id];
                    if (activeNuclearVotes[node.id]) delete activeNuclearVotes[node.id];
                    connections.forEach(c => {
                        if (c.unlockedFolders) c.unlockedFolders.delete(node.id);
                        if (c.open) {
                            try { c.send({ type: 'NUCLEAR_VAULT_RESET', folderId: node.id }); } catch(e) {}
                        }
                    });
                    showToast(`☢️ Nuclear Vault Armed! (${required} approval${required > 1 ? 's' : ''} required)`);
                    saveVFSToDB();
                    renderHostExplorer();
                    broadcastTree();
                } else if (pwd !== null) {
                    showToast("Launch code cannot be empty", "error");
                }
            }
        } else {
            await cyberAlert("Nuclear Vaults can only be applied to folders.", "NOTICE");
        }
    });
}

const ctxBurn = document.getElementById('ctx-burn');
if (ctxBurn) {
    ctxBurn.addEventListener('click', async () => {
        if (!contextTargetId) return;
        
        if (typeof hostConnection !== 'undefined' && hostConnection && hostConnection.open) {
            const node = findClientNode(clientVFS, contextTargetId);
            if (node && node.type === 'file') {
                const action = node.isBurn ? "Disable" : "Enable";
                if (await cyberConfirm(`${action} Burn-After-Reading? The file will be permanently deleted from the Host after the first guest downloads it.`, "BURN PROTOCOL")) {
                    hostConnection.send({ type: 'CLIENT_TOGGLE_BURN', id: contextTargetId });
                    showToast(`Burn Protocol ${node.isBurn ? "Disabled" : "Enabled"}`);
                }
            } else {
                await cyberAlert("You can only apply Burn Protocol to files.", "NOTICE");
            }
            contextMenu.classList.add('hidden');
            return;
        }

        const node = vfs.findNode(contextTargetId);
        if (node && node.type === 'file') {
            if (node.isBurn) {
                delete node.isBurn;
                showToast("Burn Protocol Disabled");
            } else {
                if (await cyberConfirm("Enable Burn-After-Reading? The file will be permanently deleted from your system after the first guest downloads it.", "BURN PROTOCOL")) {
                    node.isBurn = true;
                    showToast("Burn Protocol Enabled");
                }
            }
            contextTargetId = null;
            contextMenu.classList.add('hidden');
            saveVFSToDB();
            renderHostExplorer();
            broadcastTree();
        } else {
            await cyberAlert("You can only apply Burn Protocol to files.", "NOTICE");
            contextMenu.classList.add('hidden');
        }
    });
}

ctxDelete.addEventListener('click', async () => {
    if (!contextTargetId) return;
    
    const isTargetSelected = isHost ? selectedNodes.has(contextTargetId) : clientSelectedNodes.has(contextTargetId);
    const targetIds = (isTargetSelected && (isHost ? selectedNodes.size : clientSelectedNodes.size) > 1)
        ? Array.from(isHost ? selectedNodes : clientSelectedNodes)
        : [contextTargetId];
    const count = targetIds.length;
    
    if (typeof hostConnection !== 'undefined' && hostConnection && hostConnection.open) {
        if (!myPermissions || !myPermissions.delete) return showToast("Host delete permission required.", "warning");
        const promptMsg = count > 1 ? `Permanently delete ${count} selected items?` : "Are you sure you want to delete this?";
        if (await cyberConfirm(promptMsg, "CONFIRM DELETION", true)) {
            targetIds.forEach(id => hostConnection.send({ type: 'CLIENT_DELETE_NODE', id }));
            clientSelectedNodes.clear();
            contextTargetId = null;
            contextMenu.classList.add('hidden');
            updateBatchBar();
            showToast(`Deletion request sent for ${count} item${count > 1 ? 's' : ''}`);
        }
        return;
    }
    
    const node = vfs.findNode(contextTargetId);
    const promptMsg = count > 1 ? `Permanently delete ${count} selected items?` : `Delete "${node ? node.name : 'item'}" permanently?`;
    if (await cyberConfirm(promptMsg, "CONFIRM DELETION", true)) {
        targetIds.forEach(id => {
            const n = vfs.findNode(id);
            if (n && n.parent) {
                n.parent.children = n.parent.children.filter(c => c.id !== id);
            }
        });
        selectedNodes.clear();
        contextTargetId = null;
        contextMenu.classList.add('hidden');
        saveVFSToDB();
        renderHostExplorer();
        broadcastTree();
        updateBatchBar();
        showToast(`Deleted ${count} item${count > 1 ? 's' : ''}`);
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

// --- MULTI-SELECTION & BATCH ACTIONS SYSTEM ---
function updateBatchBar() {
    const bar = document.getElementById('batch-actions-bar');
    const countText = document.getElementById('batch-count-text');
    if (!bar || !countText) return;
    
    const count = isHost ? selectedNodes.size : (typeof clientSelectedNodes !== 'undefined' ? clientSelectedNodes.size : 0);
    if (count > 0) {
        countText.textContent = `${count} SELECTED`;
        bar.classList.remove('hidden');
    } else {
        bar.classList.add('hidden');
    }
}

function clearAllSelection() {
    selectedNodes.clear();
    if (typeof clientSelectedNodes !== 'undefined') clientSelectedNodes.clear();
    document.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
    updateBatchBar();
}

function openBatchMoveModal() {
    const list = document.getElementById('batch-move-folder-list');
    const modal = document.getElementById('batch-move-modal');
    const countText = document.getElementById('batch-move-count-text');
    if (!list || !modal) return;
    
    const count = isHost ? selectedNodes.size : (typeof clientSelectedNodes !== 'undefined' ? clientSelectedNodes.size : 0);
    if (count === 0) return;
    if (countText) countText.textContent = `${count} item${count > 1 ? 's' : ''}`;
    
    list.innerHTML = '';
    
    const rootNode = isHost ? vfs.root : clientVFS;
    const currentSelected = isHost ? selectedNodes : clientSelectedNodes;
    const folders = [];
    
    function collectFolders(node, path = '') {
        if (!node || node.type !== 'folder') return;
        if (currentSelected.has(node.id)) return;
        
        folders.push({ node, path: path + (node.id === 'root' ? '/ Home' : node.name) });
        if (node.children) {
            node.children.forEach(c => {
                if (c.type === 'folder') collectFolders(c, path + (node.id === 'root' ? '/' : node.name + '/'));
            });
        }
    }
    
    collectFolders(rootNode);
    
    if (folders.length === 0) {
        list.innerHTML = '<div style="color: var(--text-muted); padding: 12px; text-align: center;">No eligible destination folders found.</div>';
    } else {
        folders.forEach(f => {
            const btn = document.createElement('button');
            btn.className = 'custom-btn';
            btn.style.cssText = 'text-align: left; padding: 8px 12px; font-size: 0.82rem; border-color: rgba(255,255,255,0.15); display: flex; align-items: center; gap: 8px; width: 100%; cursor: pointer;';
            btn.innerHTML = `<span style="color: var(--neon-blue);">📁</span> <span style="font-family: var(--font-mono); color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(f.path)}</span>`;
            
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
                const targetFolderId = f.node.id;
                
                if (isHost) {
                    let moved = 0;
                    selectedNodes.forEach(id => {
                        if (id !== targetFolderId && moveNode(id, targetFolderId, false)) moved++;
                    });
                    if (moved > 0) {
                        selectedNodes.clear();
                        saveVFSToDB();
                        renderHostExplorer();
                        broadcastTree();
                        updateBatchBar();
                        showToast(`Moved ${moved} item${moved > 1 ? 's' : ''} to ${f.node.name || 'folder'}`, "success");
                    }
                } else {
                    if (!myPermissions || !myPermissions.delete) {
                        return showToast("Host delete permission required to move files.", "warning");
                    }
                    let countSent = 0;
                    clientSelectedNodes.forEach(id => {
                        if (id !== targetFolderId && hostConnection && hostConnection.open) {
                            hostConnection.send({ type: 'CLIENT_MOVE_NODE', id, targetFolderId });
                            countSent++;
                        }
                    });
                    clientSelectedNodes.clear();
                    updateBatchBar();
                    showToast(`Move request sent for ${countSent} item${countSent > 1 ? 's' : ''}`, "success");
                }
            });
            
            list.appendChild(btn);
        });
    }
    
    modal.classList.remove('hidden');
}

// Batch Actions Buttons wiring
const btnBatchSelectAll = document.getElementById('btn-batch-select-all');
const btnBatchClear = document.getElementById('btn-batch-clear');
const btnBatchDelete = document.getElementById('btn-batch-delete');
const btnBatchMove = document.getElementById('btn-batch-move');
const btnBatchDownload = document.getElementById('btn-batch-download');
const btnCloseBatchMove = document.getElementById('btn-close-batch-move');
const btnCancelBatchMove = document.getElementById('btn-cancel-batch-move');
const batchMoveModal = document.getElementById('batch-move-modal');
const btnSelectModeHost = document.getElementById('btn-select-mode-host');
const btnSelectModeClient = document.getElementById('btn-select-mode-client');

if (btnBatchClear) btnBatchClear.addEventListener('click', clearAllSelection);
if (btnBatchMove) btnBatchMove.addEventListener('click', openBatchMoveModal);
if (btnCloseBatchMove && batchMoveModal) btnCloseBatchMove.addEventListener('click', () => batchMoveModal.classList.add('hidden'));
if (btnCancelBatchMove && batchMoveModal) btnCancelBatchMove.addEventListener('click', () => batchMoveModal.classList.add('hidden'));

if (btnBatchSelectAll) {
    btnBatchSelectAll.addEventListener('click', () => {
        if (isHost) {
            if (vfs.currentDir && vfs.currentDir.children) {
                vfs.currentDir.children.forEach(child => selectedNodes.add(child.id));
                document.querySelectorAll('#host-file-grid .file-item').forEach(el => el.classList.add('selected'));
                updateBatchBar();
            }
        } else {
            if (clientCurrentDir && clientCurrentDir.children) {
                clientCurrentDir.children.forEach(child => clientSelectedNodes.add(child.id));
                document.querySelectorAll('#client-file-grid .file-item').forEach(el => el.classList.add('selected'));
                updateBatchBar();
            }
        }
    });
}

if (btnBatchDelete) {
    btnBatchDelete.addEventListener('click', async () => {
        const count = isHost ? selectedNodes.size : (typeof clientSelectedNodes !== 'undefined' ? clientSelectedNodes.size : 0);
        if (count === 0) return;
        
        if (isHost) {
            if (await cyberConfirm(`Permanently delete ${count} selected item${count > 1 ? 's' : ''}?`, "CONFIRM BATCH DELETE", true)) {
                selectedNodes.forEach(id => {
                    const node = vfs.findNode(id);
                    if (node && node.parent) {
                        node.parent.children = node.parent.children.filter(c => c.id !== id);
                    }
                });
                selectedNodes.clear();
                saveVFSToDB();
                renderHostExplorer();
                broadcastTree();
                updateBatchBar();
                showToast(`Deleted ${count} item${count > 1 ? 's' : ''}`, "info");
            }
        } else {
            if (!myPermissions || !myPermissions.delete) {
                return showToast("Host delete permission required.", "warning");
            }
            if (await cyberConfirm(`Request Host to permanently delete ${count} selected item${count > 1 ? 's' : ''}?`, "CONFIRM BATCH DELETE", true)) {
                clientSelectedNodes.forEach(id => {
                    if (hostConnection && hostConnection.open) {
                        hostConnection.send({ type: 'CLIENT_DELETE_NODE', id });
                    }
                });
                clientSelectedNodes.clear();
                renderClientExplorer();
                updateBatchBar();
                showToast(`Deletion request sent for ${count} items`, "info");
            }
        }
    });
}

if (btnBatchDownload) {
    btnBatchDownload.addEventListener('click', async () => {
        if (isHost) {
            const filesToZip = [];
            selectedNodes.forEach(id => {
                const node = vfs.findNode(id);
                if (node && node.type === 'file' && node.fileObj) {
                    filesToZip.push(node);
                }
            });
            if (filesToZip.length === 0) return showToast("No downloadable files selected.", "warning");
            
            showToast(`Preparing download for ${filesToZip.length} files...`, "info");
            try {
                const zip = new JSZip();
                for (const f of filesToZip) {
                    zip.file(f.name, f.fileObj);
                }
                const blob = await zip.generateAsync({ type: 'blob' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `localcast-selected-${Date.now()}.zip`;
                a.click();
                URL.revokeObjectURL(a.href);
                showToast("Download started!", "success");
            } catch(e) {
                console.error("Batch zip error:", e);
                showToast("Download compression failed", "error");
            }
        } else {
            const fileIds = Array.from(clientSelectedNodes).filter(id => {
                const n = findClientNode(clientVFS, id);
                return n && n.type === 'file';
            });
            if (fileIds.length === 0) return showToast("No downloadable files selected.", "warning");
            showToast(`Requesting ${fileIds.length} file${fileIds.length > 1 ? 's' : ''}...`, "info");
            fileIds.forEach((id, i) => {
                setTimeout(() => {
                    if (hostConnection && hostConnection.open) {
                        hostConnection.send({ type: 'REQUEST_FILE', id });
                    }
                }, i * 350);
            });
        }
    });
}

if (btnSelectModeHost) {
    btnSelectModeHost.addEventListener('click', () => {
        isSelectModeHost = !isSelectModeHost;
        btnSelectModeHost.classList.toggle('active', isSelectModeHost);
        if (hostExplorerGrid) hostExplorerGrid.classList.toggle('select-mode-active', isSelectModeHost);
        if (!isSelectModeHost) {
            selectedNodes.clear();
            document.querySelectorAll('#host-file-grid .file-item.selected').forEach(el => el.classList.remove('selected'));
            updateBatchBar();
        } else {
            showToast("Multi-Select Mode ON: Click items to select", "info");
        }
    });
}

if (btnSelectModeClient) {
    btnSelectModeClient.addEventListener('click', () => {
        isSelectModeClient = !isSelectModeClient;
        btnSelectModeClient.classList.toggle('active', isSelectModeClient);
        if (clientExplorerGrid) clientExplorerGrid.classList.toggle('select-mode-active', isSelectModeClient);
        if (!isSelectModeClient) {
            clientSelectedNodes.clear();
            document.querySelectorAll('#client-file-grid .file-item.selected').forEach(el => el.classList.remove('selected'));
            updateBatchBar();
        } else {
            showToast("Multi-Select Mode ON: Click items to select", "info");
        }
    });
}

if (clientExplorerGrid) {
    clientExplorerGrid.addEventListener('click', (e) => {
        if (e.target === clientExplorerGrid) {
            clearAllSelection();
        }
    });
}

// Global Drop Zone
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
});
document.addEventListener('drop', async (e) => {
    e.preventDefault();
    
    const files = [];
    async function traverseFileTree(item, path = '') {
        if (item.isFile) {
            const file = await new Promise((resolve) => {
                item.file(resolve, (err) => { console.warn("File err:", err); resolve(null); });
            });
            if (file) {
                Object.defineProperty(file, 'webkitRelativePath', { value: path + file.name });
                files.push(file);
            }
        } else if (item.isDirectory) {
            const dirReader = item.createReader();
            const readEntriesBatch = () => new Promise((resolve) => {
                dirReader.readEntries((entries) => resolve(entries || []), (err) => { console.warn("Dir err:", err); resolve([]); });
            });
            let allEntries = [];
            let batch = await readEntriesBatch();
            while (batch && batch.length > 0) {
                allEntries = allEntries.concat(batch);
                batch = await readEntriesBatch();
            }
            for (let i = 0; i < allEntries.length; i++) {
                await traverseFileTree(allEntries[i], path + item.name + '/');
            }
        }
    }
    
    const dtFiles = [];
    if (e.dataTransfer.files) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
            dtFiles.push(e.dataTransfer.files[i]);
        }
    }
    
    if (e.dataTransfer.items) {
        const entries = [];
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
            try {
                if (typeof e.dataTransfer.items[i].webkitGetAsEntry === 'function') {
                    const item = e.dataTransfer.items[i].webkitGetAsEntry();
                    if (item) entries.push(item);
                }
            } catch(err) { console.warn("Drop item extraction error:", err); }
        }
        for (const entry of entries) {
            try {
                await traverseFileTree(entry);
            } catch(err) { console.warn("Tree traversal error:", err); }
        }
    }
    
    if (files.length === 0 && dtFiles.length > 0) {
        for (let i = 0; i < dtFiles.length; i++) {
            files.push(dtFiles[i]);
        }
    }
    
    if (files.length === 0) {
        if (typeof showToast === 'function') showToast("Drop received, but no valid files found. (If dragging from Mac Photos, drag to Desktop first!)");
        return;
    }
    
    if (typeof showToast === 'function') showToast(`Processing ${files.length} dragged items...`);
    
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

ctxRename.addEventListener('click', async () => {
    if (!contextTargetId) return;
    
    if (typeof hostConnection !== 'undefined' && hostConnection && hostConnection.open) {
        const newName = await cyberPrompt("Enter new name:", "", "RENAME ITEM");
        if (newName && newName.trim()) {
            hostConnection.send({ type: 'CLIENT_RENAME_NODE', id: contextTargetId, newName: newName.trim() });
            contextMenu.classList.add('hidden');
        }
        return;
    }
    
    const node = vfs.findNode(contextTargetId);
    if (node) {
        const newName = await cyberPrompt("Enter new name:", node.name, "RENAME ITEM");
        if (newName && newName.trim()) {
            node.name = newName.trim();
            saveVFSToDB();
            renderHostExplorer();
            broadcastTree();
            showToast("Item renamed");
        }
    }
    contextMenu.classList.add('hidden');
});

function searchVFS(dir, query, results) {
    if (!dir || !Array.isArray(dir.children)) return;
    dir.children.forEach(c => {
        if (c && c.name && c.name.toLowerCase().includes(query)) results.push(c);
        if (c && c.type === 'folder') searchVFS(c, query, results);
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
    // START DYNAMIC CYBER BOOT SEQUENCE
    const bootElement = document.getElementById('boot-sequence');
    const bootTerminal = document.getElementById('boot-terminal');
    const btnSkipBoot = document.getElementById('btn-skip-boot');
    const btnBootMute = document.getElementById('btn-boot-mute');
    
    let bootCompleted = false;

    // Check sound mute state
    let isSoundMuted = localStorage.getItem('localcast_sound_muted') === 'true';
    if (btnBootMute) {
        btnBootMute.addEventListener('click', (e) => {
            e.stopPropagation();
            isSoundMuted = !isSoundMuted;
            localStorage.setItem('localcast_sound_muted', isSoundMuted);
            showToast(isSoundMuted ? "Audio feedback muted" : "Audio feedback enabled");
            btnBootMute.style.color = isSoundMuted ? 'var(--text-muted)' : 'var(--neon-blue)';
        });
        if (isSoundMuted) btnBootMute.style.color = 'var(--text-muted)';
    }

    const flyingFilesContainer = document.querySelector('.flying-files-container');
    if (flyingFilesContainer) {
        for (let i = 0; i < 40; i++) {
            const file = document.createElement('div');
            file.className = 'flying-file';
            file.style.setProperty('--startX', (Math.random() * 200 - 100) + 'vw');
            file.style.setProperty('--startY', (Math.random() * 200 - 100) + 'vh');
            file.style.setProperty('--endX', (Math.random() * 200 - 100) + 'vw');
            file.style.setProperty('--endY', (Math.random() * 200 - 100) + 'vh');
            file.style.setProperty('--rotX', (Math.random() * 720 - 360) + 'deg');
            file.style.setProperty('--rotY', (Math.random() * 720 - 360) + 'deg');
            file.style.animationDuration = (2 + Math.random() * 3) + 's';
            file.style.animationDelay = (Math.random() * 2) + 's';
            flyingFilesContainer.appendChild(file);
        }
    }

    const logSteps = [
        { text: '> [SYS_INIT] Initializing Zero-Knowledge Cryptographic Engine...', class: 'boot-line' },
        { text: '> [KEY_GEN] AES-GCM 256-bit ephemeral keys derived via PBKDF2.', class: 'boot-line accent' },
        { text: '> [ICE_MESH] Calibrating WebRTC DataMesh & Swarm Router...', class: 'boot-line' },
        { text: '> [VFS_MOUNT] Mounting IndexedDB Virtual Encrypted Storage...', class: 'boot-line' },
        { text: '> [RADAR_CAL] Aligning Proximity Radar & Peer Discovery Protocol...', class: 'boot-line' },
        { text: '> [READY] Mesh Active. Zero-Knowledge Handshake Established.', class: 'boot-line success' }
    ];

    const finishBoot = () => {
        if (bootCompleted) return;
        bootCompleted = true;
        if (bootElement) {
            bootElement.classList.add('inactive');
            playCyberChime(1046.5, 'triangle', 0.4); // C6 chime on enter
            setTimeout(() => {
                if (bootElement.parentNode) bootElement.remove();
            }, 800);
        }
    };

    if (btnSkipBoot) {
        btnSkipBoot.addEventListener('click', finishBoot);
    }
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') finishBoot();
    }, { once: true });

    // Stream telemetry lines dynamically (runs concurrently with app/peer init)
    if (bootTerminal) {
        (async () => {
            try {
                for (let i = 0; i < logSteps.length; i++) {
                    if (bootCompleted) break;
                    const step = logSteps[i];
                    const line = document.createElement('div');
                    line.className = step.class;
                    line.textContent = step.text;
                    bootTerminal.appendChild(line);
                    bootTerminal.scrollTop = bootTerminal.scrollHeight;
                    playCyberChime(350 + i * 110, 'sine', 0.08);
                    await new Promise(r => setTimeout(r, 260));
                }
                await new Promise(r => setTimeout(r, 400));
            } catch(e) {}
            finishBoot();
        })();
    } else {
        finishBoot();
    }

    try {
        await initDB();
    } catch(e) {
        console.warn("DB init warning:", e);
    }
    
    // CHECK FOR PENDING MOBILE SHARED FILES
    try {
        const db = await new Promise((resolve, reject) => {
            const req = indexedDB.open('LocalCastShareDB', 1);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
            req.onupgradeneeded = () => { req.transaction.abort(); resolve(null); }; // DB doesn't exist
        });
        if (db) {
            const tx = db.transaction('shares', 'readwrite');
            const req = tx.objectStore('shares').get('pending_files');
            req.onsuccess = () => {
                const files = req.result;
                if (files && files.length > 0) {
                    showToast(`Intercepted ${files.length} file(s) from mobile Share menu!`);
                    if (typeof processFiles === 'function') processFiles(files);
                    tx.objectStore('shares').delete('pending_files');
                }
            };
        }
    } catch(e) { console.warn("No pending share files."); }
    
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
let logicInitialized = false;
function triggerInitLogic() {
    if (logicInitialized) return;
    logicInitialized = true;
    initLogic();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    triggerInitLogic();
} else {
    document.addEventListener('DOMContentLoaded', triggerInitLogic);
    window.addEventListener('load', triggerInitLogic);
}


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
const btnScratchpadClient = document.getElementById('btn-scratchpad-client');
const btnScratchpadHeader = document.getElementById('btn-scratchpad-header');
const btnSpPermissions = document.getElementById('btn-sp-permissions');
const spPermissionsPopover = document.getElementById('sp-permissions-popover');
const spGuestList = document.getElementById('sp-guest-list');
const btnSpAllowAll = document.getElementById('btn-sp-allow-all');
const btnSpRevokeAll = document.getElementById('btn-sp-revoke-all');
const spPermCount = document.getElementById('sp-perm-count');
const spHostControls = document.getElementById('sp-host-controls');

let globalScratchpadContent = ''; // Used by Host

function renderSpGuestList() {
    if (!isHost) {
        if (spHostControls) spHostControls.style.display = 'none';
        return;
    }
    if (spHostControls) spHostControls.style.display = 'inline-block';
    if (!spGuestList) return;
    
    const activeConns = connections.filter(c => c.open && c.isAuthenticated);
    const allowedConns = activeConns.filter(c => c.permissions && c.permissions.scratchpad);
    if (spPermCount) spPermCount.textContent = `${allowedConns.length}/${activeConns.length}`;
    
    if (activeConns.length === 0) {
        spGuestList.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 12px 0;">No guests currently connected</div>`;
        return;
    }
    
    spGuestList.innerHTML = '';
    activeConns.forEach(c => {
        const alias = (c.profile && c.profile.name) || c.guestAlias || ('Peer ' + c.peer.substring(0, 6));
        const safeAlias = escapeHtml(alias);
        const safeColor = sanitizeCssColor((c.profile && c.profile.color) || c.guestColor || 'var(--neon-purple)');
        const isAllowed = !!(c.permissions && c.permissions.scratchpad);
        
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: rgba(255,255,255,0.04); border-radius: 6px;';
        row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; max-width: 170px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${safeColor}; flex-shrink: 0;"></span>
                <span style="color: #fff; font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 0.82rem;">${safeAlias}</span>
            </div>
            <label class="switch" style="transform: scale(0.85); margin-right: -4px;">
                <input type="checkbox" class="sp-peer-toggle" data-peer="${c.peer}" ${isAllowed ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        `;
        spGuestList.appendChild(row);
    });
    
    spGuestList.querySelectorAll('.sp-peer-toggle').forEach(input => {
        input.addEventListener('change', (e) => {
            const peerId = e.target.dataset.peer;
            const checked = e.target.checked;
            const conn = connections.find(c => c.peer === peerId);
            if (conn) {
                if (!conn.permissions) conn.permissions = { upload: false, chat: true, delete: false, edit: false, whiteboard: false, scratchpad: false };
                conn.permissions.scratchpad = checked;
                conn.send({ type: 'GUEST_PERMISSIONS', permissions: conn.permissions });
                if (checked) {
                    conn.send({ type: 'SCRATCHPAD_INVITE', hostName: (typeof getMyAlias === 'function' ? getMyAlias() : 'Host'), text: globalScratchpadContent });
                    conn.send({ type: 'SCRATCHPAD_UPDATE', text: globalScratchpadContent });
                } else {
                    conn.send({ type: 'SCRATCHPAD_REVOKED' });
                }
                renderSpGuestList();
                if (currentRadarGuestId === peerId) {
                    const rSp = document.getElementById('radar-perm-scratchpad');
                    if (rSp) rSp.checked = checked;
                }
            }
        });
    });
}

function openScratchpadModal() {
    if (!isHost && (!myPermissions || !myPermissions.scratchpad)) {
        cyberAlert("You do not have permission to access the scratchpad. Ask the host for access.", "PERMISSION DENIED");
        return;
    }
    if (scratchpadModal) {
        scratchpadModal.classList.remove('hidden');
        if (spHostControls) spHostControls.style.display = isHost ? 'inline-block' : 'none';
        if (isHost) {
            renderSpGuestList();
            scratchpadTextarea.value = globalScratchpadContent;
        } else if (hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'REQUEST_SCRATCHPAD' });
        }
    }
}

if (btnLiveScratchpad) btnLiveScratchpad.addEventListener('click', openScratchpadModal);
if (btnScratchpadClient) btnScratchpadClient.addEventListener('click', openScratchpadModal);
const btnScratchpadHeaderEl = document.getElementById('btn-scratchpad-header');
if (btnScratchpadHeaderEl) btnScratchpadHeaderEl.addEventListener('click', openScratchpadModal);

if (btnCloseScratchpad) {
    btnCloseScratchpad.addEventListener('click', () => {
        if (scratchpadModal) scratchpadModal.classList.add('hidden');
        if (spPermissionsPopover) spPermissionsPopover.classList.add('hidden');
    });
}

if (scratchpadTextarea) {
    scratchpadTextarea.addEventListener('input', () => {
        if (!isHost && (!myPermissions || !myPermissions.scratchpad)) {
            showToast("Scratchpad permission required.", "warning");
            return;
        }
        const text = scratchpadTextarea.value;
        if (isHost) {
            globalScratchpadContent = text;
            connections.forEach(c => {
                if (c.open && c.isAuthenticated && c.permissions && c.permissions.scratchpad) {
                    c.send({ type: 'SCRATCHPAD_UPDATE', text });
                }
            });
        } else if (hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'SCRATCHPAD_UPDATE', text });
        }
    });
}

if (btnSpPermissions && spPermissionsPopover) {
    btnSpPermissions.addEventListener('click', (e) => {
        e.stopPropagation();
        spPermissionsPopover.classList.toggle('hidden');
        if (!spPermissionsPopover.classList.contains('hidden')) {
            renderSpGuestList();
        }
    });
    spPermissionsPopover.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', (e) => {
        if (spPermissionsPopover && !spPermissionsPopover.classList.contains('hidden') && spHostControls && !spHostControls.contains(e.target)) {
            spPermissionsPopover.classList.add('hidden');
        }
    });
}

if (btnSpAllowAll) {
    btnSpAllowAll.addEventListener('click', () => {
        const activeConns = connections.filter(c => c.open && c.isAuthenticated);
        activeConns.forEach(c => {
            if (!c.permissions) c.permissions = { upload: false, chat: true, delete: false, edit: false, whiteboard: false, scratchpad: false };
            c.permissions.scratchpad = true;
            c.send({ type: 'GUEST_PERMISSIONS', permissions: c.permissions });
            c.send({ type: 'SCRATCHPAD_INVITE', hostName: (typeof getMyAlias === 'function' ? getMyAlias() : 'Host'), text: globalScratchpadContent });
            c.send({ type: 'SCRATCHPAD_UPDATE', text: globalScratchpadContent });
        });
        renderSpGuestList();
        if (currentRadarGuestId) {
            const rSp = document.getElementById('radar-perm-scratchpad');
            if (rSp) rSp.checked = true;
        }
        showToast("Scratchpad access granted to all guests", "success");
    });
}

if (btnSpRevokeAll) {
    btnSpRevokeAll.addEventListener('click', () => {
        const activeConns = connections.filter(c => c.open && c.isAuthenticated);
        activeConns.forEach(c => {
            if (!c.permissions) c.permissions = { upload: false, chat: true, delete: false, edit: false, whiteboard: false, scratchpad: false };
            c.permissions.scratchpad = false;
            c.send({ type: 'GUEST_PERMISSIONS', permissions: c.permissions });
            c.send({ type: 'SCRATCHPAD_REVOKED' });
        });
        renderSpGuestList();
        if (currentRadarGuestId) {
            const rSp = document.getElementById('radar-perm-scratchpad');
            if (rSp) rSp.checked = false;
        }
        showToast("Scratchpad access revoked for all guests", "info");
    });
}


// --- WHITEBOARD LOGIC ---
const whiteboardModal = document.getElementById('whiteboard-modal');
const btnWhiteboard = document.getElementById('btn-whiteboard');
const btnWhiteboardClient = document.getElementById('btn-whiteboard-client');
const btnCloseWhiteboard = document.getElementById('btn-close-whiteboard');
const btnClearWhiteboard = document.getElementById('btn-clear-whiteboard');
const btnWbUndo = document.getElementById('btn-wb-undo');
const btnWbRedo = document.getElementById('btn-wb-redo');
const btnWbExport = document.getElementById('btn-wb-export');

const wbContainer = document.getElementById('whiteboard-container');
const wbCanvas = document.getElementById('whiteboard-canvas');
const wbOverlayCanvas = document.getElementById('whiteboard-overlay-canvas');
const wbFloatingTextInput = document.getElementById('wb-floating-text-input');
const wbThemeSelect = document.getElementById('wb-theme-select');
const wbCustomColor = document.getElementById('wb-custom-color');
const wbCustomColorPreview = document.getElementById('wb-custom-color-preview');

const btnWbPermissions = document.getElementById('btn-wb-permissions');
const wbPermissionsPopover = document.getElementById('wb-permissions-popover');
const wbGuestList = document.getElementById('wb-guest-list');
const btnWbAllowAll = document.getElementById('btn-wb-allow-all');
const btnWbRevokeAll = document.getElementById('btn-wb-revoke-all');
const wbPermCount = document.getElementById('wb-perm-count');
const wbHostControls = document.getElementById('wb-host-controls');

let wbCtx = null;
let wbOverlayCtx = null;
let wbActiveTool = 'pen'; // 'pen', 'glow', 'highlighter', 'eraser', 'line', 'arrow', 'rect', 'circle', 'text', 'laser'
let wbDrawColor = '#00f0ff';
let wbBrushSize = 5;
let currentWbTheme = 'cyber';

const WB_VIRTUAL_WIDTH = 2560;
const WB_VIRTUAL_HEIGHT = 1600;

let wbZoom = 1;
let wbPanX = 0;
let wbPanY = 0;
let isWbPanning = false;
let wbStartPanX = 0;
let wbStartPanY = 0;
let wbStartMouseX = 0;
let wbStartMouseY = 0;
let isWbSpacePressed = false;
let wbInitialTouchDist = 0;
let wbInitialZoom = 1;

function initWbCanvasResolution() {
    if (!wbCanvas) return;
    if (wbCanvas.width !== WB_VIRTUAL_WIDTH || wbCanvas.height !== WB_VIRTUAL_HEIGHT) {
        wbCanvas.width = WB_VIRTUAL_WIDTH;
        wbCanvas.height = WB_VIRTUAL_HEIGHT;
    }
    if (wbOverlayCanvas) {
        if (wbOverlayCanvas.width !== WB_VIRTUAL_WIDTH || wbOverlayCanvas.height !== WB_VIRTUAL_HEIGHT) {
            wbOverlayCanvas.width = WB_VIRTUAL_WIDTH;
            wbOverlayCanvas.height = WB_VIRTUAL_HEIGHT;
        }
    }
    if (wbCtx) {
        wbCtx.imageSmoothingEnabled = true;
        wbCtx.imageSmoothingQuality = 'high';
    }
    if (wbOverlayCtx) {
        wbOverlayCtx.imageSmoothingEnabled = true;
        wbOverlayCtx.imageSmoothingQuality = 'high';
    }
}

function applyWbTransform() {
    const stage = document.getElementById('whiteboard-stage');
    if (stage) {
        stage.style.transform = `translate(${wbPanX}px, ${wbPanY}px) scale(${wbZoom})`;
    }
    const pct = `${Math.round(wbZoom * 100)}%`;
    const zoomLevelEl = document.getElementById('wb-zoom-level');
    if (zoomLevelEl) zoomLevelEl.textContent = pct;
    const hudZoomLevel = document.getElementById('wb-hud-zoom-level');
    if (hudZoomLevel) hudZoomLevel.textContent = pct;
}

function fitWbToContainer() {
    const container = document.getElementById('whiteboard-container');
    if (!container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    if (cw <= 0 || ch <= 0) return;

    initWbCanvasResolution();

    const paddingX = cw < 600 ? 16 : 48;
    const paddingY = ch < 500 ? 16 : 48;
    const availW = Math.max(100, cw - paddingX);
    const availH = Math.max(100, ch - paddingY);

    const fitScale = Math.min(availW / WB_VIRTUAL_WIDTH, availH / WB_VIRTUAL_HEIGHT);
    wbZoom = Math.max(0.08, Math.min(1.0, fitScale));

    wbPanX = Math.round((cw - (WB_VIRTUAL_WIDTH * wbZoom)) / 2);
    wbPanY = Math.round((ch - (WB_VIRTUAL_HEIGHT * wbZoom)) / 2);

    applyWbTransform();
}

function setWbZoom(newZoom, centerX = null, centerY = null) {
    const container = document.getElementById('whiteboard-container');
    if (!container) return;
    const prevZoom = wbZoom;
    const clampedZoom = Math.max(0.08, Math.min(5.0, newZoom));
    if (Math.abs(clampedZoom - prevZoom) < 0.001) return;

    if (centerX === null || centerY === null) {
        centerX = container.clientWidth / 2;
        centerY = container.clientHeight / 2;
    }

    wbPanX = centerX - (centerX - wbPanX) * (clampedZoom / prevZoom);
    wbPanY = centerY - (centerY - wbPanY) * (clampedZoom / prevZoom);
    wbZoom = clampedZoom;
    applyWbTransform();
}

function resetWbZoom() {
    const container = document.getElementById('whiteboard-container');
    if (!container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const paddingX = cw < 600 ? 16 : 48;
    const paddingY = ch < 500 ? 16 : 48;
    const fitScale = Math.min((cw - paddingX) / WB_VIRTUAL_WIDTH, (ch - paddingY) / WB_VIRTUAL_HEIGHT);
    const targetFit = Math.max(0.08, Math.min(1.0, fitScale));

    if (Math.abs(wbZoom - targetFit) < 0.05 && targetFit < 0.95) {
        wbZoom = 1.0;
        wbPanX = Math.round((cw - WB_VIRTUAL_WIDTH) / 2);
        wbPanY = Math.round((ch - WB_VIRTUAL_HEIGHT) / 2);
        applyWbTransform();
    } else {
        fitWbToContainer();
    }
}

let isDrawing = false;
let isDrawingShape = false;
let shapeStartX = 0;
let shapeStartY = 0;
let lastX = 0;
let lastY = 0;

let wbUndoStack = [];
let wbRedoStack = [];
let laserBeacons = [];
let laserAnimId = null;
let lastLaserEmitTime = 0;

function renderWbGuestList() {
    if (!isHost) {
        if (wbHostControls) wbHostControls.style.display = 'none';
        return;
    }
    if (wbHostControls) wbHostControls.style.display = 'inline-block';
    if (!wbGuestList) return;
    
    const activeConns = connections.filter(c => c.open && c.isAuthenticated);
    const allowedConns = activeConns.filter(c => c.permissions && c.permissions.whiteboard);
    if (wbPermCount) wbPermCount.textContent = `${allowedConns.length}/${activeConns.length}`;
    
    if (activeConns.length === 0) {
        wbGuestList.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 12px 0;">No guests currently connected</div>`;
        return;
    }
    
    wbGuestList.innerHTML = '';
    activeConns.forEach(c => {
        const alias = (c.profile && c.profile.name) || c.guestAlias || ('Peer ' + c.peer.substring(0, 6));
        const safeAlias = escapeHtml(alias);
        const safeColor = sanitizeCssColor((c.profile && c.profile.color) || c.guestColor || 'var(--neon-blue)');
        const isAllowed = !!(c.permissions && c.permissions.whiteboard);
        
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: rgba(255,255,255,0.04); border-radius: 6px;';
        row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; max-width: 170px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${safeColor}; flex-shrink: 0;"></span>
                <span style="color: #fff; font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 0.82rem;">${safeAlias}</span>
            </div>
            <label class="switch" style="transform: scale(0.85); margin-right: -4px;">
                <input type="checkbox" class="wb-peer-toggle" data-peer="${c.peer}" ${isAllowed ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        `;
        wbGuestList.appendChild(row);
    });
    
    wbGuestList.querySelectorAll('.wb-peer-toggle').forEach(input => {
        input.addEventListener('change', (e) => {
            const peerId = e.target.dataset.peer;
            const checked = e.target.checked;
            const conn = connections.find(c => c.peer === peerId);
            if (conn) {
                if (!conn.permissions) conn.permissions = { upload: false, chat: true, delete: false, edit: false, whiteboard: false, scratchpad: false };
                conn.permissions.whiteboard = checked;
                conn.send({ type: 'GUEST_PERMISSIONS', permissions: conn.permissions });
                if (checked) {
                    conn.send({ type: 'WHITEBOARD_INVITE', hostName: (typeof getMyAlias === 'function' ? getMyAlias() : 'Host') });
                    if (wbCanvas && wbCanvas.width > 0) {
                        conn.send({ 
                            type: 'WHITEBOARD_SYNC', 
                            image: wbCanvas.toDataURL(),
                            theme: currentWbTheme 
                        });
                    }
                } else {
                    conn.send({ type: 'WHITEBOARD_REVOKED' });
                }
                renderWbGuestList();
                if (currentRadarGuestId === peerId) {
                    const rWb = document.getElementById('radar-perm-whiteboard');
                    if (rWb) rWb.checked = checked;
                }
            }
        });
    });
}

function resizeWbCanvas() {
    initWbCanvasResolution();
    fitWbToContainer();
}

function saveWbState(clearRedo = true) {
    if (!wbCanvas || wbCanvas.width === 0) return;
    wbUndoStack.push(wbCanvas.toDataURL());
    if (wbUndoStack.length > 30) wbUndoStack.shift();
    if (clearRedo) wbRedoStack = [];
}

function undoWb(syncPeers = true) {
    if (!isHost && (!myPermissions || !myPermissions.whiteboard)) {
        showToast("Whiteboard permission required.", "warning");
        return;
    }
    if (wbUndoStack.length === 0) {
        showToast("Nothing to undo", "info");
        return;
    }
    wbRedoStack.push(wbCanvas.toDataURL());
    const prev = wbUndoStack.pop();
    const img = new Image();
    img.onload = () => {
        if (wbCtx) {
            wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
            wbCtx.drawImage(img, 0, 0, wbCanvas.width, wbCanvas.height);
        }
        if (syncPeers) broadcastWbSync();
    };
    img.src = prev;
}

function redoWb(syncPeers = true) {
    if (!isHost && (!myPermissions || !myPermissions.whiteboard)) {
        showToast("Whiteboard permission required.", "warning");
        return;
    }
    if (wbRedoStack.length === 0) {
        showToast("Nothing to redo", "info");
        return;
    }
    wbUndoStack.push(wbCanvas.toDataURL());
    const next = wbRedoStack.pop();
    const img = new Image();
    img.onload = () => {
        if (wbCtx) {
            wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
            wbCtx.drawImage(img, 0, 0, wbCanvas.width, wbCanvas.height);
        }
        if (syncPeers) broadcastWbSync();
    };
    img.src = next;
}

function broadcastWbSync() {
    if (!wbCanvas || wbCanvas.width === 0) return;
    const payload = {
        type: 'WHITEBOARD_SYNC',
        image: wbCanvas.toDataURL(),
        theme: currentWbTheme
    };
    if (isHost) {
        connections.forEach(c => {
            if (c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                c.send(payload);
            }
        });
    } else if (hostConnection && hostConnection.open) {
        hostConnection.send(payload);
    }
}

function setWbTheme(theme, emit = true) {
    currentWbTheme = theme || 'cyber';
    if (wbContainer) {
        wbContainer.className = 'wb-theme-' + currentWbTheme;
    }
    if (wbThemeSelect) {
        wbThemeSelect.value = currentWbTheme;
    }
    if (!emit) return;
    const payload = { type: 'WHITEBOARD_THEME', theme: currentWbTheme };
    if (isHost) {
        connections.forEach(c => {
            if (c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                c.send(payload);
            }
        });
    } else if (hostConnection && hostConnection.open) {
        hostConnection.send(payload);
    }
}

function exportWbPNG() {
    if (!wbCanvas || wbCanvas.width === 0) return;
    const cw = wbCanvas.width;
    const ch = wbCanvas.height;
    const expCanvas = document.createElement('canvas');
    expCanvas.width = cw;
    expCanvas.height = ch;
    const expCtx = expCanvas.getContext('2d');

    // Fill background according to current theme
    if (currentWbTheme === 'cyber') {
        expCtx.fillStyle = '#080a14';
        expCtx.fillRect(0, 0, cw, ch);
        expCtx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        expCtx.lineWidth = 1;
        for (let x = 0; x < cw; x += 30) {
            expCtx.beginPath(); expCtx.moveTo(x, 0); expCtx.lineTo(x, ch); expCtx.stroke();
        }
        for (let y = 0; y < ch; y += 30) {
            expCtx.beginPath(); expCtx.moveTo(0, y); expCtx.lineTo(cw, y); expCtx.stroke();
        }
    } else if (currentWbTheme === 'blueprint') {
        expCtx.fillStyle = '#061329';
        expCtx.fillRect(0, 0, cw, ch);
        expCtx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        expCtx.lineWidth = 1;
        for (let x = 0; x < cw; x += 24) {
            expCtx.beginPath(); expCtx.moveTo(x, 0); expCtx.lineTo(x, ch); expCtx.stroke();
        }
        for (let y = 0; y < ch; y += 24) {
            expCtx.beginPath(); expCtx.moveTo(0, y); expCtx.lineTo(cw, y); expCtx.stroke();
        }
    } else if (currentWbTheme === 'black') {
        expCtx.fillStyle = '#020307';
        expCtx.fillRect(0, 0, cw, ch);
    } else {
        // Classic Whiteboard
        expCtx.fillStyle = '#ffffff';
        expCtx.fillRect(0, 0, cw, ch);
        expCtx.fillStyle = 'rgba(100, 116, 139, 0.25)';
        for (let x = 10; x < cw; x += 20) {
            for (let y = 10; y < ch; y += 20) {
                expCtx.beginPath(); expCtx.arc(x, y, 1, 0, Math.PI * 2); expCtx.fill();
            }
        }
    }

    // Draw artwork on top
    expCtx.drawImage(wbCanvas, 0, 0);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10) + '_' + String(now.getHours()).padStart(2, '0') + '-' + String(now.getMinutes()).padStart(2, '0');
    const filename = `LocalCast_Whiteboard_${dateStr}.png`;

    const link = document.createElement('a');
    link.download = filename;
    link.href = expCanvas.toDataURL('image/png');
    link.click();
    showToast("🎨 Whiteboard snapshot exported as PNG!", "success");
}

function clearWhiteboard(emit = true) {
    if (!wbCtx || !wbCanvas) return;
    saveWbState(true);
    wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
    if (wbOverlayCtx) wbOverlayCtx.clearRect(0, 0, wbOverlayCanvas.width, wbOverlayCanvas.height);
    
    if (!emit) return;
    const payload = { type: 'WHITEBOARD_CLEAR' };
    if (isHost) {
        connections.forEach(c => {
            if (c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                c.send(payload);
            }
        });
    } else if (hostConnection && hostConnection.open) {
        hostConnection.send(payload);
    }
}

function drawLine(x0, y0, x1, y1, color, size, tool, emit = false) {
    if (!wbCtx) return;
    const activeSize = size || wbBrushSize;
    const activeColor = color || wbDrawColor;
    const activeTool = tool || wbActiveTool;

    wbCtx.save();
    if (activeTool === 'eraser') {
        wbCtx.globalCompositeOperation = 'destination-out';
        wbCtx.lineWidth = activeSize * 3.5;
        wbCtx.lineCap = 'round';
        wbCtx.lineJoin = 'round';
        wbCtx.beginPath();
        wbCtx.moveTo(x0, y0);
        wbCtx.lineTo(x1, y1);
        wbCtx.stroke();
    } else if (activeTool === 'glow') {
        wbCtx.globalCompositeOperation = 'source-over';
        wbCtx.strokeStyle = activeColor;
        wbCtx.lineWidth = activeSize;
        wbCtx.lineCap = 'round';
        wbCtx.lineJoin = 'round';
        wbCtx.shadowColor = activeColor;
        wbCtx.shadowBlur = Math.max(10, activeSize * 2.5);
        wbCtx.beginPath();
        wbCtx.moveTo(x0, y0);
        wbCtx.lineTo(x1, y1);
        wbCtx.stroke();
    } else if (activeTool === 'highlighter') {
        wbCtx.globalCompositeOperation = 'source-over';
        wbCtx.globalAlpha = 0.35;
        wbCtx.strokeStyle = activeColor;
        wbCtx.lineWidth = activeSize * 3;
        wbCtx.lineCap = 'square';
        wbCtx.lineJoin = 'miter';
        wbCtx.beginPath();
        wbCtx.moveTo(x0, y0);
        wbCtx.lineTo(x1, y1);
        wbCtx.stroke();
    } else {
        // Standard pen
        wbCtx.globalCompositeOperation = 'source-over';
        wbCtx.strokeStyle = activeColor;
        wbCtx.lineWidth = activeSize;
        wbCtx.lineCap = 'round';
        wbCtx.lineJoin = 'round';
        wbCtx.shadowBlur = 0;
        wbCtx.beginPath();
        wbCtx.moveTo(x0, y0);
        wbCtx.lineTo(x1, y1);
        wbCtx.stroke();
    }
    wbCtx.restore();

    if (!emit) return;
    const w = wbCanvas.width;
    const h = wbCanvas.height;
    if (!w || !h) return;

    const payload = {
        type: 'WHITEBOARD_DRAW',
        tool: activeTool,
        x0: x0 / w, y0: y0 / h,
        x1: x1 / w, y1: y1 / h,
        color: activeColor,
        size: activeSize
    };

    if (isHost) {
        connections.forEach(c => {
            if (c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                c.send(payload);
            }
        });
    } else if (hostConnection && hostConnection.open) {
        hostConnection.send(payload);
    }
}

function drawShapeOnCtx(ctx, shape, x0, y0, x1, y1, color, size, isPreview = false) {
    if (!ctx) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (isPreview) {
        ctx.setLineDash([5, 5]);
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
    }

    if (shape === 'line') {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    } else if (shape === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        const angle = Math.atan2(y1 - y0, x1 - x0);
        const headLen = Math.max(14, size * 2.5);
        ctx.fillStyle = color;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - headLen * Math.cos(angle - Math.PI / 7), y1 - headLen * Math.sin(angle - Math.PI / 7));
        ctx.lineTo(x1 - headLen * Math.cos(angle + Math.PI / 7), y1 - headLen * Math.sin(angle + Math.PI / 7));
        ctx.closePath();
        ctx.fill();
    } else if (shape === 'rect') {
        const rx = Math.min(x0, x1);
        const ry = Math.min(y0, y1);
        const rw = Math.abs(x1 - x0);
        const rh = Math.abs(y1 - y0);
        ctx.strokeRect(rx, ry, rw, rh);
    } else if (shape === 'circle') {
        const radiusX = Math.abs(x1 - x0) / 2;
        const radiusY = Math.abs(y1 - y0) / 2;
        const centerX = Math.min(x0, x1) + radiusX;
        const centerY = Math.min(y0, y1) + radiusY;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, Math.max(1, radiusX), Math.max(1, radiusY), 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

function commitShape(shape, x0, y0, x1, y1, color, size, tool, emit = true) {
    if (!wbCtx || !wbCanvas) return;
    const activeColor = color || wbDrawColor;
    const activeSize = size || wbBrushSize;
    drawShapeOnCtx(wbCtx, shape, x0, y0, x1, y1, activeColor, activeSize, false);

    if (!emit) return;
    const w = wbCanvas.width;
    const h = wbCanvas.height;
    if (!w || !h) return;

    const payload = {
        type: 'WHITEBOARD_SHAPE',
        shape: shape,
        x0: x0 / w, y0: y0 / h,
        x1: x1 / w, y1: y1 / h,
        color: activeColor,
        size: activeSize,
        tool: tool || wbActiveTool
    };

    if (isHost) {
        connections.forEach(c => {
            if (c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                c.send(payload);
            }
        });
    } else if (hostConnection && hostConnection.open) {
        hostConnection.send(payload);
    }
}

function commitText(x, y, text, color, size, emit = true) {
    if (!wbCtx || !wbCanvas || !text) return;
    const activeColor = color || wbDrawColor;
    const activeSize = size || wbBrushSize;
    const fontSize = Math.max(18, activeSize * 4);

    wbCtx.save();
    wbCtx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
    wbCtx.fillStyle = activeColor;
    wbCtx.textBaseline = 'top';
    wbCtx.shadowColor = activeColor;
    wbCtx.shadowBlur = 8;
    wbCtx.fillText(text, x, y);
    wbCtx.restore();

    if (!emit) return;
    const w = wbCanvas.width;
    const h = wbCanvas.height;
    if (!w || !h) return;

    const payload = {
        type: 'WHITEBOARD_TEXT',
        x: x / w, y: y / h,
        text: text,
        color: activeColor,
        size: activeSize
    };

    if (isHost) {
        connections.forEach(c => {
            if (c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                c.send(payload);
            }
        });
    } else if (hostConnection && hostConnection.open) {
        hostConnection.send(payload);
    }
}

function handleLaserPoint(x, y, color, peerName) {
    laserBeacons.push({
        x, y,
        color: color || '#ff0055',
        name: peerName || 'User',
        expires: Date.now() + 1400
    });
    if (!laserAnimId) {
        laserAnimId = requestAnimationFrame(renderLaserOverlay);
    }
}

function renderLaserOverlay() {
    if (!wbOverlayCtx || !wbOverlayCanvas) return;
    const now = Date.now();
    laserBeacons = laserBeacons.filter(b => b.expires > now);

    wbOverlayCtx.clearRect(0, 0, wbOverlayCanvas.width, wbOverlayCanvas.height);

    // Group the latest active beacon per peer so only ONE solid name badge is rendered
    const latestByUser = new Map();
    laserBeacons.forEach(b => {
        const key = b.name || 'User';
        const existing = latestByUser.get(key);
        if (!existing || b.expires > existing.expires) {
            latestByUser.set(key, b);
        }
    });

    // 1. Draw glowing laser trails (without duplicate name badges)
    laserBeacons.forEach(b => {
        const timeLeft = b.expires - now;
        const alpha = Math.min(1, timeLeft / 1100);
        
        wbOverlayCtx.save();
        wbOverlayCtx.globalAlpha = alpha;

        // Outer glow halo
        const grad = wbOverlayCtx.createRadialGradient(b.x, b.y, 1, b.x, b.y, 16);
        grad.addColorStop(0, b.color);
        grad.addColorStop(0.5, b.color);
        grad.addColorStop(1, 'transparent');
        wbOverlayCtx.fillStyle = grad;
        wbOverlayCtx.beginPath();
        wbOverlayCtx.arc(b.x, b.y, 16, 0, Math.PI * 2);
        wbOverlayCtx.fill();

        // Core bright center
        wbOverlayCtx.fillStyle = '#ffffff';
        wbOverlayCtx.beginPath();
        wbOverlayCtx.arc(b.x, b.y, 3.5, 0, Math.PI * 2);
        wbOverlayCtx.fill();

        wbOverlayCtx.restore();
    });

    // 2. Draw a SINGLE SOLID name badge at each peer's most recent pointer position
    latestByUser.forEach((b) => {
        const timeLeft = b.expires - now;
        // Badge is solid the entire time laser is active; gentle fade only at very end
        const badgeAlpha = timeLeft > 350 ? 1.0 : Math.max(0, timeLeft / 350);

        wbOverlayCtx.save();
        wbOverlayCtx.globalAlpha = badgeAlpha;
        wbOverlayCtx.font = 'bold 11px "Courier New", Courier, monospace';
        const tagText = `⚡ ${b.name}`;
        const tagWidth = wbOverlayCtx.measureText(tagText).width;
        const padX = 8;
        const boxW = Math.max(tagWidth + (padX * 2), 48);
        const boxH = 20;
        const boxX = b.x - boxW / 2;
        const boxY = b.y - 30;

        // Solid dark background for nameplate badge
        wbOverlayCtx.fillStyle = 'rgba(6, 9, 18, 0.96)';
        wbOverlayCtx.strokeStyle = b.color;
        wbOverlayCtx.lineWidth = 1.5;
        wbOverlayCtx.beginPath();
        wbOverlayCtx.roundRect(boxX, boxY, boxW, boxH, 4);
        wbOverlayCtx.fill();
        wbOverlayCtx.stroke();

        // Solid neon text
        wbOverlayCtx.fillStyle = b.color;
        wbOverlayCtx.textAlign = 'center';
        wbOverlayCtx.textBaseline = 'middle';
        wbOverlayCtx.fillText(tagText, b.x, boxY + boxH / 2);

        wbOverlayCtx.restore();
    });

    if (laserBeacons.length > 0) {
        laserAnimId = requestAnimationFrame(renderLaserOverlay);
    } else {
        laserAnimId = null;
    }
}

function openWhiteboardModal() {
    if (!isHost && (!myPermissions || !myPermissions.whiteboard)) {
        cyberAlert("You do not have permission to access the whiteboard. Ask the host for access.", "PERMISSION DENIED");
        return;
    }
    if (whiteboardModal) {
        whiteboardModal.classList.remove('hidden');
        initWbCanvasResolution();
        fitWbToContainer();
        if (wbHostControls) wbHostControls.style.display = isHost ? 'inline-block' : 'none';
        if (isHost) renderWbGuestList();
        setTimeout(fitWbToContainer, 30);
        setTimeout(fitWbToContainer, 150);
        setTimeout(fitWbToContainer, 350);
        if (!isHost && hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'REQUEST_WHITEBOARD' });
        }
    }
}

if (wbCanvas) {
    wbCtx = wbCanvas.getContext('2d');
    if (wbOverlayCanvas) wbOverlayCtx = wbOverlayCanvas.getContext('2d');
    initWbCanvasResolution();
    
    window.addEventListener('resize', () => {
        if (whiteboardModal && !whiteboardModal.classList.contains('hidden')) {
            if (wbZoom <= 1.05) {
                fitWbToContainer();
            }
        }
    });

    if (btnWhiteboard) btnWhiteboard.addEventListener('click', openWhiteboardModal);
    if (btnWhiteboardClient) btnWhiteboardClient.addEventListener('click', openWhiteboardModal);
    const btnWhiteboardHeader = document.getElementById('btn-whiteboard-header');
    if (btnWhiteboardHeader) btnWhiteboardHeader.addEventListener('click', openWhiteboardModal);

    // Tool switching
    document.querySelectorAll('.wb-tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tool = btn.dataset.tool;
            if (!tool) return;
            document.querySelectorAll('.wb-tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            wbActiveTool = tool;

            const btnWbHudPan = document.getElementById('btn-wb-hud-pan');
            if (btnWbHudPan) btnWbHudPan.classList.toggle('active', tool === 'pan');

            if (wbContainer) {
                if (tool === 'laser') wbContainer.style.cursor = 'crosshair';
                else if (tool === 'eraser') wbContainer.style.cursor = 'cell';
                else if (tool === 'text') wbContainer.style.cursor = 'text';
                else if (tool === 'pan') wbContainer.style.cursor = 'grab';
                else wbContainer.style.cursor = 'crosshair';
            }
        });
    });

    // Brush size switching
    document.querySelectorAll('.wb-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = parseInt(btn.dataset.size, 10);
            if (!size) return;
            document.querySelectorAll('.wb-size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            wbBrushSize = size;
        });
    });

    // Color Swatches
    document.querySelectorAll('.wb-color-swatch').forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            document.querySelectorAll('.wb-color-swatch').forEach(s => s.classList.remove('active'));
            const target = e.currentTarget || e.target;
            target.classList.add('active');
            wbDrawColor = target.dataset.color;
            if (wbCustomColor) wbCustomColor.value = wbDrawColor;
            if (wbCustomColorPreview) wbCustomColorPreview.style.background = wbDrawColor;
        });
    });

    // Custom Color input
    if (wbCustomColor) {
        wbCustomColor.addEventListener('input', (e) => {
            document.querySelectorAll('.wb-color-swatch').forEach(s => s.classList.remove('active'));
            wbDrawColor = e.target.value;
            if (wbCustomColorPreview) wbCustomColorPreview.style.background = wbDrawColor;
        });
    }

    // Theme selector
    if (wbThemeSelect) {
        wbThemeSelect.addEventListener('change', (e) => {
            setWbTheme(e.target.value, true);
        });
    }

    // Undo / Redo
    if (btnWbUndo) btnWbUndo.addEventListener('click', () => undoWb(true));
    if (btnWbRedo) btnWbRedo.addEventListener('click', () => redoWb(true));

    // Export PNG
    if (btnWbExport) btnWbExport.addEventListener('click', exportWbPNG);

    // Clear Whiteboard
    if (btnClearWhiteboard) {
        btnClearWhiteboard.addEventListener('click', () => {
            if (!isHost && (!myPermissions || !myPermissions.whiteboard)) {
                showToast("Whiteboard permission required.", "warning");
                return;
            }
            cyberConfirm("Are you sure you want to clear the entire whiteboard for all users?", "CLEAR WHITEBOARD").then(ok => {
                if (ok) clearWhiteboard(true);
            });
        });
    }

    // Keyboard Shortcuts for Whiteboard
    window.addEventListener('keydown', (e) => {
        if (!whiteboardModal || whiteboardModal.classList.contains('hidden')) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.code === 'Space' && !e.repeat) {
            e.preventDefault();
            isWbSpacePressed = true;
            if (wbContainer) wbContainer.classList.add('panning');
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
            e.preventDefault();
            if (e.shiftKey) redoWb(true);
            else undoWb(true);
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
            e.preventDefault();
            redoWb(true);
        } else if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            setWbZoom(wbZoom * 1.25);
        } else if (e.key === '-' || e.key === '_') {
            e.preventDefault();
            setWbZoom(wbZoom / 1.25);
        } else if (e.key === '0') {
            e.preventDefault();
            resetWbZoom();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            isWbSpacePressed = false;
            if (wbContainer && wbActiveTool !== 'pan') {
                wbContainer.classList.remove('panning', 'panning-active');
            }
        }
    });

    if (btnCloseWhiteboard) {
        btnCloseWhiteboard.addEventListener('click', () => {
            if (whiteboardModal) whiteboardModal.classList.add('hidden');
            if (wbPermissionsPopover) wbPermissionsPopover.classList.add('hidden');
            if (wbFloatingTextInput) wbFloatingTextInput.classList.add('hidden');
        });
    }

    if (btnWbPermissions && wbPermissionsPopover) {
        btnWbPermissions.addEventListener('click', (e) => {
            e.stopPropagation();
            wbPermissionsPopover.classList.toggle('hidden');
            if (!wbPermissionsPopover.classList.contains('hidden')) {
                renderWbGuestList();
            }
        });
        wbPermissionsPopover.addEventListener('click', (e) => e.stopPropagation());
        document.addEventListener('click', (e) => {
            if (wbPermissionsPopover && !wbPermissionsPopover.classList.contains('hidden') && wbHostControls && !wbHostControls.contains(e.target)) {
                wbPermissionsPopover.classList.add('hidden');
            }
        });
    }

    if (btnWbAllowAll) {
        btnWbAllowAll.addEventListener('click', () => {
            const activeConns = connections.filter(c => c.open && c.isAuthenticated);
            activeConns.forEach(c => {
                if (!c.permissions) c.permissions = { upload: false, chat: true, delete: false, edit: false, whiteboard: false, scratchpad: false };
                c.permissions.whiteboard = true;
                c.send({ type: 'GUEST_PERMISSIONS', permissions: c.permissions });
                c.send({ type: 'WHITEBOARD_INVITE', hostName: (typeof getMyAlias === 'function' ? getMyAlias() : 'Host') });
                if (wbCanvas && wbCanvas.width > 0) {
                    c.send({ 
                        type: 'WHITEBOARD_SYNC', 
                        image: wbCanvas.toDataURL(),
                        theme: currentWbTheme 
                    });
                }
            });
            renderWbGuestList();
            if (currentRadarGuestId) {
                const rWb = document.getElementById('radar-perm-whiteboard');
                if (rWb) rWb.checked = true;
            }
            showToast("Whiteboard access granted to all guests", "success");
        });
    }

    if (btnWbRevokeAll) {
        btnWbRevokeAll.addEventListener('click', () => {
            const activeConns = connections.filter(c => c.open && c.isAuthenticated);
            activeConns.forEach(c => {
                if (!c.permissions) c.permissions = { upload: false, chat: true, delete: false, edit: false, whiteboard: false, scratchpad: false };
                c.permissions.whiteboard = false;
                c.send({ type: 'GUEST_PERMISSIONS', permissions: c.permissions });
                c.send({ type: 'WHITEBOARD_REVOKED' });
            });
            renderWbGuestList();
            if (currentRadarGuestId) {
                const rWb = document.getElementById('radar-perm-whiteboard');
                if (rWb) rWb.checked = false;
            }
            showToast("Whiteboard access revoked for all guests", "info");
        });
    }

    function getPos(e) {
        const rect = wbCanvas.getBoundingClientRect();
        const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
        const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
        const scaleX = rect.width ? (wbCanvas.width / rect.width) : 1;
        const scaleY = rect.height ? (wbCanvas.height / rect.height) : 1;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    }

    let wbTextPendingX = 0;
    let wbTextPendingY = 0;
    let wbTextInputOpenedAt = 0;

    // Pointer event handling
    function onDown(e) {
        if (!isHost && (!myPermissions || !myPermissions.whiteboard)) {
            showToast("Whiteboard permission required.", "warning");
            return;
        }

        if (e.touches && e.touches.length === 2) {
            wbInitialTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            wbInitialZoom = wbZoom;
            isWbPanning = false;
            return;
        }

        if (wbActiveTool === 'pan' || isWbSpacePressed || e.button === 1) {
            isWbPanning = true;
            wbStartPanX = wbPanX;
            wbStartPanY = wbPanY;
            const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
            const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
            wbStartMouseX = clientX;
            wbStartMouseY = clientY;
            if (wbContainer) wbContainer.classList.add('panning-active');
            return;
        }

        const pos = getPos(e);

        if (wbActiveTool === 'text') {
            if (!wbFloatingTextInput) return;
            e.preventDefault();
            e.stopPropagation();

            const stage = document.getElementById('whiteboard-stage');
            const stageW = (stage && stage.clientWidth) ? stage.clientWidth : wbCanvas.width;
            const stageH = (stage && stage.clientHeight) ? stage.clientHeight : wbCanvas.height;
            const stageX = (pos.x / wbCanvas.width) * stageW;
            const stageY = (pos.y / wbCanvas.height) * stageH;

            // If input is already open with text, commit previous text first
            if (!wbFloatingTextInput.classList.contains('hidden') && wbFloatingTextInput.value.trim()) {
                const prevText = wbFloatingTextInput.value.trim();
                saveWbState(true);
                commitText(wbTextPendingX, wbTextPendingY, prevText, wbDrawColor, wbBrushSize, true);
                wbFloatingTextInput.value = '';
            }

            wbTextPendingX = pos.x;
            wbTextPendingY = pos.y;

            wbFloatingTextInput.style.left = stageX + 'px';
            wbFloatingTextInput.style.top = stageY + 'px';
            wbFloatingTextInput.style.color = wbDrawColor;
            wbFloatingTextInput.style.borderColor = wbDrawColor;
            wbFloatingTextInput.style.caretColor = wbDrawColor;
            wbFloatingTextInput.value = '';
            wbFloatingTextInput.classList.remove('hidden');

            wbTextInputOpenedAt = Date.now();
            setTimeout(() => {
                wbFloatingTextInput.focus();
            }, 30);

            const commitAndClose = () => {
                const text = wbFloatingTextInput.value.trim();
                wbFloatingTextInput.classList.add('hidden');
                wbFloatingTextInput.onkeydown = null;
                wbFloatingTextInput.onblur = null;
                if (text) {
                    saveWbState(true);
                    commitText(wbTextPendingX, wbTextPendingY, text, wbDrawColor, wbBrushSize, true);
                    wbFloatingTextInput.value = '';
                }
            };

            wbFloatingTextInput.onkeydown = (ke) => {
                if (ke.key === 'Enter') {
                    ke.preventDefault();
                    commitAndClose();
                } else if (ke.key === 'Escape') {
                    ke.preventDefault();
                    wbFloatingTextInput.value = '';
                    wbFloatingTextInput.classList.add('hidden');
                }
            };

            wbFloatingTextInput.onblur = () => {
                if (Date.now() - wbTextInputOpenedAt < 350) return; // Prevent premature hide on open
                commitAndClose();
            };
            return;
        }

        if (wbActiveTool === 'laser') {
            isDrawing = true;
            handleLaserPoint(pos.x, pos.y, wbDrawColor, typeof getMyAlias === 'function' ? getMyAlias() : 'You');
            emitLaserPoint(pos.x, pos.y);
            return;
        }

        const isShape = ['line', 'arrow', 'rect', 'circle'].includes(wbActiveTool);
        if (isShape) {
            isDrawingShape = true;
            shapeStartX = pos.x;
            shapeStartY = pos.y;
            return;
        }

        // Pen, glow, highlighter, eraser
        saveWbState(true);
        isDrawing = true;
        lastX = pos.x;
        lastY = pos.y;
        drawLine(pos.x, pos.y, pos.x + 0.1, pos.y + 0.1, wbDrawColor, wbBrushSize, wbActiveTool, true);
    }

    function emitLaserPoint(x, y) {
        const now = Date.now();
        if (now - lastLaserEmitTime < 35) return; // 30fps throttle
        lastLaserEmitTime = now;
        const w = wbCanvas.width;
        const h = wbCanvas.height;
        if (!w || !h) return;

        const payload = {
            type: 'WHITEBOARD_LASER',
            x: x / w, y: y / h,
            color: wbDrawColor,
            peerName: typeof getMyAlias === 'function' ? getMyAlias() : 'Peer'
        };

        if (isHost) {
            connections.forEach(c => {
                if (c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                    c.send(payload);
                }
            });
        } else if (hostConnection && hostConnection.open) {
            hostConnection.send(payload);
        }
    }

    function onMove(e) {
        if (e.touches && e.touches.length === 2 && wbInitialTouchDist > 0) {
            const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            if (dist > 0 && wbContainer) {
                const rect = wbContainer.getBoundingClientRect();
                const midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
                const midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
                setWbZoom(wbInitialZoom * (dist / wbInitialTouchDist), midX, midY);
            }
            return;
        }

        if (isWbPanning) {
            const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
            const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
            wbPanX = wbStartPanX + (clientX - wbStartMouseX);
            wbPanY = wbStartPanY + (clientY - wbStartMouseY);
            applyWbTransform();
            return;
        }

        const pos = getPos(e);

        if (wbActiveTool === 'laser' && isDrawing) {
            handleLaserPoint(pos.x, pos.y, wbDrawColor, typeof getMyAlias === 'function' ? getMyAlias() : 'You');
            emitLaserPoint(pos.x, pos.y);
            return;
        }

        if (isDrawingShape && wbOverlayCtx) {
            wbOverlayCtx.clearRect(0, 0, wbOverlayCanvas.width, wbOverlayCanvas.height);
            drawShapeOnCtx(wbOverlayCtx, wbActiveTool, shapeStartX, shapeStartY, pos.x, pos.y, wbDrawColor, wbBrushSize, true);
            return;
        }

        if (!isDrawing) return;
        drawLine(lastX, lastY, pos.x, pos.y, wbDrawColor, wbBrushSize, wbActiveTool, true);
        lastX = pos.x;
        lastY = pos.y;
    }

    function onUp(e) {
        if (isWbPanning) {
            isWbPanning = false;
            if (wbContainer) wbContainer.classList.remove('panning-active');
            return;
        }
        if (e && e.touches && e.touches.length < 2) {
            wbInitialTouchDist = 0;
        }

        if (isDrawingShape) {
            isDrawingShape = false;
            const pos = getPos(e);
            if (wbOverlayCtx) wbOverlayCtx.clearRect(0, 0, wbOverlayCanvas.width, wbOverlayCanvas.height);
            saveWbState(true);
            commitShape(wbActiveTool, shapeStartX, shapeStartY, pos.x, pos.y, wbDrawColor, wbBrushSize, wbActiveTool, true);
            return;
        }

        if (!isDrawing) return;
        isDrawing = false;
    }

    // Whiteboard Image Stamping System
    const btnWbStamp = document.getElementById('btn-wb-stamp');
    const wbStampFileInput = document.getElementById('wb-stamp-file-input');
    const wbStampDropOverlay = document.getElementById('wb-stamp-drop-overlay');

    window.stampImageOnWhiteboard = function(dataUrl, targetX, targetY, normW = null, normH = null, emit = true) {
        if (!wbCtx || !wbCanvas) return;
        initWbCanvasResolution();
        const img = new Image();
        img.onload = () => {
            saveWbState(true);
            let drawX, drawY, drawW, drawH;
            if (normW !== null && normH !== null) {
                drawX = targetX * wbCanvas.width;
                drawY = targetY * wbCanvas.height;
                drawW = normW * wbCanvas.width;
                drawH = normH * wbCanvas.height;
            } else {
                const maxW = wbCanvas.width * 0.70;
                const maxH = wbCanvas.height * 0.70;
                let scale = Math.min(maxW / img.width, maxH / img.height);
                if (scale > 1) scale = 1;
                drawW = img.width * scale;
                drawH = img.height * scale;
                drawX = Math.max(10, Math.min(wbCanvas.width - drawW - 10, targetX - drawW / 2));
                drawY = Math.max(10, Math.min(wbCanvas.height - drawH - 10, targetY - drawH / 2));
            }

            wbCtx.imageSmoothingEnabled = true;
            wbCtx.imageSmoothingQuality = 'high';
            wbCtx.drawImage(img, drawX, drawY, drawW, drawH);

            if (emit) {
                const payload = {
                    type: 'WHITEBOARD_STAMP',
                    image: dataUrl,
                    x: drawX / wbCanvas.width,
                    y: drawY / wbCanvas.height,
                    w: drawW / wbCanvas.width,
                    h: drawH / wbCanvas.height
                };
                if (isHost) {
                    connections.forEach(c => {
                        if (c.open && c.isAuthenticated && c.permissions && c.permissions.whiteboard) {
                            c.send(payload);
                        }
                    });
                } else if (hostConnection && hostConnection.open) {
                    hostConnection.send(payload);
                }
            }
        };
        img.src = dataUrl;
    };

    if (btnWbStamp && wbStampFileInput) {
        btnWbStamp.addEventListener('click', () => wbStampFileInput.click());
        wbStampFileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (re) => stampImageOnWhiteboard(re.target.result, WB_VIRTUAL_WIDTH / 2, WB_VIRTUAL_HEIGHT / 2);
                reader.readAsDataURL(file);
                showToast("🖼️ Image stamped onto whiteboard!", "success");
            }
            wbStampFileInput.value = '';
        });
    }

    if (wbContainer) {
        let wbDragCounter = 0;
        wbContainer.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
            wbDragCounter++;
            if (wbStampDropOverlay) wbStampDropOverlay.classList.remove('hidden');
        });
        wbContainer.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            wbDragCounter--;
            if (wbDragCounter <= 0 && wbStampDropOverlay) {
                wbStampDropOverlay.classList.add('hidden');
                wbDragCounter = 0;
            }
        });
        wbContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        });
        wbContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            wbDragCounter = 0;
            if (wbStampDropOverlay) wbStampDropOverlay.classList.add('hidden');
            if (e.dataTransfer && e.dataTransfer.files) {
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                if (files.length > 0) {
                    const pos = getPos(e);
                    const reader = new FileReader();
                    reader.onload = (re) => stampImageOnWhiteboard(re.target.result, pos.x, pos.y);
                    reader.readAsDataURL(files[0]);
                    showToast("🖼️ Image dropped & stamped onto whiteboard!", "success");
                }
            }
        });
    }

    window.addEventListener('paste', (e) => {
        if (!whiteboardModal || whiteboardModal.classList.contains('hidden')) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.clipboardData && e.clipboardData.items) {
            for (const item of e.clipboardData.items) {
                if (item.type.startsWith('image/')) {
                    const blob = item.getAsFile();
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = (re) => stampImageOnWhiteboard(re.target.result, WB_VIRTUAL_WIDTH / 2, WB_VIRTUAL_HEIGHT / 2);
                        reader.readAsDataURL(blob);
                        showToast("🖼️ Clipboard image stamped!", "success");
                        break;
                    }
                }
            }
        }
    });

    wbCanvas.addEventListener('mousedown', onDown);
    wbCanvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    
    wbCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(e); }, { passive: false });
    wbCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); onMove(e); }, { passive: false });
    window.addEventListener('touchend', onUp);

    if (wbFloatingTextInput) {
        wbFloatingTextInput.addEventListener('mousedown', (e) => e.stopPropagation());
        wbFloatingTextInput.addEventListener('pointerdown', (e) => e.stopPropagation());
        wbFloatingTextInput.addEventListener('click', (e) => e.stopPropagation());
        wbFloatingTextInput.addEventListener('touchstart', (e) => e.stopPropagation());
    }

    // Zoom & Pan Toolbar and HUD Controls
    const btnWbZoomIn = document.getElementById('btn-wb-zoom-in');
    const btnWbZoomOut = document.getElementById('btn-wb-zoom-out');
    const btnWbZoomReset = document.getElementById('btn-wb-zoom-reset');
    const btnWbHudZoomIn = document.getElementById('btn-wb-hud-zoom-in');
    const btnWbHudZoomOut = document.getElementById('btn-wb-hud-zoom-out');
    const wbHudZoomLevel = document.getElementById('wb-hud-zoom-level');
    const btnWbHudPan = document.getElementById('btn-wb-hud-pan');

    if (btnWbZoomIn) btnWbZoomIn.addEventListener('click', () => setWbZoom(wbZoom * 1.25));
    if (btnWbZoomOut) btnWbZoomOut.addEventListener('click', () => setWbZoom(wbZoom / 1.25));
    if (btnWbZoomReset) btnWbZoomReset.addEventListener('click', resetWbZoom);

    if (btnWbHudZoomIn) btnWbHudZoomIn.addEventListener('click', () => setWbZoom(wbZoom * 1.25));
    if (btnWbHudZoomOut) btnWbHudZoomOut.addEventListener('click', () => setWbZoom(wbZoom / 1.25));
    if (wbHudZoomLevel) wbHudZoomLevel.addEventListener('click', resetWbZoom);

    if (btnWbHudPan) {
        btnWbHudPan.addEventListener('click', () => {
            const panBtn = document.getElementById('btn-wb-tool-pan');
            if (wbActiveTool === 'pan') {
                const penBtn = document.querySelector('.wb-tool-btn[data-tool="pen"]');
                if (penBtn) penBtn.click();
            } else if (panBtn) {
                panBtn.click();
            }
        });
    }

    // Mouse wheel cursor-centered zoom
    if (wbContainer) {
        wbContainer.addEventListener('wheel', (e) => {
            if (!whiteboardModal || whiteboardModal.classList.contains('hidden')) return;
            e.preventDefault();
            const rect = wbContainer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const factor = e.deltaY < 0 ? 1.15 : 0.87;
            setWbZoom(wbZoom * factor, mouseX, mouseY);
        }, { passive: false });
    }
}

// --- LOW-LATENCY P2P SCREEN SHARING LOGIC ---
const screenshareModal = document.getElementById('screenshare-modal');
const screenshareVideo = document.getElementById('screenshare-video');
const screenshareSharerBadge = document.getElementById('screenshare-sharer-badge');
const btnScreensharePip = document.getElementById('btn-screenshare-pip');
const btnScreenshareFullscreen = document.getElementById('btn-screenshare-fullscreen');
const btnScreenshareStop = document.getElementById('btn-screenshare-stop');
const btnCloseScreenshare = document.getElementById('btn-close-screenshare');

const btnScreenshareHeader = document.getElementById('btn-screenshare-header');
const btnScreenshareHost = document.getElementById('btn-screenshare-host');
const btnScreenshareClient = document.getElementById('btn-screenshare-client');

let localScreenStream = null;
let activeScreenCalls = {};
let isScreenSharing = false;

function optimizeScreenShareCall(call) {
    if (!call) return;
    const applyOptimization = async () => {
        try {
            const pc = call.peerConnection;
            if (!pc || typeof pc.getSenders !== 'function') return;
            const senders = pc.getSenders();
            for (const sender of senders) {
                if (sender && sender.track && sender.track.kind === 'video') {
                    const params = sender.getParameters ? sender.getParameters() : null;
                    if (params) {
                        if (!params.encodings || params.encodings.length === 0) {
                            params.encodings = [{}];
                        }
                        params.encodings[0].maxBitrate = 1800000; // 1.8 Mbps cap: prevents multi-peer bandwidth saturation
                        params.encodings[0].maxFramerate = 30;
                        if ('degradationPreference' in params) {
                            params.degradationPreference = 'maintain-resolution';
                        }
                        try {
                            await sender.setParameters(params);
                        } catch(e) {}
                    }
                }
            }
        } catch (e) {
            console.debug("Screen share sender tuning deferred:", e);
        }
    };

    if (call.peerConnection) {
        applyOptimization();
        try {
            call.peerConnection.addEventListener('connectionstatechange', applyOptimization);
        } catch(e) {}
    }
    setTimeout(applyOptimization, 400);
    setTimeout(applyOptimization, 1200);
    setTimeout(applyOptimization, 2500);
}

async function startScreenSharing() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        await cyberAlert("Screen sharing is not supported by your current browser.", "NOT SUPPORTED");
        return;
    }

    try {
        localScreenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: "always",
                width: { max: 1920 },
                height: { max: 1080 },
                frameRate: { ideal: 30, max: 30 }
            },
            audio: true
        });
    } catch (err) {
        if (err.name !== 'NotAllowedError') {
            try {
                localScreenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor: "always",
                        width: { max: 1920 },
                        height: { max: 1080 },
                        frameRate: { ideal: 30, max: 30 }
                    },
                    audio: false
                });
            } catch (err2) {
                if (err2.name !== 'NotAllowedError') {
                    showToast("Screen share error: " + err2.message, "warning");
                }
                return;
            }
        } else {
            return;
        }
    }

    if (!localScreenStream) return;

    const vTrack = localScreenStream.getVideoTracks()[0];
    if (vTrack && 'contentHint' in vTrack) {
        vTrack.contentHint = 'detail';
    }

    isScreenSharing = true;
    if (vTrack) {
        vTrack.onended = () => stopScreenSharing();
    }

    openScreenShareViewer(localScreenStream, (typeof getMyAlias === 'function' ? getMyAlias() : 'You'), (typeof peer !== 'undefined' && peer) ? peer.id : 'self', true);

    if (typeof isHost !== 'undefined' && isHost) {
        connections.filter(c => c.open && c.isAuthenticated).forEach(c => {
            const call = peer.call(c.peer, localScreenStream, {
                metadata: { type: 'SCREEN_SHARE', sharerName: getMyAlias(), sharerId: peer.id }
            });
            if (call) {
                activeScreenCalls[c.peer] = call;
                optimizeScreenShareCall(call);
            }
            try { c.send({ type: 'SCREEN_SHARE_STARTED', sharerName: getMyAlias(), sharerId: peer.id }); } catch(e) {}
        });
    } else if (typeof hostConnection !== 'undefined' && hostConnection && hostConnection.open) {
        const call = peer.call(hostConnection.peer, localScreenStream, {
            metadata: { type: 'SCREEN_SHARE', sharerName: getMyAlias(), sharerId: peer.id }
        });
        if (call) {
            activeScreenCalls[hostConnection.peer] = call;
            optimizeScreenShareCall(call);
        }
        try { hostConnection.send({ type: 'SCREEN_SHARE_STARTED', sharerName: getMyAlias(), sharerId: peer.id }); } catch(e) {}
    }

    showToast("🖥️ Screen sharing live across swarm!", "success");
}

function stopScreenSharing() {
    if (localScreenStream) {
        localScreenStream.getTracks().forEach(t => t.stop());
        localScreenStream = null;
    }
    Object.values(activeScreenCalls).forEach(c => {
        try { c.close(); } catch(e) {}
    });
    activeScreenCalls = {};
    isScreenSharing = false;
    closeScreenShareViewer();

    if (typeof isHost !== 'undefined' && isHost) {
        connections.forEach(c => {
            if (c.open) {
                try { c.send({ type: 'SCREEN_SHARE_STOPPED' }); } catch(e) {}
            }
        });
    } else if (typeof hostConnection !== 'undefined' && hostConnection && hostConnection.open) {
        try { hostConnection.send({ type: 'SCREEN_SHARE_STOPPED' }); } catch(e) {}
    }

    showToast("Screen sharing stopped.", "info");
}

function openScreenShareViewer(stream, sharerName, sharerId, isSelf = false) {
    if (!screenshareModal || !screenshareVideo) return;
    screenshareModal.classList.remove('hidden');

    // Force muted & playsinline: Essential for 100% reliable autoplay across browsers
    screenshareVideo.muted = true;
    screenshareVideo.defaultMuted = true;
    screenshareVideo.playsInline = true;
    screenshareVideo.setAttribute('playsinline', '');
    screenshareVideo.setAttribute('webkit-playsinline', '');

    if (screenshareVideo.srcObject !== stream) {
        screenshareVideo.srcObject = stream;
    }

    const playOverlay = document.getElementById('screenshare-play-overlay');

    const tryPlay = () => {
        if (!screenshareVideo) return;
        const p = screenshareVideo.play();
        if (p !== undefined) {
            p.then(() => {
                if (playOverlay) playOverlay.classList.add('hidden');
            }).catch(err => {
                console.warn("Screen share autoplay deferred:", err);
                if (playOverlay) playOverlay.classList.remove('hidden');
            });
        }
    };

    tryPlay();
    screenshareVideo.onloadedmetadata = () => tryPlay();
    screenshareVideo.oncanplay = () => tryPlay();

    if (stream) {
        stream.getTracks().forEach(t => {
            t.enabled = true;
            t.onunmute = () => tryPlay();
        });
        stream.onaddtrack = () => tryPlay();
    }

    if (screenshareSharerBadge) {
        screenshareSharerBadge.textContent = isSelf ? "PRESENTING (YOU)" : `LIVE // ${sharerName}`;
    }
    if (btnScreenshareStop) {
        if (isSelf) btnScreenshareStop.classList.remove('hidden');
        else btnScreenshareStop.classList.add('hidden');
    }
    const audioBtn = document.getElementById('btn-screenshare-audio-toggle');
    if (audioBtn) {
        audioBtn.textContent = '🔇 UNMUTE';
        audioBtn.style.color = '';
    }
}

function closeScreenShareViewer() {
    if (screenshareModal) screenshareModal.classList.add('hidden');
    if (screenshareVideo) {
        screenshareVideo.pause();
        screenshareVideo.srcObject = null;
    }
    const playOverlay = document.getElementById('screenshare-play-overlay');
    if (playOverlay) playOverlay.classList.add('hidden');
}

const btnScreenshareAudioToggle = document.getElementById('btn-screenshare-audio-toggle');
if (btnScreenshareAudioToggle) {
    btnScreenshareAudioToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!screenshareVideo) return;
        screenshareVideo.muted = !screenshareVideo.muted;
        if (screenshareVideo.muted) {
            btnScreenshareAudioToggle.textContent = '🔇 UNMUTE';
            btnScreenshareAudioToggle.style.color = '';
        } else {
            btnScreenshareAudioToggle.textContent = '🔊 AUDIO ON';
            btnScreenshareAudioToggle.style.color = 'var(--neon-green)';
            screenshareVideo.play().catch(() => {});
        }
    });
}

const screenshareVideoWrapper = document.getElementById('screenshare-video-wrapper');
if (screenshareVideoWrapper) {
    screenshareVideoWrapper.addEventListener('click', () => {
        if (screenshareVideo) {
            screenshareVideo.play().then(() => {
                const playOverlay = document.getElementById('screenshare-play-overlay');
                if (playOverlay) playOverlay.classList.add('hidden');
            }).catch(() => {});
        }
    });
}

if (btnScreenshareHeader) btnScreenshareHeader.addEventListener('click', () => {
    if (isScreenSharing) openScreenShareViewer(localScreenStream, "You (Presenting)", peer.id, true);
    else startScreenSharing();
});
if (btnScreenshareHost) btnScreenshareHost.addEventListener('click', () => {
    if (isScreenSharing) openScreenShareViewer(localScreenStream, "You (Presenting)", peer.id, true);
    else startScreenSharing();
});
if (btnScreenshareClient) btnScreenshareClient.addEventListener('click', () => {
    if (isScreenSharing) openScreenShareViewer(localScreenStream, "You (Presenting)", peer.id, true);
    else startScreenSharing();
});
if (btnScreenshareStop) btnScreenshareStop.addEventListener('click', stopScreenSharing);
if (btnCloseScreenshare) btnCloseScreenshare.addEventListener('click', closeScreenShareViewer);

if (btnScreenshareFullscreen) {
    btnScreenshareFullscreen.addEventListener('click', () => {
        if (!screenshareVideo) return;
        if (screenshareVideo.requestFullscreen) screenshareVideo.requestFullscreen();
        else if (screenshareVideo.webkitRequestFullscreen) screenshareVideo.webkitRequestFullscreen();
    });
}
if (btnScreensharePip) {
    btnScreensharePip.addEventListener('click', async () => {
        if (!screenshareVideo) return;
        try {
            if (document.pictureInPictureElement) await document.exitPictureInPicture();
            else if (screenshareVideo.requestPictureInPicture) await screenshareVideo.requestPictureInPicture();
        } catch(e) {
            console.log("PIP error:", e);
        }
    });
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
    audio.play().catch(e => console.log('Intercom audio autoplay prevented:', e));
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
                await cyberAlert("Microphone access denied or not available.", "AUDIO PERMISSION ERROR", true);
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
    ctxMagicLink.addEventListener('click', async () => {
        if (!contextTargetId || !peer || !peer.id) return;
        const baseUrl = window.location.origin + window.location.pathname;
        const magicUrl = `${baseUrl}?peer=${peer.id}&file=${contextTargetId}`;
        try {
            await navigator.clipboard.writeText(magicUrl);
            showToast("Magic Link copied to clipboard!");
        } catch (err) {
            await cyberPrompt("Copy this Magic Link:", magicUrl, "MAGIC LINK READY");
        }
        hideContextMenu();
    });
}

const ctxHoneypot = document.getElementById('ctx-honeypot');
if (ctxHoneypot) {
    ctxHoneypot.addEventListener('click', async () => {
        if (!contextTargetId) return;
        const node = vfs.findNode(contextTargetId);
        if (node && node.type === 'folder') {
            node.isHoneyPot = !node.isHoneyPot;
            if (node.isHoneyPot && !node.password) {
                const trapPwd = await cyberPrompt("Enter the bait password for this Honey-Pot:", "", "HONEY-POT CONFIG");
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

// --- COMM-LINK UI LISTENERS ---
if (btnStartCall) {
    btnStartCall.addEventListener('click', () => {
        if (!whisperTarget) {
            showToast("Select a peer first to start Comm-Link.");
            return;
        }
        const targetAlias = (activePeers[whisperTarget] && activePeers[whisperTarget].alias) || (isHost ? 'Guest' : 'Host');
        initiateCommLink(whisperTarget, targetAlias, 'var(--neon-green)');
    });
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
const radarPermWhiteboard = document.getElementById('radar-perm-whiteboard');
const radarPermScratchpad = document.getElementById('radar-perm-scratchpad');

let activeNuclearFolderId = null;

function updateNuclearModalUI(folderId, current, required) {
    if (activeNuclearFolderId === folderId) {
        document.getElementById('nuclear-current-votes').innerText = current;
        document.getElementById('nuclear-required-votes').innerText = required;
    }
}

function handleNuclearUnlockSuccess(folderId, pin) {
    if (typeof clientUnlockedVaults !== 'undefined') {
        clientUnlockedVaults[folderId] = pin;
    }
    if (activeNuclearFolderId === folderId) {
        document.getElementById('nuclear-vote-modal').classList.add('hidden');
        showToast("Nuclear Vault Unlocked!", "success");
        activeNuclearFolderId = null;
    }
    if (typeof isHost !== 'undefined' && !isHost && clientCurrentDir && clientCurrentDir.id === folderId) {
        renderClientExplorer();
    }
}

function openNuclearModal(child) {
    activeNuclearFolderId = child.id;
    const modal = document.getElementById('nuclear-vote-modal');
    modal.classList.remove('hidden');
    
    // Reset UI
    const currentCount = (typeof activeNuclearVotes !== 'undefined' && activeNuclearVotes[child.id]) ? activeNuclearVotes[child.id].size : 0;
    document.getElementById('nuclear-current-votes').innerText = currentCount;
    document.getElementById('nuclear-required-votes').innerText = child.nuclearVotesRequired || 1;
    const pwdInput = document.getElementById('nuclear-password-input');
    pwdInput.value = '';
    pwdInput.placeholder = "Enter Launch Code";
    setTimeout(() => pwdInput.focus(), 60);
    
    const btnSubmit = document.getElementById('btn-submit-nuclear');
    const btnCancel = document.getElementById('btn-cancel-nuclear');
    
    // Remove old listeners to avoid multiple fires
    const newSubmit = btnSubmit.cloneNode(true);
    const newCancel = btnCancel.cloneNode(true);
    btnSubmit.parentNode.replaceChild(newSubmit, btnSubmit);
    btnCancel.parentNode.replaceChild(newCancel, btnCancel);
    
    newCancel.addEventListener('click', () => {
        modal.classList.add('hidden');
        activeNuclearFolderId = null;
    });

    pwdInput.onkeydown = (e) => {
        if (e.key === 'Enter') newSubmit.click();
    };
    
    newSubmit.addEventListener('click', () => {
        const pin = pwdInput.value;
        if (!pin || !pin.trim()) return;
        
        if (typeof isHost !== 'undefined' && isHost) {
            handleNuclearVote(child.id, 'host', pin.trim());
        } else {
            if (typeof hostConnection !== 'undefined' && hostConnection && hostConnection.open) {
                hostConnection.send({ type: 'NUCLEAR_VOTE', folderId: child.id, pin: pin.trim() });
            }
        }
        
        pwdInput.value = '';
        pwdInput.placeholder = "VOTE CAST... WAITING...";
    });
}

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
    
    const radarPermSection = document.getElementById('radar-permissions-section');
    if (radarPermSection) {
        radarPermSection.style.display = (typeof isHost !== 'undefined' && isHost) ? 'block' : 'none';
    }

    const conn = connections.find(c => c.peer === id);
    if (conn) {
        if (!conn.permissions) conn.permissions = { upload: false, delete: false, edit: false, whiteboard: false, scratchpad: false, chat: true };
        if (radarPermUpload) radarPermUpload.checked = !!conn.permissions.upload;
        if (radarPermDelete) radarPermDelete.checked = !!conn.permissions.delete;
        if (radarPermEdit) radarPermEdit.checked = !!conn.permissions.edit;
        if (radarPermWhiteboard) radarPermWhiteboard.checked = !!conn.permissions.whiteboard;
        if (radarPermScratchpad) radarPermScratchpad.checked = !!conn.permissions.scratchpad;
    }
    
    radarGuestModal.classList.remove('hidden');
}

if (btnCloseRadarModal) {
    btnCloseRadarModal.addEventListener('click', () => radarGuestModal.classList.add('hidden'));
}

[radarPermUpload, radarPermDelete, radarPermEdit, radarPermWhiteboard, radarPermScratchpad].forEach(checkbox => {
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            if (!currentRadarGuestId) return;
            const conn = connections.find(c => c.peer === currentRadarGuestId);
            if (conn) {
                const prevWb = conn.permissions ? !!conn.permissions.whiteboard : false;
                const prevSp = conn.permissions ? !!conn.permissions.scratchpad : false;
                const newWb = radarPermWhiteboard ? radarPermWhiteboard.checked : false;
                const newSp = radarPermScratchpad ? radarPermScratchpad.checked : false;

                conn.permissions = {
                    upload: radarPermUpload ? radarPermUpload.checked : false,
                    delete: radarPermDelete ? radarPermDelete.checked : false,
                    edit: radarPermEdit ? radarPermEdit.checked : false,
                    whiteboard: newWb,
                    scratchpad: newSp,
                    chat: conn.permissions ? conn.permissions.chat !== false : true
                };
                conn.send({ type: 'GUEST_PERMISSIONS', permissions: conn.permissions });

                if (newWb && !prevWb) {
                    conn.send({ type: 'WHITEBOARD_INVITE', hostName: (typeof getMyAlias === 'function' ? getMyAlias() : 'Host') });
                    if (wbCanvas && wbCanvas.width > 0) {
                        conn.send({ type: 'WHITEBOARD_SYNC', image: wbCanvas.toDataURL() });
                    }
                } else if (!newWb && prevWb) {
                    conn.send({ type: 'WHITEBOARD_REVOKED' });
                }

                if (newSp && !prevSp) {
                    conn.send({ type: 'SCRATCHPAD_INVITE', hostName: (typeof getMyAlias === 'function' ? getMyAlias() : 'Host'), text: globalScratchpadContent });
                    conn.send({ type: 'SCRATCHPAD_UPDATE', text: globalScratchpadContent });
                } else if (!newSp && prevSp) {
                    conn.send({ type: 'SCRATCHPAD_REVOKED' });
                }

                if (typeof renderWbGuestList === 'function') renderWbGuestList();
                if (typeof renderSpGuestList === 'function') renderSpGuestList();
            }
        });
    }
});

function drawRadar() {
    requestAnimationFrame(drawRadar);
    try {
        if (radarModal && radarModal.classList.contains('hidden')) return;
        
        const canvas = radarCanvas;
        if (!canvas || !canvas.parentElement) return;
        const pw = canvas.parentElement.clientWidth;
        const ph = canvas.parentElement.clientHeight;
        if (canvas.width !== pw || canvas.height !== ph) {
            canvas.width = pw;
            canvas.height = ph;
        }
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
    const strong = document.createElement('strong');
    strong.style.color = sanitizeCssColor(color);
    strong.textContent = (name || 'Guest') + ': ';
    const span = document.createElement('span');
    span.style.color = '#fff';
    span.textContent = text || '';
    el.appendChild(strong);
    el.appendChild(span);
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
    const targetNameEl = document.getElementById('whisper-target-name');
    if (targetNameEl) {
        targetNameEl.textContent = 'Whispering: ' + (alias || 'Guest');
        targetNameEl.style.color = sanitizeCssColor(color);
    }
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
    btnRadarCall.addEventListener('click', () => {
        if (!currentRadarGuestId) return;
        const radarGuestModal = document.getElementById('radar-guest-modal');
        if (radarGuestModal) radarGuestModal.classList.add('hidden');
        initiateCommLink(currentRadarGuestId, currentRadarGuestAlias || 'Guest', currentRadarGuestColor || 'var(--neon-green)');
    });
}

if (btnCloseWhisper) {
    btnCloseWhisper.addEventListener('click', () => {
        whisperModal.classList.add('hidden');
        whisperTarget = null;
        endCommLink();
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
                        printCli('LOCAL-CAST TERMINAL COMMANDS:', 'var(--neon-blue)');
                        printCli('  ls           - List contents of current directory');
                        printCli('  cd <id>      - Change directory (or "cd .." to go up)');
                        printCli('  mkdir <name> - Create a new folder (Host only)');
                        printCli('  rm <id>      - Delete a file/folder (Host only)');
                        printCli('  peers        - List connected peers');
                        printCli('  kick <id>    - Kick a connected peer (Host only)');
                        printCli('  whoami       - Print user identity & peer ID');
                        printCli('  clear        - Clear terminal output');
                    } else if (cmd === 'clear') {
                        cliOutput.innerHTML = '';
                    } else if (cmd === 'peers') {
                        if (isHost) {
                            if (!connections.length) {
                                printCli('No connected peers.', 'var(--text-muted)');
                            } else {
                                printCli('CONNECTED PEERS (' + connections.length + '):', 'var(--neon-blue)');
                                connections.forEach(c => {
                                    const alias = (c.profile && c.profile.name) ? c.profile.name : 'Guest';
                                    printCli('  ' + c.peer + ' [' + alias + ']', 'var(--neon-green)');
                                });
                            }
                        } else {
                            printCli('Host: ' + (hostConnection ? hostConnection.peer : 'Disconnected'), 'var(--neon-blue)');
                        }
                    } else if (cmd === 'kick') {
                        if (!isHost) {
                            printCli('Error: Only Host can kick peers.', 'var(--neon-red)');
                        } else {
                            const target = args[1];
                            if (!target) {
                                printCli('Usage: kick <peerId>', 'var(--text-muted)');
                            } else {
                                const conn = connections.find(c => c.peer === target || c.peer.startsWith(target));
                                if (conn) {
                                    try { conn.send({ type: 'KICK' }); } catch(e) {}
                                    try { conn.close(); } catch(e) {}
                                    printCli('Kicked peer: ' + conn.peer, 'var(--neon-green)');
                                } else {
                                    printCli('Peer not found: ' + target, 'var(--neon-red)');
                                }
                            }
                        }
                    } else if (cmd === 'whoami') {
                        printCli('ALIAS: ' + (typeof profile !== 'undefined' && profile.name ? profile.name : (typeof guestAlias !== 'undefined' ? guestAlias : 'HOST')), 'var(--neon-purple)');
                        printCli('ID: ' + (peer ? peer.id : 'N/A'), 'var(--neon-purple)');
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
async function handleJukeboxContext(fileId) {
    const file = isHost ? vfs.findNode(fileId) : (typeof findClientNode === 'function' ? findClientNode(clientVFS, fileId) : null);
    if (!file) {
        await cyberAlert("File not found in Virtual File System.", "FILE ERROR", true);
        return;
    }
    const isAudio = file.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i) || (file.mime && file.mime.startsWith('audio/'));
    if (!isAudio) {
        await cyberAlert("Not a supported audio file. Name: " + file.name + ", Mime: " + file.mime, "AUDIO FORMAT NOTICE");
        return;
    }
    
    // Fetch file blob using getDecryptedFileObj to handle encryption, native handles, or memory blobs
    if (isHost) {
        try {
            const fileBlob = await getDecryptedFileObj(file);
            if (fileBlob) {
                const url = URL.createObjectURL(fileBlob);
                loadJukeboxFile(file, url);
                jukeboxPlayer.play();
                btnJukePlay.classList.add('hidden');
                btnJukePause.classList.remove('hidden');
                broadcastJukebox('JUKEBOX_PLAY', file.id, 0);
            }
        } catch (err) {
            await cyberAlert("Failed to read audio file: " + err, "JUKEBOX ERROR", true);
        }
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
        if (hostConnection && hostConnection.open) {
            if (arcadeOpponentId === hostConnection.peer) {
                hostConnection.send(data);
            } else {
                hostConnection.send({ type: 'ARCADE_RELAY', targetId: arcadeOpponentId, data: data });
            }
        }
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

async function handleArcadeNetwork(data) {
    if (data.type === 'ARCADE_INVITE') {
        const inviterName = data.fromAlias || (data.fromId ? data.fromId.substring(0, 6) : "Peer");
        const gameName = data.gameType === 'pong' ? 'Cyber-Pong' : (data.gameType === 'chess' ? 'Holo-Chess' : 'Neon-Tac-Toe');
        
        const accepted = await cyberConfirm("Arcade match request from " + inviterName + " to play " + gameName + ". Accept challenge?", "P2P ARCADE CHALLENGE");
        if (accepted) {
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
        await cyberAlert("Arcade match request was declined.", "ARCADE STATUS");
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
        
        const moveData = { type: 'ARCADE_MOVE', gameType: 'tictactoe', board: arcadeBoard, turn: currentArcadeTurn };
        sendArcadeData(moveData);
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
        
        sendArcadeData(resetData);
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

// =========================================================================
// MODULE 1: END-TO-END EPHEMERAL ENCRYPTION (ECDH P-256 + AES-GCM-256)
// =========================================================================

async function initEcdh() {
    try {
        if (!window.crypto || !window.crypto.subtle) return null;
        if (myEcdhKeyPair) return myEcdhKeyPair;
        myEcdhKeyPair = await window.crypto.subtle.generateKey(
            { name: "ECDH", namedCurve: "P-256" },
            true,
            ["deriveKey", "deriveBits"]
        );
        return myEcdhKeyPair;
    } catch (err) {
        console.warn("ECDH initialization failed:", err);
        return null;
    }
}

async function getExportedPublicKey() {
    const kp = await initEcdh();
    if (!kp) return null;
    const raw = await window.crypto.subtle.exportKey("raw", kp.publicKey);
    return Array.from(new Uint8Array(raw));
}

async function handlePeerEcdhKey(peerId, rawPublicKeyArray) {
    try {
        const kp = await initEcdh();
        if (!kp) return null;
        const peerKey = await window.crypto.subtle.importKey(
            "raw",
            new Uint8Array(rawPublicKeyArray),
            { name: "ECDH", namedCurve: "P-256" },
            true,
            []
        );
        const sharedKey = await window.crypto.subtle.deriveKey(
            { name: "ECDH", public: peerKey },
            kp.privateKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
        peerEcdhSharedKeys.set(peerId, sharedKey);
        
        // Activate E2EE lock indicator in header
        const e2eeBadge = document.getElementById('e2ee-badge');
        if (e2eeBadge) {
            e2eeBadge.classList.remove('hidden');
            e2eeBadge.classList.add('active');
            e2eeBadge.title = `E2EE Active: ECDH P-256 + AES-GCM-256 with ${peerId}`;
        }
        if (typeof printCli === 'function') {
            printCli(`[E2EE] Zero-knowledge session key established with ${peerId}`, 'var(--neon-green)');
        }
        return sharedKey;
    } catch (err) {
        console.warn(`ECDH key derivation failed for ${peerId}:`, err);
        return null;
    }
}

async function sendEcdhHandshake(conn) {
    if (!conn || !conn.open) return;
    try {
        const pubKey = await getExportedPublicKey();
        if (pubKey) {
            conn.send({ type: 'ECDH_KEY_EXCHANGE', publicKey: pubKey, sender: peer ? peer.id : null });
        }
    } catch(err) {
        console.warn("sendEcdhHandshake failed:", err);
    }
}

async function encryptE2EE(peerId, dataBufferOrObject) {
    const key = peerEcdhSharedKeys.get(peerId);
    if (!key) return null;
    try {
        let buffer;
        if (dataBufferOrObject instanceof ArrayBuffer) {
            buffer = dataBufferOrObject;
        } else if (ArrayBuffer.isView(dataBufferOrObject)) {
            buffer = dataBufferOrObject.buffer;
        } else {
            const str = JSON.stringify(dataBufferOrObject);
            buffer = new TextEncoder().encode(str);
        }
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            buffer
        );
        return {
            e2ee: true,
            iv: Array.from(iv),
            data: encrypted
        };
    } catch (e) {
        console.warn("encryptE2EE error:", e);
        return null;
    }
}

async function decryptE2EE(peerId, encObj) {
    const key = peerEcdhSharedKeys.get(peerId);
    if (!key) throw new Error("No shared key for peer");
    const iv = new Uint8Array(encObj.iv);
    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encObj.data
    );
    return decrypted;
}

// Auto-initialize ECDH keypair in background
initEcdh();


// =========================================================================
// MODULE 2: RESUMABLE TRANSFERS (INDEXEDDB CHUNK CACHE)
// =========================================================================

const activeTransferMetaCache = new Map();
let metaCacheSaveTimer = null;

async function flushTransferMetaCache() {
    metaCacheSaveTimer = null;
    for (const [metaKey, meta] of activeTransferMetaCache.entries()) {
        try {
            await localforage.setItem(metaKey, meta);
        } catch(e) {}
    }
}

async function saveChunkToCache(fileId, chunkIndex, chunkData, meta = {}) {
    if (typeof localforage === 'undefined') return;
    try {
        await localforage.setItem(`chunk_${fileId}_${chunkIndex}`, chunkData);
        const metaKey = `transfer_meta_${fileId}`;
        let transferMeta = activeTransferMetaCache.get(metaKey);
        if (!transferMeta) {
            transferMeta = await localforage.getItem(metaKey) || {
                fileId,
                name: meta.name || 'file',
                mime: meta.mime || 'application/octet-stream',
                size: meta.size || 0,
                totalChunks: meta.totalChunks || 1,
                receivedIndices: [],
                isEncrypted: meta.isEncrypted || false,
                salt: meta.salt || null,
                iv: meta.iv || null,
                updatedAt: Date.now()
            };
            activeTransferMetaCache.set(metaKey, transferMeta);
        }
        if (!transferMeta.receivedIndices.includes(chunkIndex)) {
            transferMeta.receivedIndices.push(chunkIndex);
        }
        transferMeta.updatedAt = Date.now();
        if (!metaCacheSaveTimer) {
            metaCacheSaveTimer = setTimeout(flushTransferMetaCache, 500);
        }
        return transferMeta;
    } catch (e) {
        console.warn("saveChunkToCache failed:", e);
    }
}

async function getCachedTransferMeta(fileId) {
    if (typeof localforage === 'undefined') return null;
    try {
        const metaKey = `transfer_meta_${fileId}`;
        if (activeTransferMetaCache.has(metaKey)) {
            return activeTransferMetaCache.get(metaKey);
        }
        return await localforage.getItem(metaKey);
    } catch (e) {
        return null;
    }
}

async function getCachedChunk(fileId, chunkIndex) {
    if (typeof localforage === 'undefined') return null;
    try {
        return await localforage.getItem(`chunk_${fileId}_${chunkIndex}`);
    } catch (e) {
        return null;
    }
}

async function assembleFileFromCache(fileId) {
    if (typeof localforage === 'undefined') return null;
    try {
        const meta = await getCachedTransferMeta(fileId);
        if (!meta) return null;
        const chunks = [];
        for (let i = 0; i < meta.totalChunks; i++) {
            const ch = await localforage.getItem(`chunk_${fileId}_${i}`);
            if (!ch) return null;
            chunks.push(ch);
        }
        const blob = new Blob(chunks, { type: meta.mime });
        return { blob, meta };
    } catch (e) {
        console.error("assembleFileFromCache error:", e);
        return null;
    }
}

async function clearCachedTransfer(fileId, totalChunks = 0) {
    if (typeof localforage === 'undefined') return;
    try {
        const metaKey = `transfer_meta_${fileId}`;
        activeTransferMetaCache.delete(metaKey);
        const meta = await localforage.getItem(metaKey);
        const count = meta ? meta.totalChunks : totalChunks;
        for (let i = 0; i < count; i++) {
            await localforage.removeItem(`chunk_${fileId}_${i}`);
        }
        await localforage.removeItem(metaKey);
    } catch (e) {
        console.warn("clearCachedTransfer error:", e);
    }
}

async function getMissingChunkIndices(fileId, totalChunks) {
    const meta = await getCachedTransferMeta(fileId);
    if (!meta || !meta.receivedIndices) {
        return Array.from({ length: totalChunks }, (_, i) => i);
    }
    const receivedSet = new Set(meta.receivedIndices);
    const missing = [];
    for (let i = 0; i < totalChunks; i++) {
        if (!receivedSet.has(i)) missing.push(i);
    }
    return missing;
}


// =========================================================================
// MODULE 3: MULTI-SOURCE SWARM TORRENTING (BITTORRENT IN BROWSER)
// =========================================================================

function broadcastNetworkMap() {
    if (!isHost) return;
    const map = connections.filter(c => c.open && c.isAuthenticated).map(c => c.peer);
    connections.forEach(c => {
        if (c.open && c.isAuthenticated) {
            try {
                c.send({ type: 'NETWORK_MAP', peers: map });
            } catch(e) {}
        }
    });
}

function registerSwarmAnnounce(peerId, fileId, totalChunks, name, mime, size) {
    const key = `${peerId}:${fileId}`;
    if (!swarmBitfields.has(key)) {
        swarmBitfields.set(key, new Set());
    }
    const bitfield = swarmBitfields.get(key);
    for (let i = 0; i < totalChunks; i++) {
        bitfield.add(i);
    }
}

function registerSwarmHaves(peerId, fileId, chunkIndices) {
    const key = `${peerId}:${fileId}`;
    if (!swarmBitfields.has(key)) {
        swarmBitfields.set(key, new Set());
    }
    const bitfield = swarmBitfields.get(key);
    chunkIndices.forEach(idx => bitfield.add(idx));

    // If an active downloader is running for this file, wake up its pump!
    if (activeSwarmDownloads.has(fileId)) {
        activeSwarmDownloads.get(fileId).pump();
    }
    if (activeMediaStreamDownloader && activeMediaStreamDownloader.fileId === fileId) {
        activeMediaStreamDownloader.pump();
    }
}

function registerSwarmHave(peerId, fileId, chunkIndex) {
    const key = `${peerId}:${fileId}`;
    if (!swarmBitfields.has(key)) {
        swarmBitfields.set(key, new Set());
    }
    swarmBitfields.get(key).add(chunkIndex);

    // If an active downloader is running for this file, wake up its pump!
    if (activeSwarmDownloads.has(fileId)) {
        activeSwarmDownloads.get(fileId).pump();
    }
    if (activeMediaStreamDownloader && activeMediaStreamDownloader.fileId === fileId) {
        activeMediaStreamDownloader.pump();
    }
}

let pendingSwarmHaves = {};
let swarmHaveTimer = null;

function flushSwarmHaves() {
    swarmHaveTimer = null;
    const entries = Object.entries(pendingSwarmHaves);
    pendingSwarmHaves = {};

    entries.forEach(([fileId, info]) => {
        const indices = Array.from(info.indices);
        if (indices.length === 0) return;
        const msg = {
            type: 'SWARM_HAVES',
            fileId,
            chunkIndices: indices,
            totalChunks: info.totalChunks,
            fromPeer: (typeof peer !== 'undefined' && peer) ? peer.id : null
        };
        if (!isHost && hostConnection && hostConnection.open) {
            try { hostConnection.send(msg); } catch(e) {}
        }
        if (Array.isArray(swarmConnections)) {
            swarmConnections.forEach(c => {
                if (c.open) {
                    try { c.send(msg); } catch(e) {}
                }
            });
        }
        if (typeof isHost !== 'undefined' && isHost && Array.isArray(connections)) {
            connections.forEach(c => {
                if (c.open && c.isAuthenticated) {
                    try { c.send(msg); } catch(e) {}
                }
            });
        }
    });
}

function broadcastSwarmHave(fileId, chunkIndex, totalChunks) {
    if (!pendingSwarmHaves[fileId]) {
        pendingSwarmHaves[fileId] = { totalChunks, indices: new Set() };
    }
    pendingSwarmHaves[fileId].indices.add(chunkIndex);
    if (!swarmHaveTimer) {
        swarmHaveTimer = setTimeout(flushSwarmHaves, 100);
    }
}

async function handleHostSwarmChunkRequest(conn, fileId, chunkIndex) {
    if (!conn || !conn.isAuthenticated) return;
    const node = vfs.findNode(fileId);
    if (!node || node.type !== 'file' || !isNodeAuthorizedForConnection(node, conn)) return;
    try {
        let blob = node.fileObj;
        if (node.isNative) blob = await getDecryptedFileObj(node);
        if (!blob) return;

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, blob.size);
        const slice = blob.slice(start, end);
        const arrayBuffer = await slice.arrayBuffer();

        if (conn && conn.open) {
            conn.send({
                type: 'SWARM_CHUNK_DATA',
                fileId: fileId,
                chunkIndex: chunkIndex,
                chunk: arrayBuffer
            });
            const now = Date.now();
            if (window.triggerCyberspaceBeam && (!conn._lastBeamTime || now - conn._lastBeamTime > 250)) {
                conn._lastBeamTime = now;
                window.triggerCyberspaceBeam('host', conn.peer, '#ff00ff');
            }
        }
    } catch (err) {
        console.warn(`Host error serving swarm chunk ${chunkIndex} for ${fileId}:`, err);
    }
}

async function handleGuestSwarmChunkRequest(conn, fileId, chunkIndex) {
    try {
        let chunkData = null;
        if (incomingTransfers[fileId] && incomingTransfers[fileId].chunks && incomingTransfers[fileId].chunks[chunkIndex]) {
            chunkData = incomingTransfers[fileId].chunks[chunkIndex];
        } else {
            chunkData = await getCachedChunk(fileId, chunkIndex);
        }
        if (chunkData && conn && conn.open) {
            conn.send({
                type: 'SWARM_CHUNK_DATA',
                fileId: fileId,
                chunkIndex: chunkIndex,
                chunk: chunkData
            });
            const now = Date.now();
            if (window.triggerCyberspaceBeam && (!conn._lastBeamTime || now - conn._lastBeamTime > 250)) {
                conn._lastBeamTime = now;
                const to = (conn.peer === hostConnection?.peer) ? 'host' : conn.peer;
                window.triggerCyberspaceBeam(peer.id, to, '#fcee0a');
            }
        }
    } catch (err) {
        console.warn(`Guest error serving swarm chunk ${chunkIndex} for ${fileId}:`, err);
    }
}

function handleIncomingSwarmChunk(fileId, chunkIndex, chunkData, fromPeerId) {
    const now = Date.now();
    if (window.triggerCyberspaceBeam && (!window._lastSwarmChunkBeamTime || now - window._lastSwarmChunkBeamTime > 250)) {
        window._lastSwarmChunkBeamTime = now;
        const to = (typeof isHost !== 'undefined' && isHost) ? 'host' : (peer ? peer.id : 'unknown');
        const from = fromPeerId === (hostConnection && hostConnection.peer) ? 'host' : fromPeerId;
        window.triggerCyberspaceBeam(from, to, '#fcee0a');
    }
    if (activeSwarmDownloads.has(fileId)) {
        activeSwarmDownloads.get(fileId).receiveChunk(chunkIndex, chunkData, fromPeerId);
    }
    if (activeMediaStreamDownloader && activeMediaStreamDownloader.fileId === fileId) {
        activeMediaStreamDownloader.receiveChunk(chunkIndex, chunkData, fromPeerId);
    }
    if (incomingTransfers[fileId]) {
        const transfer = incomingTransfers[fileId];
        if (!transfer.chunks[chunkIndex]) {
            transfer.chunks[chunkIndex] = chunkData;
            transfer.received++;
            updateTransferProgress(fileId, chunkData.byteLength, transfer.size);
            saveChunkToCache(fileId, chunkIndex, chunkData, transfer);
            broadcastSwarmHave(fileId, chunkIndex, transfer.total);
            if (transfer.received === transfer.total) {
                finishTransfer(fileId);
                const blob = new Blob(transfer.chunks, { type: transfer.mime });
                triggerDownload(blob, transfer.name, transfer.mime, fileId);
                delete incomingTransfers[fileId];
            }
        }
    }
}

class SwarmDownloader {
    constructor({ fileId, fileName, fileMime, fileSize, totalChunks, isSequential = false, onChunk, onProgress, onComplete, onError }) {
        this.fileId = fileId;
        this.fileName = fileName;
        this.fileMime = fileMime;
        this.fileSize = fileSize || (totalChunks * CHUNK_SIZE);
        this.totalChunks = totalChunks;
        this.isSequential = isSequential;
        this.onChunk = onChunk;
        this.onProgress = onProgress;
        this.onComplete = onComplete;
        this.onError = onError;

        this.chunks = new Array(totalChunks);
        this.completedIndices = new Set();
        this.inFlight = new Map(); // chunkIndex -> { conn, time }
        this.pendingQueue = [];
        this.aborted = false;
        this.isDone = false;
        this.pumpInterval = null;
        this.maxConcurrent = 8;
    }

    async start() {
        try {
            const cachedMeta = await getCachedTransferMeta(this.fileId);
            if (cachedMeta && cachedMeta.receivedIndices && cachedMeta.receivedIndices.length > 0) {
                for (const idx of cachedMeta.receivedIndices) {
                    if (idx < this.totalChunks) {
                        const chunkData = await getCachedChunk(this.fileId, idx);
                        if (chunkData) {
                            this.chunks[idx] = chunkData;
                            this.completedIndices.add(idx);
                            if (this.onChunk) this.onChunk(idx, chunkData);
                        }
                    }
                }
                if (this.completedIndices.size > 0 && this.completedIndices.size < this.totalChunks) {
                    showToast(`⚡ Resumed "${this.fileName}" (${this.completedIndices.size}/${this.totalChunks} chunks from cache)`);
                }
            }
        } catch (e) {
            console.warn("Resumable cache check error:", e);
        }

        if (this.completedIndices.size === this.totalChunks) {
            this.finish();
            return;
        }

        const missing = [];
        for (let i = 0; i < this.totalChunks; i++) {
            if (!this.completedIndices.has(i)) {
                missing.push(i);
            }
        }

        if (this.isSequential) {
            this.pendingQueue = missing.sort((a, b) => a - b);
        } else {
            this.pendingQueue = missing;
        }

        this.pump();
        this.pumpInterval = setInterval(() => {
            if (this.aborted || this.isDone) {
                if (this.pumpInterval) clearInterval(this.pumpInterval);
                return;
            }
            this.checkTimeouts();
            this.pump();
        }, 150);
    }

    getEligibleConnections(chunkIndex) {
        const eligible = [];
        if (!isHost && hostConnection && hostConnection.open) {
            eligible.push({ conn: hostConnection, isHost: true });
        }
        swarmConnections.forEach(conn => {
            if (conn.open) {
                const bitfield = swarmBitfields.get(`${conn.peer}:${this.fileId}`);
                if (bitfield && bitfield.has(chunkIndex)) {
                    eligible.push({ conn, isHost: false });
                }
            }
        });
        return eligible;
    }

    pump() {
        if (this.aborted || this.isDone) return;

        if (this.completedIndices.size >= this.totalChunks) {
            this.finish();
            return;
        }

        while (this.inFlight.size < this.maxConcurrent && this.pendingQueue.length > 0) {
            const chunkIndex = this.pendingQueue.shift();
            const eligible = this.getEligibleConnections(chunkIndex);

            if (eligible.length === 0) {
                if (!isHost && hostConnection && hostConnection.open) {
                    eligible.push({ conn: hostConnection, isHost: true });
                } else {
                    this.pendingQueue.push(chunkIndex);
                    break;
                }
            }

            let bestPeer = eligible[0];
            let minLoad = Infinity;
            for (const item of eligible) {
                let load = 0;
                for (const inflight of this.inFlight.values()) {
                    if (inflight.conn === item.conn) load++;
                }
                if (load < minLoad) {
                    minLoad = load;
                    bestPeer = item;
                }
            }

            try {
                bestPeer.conn.send({
                    type: 'SWARM_REQUEST_CHUNK',
                    fileId: this.fileId,
                    chunkIndex: chunkIndex
                });
                this.inFlight.set(chunkIndex, { conn: bestPeer.conn, time: Date.now() });
            } catch (err) {
                console.warn(`Failed to request chunk ${chunkIndex}:`, err);
                this.pendingQueue.push(chunkIndex);
                break;
            }
        }
    }

    checkTimeouts() {
        const now = Date.now();
        const TIMEOUT_MS = 3500;
        for (const [idx, item] of this.inFlight.entries()) {
            if (now - item.time > TIMEOUT_MS) {
                this.inFlight.delete(idx);
                if (!this.completedIndices.has(idx) && !this.pendingQueue.includes(idx)) {
                    this.pendingQueue.unshift(idx);
                }
            }
        }
    }

    receiveChunk(chunkIndex, chunkData, fromPeerId) {
        if (this.aborted || this.completedIndices.has(chunkIndex)) return;
        this.inFlight.delete(chunkIndex);
        this.chunks[chunkIndex] = chunkData;
        this.completedIndices.add(chunkIndex);

        if (!localFileBitfields.has(this.fileId)) localFileBitfields.set(this.fileId, new Set());
        localFileBitfields.get(this.fileId).add(chunkIndex);

        saveChunkToCache(this.fileId, chunkIndex, chunkData, {
            name: this.fileName,
            mime: this.fileMime,
            size: this.fileSize,
            totalChunks: this.totalChunks
        });

        broadcastSwarmHave(this.fileId, chunkIndex, this.totalChunks);

        if (this.onChunk) {
            try { this.onChunk(chunkIndex, chunkData); } catch (e) { console.warn("onChunk error:", e); }
        }
        if (this.onProgress) {
            try { this.onProgress(this.completedIndices.size, this.totalChunks); } catch (e) { console.warn("onProgress error:", e); }
        }

        if (this.completedIndices.size >= this.totalChunks) {
            this.finish();
        } else {
            this.pump();
        }
    }

    async finish() {
        if (this.isDone) return;
        this.isDone = true;
        if (this.pumpInterval) {
            clearInterval(this.pumpInterval);
            this.pumpInterval = null;
        }

        let fullBlob = null;
        try {
            const blobParts = [];
            for (let i = 0; i < this.totalChunks; i++) {
                if (this.chunks[i]) {
                    blobParts.push(this.chunks[i]);
                } else {
                    const ch = await getCachedChunk(this.fileId, i);
                    if (ch) blobParts.push(ch);
                    else throw new Error(`Missing chunk ${i}`);
                }
            }
            fullBlob = new Blob(blobParts, { type: this.fileMime });
        } catch (e) {
            console.error("Assembly error, attempting cache assembly:", e);
            const fromCache = await assembleFileFromCache(this.fileId);
            if (fromCache) fullBlob = fromCache.blob;
        }

        if (fullBlob) {
            if (this.onComplete) {
                try { this.onComplete(fullBlob); } catch(e) { console.error("onComplete error:", e); }
            }
        } else if (this.onError) {
            this.onError("Failed to assemble complete file blob");
        }
    }

    abort() {
        this.aborted = true;
        if (this.pumpInterval) {
            clearInterval(this.pumpInterval);
            this.pumpInterval = null;
        }
        this.inFlight.clear();
        this.pendingQueue = [];
    }
}

function startSwarmDownload(fileId) {
    const node = findClientNode(clientVFS, fileId);
    if (!node) return;
    const totalChunks = Math.max(1, Math.ceil(node.size / CHUNK_SIZE));
    createTransferItem(fileId, node.name, 'download', { isSwarm: true, totalChunks, totalSize: node.size });

    const downloader = new SwarmDownloader({
        fileId,
        fileName: node.name,
        fileMime: node.mime,
        fileSize: node.size,
        totalChunks,
        isSequential: false,
        onChunk: (index, chunk) => {
            const pct = Math.floor((downloader.completedIndices.size / totalChunks) * 100);
            const previewPct = document.getElementById('preview-progress-text');
            if (previewPct) previewPct.textContent = `${pct}%`;
            updateTransferProgress(fileId, chunk.byteLength, node.size, index);
        },
        onComplete: async (blob) => {
            finishTransfer(fileId);
            if (node.isEncrypted) {
                const pass = (clientCurrentDir && clientUnlockedVaults[clientCurrentDir.id]) || clientUnlockedVaults[fileId];
                if (pass) {
                    try {
                        const buffer = await blob.arrayBuffer();
                        const decryptedBuffer = await decryptFile(buffer, pass, node.salt, node.iv);
                        const decryptedBlob = new Blob([decryptedBuffer], { type: node.mime });
                        triggerDownload(decryptedBlob, node.name, node.mime, fileId);
                    } catch (e) {
                        cyberAlert("Decryption failed: " + e.message, "DECRYPTION ERROR", true);
                        triggerDownload(blob, node.name, node.mime, fileId);
                    }
                } else {
                    triggerDownload(blob, node.name, node.mime, fileId);
                }
            } else {
                triggerDownload(blob, node.name, node.mime, fileId);
            }
            activeSwarmDownloads.delete(fileId);
        },
        onError: (err) => {
            failTransfer(fileId, 'SWARM_FAILED');
            activeSwarmDownloads.delete(fileId);
        }
    });

    activeSwarmDownloads.set(fileId, downloader);
    downloader.start();
}


// =========================================================================
// MODULE 4: STREAMING VIDEO/AUDIO TORRENT PLAYER
// =========================================================================

async function startMediaStream(fileId, name, mime, size) {
    previewModal.classList.add('hidden');
    mediaModal.classList.remove('hidden');
    mediaTitle.innerText = name;
    mediaContainer.innerHTML = '';

    const bufferContainer = document.getElementById('stream-buffer-container');
    const bufferDetail = document.getElementById('stream-buffer-detail');
    const bufferPct = document.getElementById('stream-buffer-pct');
    const bufferFill = document.getElementById('stream-buffer-fill');

    if (bufferContainer) bufferContainer.classList.remove('hidden');
    if (bufferFill) bufferFill.style.width = '0%';
    if (bufferPct) bufferPct.textContent = '0%';
    if (bufferDetail) {
        bufferDetail.textContent = 'INITIALIZING STREAM...';
        bufferDetail.style.color = 'var(--neon-blue)';
    }

    if (btnDownloadMedia) {
        btnDownloadMedia.style.display = 'none';
    }

    const totalChunks = Math.max(1, Math.ceil(size / CHUNK_SIZE));
    let mediaElement = null;
    let playbackStarted = false;
    const streamChunks = new Array(totalChunks);
    let receivedCount = 0;

    const lowerName = name.toLowerCase();
    const isVideo = (mime && mime.startsWith('video/')) || lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.ogg');
    const isAudio = (mime && mime.startsWith('audio/')) || lowerName.endsWith('.mp3') || lowerName.endsWith('.wav') || lowerName.endsWith('.m4a');

    if (isVideo) {
        mediaContainer.innerHTML = `<video id="active-stream-media" controls autoplay playsinline style="width:100%; max-height:70vh; display:block; background:#000;"></video>`;
        mediaElement = document.getElementById('active-stream-media');
    } else if (isAudio) {
        mediaContainer.innerHTML = `<div style="padding: 2rem; text-align: center;"><div style="font-family: var(--font-mono); color: var(--neon-blue); margin-bottom: 1rem;">⚡ STREAMING P2P AUDIO</div><audio id="active-stream-media" controls autoplay style="width:100%;"></audio></div>`;
        mediaElement = document.getElementById('active-stream-media');
    } else {
        mediaContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--neon-blue);">STREAMING PREVIEW...</div>`;
    }

    if (activeMediaStreamDownloader) {
        activeMediaStreamDownloader.abort();
        activeMediaStreamDownloader = null;
    }

    const downloader = new SwarmDownloader({
        fileId,
        fileName: name,
        fileMime: mime,
        fileSize: size,
        totalChunks,
        isSequential: true, // Sequential chunks 0, 1, 2, 3...
        onChunk: (index, chunk) => {
            streamChunks[index] = chunk;
            receivedCount++;

            const pct = Math.floor((receivedCount / totalChunks) * 100);
            if (bufferFill) bufferFill.style.width = `${pct}%`;
            if (bufferPct) bufferPct.textContent = `${pct}%`;
            if (bufferDetail) bufferDetail.textContent = `BUFFERED ${receivedCount}/${totalChunks} CHUNKS (${pct}%)`;

            // Start playback as soon as initial sequential buffer arrives (e.g. first 4 chunks or 10%)
            if (!playbackStarted && (receivedCount >= Math.min(4, totalChunks) || pct >= 10)) {
                if (streamChunks[0]) {
                    playbackStarted = true;
                    const consecutive = [];
                    for (let i = 0; i < totalChunks; i++) {
                        if (streamChunks[i]) consecutive.push(streamChunks[i]);
                        else break;
                    }
                    const partialBlob = new Blob(consecutive, { type: mime });
                    const partialUrl = URL.createObjectURL(partialBlob);
                    if (mediaElement) {
                        mediaElement.src = partialUrl;
                        mediaElement.play().catch(e => console.log("Stream play awaiting user gesture:", e));
                    }
                    if (bufferDetail) {
                        bufferDetail.textContent = '⚡ LIVE STREAM PLAYBACK ACTIVE';
                        bufferDetail.style.color = 'var(--neon-green)';
                    }
                }
            }
        },
        onComplete: (fullBlob) => {
            const fullUrl = URL.createObjectURL(fullBlob);
            if (bufferDetail) {
                bufferDetail.textContent = '⚡ STREAM FULLY BUFFERED (COMPLETE)';
                bufferDetail.style.color = 'var(--neon-green)';
            }
            if (bufferFill) bufferFill.style.width = '100%';
            if (bufferPct) bufferPct.textContent = '100%';

            if (mediaElement && !playbackStarted) {
                mediaElement.src = fullUrl;
                mediaElement.play().catch(e => console.log("Playback play error:", e));
            }

            if (btnDownloadMedia) {
                btnDownloadMedia.href = fullUrl;
                btnDownloadMedia.download = name;
                btnDownloadMedia.style.display = 'block';
                btnDownloadMedia.textContent = 'DOWNLOAD BUFFERED FILE';
            }
            activeMediaStreamDownloader = null;
        },
        onError: (err) => {
            if (bufferDetail) {
                bufferDetail.textContent = 'STREAM ERROR: ' + err;
                bufferDetail.style.color = 'var(--neon-red)';
            }
            activeMediaStreamDownloader = null;
        }
    });

    activeMediaStreamDownloader = downloader;
    downloader.start();
}

// Logo click resets to fresh Host mode if in client or query session
document.querySelectorAll('.logo-container').forEach(el => {
    el.style.cursor = 'pointer';
    el.title = 'Local-Cast Mesh (Click to go Home)';
    el.addEventListener('click', () => {
        if (window.location.search) {
            window.location.href = window.location.origin + window.location.pathname;
        }
    });
});

// Clean up PeerJS connection on page unload
window.addEventListener('beforeunload', () => {
    if (peer && !peer.destroyed) {
        try { peer.destroy(); } catch(e) {}
    }
});


