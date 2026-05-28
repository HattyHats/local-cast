with open('index.html', 'r') as f:
    html = f.read()

# 1. Add Whiteboard Button
btn_old = """                        <button id="btn-live-scratchpad" class="custom-btn action-btn" style="border-color: var(--neon-purple); color: var(--neon-purple);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            Live Scratchpad
                        </button>"""
btn_new = btn_old + """
                        <button id="btn-whiteboard" class="custom-btn action-btn" style="border-color: #fcee0a; color: #fcee0a;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg>
                            Whiteboard
                        </button>"""
html = html.replace(btn_old, btn_new)

# 2. Add Whiteboard Modal
modal_code = """
    <!-- WHITEBOARD MODAL -->
    <div id="whiteboard-modal" class="modal-overlay hidden">
        <div class="modal" style="max-width: 1000px; width: 95%; height: 90vh; display: flex; flex-direction: column; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0; color: #fcee0a;">COLLABORATIVE WHITEBOARD</h2>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <button id="btn-clear-whiteboard" class="custom-btn" style="border-color: var(--neon-red); color: var(--neon-red); padding: 0.2rem 0.5rem; font-size: 0.8rem;">CLEAR</button>
                    <button id="btn-close-whiteboard" class="btn-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            <div id="whiteboard-container" style="flex: 1; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; position: relative; background: #fff; cursor: crosshair;">
                <canvas id="whiteboard-canvas" style="position: absolute; top: 0; left: 0; touch-action: none;"></canvas>
            </div>
        </div>
    </div>
"""
html = html.replace('</body>', modal_code + '\n</body>')

with open('index.html', 'w') as f:
    f.write(html)
