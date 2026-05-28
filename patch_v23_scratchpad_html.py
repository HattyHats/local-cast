with open('index.html', 'r') as f:
    html = f.read()

# 1. Add Live Scratchpad Button
btn_old = """                        <button id="btn-new-note" class="custom-btn action-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            New Note
                        </button>"""
btn_new = btn_old + """
                        <button id="btn-live-scratchpad" class="custom-btn action-btn" style="border-color: var(--neon-purple); color: var(--neon-purple);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            Live Scratchpad
                        </button>"""
html = html.replace(btn_old, btn_new)

# 2. Add Live Scratchpad Modal
modal_code = """
    <!-- LIVE SCRATCHPAD MODAL -->
    <div id="scratchpad-modal" class="modal-overlay hidden">
        <div class="modal" style="max-width: 800px; width: 90%; height: 80vh; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0; color: var(--neon-purple);">LIVE SCRATCHPAD</h2>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div id="scratchpad-users" style="font-size: 0.8rem; color: var(--text-muted); display: flex; gap: 0.5rem;"></div>
                    <button id="btn-close-scratchpad" class="btn-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            <textarea id="scratchpad-textarea" class="custom-input" style="flex: 1; resize: none; font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.5; padding: 1rem; border-color: var(--neon-purple);" placeholder="Type here... everyone can see this in real-time."></textarea>
        </div>
    </div>
"""
html = html.replace('</body>', modal_code + '\n</body>')

with open('index.html', 'w') as f:
    f.write(html)
