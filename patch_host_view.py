import re

with open('style.css', 'r') as f:
    css = f.read()

old_host_view = '''#host-view {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 1.5rem;
    height: 100%;
    overflow: hidden;
    min-height: 0;
}'''

new_host_view = '''#host-view {
    display: grid;
    grid-template-columns: 280px 1fr;
    grid-template-rows: minmax(0, 1fr);
    gap: 1.5rem;
    height: 100%;
    overflow: hidden;
    min-height: 0;
}'''

css = css.replace(old_host_view, new_host_view)

old_cards_container = '''.cards-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto;
    min-height: 0;
    padding-bottom: 1rem;
    padding-right: 0.5rem; /* For scrollbar */
}'''

new_cards_container = '''.cards-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto;
    min-height: 0;
    height: 100%;
    padding-bottom: 1rem;
    padding-right: 0.5rem; /* For scrollbar */
}'''

css = css.replace(old_cards_container, new_cards_container)

with open('style.css', 'w') as f:
    f.write(css)
