import sys

def inject():
    with open('index.html', 'r') as f:
        html = f.read()

    theme_btn = """                <button id="btn-theme-toggle" class="btn-icon header-btn" title="Themes">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
                </button>
"""
    if "id=\"btn-theme-toggle\"" not in html:
        html = html.replace('<button id="btn-info"', theme_btn + '                <button id="btn-info"')

    theme_modal = """    <!-- THEME MODAL -->
    <div id="theme-modal" class="modal hidden" style="z-index: 9999;">
        <div class="modal-content card" style="max-width: 400px; width: 90%;">
            <h2 class="neon-blue">AESTHETIC PROTOCOLS</h2>
            <div class="theme-options" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem;">
                <button class="btn theme-btn" data-theme="synthwave" style="border-color: #00f0ff; color: #00f0ff;">SYNTHWAVE (DEFAULT)</button>
                <button class="btn theme-btn" data-theme="matrix" style="border-color: #39ff14; color: #39ff14;">MATRIX TERMINAL</button>
                <button class="btn theme-btn" data-theme="nightcity" style="border-color: #ff00ff; color: #ff00ff;">NIGHT CITY</button>
                <button class="btn theme-btn" data-theme="bloodmoon" style="border-color: #ff003c; color: #ff003c;">BLOOD MOON</button>
            </div>
            <div class="modal-actions" style="margin-top: 1.5rem;">
                <button class="btn" id="btn-close-theme" style="width: 100%;">CLOSE</button>
            </div>
        </div>
    </div>
"""
    if "id=\"theme-modal\"" not in html:
        html = html.replace('<!-- PROFILE MODAL (GUEST) -->', theme_modal + '\n    <!-- PROFILE MODAL (GUEST) -->')

    with open('index.html', 'w') as f:
        f.write(html)

    # JS Logic
    with open('app.js', 'r') as f:
        js = f.read()

    js_theme = """
// --- THEMING ENGINE ---
const themes = {
    synthwave: {
        '--bg-dark': '#050507',
        '--bg-card': '#0a0b10',
        '--bg-card-hover': '#101218',
        '--neon-blue': '#00f0ff',
        '--neon-green': '#39ff14',
        '--neon-red': '#ff003c',
        '--border-glow': 'rgba(0, 240, 255, 0.2)'
    },
    matrix: {
        '--bg-dark': '#000000',
        '--bg-card': '#001100',
        '--bg-card-hover': '#002200',
        '--neon-blue': '#39ff14',
        '--neon-green': '#39ff14',
        '--neon-red': '#39ff14',
        '--border-glow': 'rgba(57, 255, 20, 0.2)'
    },
    nightcity: {
        '--bg-dark': '#0f0f1a',
        '--bg-card': '#1a0b1c',
        '--bg-card-hover': '#2a112c',
        '--neon-blue': '#fce205', // Yellow
        '--neon-green': '#00f0ff',
        '--neon-red': '#ff00ff', // Pink
        '--border-glow': 'rgba(255, 0, 255, 0.2)'
    },
    bloodmoon: {
        '--bg-dark': '#050000',
        '--bg-card': '#1a0000',
        '--bg-card-hover': '#330000',
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
"""
    if "THEMING ENGINE" not in js:
        js = js + js_theme

    with open('app.js', 'w') as f:
        f.write(js)
    
    print("Injected Theming Engine")

if __name__ == '__main__':
    inject()
