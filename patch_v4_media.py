import sys

def inject():
    with open('index.html', 'r') as f:
        html = f.read()

    btn_stream = """
                <button id="btn-stream-direct" class="custom-btn hidden" style="display: none; background: transparent; border-color: var(--neon-purple); color: var(--neon-purple); width: 100%; box-sizing: border-box; text-align: center; margin-top: 1rem;">STREAM MEDIA</button>
"""
    if "btn-stream-direct" not in html:
        html = html.replace('<a id="btn-download-direct"', '<a id="btn-download-direct"')
        html = html.replace('SAVE FILE TO DEVICE</a>', 'SAVE FILE TO DEVICE</a>' + btn_stream)
        
    with open('index.html', 'w') as f:
        f.write(html)

    with open('app.js', 'r') as f:
        js = f.read()

    selectors = """
const btnStreamDirect = document.getElementById('btn-stream-direct');
const mediaModal = document.getElementById('media-modal');
const btnCloseMedia = document.getElementById('btn-close-media');
const mediaTitle = document.getElementById('media-title');
const mediaContainer = document.getElementById('media-container');
"""
    if "btnStreamDirect" not in js:
        js = js.replace("const previewModal = document.getElementById('preview-modal');", "const previewModal = document.getElementById('preview-modal');\n" + selectors)

    # Modify btnClosePreview to also hide btnStreamDirect
    js = js.replace("btnDownloadDirect.style.display = \"none\";", "btnDownloadDirect.style.display = \"none\";\n        if(btnStreamDirect) { btnStreamDirect.classList.add('hidden'); btnStreamDirect.style.display = 'none'; }")

    # In triggerDownload, add the logic for Streaming
    # When file chunk downloading is done, it calls triggerDownload(blob, name, mime)
    stream_logic = """
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
        
        const isMedia = mime && (mime.startsWith('video/') || mime.startsWith('audio/'));
        
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
                if (mime.startsWith('video/')) {
                    mediaContainer.innerHTML = `<video src="${url}" controls autoplay style="width:100%; max-height:70vh; display:block;"></video>`;
                } else {
                    mediaContainer.innerHTML = `<audio src="${url}" controls autoplay style="width:100%; margin: 2rem 0;"></audio>`;
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
"""
    # I need to completely replace triggerDownload
    # Let's find it.
    
    # We will use simple replace for the whole block of triggerDownload
    # Since I know the rough structure, I can just write a regex to replace it.
    import re
    js = re.sub(r'async function triggerDownload\(fileData, name, mime\) \{[\s\S]*?\}\n', stream_logic, js)

    media_close_logic = """
if (btnCloseMedia) {
    btnCloseMedia.addEventListener('click', () => {
        mediaModal.classList.add('hidden');
        mediaContainer.innerHTML = ''; // Stop playback
    });
}
"""
    if "btnCloseMedia.addEventListener" not in js:
        js = js.replace("btnClosePreview.addEventListener('click', () => {", media_close_logic + "\nbtnClosePreview.addEventListener('click', () => {")

    with open('app.js', 'w') as f:
        f.write(js)
    
    print("Injected Task 3: P2P Media Streaming")

if __name__ == '__main__':
    inject()
