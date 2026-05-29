import sys

def inject():
    with open('index.html', 'r') as f:
        html = f.read()

    btn_html = """                <button id="btn-info" class="btn-icon header-btn" title="Info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </button>
"""
    if "id=\"btn-info\"" not in html:
        html = html.replace('<div class="header-actions">', '<div class="header-actions">\n' + btn_html)

    modal_html = """    <!-- INFO MODAL -->
    <div id="info-modal" class="modal-overlay hidden" style="z-index: 9999;">
        <div class="modal-content" style="max-width: 600px;">
            <h2 class="neon-blue">LOCAL-CAST ARCHITECTURE</h2>
            <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 1rem; line-height: 1.5; height: 300px; overflow-y: auto; padding-right: 10px;">
                <p>Welcome to <strong>Local-Cast</strong>, a decentralized, browser-based peer-to-peer network designed for secure and ephemeral file sharing and communication.</p>
                
                <h3 style="color: #fff; margin-top: 1rem;">Core Features</h3>
                <ul style="margin-left: 1rem;">
                    <li><strong class="neon-green">Decentralized P2P:</strong> All data is transferred directly between browsers via WebRTC. No central server stores your files.</li>
                    <li><strong class="neon-blue">Proximity Radar:</strong> Visualizes all connected peers orbiting the Host. Click a blip to open an encrypted Whisper channel.</li>
                    <li><strong class="neon-purple">Dead Drops:</strong> Right-click any folder to mark it as a Dead Drop (hidden). To access them, type <code style="background: #222; padding: 2px 4px; border-radius: 4px;">/deaddrop</code> in the search bar.</li>
                    <li><strong style="color: #ff0;">P2P Media Streaming:</strong> Double-click media files (audio/video/images) to stream them instantly without fully downloading them.</li>
                    <li><strong class="neon-red">Burn Notice:</strong> The "Destroy Network" button obliterates all active connections and permanently wipes the encrypted local storage, leaving no trace.</li>
                </ul>
                <p style="margin-top: 1rem;">To invite guests, they just need to scan your QR code or navigate to the connection URL. Stay secure.</p>
            </div>
            <div class="modal-actions" style="margin-top: 1.5rem;">
                <button class="btn" id="btn-close-info">UNDERSTOOD</button>
            </div>
        </div>
    </div>
"""
    if "id=\"info-modal\"" not in html:
        html = html.replace('<!-- MODALS -->', '<!-- MODALS -->\n' + modal_html)

    with open('index.html', 'w') as f:
        f.write(html)

    with open('app.js', 'r') as f:
        js = f.read()

    js_logic = """
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
"""
    if "btnInfo" not in js:
        js = js + js_logic

    with open('app.js', 'w') as f:
        f.write(js)
    
    print("Injected info modal")

if __name__ == '__main__':
    inject()
