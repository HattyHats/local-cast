with open('index.html', 'r') as f:
    html = f.read()

# Add Profile Modal right before the final </body> tag
profile_modal = """
    <!-- PROFILE MODAL (GUEST) -->
    <div id="profile-modal" class="modal-overlay hidden">
        <div class="modal">
            <h2>SET YOUR ALIAS</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Choose a hacker alias and neon color so the host knows who you are.</p>
            
            <div class="input-group">
                <input type="text" id="profile-name-input" class="custom-input" placeholder="e.g. Neo, Trinity..." maxlength="15">
            </div>
            
            <div class="color-picker-container" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; justify-content: center;">
                <div class="color-swatch selected" data-color="#00f0ff" style="background: #00f0ff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid #fff;"></div>
                <div class="color-swatch" data-color="#ff003c" style="background: #ff003c; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;"></div>
                <div class="color-swatch" data-color="#39ff14" style="background: #39ff14; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;"></div>
                <div class="color-swatch" data-color="#fcee0a" style="background: #fcee0a; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;"></div>
                <div class="color-swatch" data-color="#b026ff" style="background: #b026ff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;"></div>
            </div>

            <div class="modal-actions">
                <button id="btn-save-profile" class="custom-btn primary-btn" style="width: 100%;">JOIN SERVER</button>
            </div>
        </div>
    </div>
"""

html = html.replace('</body>', profile_modal + '\n</body>')

with open('index.html', 'w') as f:
    f.write(html)
