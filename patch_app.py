import re

with open('app.js', 'r') as f:
    content = f.read()

# 1. Add localforage config & chunk variables
content = re.sub(
    r'(const appWrapper = document.getElementById\(\'app-wrapper\'\);)',
    r'\1\n\nlocalforage.config({ name: "LocalCast" });\nconst CHUNK_SIZE = 256 * 1024;\nconst incomingTransfers = {};',
    content
)

# 2. Add Guest Uploads toggle and File Input
content = re.sub(
    r'(const clientFileInput = document.getElementById\(\'client-file-input\'\);)',
    r'const toggleGuestUploads = document.getElementById("toggle-guest-uploads");\nconst btnUploadClient = document.getElementById("btn-upload-client");\n\1',
    content
)

# 3. Add saveVFSToDB function
content = re.sub(
    r'(class VirtualFileSystem \{)',
    r'async function saveVFSToDB() { if(isHost) await localforage.setItem("vfs_root", vfs.root); }\n\n\1',
    content
)

# 4. Burn sequence updates
content = re.sub(
    r'(vfs\.currentDir = vfs\.root;)',
    r'\1\n    saveVFSToDB();',
    content
)

# 5. Load VFS on initHost
content = re.sub(
    r'(btnLock\.classList\.remove\(\'hidden\'\);)',
    r'const savedRoot = await localforage.getItem("vfs_root");\n    if (savedRoot) { vfs.root = savedRoot; vfs.currentDir = vfs.root; }\n    \1',
    content
)
content = re.sub(r'function initHost\(\) \{', 'async function initHost() {', content)

# 6. Host WebRTC Handlers (REQUEST_FILE -> Chunks, REQUEST_ZIP_ALL -> Chunks)
host_handlers_old = """            } else if (data.type === 'REQUEST_FILE' && conn.isAuthenticated) {
                const node = vfs.findNode(data.id);
                if (node && node.type === 'file') {
                    conn.send({ type: 'FILE_DATA', id: node.id, name: node.name, mime: node.mime, file: node.fileObj });
                }
            } else if (data.type === 'REQUEST_ZIP_ALL' && conn.isAuthenticated) {
                generateZipBlob().then(blob => {
                    conn.send({ type: 'FILE_DATA', id: 'zip-all', name: 'local-cast-backup.zip', mime: 'application/zip', file: blob });
                });
            }"""

host_handlers_new = """            } else if (data.type === 'REQUEST_FILE' && conn.isAuthenticated) {
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
            }"""
content = content.replace(host_handlers_old, host_handlers_new)

# 7. Host Actions (Guest Toggle, saveVFSToDB)
content = re.sub(
    r'(vfs\.addFolder\(name\);\n            renderHostExplorer\(\);\n            broadcastTree\(\);)',
    r'saveVFSToDB();\n            \1',
    content
)
content = re.sub(
    r'(folderInput\.addEventListener\(\'change\', \(e\) => processFiles\(Array\.from\(e\.target\.files\)\)\);)',
    r'\1\n\n    if (toggleGuestUploads) {\n        toggleGuestUploads.addEventListener("change", (e) => {\n            connections.forEach(conn => {\n                if (conn.open) conn.send({ type: "GUEST_UPLOAD_ENABLED", enabled: e.target.checked });\n            });\n        });\n    }',
    content
)
content = re.sub(
    r'(fileInput\.value = \'\';\n    folderInput\.value = \'\';\n    renderHostExplorer\(\);\n    broadcastTree\(\);)',
    r'saveVFSToDB();\n    \1',
    content
)
content = re.sub(
    r'(node\.parent = target;\n    target\.children\.push\(node\);\n    \n    renderHostExplorer\(\);\n    broadcastTree\(\);)',
    r'saveVFSToDB();\n    \1',
    content
)

# 8. Client WebRTC Handlers (Receiving Chunks, GUEST_UPLOAD_ENABLED, UPLOAD_COMPLETE)
client_handlers_old = """            } else if (data.type === 'FILE_DATA') {
                triggerDownload(data.file, data.name, data.mime);
            } else if (data.type === 'SERVER_BURNED') {"""

client_handlers_new = """            } else if (data.type === 'FILE_CHUNK_START' || data.type === 'ZIP_CHUNK_START') {
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
            } else if (data.type === 'SERVER_BURNED') {"""
content = content.replace(client_handlers_old, client_handlers_new)

# 9. Client Upload Event Listeners
content = re.sub(
    r'(btnDownloadAllClient\.addEventListener\(\'click\', \(\) => \{)',
    r'if(btnUploadClient) btnUploadClient.addEventListener("click", () => clientFileInput.click());\n    if(clientFileInput) clientFileInput.addEventListener("change", (e) => {\n        const file = e.target.files[0];\n        if (file && hostConnection && hostConnection.open) {\n            clientDownloading.classList.remove("hidden");\n            downloadFilename.textContent = "Uploading " + file.name;\n            document.getElementById("client-progress-text").textContent = "Starting...";\n            sendFileInChunks(hostConnection, "upload_" + Date.now(), file, file.name, file.type, "CLIENT_UPLOAD_CHUNK");\n        }\n    });\n    \n    \1',
    content
)

# 10. Update btnRequestFile Event Listener
content = re.sub(
    r'(btnRequestFile\.classList\.add\(\'hidden\'\);\n            previewLoader\.classList\.remove\(\'hidden\'\);)',
    r'btnRequestFile.classList.add("hidden");\n            document.getElementById("preview-loader-container").classList.remove("hidden");',
    content
)
content = re.sub(
    r'(btnDownloadDirect\.style\.display = \'none\';\n        btnRequestFile\.classList\.remove\(\'hidden\'\);\n        previewLoader\.classList\.add\(\'hidden\'\);)',
    r'btnDownloadDirect.style.display = "none";\n        btnRequestFile.classList.remove("hidden");\n        document.getElementById("preview-loader-container").classList.add("hidden");\n        document.getElementById("preview-icon").innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 80px; height: 80px; color: var(--neon-blue);"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;',
    content
)

content = re.sub(
    r'(btnDownloadDirect\.style\.display = \'none\';\n                btnRequestFile\.classList\.remove\(\'hidden\'\);\n                previewLoader\.classList\.add\(\'hidden\'\);)',
    r'btnDownloadDirect.style.display = "none";\n                btnRequestFile.classList.remove("hidden");\n                document.getElementById("preview-loader-container").classList.add("hidden");\n                document.getElementById("preview-icon").innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 80px; height: 80px; color: var(--neon-blue);"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;',
    content
)

# 11. Trigger Download with Previews
trigger_dl_old = """    } else {
        // Handle Single File Preview Download
        const blob = new Blob([fileData], { type: mime });
        const url = URL.createObjectURL(blob);
        previewLoader.classList.add('hidden');
        btnDownloadDirect.href = url;
        btnDownloadDirect.download = name;
        btnDownloadDirect.classList.remove('hidden');
        btnDownloadDirect.style.display = 'block';
    }"""
trigger_dl_new = """    } else {
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
    }"""
content = content.replace(trigger_dl_old, trigger_dl_new)

# Fix blob wrapping in triggerDownload for zip
content = content.replace('const blob = new Blob([fileData], { type: mime });', 'const blob = fileData;')

# 12. Send Chunks function
utils_section = """// --- UTILS ---
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

"""
content = content.replace('// --- UTILS ---', utils_section)


with open('app.js', 'w') as f:
    f.write(content)

print("Patch complete")
