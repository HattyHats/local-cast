import re

with open('style.css', 'r') as f:
    css = f.read()

# 1. Shrink Card Padding
css = css.replace('''.card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}''', '''.card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}''')

# 2. Shrink Card h2 Margin
css = css.replace('''.card h2 {
    font-size: 0.8rem;
    color: var(--text-muted);
    letter-spacing: 2px;
    margin-bottom: 1rem;
    font-family: var(--font-mono);
}''', '''.card h2 {
    font-size: 0.75rem;
    color: var(--text-muted);
    letter-spacing: 2px;
    margin-bottom: 0.5rem;
    font-family: var(--font-mono);
}''')

# 3. Shrink QR Code Max-Width
css = css.replace('''.qr-container {
    width: 100%;
    aspect-ratio: 1;
    max-width: 200px;
    margin: 0 auto;
    position: relative;
    background: var(--bg-main);
    border-radius: 8px;
    overflow: hidden;
}''', '''.qr-container {
    width: 100%;
    aspect-ratio: 1;
    max-width: 150px;
    margin: 0 auto;
    position: relative;
    background: var(--bg-main);
    border-radius: 8px;
    overflow: hidden;
}''')

# 4. Shrink Action Buttons Even More
css = css.replace('''.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}''', '''.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}''')
css = css.replace('''.action-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5rem;
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
}''', '''.action-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5rem;
    font-size: 0.8rem;
    padding: 0.4rem 0.75rem;
}''')

# 5. Fix .cards-container
css = css.replace('''.cards-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto;
    min-height: 0;
    height: 100%;
    padding-bottom: 1rem;
    padding-right: 0.5rem; /* For scrollbar */
}''', '''.cards-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    min-height: 0;
    max-height: 100%;
    padding-bottom: 1rem;
    padding-right: 0.5rem; /* For scrollbar */
}''')

with open('style.css', 'w') as f:
    f.write(css)
