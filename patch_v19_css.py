import re

with open('style.css', 'r') as f:
    css = f.read()

# 1. Reduce padding and gap for action buttons
css = css.replace('''.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}''', '''.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}''')

css = css.replace('''.action-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75rem;
    font-size: 0.9rem;
    padding: 0.75rem 1rem;
}''', '''.action-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5rem;
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
}''')

# 2. Ensure left-column can scroll if it's too small
css = css.replace('''.left-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 320px;
    flex-shrink: 0;
}''', '''.left-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 320px;
    flex-shrink: 0;
    overflow-y: auto;
    padding-bottom: 1rem;
}''')

with open('style.css', 'w') as f:
    f.write(css)
