with open('style.css', 'r') as f:
    content = f.read()

# Make sidebar wider
content = content.replace("grid-template-columns: 280px 1fr;", "grid-template-columns: 320px 1fr;")

# Make buttons more compact
old_btn = """.action-btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75rem;
    background: var(--bg-dark);
    color: var(--text-main);
    border: 1px solid var(--border-color);
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    border-radius: 8px;
}"""
new_btn = """.action-btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5rem;
    background: var(--bg-dark);
    color: var(--text-main);
    border: 1px solid var(--border-color);
    padding: 0.5rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 8px;
}"""
content = content.replace(old_btn, new_btn)

with open('style.css', 'w') as f:
    f.write(content)
