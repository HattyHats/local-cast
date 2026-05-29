import sys

def inject():
    with open('index.html', 'r') as f:
        html = f.read()
    
    # 1. Add Radar Button to Host Actions
    radar_btn = """
                        <button id="btn-radar" class="custom-btn action-btn" style="border-color: #39ff14; color: #39ff14;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle><line x1="12" y1="12" x2="19.07" y2="4.93"></line></svg>
                            Radar
                        </button>
"""
    if 'id="btn-radar"' not in html:
        html = html.replace('<button id="btn-burn"', radar_btn + '                        <button id="btn-burn"')
    
    # 2. Add New Modals right before the script tags
    modals = """
    <!-- MEDIA PLAYER MODAL -->
    <div id="media-modal" class="modal hidden">
        <div class="modal-content card" style="max-width: 800px; width: 90%; background: #000; border-color: var(--neon-blue);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 id="media-title" style="color: var(--neon-blue); margin: 0; font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">MEDIA PLAYER</h3>
                <button id="btn-close-media" class="btn-icon" style="color: var(--neon-red);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div id="media-container" style="width: 100%; border: 1px solid var(--neon-blue); border-radius: 4px; overflow: hidden; background: #050507; position: relative;">
                <!-- Video or Audio will be injected here -->
            </div>
        </div>
    </div>

    <!-- RADAR MODAL -->
    <div id="radar-modal" class="modal hidden">
        <div class="modal-content card" style="max-width: 600px; width: 90%; text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="color: #39ff14; margin: 0; text-shadow: 0 0 10px rgba(57,255,20,0.5);">PROXIMITY RADAR</h2>
                <button id="btn-close-radar" class="btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div style="position: relative; width: 100%; aspect-ratio: 1/1; background: #050507; border: 2px solid #39ff14; border-radius: 50%; overflow: hidden; box-shadow: inset 0 0 50px rgba(57,255,20,0.2), 0 0 20px rgba(57,255,20,0.2);">
                <canvas id="radar-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
            </div>
        </div>
    </div>

    <!-- WHISPER MODAL -->
    <div id="whisper-modal" class="modal hidden">
        <div class="modal-content card" style="max-width: 500px; width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0; color: var(--neon-pink);"><span id="whisper-target-name">Whisper</span></h2>
                <button id="btn-close-whisper" class="btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div id="whisper-messages" style="height: 300px; overflow-y: auto; background: #000; border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.85rem;"></div>
            <form id="whisper-form" style="display: flex; gap: 0.5rem;">
                <input type="text" id="whisper-input" class="custom-input" placeholder="Encrypting message..." style="flex: 1;" autocomplete="off" />
                <button type="submit" class="custom-btn" style="width: auto; background: transparent; border-color: var(--neon-pink); color: var(--neon-pink);">SEND</button>
            </form>
        </div>
    </div>

    <!-- BURN NOTICE OVERLAY -->
    <div id="burn-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 0, 0, 0.15); z-index: 9999; display: none; flex-direction: column; justify-content: center; align-items: center; pointer-events: none;">
        <h1 style="color: #ff0000; font-size: 15vw; font-family: var(--font-mono); font-weight: 900; margin: 0; text-shadow: 0 0 50px #ff0000;">LOCKDOWN</h1>
        <div id="burn-countdown" style="color: #fff; font-size: 10vw; font-family: var(--font-mono); font-weight: 800; text-shadow: 0 0 20px #ff0000;">10.00</div>
    </div>

"""
    if 'id="media-modal"' not in html:
        html = html.replace('<script src="./localforage.min.js"></script>', modals + '\n    <script src="./localforage.min.js"></script>')

    # 3. Add Context Menu toggle dead drop
    deaddrop_ctx = """
        <div class="context-item" id="ctx-deaddrop" style="color: var(--neon-purple);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Toggle Dead Drop
        </div>
"""
    if 'id="ctx-deaddrop"' not in html:
        html = html.replace('<div class="context-item" id="ctx-delete"', deaddrop_ctx + '        <div class="context-item" id="ctx-delete"')

    with open('index.html', 'w') as f:
        f.write(html)
    print("Injected V4 HTML successfully.")

if __name__ == '__main__':
    inject()
