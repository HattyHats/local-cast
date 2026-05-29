import sys

def inject():
    with open('index.html', 'r') as f:
        html = f.read()

    old_modal = """    <!-- INFO MODAL -->
    <div id="info-modal" class="modal-overlay hidden" style="z-index: 9999;">
        <div class="modal-content" style="max-width: 600px;">
            <h2 class="neon-blue">LOCAL-CAST ARCHITECTURE</h2>
            <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 1rem; line-height: 1.5; height: 300px; overflow-y: auto; padding-right: 10px; text-align: left;">
                <p>Welcome to <strong>Local-Cast</strong>, a decentralized, browser-based peer-to-peer network designed for secure and ephemeral file sharing and communication.</p>
                
                <h3 style="color: #fff; margin-top: 1rem;">Core Features</h3>
                <ul style="margin-left: 1rem; padding-left: 1rem;">
                    <li style="margin-bottom: 0.5rem;"><strong class="neon-green">Decentralized P2P:</strong> All data is transferred directly between browsers via WebRTC. No central server stores your files.</li>
                    <li style="margin-bottom: 0.5rem;"><strong class="neon-blue">Proximity Radar:</strong> Visualizes all connected peers orbiting the Host. Click a blip to open an encrypted Whisper channel.</li>
                    <li style="margin-bottom: 0.5rem;"><strong class="neon-purple">Dead Drops:</strong> Right-click any folder to mark it as a Dead Drop (hidden). To access them, type <code style="background: #222; padding: 2px 4px; border-radius: 4px;">/deaddrop</code> in the search bar.</li>
                    <li style="margin-bottom: 0.5rem;"><strong style="color: #ff0;">P2P Media Streaming:</strong> Double-click media files (audio/video/images) to stream them instantly without fully downloading them.</li>
                    <li style="margin-bottom: 0.5rem;"><strong class="neon-red">Burn Notice:</strong> The "Destroy Network" button obliterates all active connections and permanently wipes the encrypted local storage, leaving no trace.</li>
                </ul>
                <p style="margin-top: 1rem;">To invite guests, they just need to scan your QR code or navigate to the connection URL. Stay secure.</p>
            </div>
            <div class="modal-actions" style="margin-top: 1.5rem;">
                <button class="btn" id="btn-close-info">UNDERSTOOD</button>
            </div>
        </div>
    </div>"""

    new_modal = """    <!-- INFO MODAL -->
    <div id="info-modal" class="modal hidden" style="z-index: 9999;">
        <div class="modal-content card" style="max-width: 650px; width: 90%;">
            <h2 class="neon-blue">LOCAL-CAST ARCHITECTURE</h2>
            <div style="color: var(--text-muted); font-size: 0.95rem; margin-top: 1rem; line-height: 1.6; height: 350px; overflow-y: auto; padding-right: 10px; text-align: left;">
                <p>Welcome to <strong>Local-Cast</strong>, a decentralized, browser-based peer-to-peer network designed for secure and ephemeral file sharing and communication.</p>
                
                <h3 style="color: #fff; margin-top: 1.2rem;">Core Features</h3>
                <ul style="margin-left: 1rem; padding-left: 1rem;">
                    <li style="margin-bottom: 0.8rem;"><strong class="neon-green">Decentralized P2P:</strong> All data is transferred directly between browsers via WebRTC. No central server stores your files.</li>
                    <li style="margin-bottom: 0.8rem;"><strong class="neon-blue">Proximity Radar:</strong> Visualizes all connected peers orbiting the Host. The Host can click any blip to open an encrypted 1-on-1 Whisper channel with that guest.</li>
                    <li style="margin-bottom: 0.8rem;"><strong class="neon-purple">Dead Drops (Hidden Files):</strong> Right-click any folder to toggle it as a "Dead Drop" (it will turn 50% transparent). Dead drops are completely invisible to guests on the network. To reveal and browse your hidden dead drops, type <code style="background: #222; padding: 2px 4px; border-radius: 4px; color: var(--neon-purple);">/deaddrop</code> in the Host search bar. To un-hide a dead drop, simply right-click the transparent folder again and toggle it back to normal.</li>
                    <li style="margin-bottom: 0.8rem;"><strong style="color: #ff0;">P2P Media Streaming:</strong> Double-click media files (audio/video/images) to stream them instantly over the P2P connection without having to fully download them first.</li>
                    <li style="margin-bottom: 0.8rem;"><strong class="neon-red">Burn Notice:</strong> The "Destroy Network" button obliterates all active connections, wipes all session data, and permanently shreds the encrypted local storage filesystem, leaving zero trace.</li>
                </ul>
                <p style="margin-top: 1rem;">To invite guests, they just need to scan your QR code or navigate to the connection URL. Stay secure.</p>
            </div>
            <div class="modal-actions" style="margin-top: 1.5rem;">
                <button class="btn" id="btn-close-info" style="width: 100%;">UNDERSTOOD</button>
            </div>
        </div>
    </div>"""

    if old_modal in html:
        html = html.replace(old_modal, new_modal)
    else:
        print("COULD NOT FIND OLD MODAL!")

    with open('index.html', 'w') as f:
        f.write(html)

if __name__ == '__main__':
    inject()
